import { Droppable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';
import type { TaskWithChangelog } from '@/hooks/useProjects';

/** Props for a single Kanban column. */
interface Props {
  status: string;                                  // Droppable id matching the task status enum.
  title: string;                                   // Header label.
  colorVar: string;                                // CSS variable expression for the status dot.
  tasks: TaskWithChangelog[];                      // Tasks belonging to this column.
  onOpenLog: (task: TaskWithChangelog) => void;    // Open the change-log modal for a card.
  onEdit?: (task: TaskWithChangelog) => void;      // Optional — open the edit modal.
}

/** Single droppable column in the Kanban board */
export function KanbanColumn({ status, title, colorVar, tasks, onOpenLog, onEdit }: Props) {
  return (
    <div className="flex-1 min-w-0 md:min-w-[300px] flex flex-col">
      {/* Column header with status dot and task count */}
      <div className="flex items-center gap-2.5 mb-4 px-1">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `hsl(${colorVar})` }} />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn('flex-1 space-y-2.5 p-2 rounded-lg transition-colors min-h-[200px]', snapshot.isDraggingOver ? 'bg-primary/5' : 'bg-muted/30')}
          >
            {tasks.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} onOpenLog={onOpenLog} onEdit={onEdit} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
