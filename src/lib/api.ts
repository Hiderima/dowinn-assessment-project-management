// Legacy REST API client (axios) — kept as a fallback for environments without Supabase.
// Most live data flows through the Supabase client instead of this module.
import axios from 'axios';
import type { Task, Project } from '@/types/project';

// Pre-configured axios instance pointing at a local dev backend.
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

/** Project endpoints — list and fetch-by-id. */
export const projectsApi = {
  getAll: () => api.get<Project[]>('/projects'),
  getById: (id: string) => api.get<Project>(`/projects/${id}`),
};

/** Task endpoints — CRUD plus a dedicated status update for Kanban moves. */
export const tasksApi = {
  getByProject: (projectId: string) => api.get<Task[]>(`/projects/${projectId}/tasks`),
  create: (projectId: string, task: Partial<Task>) => api.post<Task>(`/projects/${projectId}/tasks`, task),
  update: (taskId: string, data: Partial<Task>) => api.patch<Task>(`/tasks/${taskId}`, data),
  delete: (taskId: string) => api.delete(`/tasks/${taskId}`),
  updateStatus: (taskId: string, status: string) => api.patch<Task>(`/tasks/${taskId}/status`, { status }),
};

/** Seed endpoint — populate the legacy backend with sample data. */
export const seedApi = {
  seed: () => api.post('/seed'),
};

export default api;
