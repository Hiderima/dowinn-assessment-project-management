import { Draggable } from '@hello-pangea/dnd';
import { Clock, MessageSquare, User, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskWithChangelog } from '@/hooks/useProjects';

/* Priority badge styles mapped to semantic tokens */
const priorityStyles: Record<string, string> = {
  high: 'bg-destructive/10 text-destructive',
  medium: 'bg-accent text-accent-foreground',
  low: 'bg-muted text-muted-foreground',
};

/** Props for an individual draggable task card. */
interface Props {
  task: TaskWithChangelog;                            // Task data with its changelog.
  index: number;                                      // Position within the column (required by drag library).
  onOpenLog: (task: TaskWithChangelog) => void;       // Open the change-log modal for this task.
  onEdit?: (task: TaskWithChangelog) => void;         // Optional edit handler (opens edit modal).
}

/** Draggable task card shown inside a Kanban column */
export function TaskCard({ task, index, onOpenLog, onEdit }: Props) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'bg-card rounded-lg border p-3.5 shadow-sm transition-shadow cursor-grab active:cursor-grabbing',
            snapshot.isDragging && 'shadow-lg ring-2 ring-primary/20'
          )}
        >
          {/* Title + priority badge */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-medium text-card-foreground leading-snug">{task.title}</h4>
            <span className={cn('text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded', priorityStyles[task.priority])}>
              {task.priority}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>

          {/* Footer: assignee, date, edit & changelog buttons */}
          <div className="flex items-center justify-between text-muted-foreground">
            <div className="flex items-center gap-3">
              {task.assignee && (
                <span className="flex items-center gap-1 text-xs">
                  <User className="w-3 h-3" /> {task.assignee.replace(/\s*\(.*\)$/, '')}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs">
                <Clock className="w-3 h-3" /> {new Date(task.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <button onClick={(e) => { e.stopPropagation(); onEdit(task); }} className="flex items-center gap-1 text-xs hover:text-primary transition-colors" title="Edit task">
                  <Pencil className="w-3 h-3" />
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); onOpenLog(task); }} className="flex items-center gap-1 text-xs hover:text-primary transition-colors" title="View change log">
                <MessageSquare className="w-3 h-3" />
                {task.changelog.length}
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
