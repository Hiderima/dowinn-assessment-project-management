import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEmployees } from '@/hooks/useEmployees';

type DepartmentTask = {
  id: string;
  status: 'todo' | 'in_progress' | 'done';
  assignee: string | null;
  department: string | null;
};

function stripEmployeeNumber(assignee: string) {
  return assignee.replace(/\s*\(.*\)$/, '').trim();
}

export function DepartmentProgressBars({ filterDepartment }: { filterDepartment?: string } = {}) {
  const { employees } = useEmployees();
  const [allTasks, setAllTasks] = useState<DepartmentTask[]>([]);

  const fetchAllTasks = useCallback(async () => {
    const { data } = await supabase.from('tasks').select('*');
    setAllTasks((data as DepartmentTask[]) || []);
  }, []);

  useEffect(() => { fetchAllTasks(); }, [fetchAllTasks]);

  useEffect(() => {
    const handler = () => fetchAllTasks();
    window.addEventListener('tasks-updated', handler);
    return () => window.removeEventListener('tasks-updated', handler);
  }, [fetchAllTasks]);

  useEffect(() => {
    const channel = supabase
      .channel('dept-tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchAllTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllTasks]);

  const nameToDept = new Map<string, string>();
  employees.forEach((employee) => {
    if (employee.display_name && employee.department) {
      nameToDept.set(employee.display_name.toLowerCase(), employee.department);
    }
  });

  const deptTasks = new Map<string, DepartmentTask[]>();
  allTasks.forEach((task) => {
    const dept = task.department || (task.assignee ? nameToDept.get(stripEmployeeNumber(task.assignee).toLowerCase()) || null : null);
    if (!dept) return;

    if (!deptTasks.has(dept)) {
      deptTasks.set(dept, []);
    }

    deptTasks.get(dept)!.push(task);
  });

  const sortedDepts = [...deptTasks.keys()].sort();

  if (sortedDepts.length === 0) return null;

  return (
    <div className="space-y-4">
      {sortedDepts.map((dept) => {
        const dt = deptTasks.get(dept)!;
        const total = dt.length;
        const done = dt.filter((task) => task.status === 'done').length;
        const inProgress = dt.filter((task) => task.status === 'in_progress').length;
        const todo = total - done - inProgress;
        const donePercent = (done / total) * 100;
        const inProgressPercent = (inProgress / total) * 100;
        const overallPercent = Math.round(((done + inProgress * 0.5) / total) * 100);

        return (
          <div key={dept} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-card-foreground">{dept}</span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground">{total} task{total !== 1 ? 's' : ''}</span>
                <span className="text-xs font-semibold text-card-foreground">{overallPercent}%</span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden flex">
              <div
                className="h-full rounded-l-full transition-all duration-500"
                style={{ width: `${donePercent}%`, background: 'hsl(var(--column-done))' }}
              />
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${inProgressPercent}%`, background: 'hsl(var(--column-progress))' }}
              />
            </div>
            <div className="flex gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'hsl(var(--column-done))' }} />
                Done {done}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'hsl(var(--column-progress))' }} />
                In Progress {inProgress}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'hsl(var(--column-todo))' }} />
                Todo {todo}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
