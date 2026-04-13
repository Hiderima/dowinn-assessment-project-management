import type { TaskWithChangelog } from '@/hooks/useProjects';

interface Props {
  tasks: TaskWithChangelog[];
}

export function ProjectProgressBar({ tasks }: Props) {
  const total = tasks.length;
  if (total === 0) return null;

  const done = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const donePercent = (done / total) * 100;
  const inProgressPercent = (inProgress / total) * 100;
  const overallPercent = Math.round(((done + inProgress * 0.5) / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Progress</span>
        <span className="text-xs font-semibold text-card-foreground">{overallPercent}%</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden flex">
        <div className="h-full rounded-l-full transition-all duration-500" style={{ width: `${donePercent}%`, background: 'hsl(var(--column-done))' }} />
        <div className="h-full transition-all duration-500" style={{ width: `${inProgressPercent}%`, background: 'hsl(var(--column-progress))' }} />
      </div>
      <div className="flex gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--column-done))' }} /> Done {done}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--column-progress))' }} /> In Progress {inProgress}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--column-todo))' }} /> Todo {total - done - inProgress}</span>
      </div>
    </div>
  );
}
