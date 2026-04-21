// Shared domain types used by the legacy REST API client and a few presentation components.

/** Allowed task lifecycle states. */
export type TaskStatus = 'todo' | 'in_progress' | 'done';

/** A single entry in a task's audit/history trail. */
export interface ChangeLogEntry {
  id: string;
  message: string;
  timestamp: string;
}

/** A task as represented by the legacy REST backend. */
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

/** A project plus a precomputed task count, used by the sidebar. */
export interface Project {
  id: string;
  name: string;
  description: string;
  taskCount: number;
}

// Kanban column definitions — id maps to TaskStatus, colorVar references CSS tokens.
export const COLUMNS: { id: TaskStatus; title: string; colorVar: string }[] = [
  { id: 'todo', title: 'Todo', colorVar: 'var(--column-todo)' },
  { id: 'in_progress', title: 'In Progress', colorVar: 'var(--column-progress)' },
  { id: 'done', title: 'Done', colorVar: 'var(--column-done)' },
];
