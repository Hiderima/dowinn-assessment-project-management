import { X, Clock } from 'lucide-react';
import type { TaskWithChangelog } from '@/hooks/useProjects';

/** Props for the change-log modal. */
interface Props {
  task: TaskWithChangelog; // Task whose history will be displayed.
  onClose: () => void;     // Dismiss handler (also fires on backdrop click).
}

/** Modal showing chronological change history for a task */
export function ChangeLogModal({ task, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card rounded-xl shadow-xl border w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-base font-semibold text-card-foreground">Change Log</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{task.title}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Timeline entries */}
        <div className="p-5 max-h-80 overflow-y-auto">
          {task.changelog.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No history yet</p>
          ) : (
            <div className="relative pl-5 space-y-4 before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-px before:bg-border">
              {task.changelog.map(entry => (
                <div key={entry.id} className="relative">
                  <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-primary border-2 border-card" />
                  <p className="text-sm text-card-foreground">{entry.message}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
