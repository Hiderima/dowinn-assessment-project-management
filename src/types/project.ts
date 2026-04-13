export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface ChangeLogEntry {
  id: string;
  message: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  changelog: ChangeLogEntry[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  taskCount: number;
}

export const COLUMNS: { id: TaskStatus; title: string; colorVar: string }[] = [
  { id: 'todo', title: 'Todo', colorVar: 'var(--column-todo)' },
  { id: 'in_progress', title: 'In Progress', colorVar: 'var(--column-progress)' },
  { id: 'done', title: 'Done', colorVar: 'var(--column-done)' },
];
