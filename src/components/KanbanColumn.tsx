import { Droppable } from '@hello-pangea/dnd';
import type { Task, TaskStatus } from '@/types/project';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

interface Props {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  colorVar: string;
  onOpenLog: (task: Task) => void;
}

export function KanbanColumn({ status, title, tasks, colorVar, onOpenLog }: Props) {
  return (
    <div className="flex-1 min-w-[300px] flex flex-col">
      <div className="flex items-center gap-2.5 mb-4 px-1">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `hsl(${colorVar})` }} />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 space-y-2.5 p-2 rounded-lg transition-colors min-h-[200px]',
              snapshot.isDraggingOver ? 'bg-primary/5' : 'bg-muted/30'
            )}
          >
            {tasks.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} onOpenLog={onOpenLog} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
