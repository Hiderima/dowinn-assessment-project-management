import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { TaskWithChangelog, ProjectWithCount } from '@/hooks/useProjects';

interface Props {
  tasks: TaskWithChangelog[];
  projects?: ProjectWithCount[];
}

const STATUS_CONFIG = [
  { key: 'todo', label: 'Todo', color: 'hsl(220, 72%, 50%)' },
  { key: 'in_progress', label: 'In Progress', color: 'hsl(35, 92%, 50%)' },
  { key: 'done', label: 'Done', color: 'hsl(145, 63%, 42%)' },
];

export function TaskStatusPieChart({ tasks, projects }: Props) {
  if (tasks.length === 0) return <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">No tasks yet</div>;

  const data = STATUS_CONFIG.map(s => ({ name: s.label, value: tasks.filter(t => t.status === s.key).length, color: s.color })).filter(d => d.value > 0);

  // Per-project breakdown (only when projects are provided, i.e. "All Projects" view)
  const projectBreakdown = projects?.map(p => {
    const projectTasks = tasks.filter(t => t.project_id === p.id);
    return {
      name: p.name,
      todo: projectTasks.filter(t => t.status === 'todo').length,
      inProgress: projectTasks.filter(t => t.status === 'in_progress').length,
      done: projectTasks.filter(t => t.status === 'done').length,
      total: projectTasks.length,
    };
  }).filter(p => p.total > 0);

  const chartSection = (
    <div className="flex items-center gap-4">
      <div className="w-56 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" strokeWidth={0}>
              {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px', color: 'hsl(var(--card-foreground))' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-sm" style={{ background: d.color }} />
            <span className="text-muted-foreground">{d.name}</span>
            <span className="font-semibold text-card-foreground ml-auto">{d.value}</span>
          </div>
        ))}
        <div className="pt-1 border-t text-xs text-muted-foreground">Total: <span className="font-semibold text-card-foreground">{tasks.length}</span></div>
      </div>
    </div>
  );

  const breakdownSection = projectBreakdown && projectBreakdown.length > 0 ? (
    <div className="flex-1 min-w-0">
      <h3 className="text-xs font-semibold text-card-foreground mb-2 uppercase tracking-wider">Per Project Breakdown</h3>
      <div className="rounded-lg border overflow-auto" style={{ maxHeight: '180px' }}>
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-muted/80 backdrop-blur">
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Project</th>
              <th className="text-center px-3 py-2 font-medium" style={{ color: STATUS_CONFIG[0].color }}>Todo</th>
              <th className="text-center px-3 py-2 font-medium" style={{ color: STATUS_CONFIG[1].color }}>In Prog.</th>
              <th className="text-center px-3 py-2 font-medium" style={{ color: STATUS_CONFIG[2].color }}>Done</th>
              <th className="text-center px-3 py-2 font-medium text-muted-foreground">Total</th>
            </tr>
          </thead>
          <tbody>
            {projectBreakdown.map(p => (
              <tr key={p.name} className="border-t">
                <td className="px-3 py-2 font-medium text-card-foreground truncate max-w-[120px]">{p.name}</td>
                <td className="text-center px-3 py-2 text-muted-foreground">{p.todo || '—'}</td>
                <td className="text-center px-3 py-2 text-muted-foreground">{p.inProgress || '—'}</td>
                <td className="text-center px-3 py-2 text-muted-foreground">{p.done || '—'}</td>
                <td className="text-center px-3 py-2 font-semibold text-card-foreground">{p.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : null;

  if (projects && breakdownSection) {
    return (
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        <div className="shrink-0">{chartSection}</div>
        {breakdownSection}
      </div>
    );
  }

  return chartSection;
}
