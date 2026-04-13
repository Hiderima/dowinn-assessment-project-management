import { useState, useEffect, useCallback } from 'react';
import type { Project, Task, TaskStatus } from '@/types/project';
import { projectsApi, tasksApi, seedApi } from '@/lib/api';
import { toast } from 'sonner';

// Demo data used when API is unavailable
const DEMO_PROJECTS: Project[] = [
  { id: '1', name: 'Website Redesign', description: 'Modernize the company website', taskCount: 5 },
  { id: '2', name: 'Mobile App', description: 'Build cross-platform mobile app', taskCount: 3 },
  { id: '3', name: 'API Integration', description: 'Third-party API integrations', taskCount: 4 },
];

const DEMO_TASKS: Record<string, Task[]> = {
  '1': [
    { id: 't1', title: 'Design homepage mockup', description: 'Create wireframes and high-fidelity mockups', status: 'done', priority: 'high', assignee: 'Alice', changelog: [{ id: 'c1', message: 'Task created', timestamp: '2026-04-10T09:00:00Z' }, { id: 'c2', message: 'Moved to Done', timestamp: '2026-04-12T14:00:00Z' }], createdAt: '2026-04-10T09:00:00Z' },
    { id: 't2', title: 'Implement nav component', description: 'Responsive navigation with mobile menu', status: 'in_progress', priority: 'medium', assignee: 'Bob', changelog: [{ id: 'c3', message: 'Task created', timestamp: '2026-04-10T10:00:00Z' }], createdAt: '2026-04-10T10:00:00Z' },
    { id: 't3', title: 'Set up CI/CD pipeline', description: 'Automate deployments to staging', status: 'todo', priority: 'medium', changelog: [{ id: 'c4', message: 'Task created', timestamp: '2026-04-11T08:00:00Z' }], createdAt: '2026-04-11T08:00:00Z' },
    { id: 't4', title: 'Write unit tests', description: 'Cover critical components with tests', status: 'todo', priority: 'low', assignee: 'Charlie', changelog: [{ id: 'c5', message: 'Task created', timestamp: '2026-04-11T09:00:00Z' }], createdAt: '2026-04-11T09:00:00Z' },
    { id: 't5', title: 'Optimize images', description: 'Compress and serve responsive images', status: 'in_progress', priority: 'low', changelog: [{ id: 'c6', message: 'Task created', timestamp: '2026-04-12T07:00:00Z' }], createdAt: '2026-04-12T07:00:00Z' },
  ],
  '2': [
    { id: 't6', title: 'Set up React Native project', description: 'Initialize and configure the project', status: 'done', priority: 'high', assignee: 'Alice', changelog: [{ id: 'c7', message: 'Task created', timestamp: '2026-04-09T08:00:00Z' }], createdAt: '2026-04-09T08:00:00Z' },
    { id: 't7', title: 'Build auth screens', description: 'Login, register, forgot password', status: 'in_progress', priority: 'high', assignee: 'Bob', changelog: [{ id: 'c8', message: 'Task created', timestamp: '2026-04-10T08:00:00Z' }], createdAt: '2026-04-10T08:00:00Z' },
    { id: 't8', title: 'Push notifications', description: 'Integrate Firebase Cloud Messaging', status: 'todo', priority: 'medium', changelog: [{ id: 'c9', message: 'Task created', timestamp: '2026-04-11T08:00:00Z' }], createdAt: '2026-04-11T08:00:00Z' },
  ],
  '3': [
    { id: 't9', title: 'Stripe integration', description: 'Payment processing setup', status: 'in_progress', priority: 'high', assignee: 'Charlie', changelog: [{ id: 'c10', message: 'Task created', timestamp: '2026-04-08T08:00:00Z' }], createdAt: '2026-04-08T08:00:00Z' },
    { id: 't10', title: 'SendGrid emails', description: 'Transactional email service', status: 'todo', priority: 'medium', changelog: [{ id: 'c11', message: 'Task created', timestamp: '2026-04-09T08:00:00Z' }], createdAt: '2026-04-09T08:00:00Z' },
    { id: 't11', title: 'OAuth2 providers', description: 'Google and GitHub SSO', status: 'done', priority: 'high', assignee: 'Alice', changelog: [{ id: 'c12', message: 'Task created', timestamp: '2026-04-07T08:00:00Z' }], createdAt: '2026-04-07T08:00:00Z' },
    { id: 't12', title: 'Webhook handlers', description: 'Process incoming webhooks', status: 'todo', priority: 'low', changelog: [{ id: 'c13', message: 'Task created', timestamp: '2026-04-10T08:00:00Z' }], createdAt: '2026-04-10T08:00:00Z' },
  ],
};

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(DEMO_PROJECTS[0].id);
  const [tasks, setTasks] = useState<Task[]>(DEMO_TASKS['1']);
  const [loading, setLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await projectsApi.getAll();
      setProjects(res.data);
      setApiAvailable(true);
      if (res.data.length > 0 && !res.data.find(p => p.id === selectedProjectId)) {
        setSelectedProjectId(res.data[0].id);
      }
    } catch {
      setApiAvailable(false);
      setProjects(DEMO_PROJECTS);
    }
  }, [selectedProjectId]);

  const fetchTasks = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      if (apiAvailable) {
        const res = await tasksApi.getByProject(projectId);
        setTasks(res.data);
      } else {
        setTasks(DEMO_TASKS[projectId] || []);
      }
    } catch {
      setTasks(DEMO_TASKS[projectId] || []);
    } finally {
      setLoading(false);
    }
  }, [apiAvailable]);

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { fetchTasks(selectedProjectId); }, [selectedProjectId, apiAvailable]);

  const moveTask = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const entry = { id: `cl-${Date.now()}`, message: `Moved to ${newStatus.replace('_', ' ')}`, timestamp: new Date().toISOString() };
      return { ...t, status: newStatus, changelog: [...t.changelog, entry] };
    }));
    if (apiAvailable) {
      try { await tasksApi.updateStatus(taskId, newStatus); } catch { toast.error('Failed to update task status'); }
    }
  }, [apiAvailable]);

  const seedDatabase = useCallback(async () => {
    try {
      await seedApi.seed();
      toast.success('Database seeded successfully');
      await fetchProjects();
    } catch {
      toast.error('Failed to seed database. Is the API running?');
    }
  }, [fetchProjects]);

  const addProject = useCallback((name: string, description: string) => {
    const newProject: Project = {
      id: `p-${Date.now()}`,
      name,
      description,
      taskCount: 0,
    };
    setProjects(prev => [...prev, newProject]);
    setSelectedProjectId(newProject.id);
    setTasks([]);
    toast.success('Project created');
  }, []);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return { projects, selectedProject, selectedProjectId, setSelectedProjectId, tasks, loading, moveTask, seedDatabase, addProject, apiAvailable };
}
