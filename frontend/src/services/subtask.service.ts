import { apiClient } from './api';
import type { SubTask } from '@/types';

export const subtaskService = {
  async updateSubtask(subtaskId: number, completed: boolean): Promise<SubTask> {
    return apiClient.patch<SubTask>(`/api/subtasks/${subtaskId}?completed=${completed}`, {});
  },
};
