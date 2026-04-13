import axios from 'axios';
import type { Task, Project } from '@/types/project';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const projectsApi = {
  getAll: () => api.get<Project[]>('/projects'),
  getById: (id: string) => api.get<Project>(`/projects/${id}`),
};

export const tasksApi = {
  getByProject: (projectId: string) => api.get<Task[]>(`/projects/${projectId}/tasks`),
  create: (projectId: string, task: Partial<Task>) => api.post<Task>(`/projects/${projectId}/tasks`, task),
  update: (taskId: string, data: Partial<Task>) => api.patch<Task>(`/tasks/${taskId}`, data),
  delete: (taskId: string) => api.delete(`/tasks/${taskId}`),
  updateStatus: (taskId: string, status: string) => api.patch<Task>(`/tasks/${taskId}/status`, { status }),
};

export const seedApi = {
  seed: () => api.post('/seed'),
};

export default api;
