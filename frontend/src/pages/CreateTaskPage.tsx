import { Container, Title, Group, ActionIcon, Paper } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '@/hooks/useTasks';
import { TaskForm } from '@/components/forms/TaskForm';
import type { TaskFormData } from '@/utils/validation';
import type { CreateTaskPayload } from '@/types';

export const CreateTaskPage = () => {
  const navigate = useNavigate();
  const { createTask } = useTasks();

  const handleCreateTask = async (data: TaskFormData) => {
    await createTask(data as CreateTaskPayload);
    navigate('/dashboard');
  };

  return (
    <Container size="md" px="md">
      <Group mb="xl">
        <ActionIcon variant="subtle" size="lg" onClick={() => navigate(-1)}>
          <IconChevronLeft size={24} />
        </ActionIcon>
        <Title order={2}>Create New Task</Title>
      </Group>

      <Paper p="xl" radius="lg" withBorder>
        <TaskForm onSubmit={handleCreateTask} onCancel={() => navigate(-1)} isLoading={false} />
      </Paper>
    </Container>
  );
};
