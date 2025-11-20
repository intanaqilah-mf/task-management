import { useState } from 'react';
import { TextInput, Textarea, Select, Button, Group, Stack } from '@mantine/core';
import { taskSchema, type TaskFormData } from '@/utils/validation';
import { TaskStatus, TaskPriority, TaskCategory, type Task } from '@/types';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TaskForm = ({
  task,
  onSubmit,
  onCancel,
  isLoading = false,
}: TaskFormProps) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || TaskStatus.TODO,
    priority: task?.priority || TaskPriority.MEDIUM,
    category: task?.category,
    dueDate: task?.dueDate || '',
    startTime: task?.startTime || '',
    endTime: task?.endTime || '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});

  const handleChange = (field: keyof TaskFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string
  ) => {
    const value = typeof e === 'string' ? e : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = taskSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof TaskFormData, string>> = {};
      result.error.issues.forEach((error) => {
        const field = error.path[0] as keyof TaskFormData;
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Title"
          placeholder="Enter task title"
          required
          value={formData.title}
          onChange={handleChange('title')}
          error={errors.title}
          disabled={isLoading}
        />

        <Textarea
          label="Description"
          placeholder="Enter task description (optional)"
          value={formData.description}
          onChange={handleChange('description')}
          error={errors.description}
          disabled={isLoading}
          rows={4}
        />

        <Group grow>
          <Select
            label="Status"
            value={formData.status}
            onChange={(value) => handleChange('status')(value || TaskStatus.TODO)}
            error={errors.status}
            disabled={isLoading}
            data={[
              { value: TaskStatus.TODO, label: 'To Do' },
              { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
              { value: TaskStatus.COMPLETED, label: 'Completed' },
            ]}
          />

          <Select
            label="Priority"
            value={formData.priority}
            onChange={(value) => handleChange('priority')(value || TaskPriority.MEDIUM)}
            error={errors.priority}
            disabled={isLoading}
            data={[
              { value: TaskPriority.LOW, label: 'Low' },
              { value: TaskPriority.MEDIUM, label: 'Medium' },
              { value: TaskPriority.HIGH, label: 'High' },
              { value: TaskPriority.URGENT, label: 'Urgent' },
            ]}
          />
        </Group>

        <Group grow>
          <Select
            label="Category"
            placeholder="Select category"
            value={formData.category || ''}
            onChange={(value) => handleChange('category')(value || '')}
            error={errors.category}
            disabled={isLoading}
            clearable
            data={[
              { value: TaskCategory.WORK, label: 'Work' },
              { value: TaskCategory.PERSONAL, label: 'Personal' },
              { value: TaskCategory.SHOPPING, label: 'Shopping' },
              { value: TaskCategory.HEALTH, label: 'Health' },
              { value: TaskCategory.FINANCE, label: 'Finance' },
              { value: TaskCategory.EDUCATION, label: 'Education' },
              { value: TaskCategory.OTHER, label: 'Other' },
            ]}
          />

          <TextInput
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={handleChange('dueDate')}
            error={errors.dueDate}
            disabled={isLoading}
          />
        </Group>

        <Group grow>
          <TextInput
            label="Start Time"
            type="time"
            placeholder="08:00"
            value={formData.startTime}
            onChange={handleChange('startTime')}
            error={errors.startTime}
            disabled={isLoading}
          />

          <TextInput
            label="End Time"
            type="time"
            placeholder="09:30"
            value={formData.endTime}
            onChange={handleChange('endTime')}
            error={errors.endTime}
            disabled={isLoading}
          />
        </Group>

        <Group grow mt="md">
          <Button type="submit" loading={isLoading} disabled={isLoading}>
            {task ? 'Update Task' : 'Create Task'}
          </Button>
          <Button variant="default" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
