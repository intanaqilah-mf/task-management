import { apiClient } from './api';
import { API_ENDPOINTS } from '@/constants/config';
import type { Task, CreateTaskPayload, UpdateTaskPayload, TaskFilters } from '@/types';

export const taskService = {
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    const params: Record<string, any> = {};

    if (filters) {
      if (filters.status?.length) params.status = filters.status;
      if (filters.priority?.length) params.priority = filters.priority;
      if (filters.category?.length) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.dueDateFrom) params.dueDateFrom = filters.dueDateFrom;
      if (filters.dueDateTo) params.dueDateTo = filters.dueDateTo;
    }

    return apiClient.get<Task[]>(API_ENDPOINTS.TASKS.LIST, params);
  },

  async getTask(id: string): Promise<Task> {
    return apiClient.get<Task>(API_ENDPOINTS.TASKS.GET(id));
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    return apiClient.post<Task>(API_ENDPOINTS.TASKS.CREATE, payload);
  },

  async updateTask(payload: UpdateTaskPayload): Promise<Task> {
    const { id, ...data } = payload;
    return apiClient.put<Task>(API_ENDPOINTS.TASKS.UPDATE(String(id)), data);
  },

  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.TASKS.DELETE(id));
  },
};
