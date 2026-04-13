import type { CSSProperties } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Clock, MessageSquare, User, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskWithChangelog } from '@/hooks/useProjects';

const priorityStyles: Record<string, string> = {
  high: 'bg-destructive/10 text-destructive',
  medium: 'bg-accent text-accent-foreground',
  low: 'bg-muted text-muted-foreground',
};

const getTaskCardStyle = (style: CSSProperties | undefined, isDragging: boolean): CSSProperties => {
  if (!style || !isDragging) return style ?? {};

  return {
    ...style,
    transform: style.transform ? `${style.transform} rotate(1deg) scale(1.02)` : undefined,
    zIndex: 30,
  };
};

interface Props {
  task: TaskWithChangelog;
  index: number;
  onOpenLog: (task: TaskWithChangelog) => void;
  onEdit?: (task: TaskWithChangelog) => void;
}

export function TaskCard({ task, index, onOpenLog, onEdit }: Props) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getTaskCardStyle(provided.draggableProps.style, snapshot.isDragging)}
          className={cn(
            'bg-card rounded-lg border p-3.5 shadow-sm cursor-grab active:cursor-grabbing animate-task-enter select-none will-change-transform transition-[box-shadow,background-color,border-color,opacity] duration-150 ease-out motion-reduce:transition-none',
            snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary/25 opacity-95' : 'hover:shadow-md'
          )}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-medium text-card-foreground leading-snug">{task.title}</h4>
            <span className={cn('text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded', priorityStyles[task.priority])}>
              {task.priority}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
          <div className="flex items-center justify-between text-muted-foreground">
            <div className="flex items-center gap-3">
              {task.assignee && (
                <span className="flex items-center gap-1 text-xs">
                  <User className="w-3 h-3" /> {task.assignee}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs">
                <Clock className="w-3 h-3" /> {new Date(task.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                  className="flex items-center gap-1 text-xs hover:text-primary transition-colors"
                  title="Edit task"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onOpenLog(task); }}
                className="flex items-center gap-1 text-xs hover:text-primary transition-colors"
                title="View change log"
              >
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
