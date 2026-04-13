import { useState } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { ChangeLogModal } from './ChangeLogModal';
import type { TaskWithChangelog } from '@/hooks/useProjects';

const COLUMNS = [
  { id: 'todo' as const, title: 'Todo', colorVar: 'var(--column-todo)' },
  { id: 'in_progress' as const, title: 'In Progress', colorVar: 'var(--column-progress)' },
  { id: 'done' as const, title: 'Done', colorVar: 'var(--column-done)' },
];

interface Props {
  tasks: TaskWithChangelog[];
  loading: boolean;
  onMoveTask: (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => void;
  onEditTask?: (task: TaskWithChangelog) => void;
}

export function KanbanBoard({ tasks, loading, onMoveTask, onEditTask }: Props) {
  const [logTask, setLogTask] = useState<TaskWithChangelog | null>(null);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as 'todo' | 'in_progress' | 'done';
    if (newStatus !== result.source.droppableId) {
      onMoveTask(result.draggableId, newStatus);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-5 p-6" style={{ minWidth: 'max-content' }}>
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              status={col.id}
              title={col.title}
              colorVar={col.colorVar}
              tasks={tasks.filter(t => t.status === col.id)}
              onOpenLog={setLogTask}
              onEdit={onEditTask}
            />
          ))}
        </div>
      </DragDropContext>
      {logTask && <ChangeLogModal task={logTask} onClose={() => setLogTask(null)} />}
    </>
  );
}
