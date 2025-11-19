import { useEffect } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useUIStore } from '@/stores/uiStore';
import type { CreateTaskPayload, UpdateTaskPayload } from '@/types';

export const useTasks = () => {
  const addToast = useUIStore((state) => state.addToast);
  const {
    tasks,
    selectedTask,
    filters,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    setSelectedTask,
    setFilters,
    clearFilters,
    clearError,
  } = useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (payload: CreateTaskPayload) => {
    try {
      const task = await createTask(payload);
      addToast({
        type: 'success',
        message: 'Task created successfully!',
      });
      return task;
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Failed to create task',
      });
      throw error;
    }
  };

  const handleUpdateTask = async (payload: UpdateTaskPayload) => {
    try {
      const task = await updateTask(payload);
      addToast({
        type: 'success',
        message: 'Task updated successfully!',
      });
      return task;
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Failed to update task',
      });
      throw error;
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      addToast({
        type: 'success',
        message: 'Task deleted successfully!',
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Failed to delete task',
      });
      throw error;
    }
  };

  return {
    tasks,
    selectedTask,
    filters,
    isLoading,
    error,
    createTask: handleCreateTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    setSelectedTask,
    setFilters,
    clearFilters,
    clearError,
    refreshTasks: fetchTasks,
  };
};
