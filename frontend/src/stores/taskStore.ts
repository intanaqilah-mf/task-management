import { create } from 'zustand';
import { taskService } from '@/services/task.service';
import type { Task, CreateTaskPayload, UpdateTaskPayload, TaskFilters } from '@/types';

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  filters: TaskFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (payload: CreateTaskPayload) => Promise<Task>;
  updateTask: (payload: UpdateTaskPayload) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  setSelectedTask: (task: Task | null) => void;
  setFilters: (filters: TaskFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
}

const initialFilters: TaskFilters = {
  status: [],
  priority: [],
  category: [],
  search: '',
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedTask: null,
  filters: initialFilters,
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskService.getTasks(get().filters);
      set({ tasks, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch tasks',
        isLoading: false,
      });
    }
  },

  createTask: async (payload: CreateTaskPayload) => {
    set({ isLoading: true, error: null });
    try {
      const newTask = await taskService.createTask(payload);
      set((state) => ({
        tasks: [newTask, ...state.tasks],
        isLoading: false,
      }));
      return newTask;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create task',
        isLoading: false,
      });
      throw error;
    }
  },

  updateTask: async (payload: UpdateTaskPayload) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await taskService.updateTask(payload);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        ),
        selectedTask:
          state.selectedTask?.id === updatedTask.id
            ? updatedTask
            : state.selectedTask,
        isLoading: false,
      }));
      return updatedTask;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update task',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await taskService.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete task',
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedTask: (task: Task | null) => set({ selectedTask: task }),

  setFilters: (filters: TaskFilters) => {
    set({ filters });
    // Automatically fetch tasks with new filters
    get().fetchTasks();
  },

  clearFilters: () => {
    set({ filters: initialFilters });
    get().fetchTasks();
  },

  clearError: () => set({ error: null }),
}));
