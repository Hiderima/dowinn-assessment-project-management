import { useEmployees } from '@/hooks/useEmployees';
import type { TaskWithChangelog } from '@/hooks/useProjects';

interface Props {
  tasks: TaskWithChangelog[];
}

function stripEmployeeNumber(assignee: string) {
  return assignee.replace(/\s*\(.*\)$/, '').trim();
}

export function DepartmentProgressBars({ tasks }: Props) {
  const { employees, departments } = useEmployees();

  // Map each employee name to their department
  const nameToDept = new Map<string, string>();
  employees.forEach(e => {
    if (e.display_name && e.department) {
      nameToDept.set(e.display_name.toLowerCase(), e.department);
    }
  });

  // Group tasks by department
  const deptTasks = new Map<string, TaskWithChangelog[]>();
  tasks.forEach(task => {
    if (!task.assignee) return;
    const name = stripEmployeeNumber(task.assignee).toLowerCase();
    const dept = nameToDept.get(name);
    if (!dept) return;
    if (!deptTasks.has(dept)) deptTasks.set(dept, []);
    deptTasks.get(dept)!.push(task);
  });

  // Sort departments alphabetically
  const sortedDepts = [...deptTasks.keys()].sort();

  if (sortedDepts.length === 0) return null;

  return (
    <div className="space-y-4">
      {sortedDepts.map(dept => {
        const dt = deptTasks.get(dept)!;
        const total = dt.length;
        const done = dt.filter(t => t.status === 'done').length;
        const inProgress = dt.filter(t => t.status === 'in_progress').length;
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
