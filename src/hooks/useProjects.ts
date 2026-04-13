import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type DbProject = Tables<'projects'>;
type DbTask = Tables<'tasks'>;
type DbChangelog = Tables<'task_changelog'>;

export interface TaskWithChangelog extends DbTask {
  changelog: DbChangelog[];
}

export interface ProjectWithCount extends DbProject {
  taskCount: number;
}

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [tasks, setTasks] = useState<TaskWithChangelog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('projects')
      .select('*, tasks(id)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) { toast.error('Failed to load projects'); return; }

    const mapped: ProjectWithCount[] = (data || []).map((p: any) => ({
      ...p,
      taskCount: p.tasks?.length || 0,
    }));
    // Remove the nested tasks array
    mapped.forEach((p: any) => delete p.tasks);

    setProjects(mapped);
    if (!selectedProjectId || (selectedProjectId !== 'all' && mapped.length > 0 && !mapped.find(p => p.id === selectedProjectId))) {
      setSelectedProjectId('all');
    }
  }, [user, selectedProjectId]);

  const fetchTasks = useCallback(async (projectId: string) => {
    if (!projectId) { setTasks([]); return; }
    setLoading(true);

    let query = supabase
      .from('tasks')
      .select('*, task_changelog(*)')
      .order('created_at', { ascending: true });

    if (projectId !== 'all') {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) { toast.error('Failed to load tasks'); setLoading(false); return; }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const mapped: TaskWithChangelog[] = (data || []).map((t: any) => ({
      ...t,
      changelog: (t.task_changelog || []).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    }));
    mapped.forEach((t: any) => delete t.task_changelog);
    mapped.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    setTasks(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [user]);
  useEffect(() => { if (selectedProjectId) fetchTasks(selectedProjectId); }, [selectedProjectId]);

  const moveTask = useCallback(async (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    if (error) { toast.error('Failed to update task'); fetchTasks(selectedProjectId); return; }

    // Add changelog entry
    await supabase.from('task_changelog').insert({
      task_id: taskId,
      message: `Status changed to ${newStatus.replace('_', ' ')}`,
    });

    fetchTasks(selectedProjectId);
  }, [selectedProjectId, fetchTasks]);

  const updateTaskDates = useCallback(async (taskId: string, startDate: string, endDate: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, start_date: startDate, end_date: endDate } : t));
    const { error } = await supabase.from('tasks').update({ start_date: startDate, end_date: endDate } as any).eq('id', taskId);
    if (error) { toast.error('Failed to update dates'); fetchTasks(selectedProjectId); }
  }, [selectedProjectId, fetchTasks]);

  const updateTaskTimes = useCallback(async (taskId: string, startTime: string, endTime: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, start_time: startTime, end_time: endTime } as any : t));
    const { error } = await supabase.from('tasks').update({ start_time: startTime, end_time: endTime } as any).eq('id', taskId);
    if (error) { toast.error('Failed to update times'); fetchTasks(selectedProjectId); }
  }, [selectedProjectId, fetchTasks]);

  const updateTask = useCallback(async (taskId: string, updates: { title: string; description: string; priority: 'low' | 'medium' | 'high'; assignee: string }) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates, assignee: updates.assignee || null } : t));
    const { error } = await supabase.from('tasks').update({
      title: updates.title,
      description: updates.description,
      priority: updates.priority,
      assignee: updates.assignee || null,
    }).eq('id', taskId);
    if (error) { toast.error('Failed to update task'); fetchTasks(selectedProjectId); return; }
    toast.success('Task updated');
    await supabase.from('task_changelog').insert({ task_id: taskId, message: 'Task details updated' });
    fetchTasks(selectedProjectId);
  }, [selectedProjectId, fetchTasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) { toast.error('Failed to delete task'); fetchTasks(selectedProjectId); return; }
    toast.success('Task deleted');
    await fetchProjects();
  }, [selectedProjectId, fetchTasks, fetchProjects]);

  const addProject = useCallback(async (name: string, description: string) => {
    if (!user) return;
    const { error } = await supabase.from('projects').insert({ name, description, user_id: user.id });
    if (error) { toast.error('Failed to create project'); return; }
    toast.success('Project created');
    await fetchProjects();
  }, [user, fetchProjects]);

  const updateProject = useCallback(async (projectId: string, name: string, description: string) => {
    const { error } = await supabase.from('projects').update({ name, description }).eq('id', projectId);
    if (error) { toast.error('Failed to update project'); return; }
    toast.success('Project updated');
    await fetchProjects();
  }, [fetchProjects]);

  const addTask = useCallback(async (title: string, description: string, priority: 'low' | 'medium' | 'high', assignee: string) => {
    if (!selectedProjectId) return;
    const { data, error } = await supabase.from('tasks').insert({
      project_id: selectedProjectId,
      title,
      description,
      priority,
      assignee: assignee || null,
    }).select().single();
    if (error) { toast.error('Failed to create task'); return; }

    await supabase.from('task_changelog').insert({ task_id: data.id, message: 'Task created' });
    toast.success('Task created');
    await fetchTasks(selectedProjectId);
    await fetchProjects(); // update task count
  }, [selectedProjectId, fetchTasks, fetchProjects]);

  const seedDatabase = useCallback(async () => {
    if (!user) return;
    try {
      // Create sample projects
      const { data: p1 } = await supabase.from('projects').insert({ name: 'Website Redesign', description: 'Modernize the company website', user_id: user.id }).select().single();
      const { data: p2 } = await supabase.from('projects').insert({ name: 'Mobile App', description: 'Build cross-platform mobile app', user_id: user.id }).select().single();

      if (p1) {
        const { data: t1 } = await supabase.from('tasks').insert({ project_id: p1.id, title: 'Design homepage mockup', description: 'Create wireframes and high-fidelity mockups', status: 'done', priority: 'high', assignee: 'Alice' }).select().single();
        const { data: t2 } = await supabase.from('tasks').insert({ project_id: p1.id, title: 'Implement nav component', description: 'Responsive navigation with mobile menu', status: 'in_progress', priority: 'medium', assignee: 'Bob' }).select().single();
        await supabase.from('tasks').insert({ project_id: p1.id, title: 'Set up CI/CD pipeline', description: 'Automate deployments to staging', status: 'todo', priority: 'medium' });
        if (t1) await supabase.from('task_changelog').insert([{ task_id: t1.id, message: 'Task created' }, { task_id: t1.id, message: 'Moved to done' }]);
        if (t2) await supabase.from('task_changelog').insert({ task_id: t2.id, message: 'Task created' });
      }

      if (p2) {
        await supabase.from('tasks').insert({ project_id: p2.id, title: 'Set up React Native', description: 'Initialize and configure the project', status: 'done', priority: 'high', assignee: 'Alice' });
        await supabase.from('tasks').insert({ project_id: p2.id, title: 'Build auth screens', description: 'Login, register, forgot password', status: 'in_progress', priority: 'high', assignee: 'Bob' });
        await supabase.from('tasks').insert({ project_id: p2.id, title: 'Push notifications', description: 'Integrate Firebase Cloud Messaging', status: 'todo', priority: 'medium' });
      }

      toast.success('Database seeded with sample data');
      await fetchProjects();
    } catch {
      toast.error('Failed to seed database');
    }
  }, [user, fetchProjects]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return { projects, selectedProject, selectedProjectId, setSelectedProjectId, tasks, loading, moveTask, addProject, updateProject, addTask, updateTask, deleteTask, updateTaskDates, updateTaskTimes, seedDatabase };
}
