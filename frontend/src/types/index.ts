// Task Status Constants
export const TaskStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

// Task Priority Constants
export const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];

// Task Category Constants
export const TaskCategory = {
  WORK: 'WORK',
  PERSONAL: 'PERSONAL',
  SHOPPING: 'SHOPPING',
  HEALTH: 'HEALTH',
  FINANCE: 'FINANCE',
  EDUCATION: 'EDUCATION',
  OTHER: 'OTHER',
} as const;

export type TaskCategory = typeof TaskCategory[keyof typeof TaskCategory];

// Task Interface
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: TaskCategory;
  dueDate?: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// Task Creation/Update Payloads
export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: string;
  startTime?: string;
  endTime?: string;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  id: string;
}

// User Interface
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

// Auth Interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Filter and Sort Options
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: TaskCategory[];
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface TaskSortOptions {
  field: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  direction: 'asc' | 'desc';
}

// API Response Types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Theme
export type Theme = 'light' | 'dark' | 'system';
