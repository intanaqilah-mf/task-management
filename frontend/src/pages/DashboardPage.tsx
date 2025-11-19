import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskForm } from '@/components/forms/TaskForm';
import { TaskCard } from '@/components/forms/TaskCard';
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '@/types';
import { Plus, Search, X } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    tasks,
    selectedTask,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    setSelectedTask,
    setFilters,
    filters,
  } = useTasks();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateTask = async (data: CreateTaskPayload) => {
    await createTask(data);
    setIsCreateModalOpen(false);
  };

  const handleEditTask = async (data: UpdateTaskPayload) => {
    if (!selectedTask) return;
    await updateTask({ ...data, id: selectedTask.id });
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    await deleteTask(taskToDelete.id);
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setFilters({ ...filters, search: value });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilters({ ...filters, search: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your tasks efficiently and stay productive
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tasks Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Plus className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || filters.status?.length
              ? 'Try adjusting your filters or search query'
              : 'Get started by creating your first task'}
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
        description="Add a new task to your list"
      >
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        title="Edit Task"
        description="Update task details"
      >
        {selectedTask && (
          <TaskForm
            task={selectedTask}
            onSubmit={handleEditTask}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedTask(null);
            }}
            isLoading={isLoading}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        title="Delete Task"
        description="Are you sure you want to delete this task?"
        className="max-w-md"
      >
        <div className="space-y-4">
          {taskToDelete && (
            <div className="p-4 bg-muted rounded-md">
              <p className="font-medium">{taskToDelete.title}</p>
              {taskToDelete.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {taskToDelete.description}
                </p>
              )}
            </div>
          )}
          <div className="flex gap-3">
            <Button
              variant="destructive"
              onClick={handleDeleteTask}
              className="flex-1"
              isLoading={isLoading}
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setTaskToDelete(null);
              }}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
