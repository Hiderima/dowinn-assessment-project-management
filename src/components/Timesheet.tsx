import { Clock, User } from 'lucide-react';
import type { Task } from '@/types/project';

interface Props {
  tasks: Task[];
}

const statusLabel: Record<string, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
};

const statusDot: Record<string, string> = {
  todo: 'hsl(220, 72%, 50%)',
  in_progress: 'hsl(35, 92%, 50%)',
  done: 'hsl(145, 63%, 42%)',
};

function getDaysSince(dateStr: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)));
}

export function Timesheet({ tasks }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        No tasks to display
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium text-muted-foreground text-xs">Task</th>
            <th className="pb-2 font-medium text-muted-foreground text-xs">Assignee</th>
            <th className="pb-2 font-medium text-muted-foreground text-xs">Status</th>
            <th className="pb-2 font-medium text-muted-foreground text-xs">Created</th>
            <th className="pb-2 font-medium text-muted-foreground text-xs text-right">Days</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {tasks.map(task => (
            <tr key={task.id} className="hover:bg-muted/30 transition-colors">
              <td className="py-2.5 pr-4">
                <span className="font-medium text-card-foreground">{task.title}</span>
              </td>
              <td className="py-2.5 pr-4">
                {task.assignee ? (
                  <span className="flex items-center gap-1 text-muted-foreground text-xs">
                    <User className="w-3 h-3" /> {task.assignee}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground/50">Unassigned</span>
                )}
              </td>
              <td className="py-2.5 pr-4">
                <span className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ background: statusDot[task.status] }} />
                  {statusLabel[task.status]}
                </span>
              </td>
              <td className="py-2.5 pr-4 text-xs text-muted-foreground">
                {new Date(task.createdAt).toLocaleDateString()}
              </td>
              <td className="py-2.5 text-right">
                <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {getDaysSince(task.createdAt)}d
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
