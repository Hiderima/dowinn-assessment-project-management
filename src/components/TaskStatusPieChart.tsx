import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { TaskWithChangelog } from '@/hooks/useProjects';

interface Props {
  tasks: TaskWithChangelog[];
}

const STATUS_CONFIG = [
  { key: 'todo', label: 'Todo', color: 'hsl(220, 72%, 50%)' },
  { key: 'in_progress', label: 'In Progress', color: 'hsl(35, 92%, 50%)' },
  { key: 'done', label: 'Done', color: 'hsl(145, 63%, 42%)' },
];

export function TaskStatusPieChart({ tasks }: Props) {
  if (tasks.length === 0) return <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">No tasks yet</div>;

  const data = STATUS_CONFIG.map(s => ({ name: s.label, value: tasks.filter(t => t.status === s.key).length, color: s.color })).filter(d => d.value > 0);

  return (
    <div className="flex items-center gap-4">
      <div className="w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={3} dataKey="value" strokeWidth={0}>
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
}
