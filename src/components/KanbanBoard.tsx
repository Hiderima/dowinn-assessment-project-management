import { useState } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import type { Task, TaskStatus } from '@/types/project';
import { COLUMNS } from '@/types/project';
import { KanbanColumn } from './KanbanColumn';
import { ChangeLogModal } from './ChangeLogModal';

interface Props {
  tasks: Task[];
  loading: boolean;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
}

export function KanbanBoard({ tasks, loading, onMoveTask }: Props) {
  const [logTask, setLogTask] = useState<Task | null>(null);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as TaskStatus;
    if (newStatus !== result.source.droppableId) {
      onMoveTask(result.draggableId, newStatus);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-5 flex-1 overflow-x-auto p-6">
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              status={col.id}
              title={col.title}
              colorVar={col.colorVar}
              tasks={tasks.filter(t => t.status === col.id)}
              onOpenLog={setLogTask}
            />
          ))}
        </div>
      </DragDropContext>
      {logTask && <ChangeLogModal task={logTask} onClose={() => setLogTask(null)} />}
    </>
  );
}
