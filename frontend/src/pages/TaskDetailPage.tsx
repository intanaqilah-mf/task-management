import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Badge,
  Group,
  Stack,
  ActionIcon,
  Paper,
  Progress,
  Checkbox,
  Button,
  Modal,
} from '@mantine/core';
import { IconChevronLeft, IconCalendar, IconClock, IconCheck } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTasks } from '@/hooks/useTasks';
import { TaskForm } from '@/components/forms/TaskForm';
import type { TaskFormData } from '@/utils/validation';
import type { CreateTaskPayload } from '@/types';
import { subtaskService } from '@/services/subtask.service';

export const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask, selectedTask, setSelectedTask } = useTasks();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const task = tasks.find((t) => String(t.id) === id);

  useEffect(() => {
    if (task) {
      setSelectedTask(task);
    }
  }, [task, setSelectedTask]);

  if (!task) {
    return (
      <Container size="xl" px="md">
        <Text>Task not found</Text>
        <Button onClick={() => navigate('/dashboard')} mt="md">
          Go to Dashboard
        </Button>
      </Container>
    );
  }

  const getDaysLeft = () => {
    if (!task.dueDate) return null;
    const now = new Date();
    const due = new Date(task.dueDate);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysLeft = getDaysLeft();

  const handleEditTask = async (data: TaskFormData) => {
    if (!task) return;
    await updateTask({ ...(data as CreateTaskPayload), id: task.id });
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  // Get subtasks from task
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);

  // Update subtasks when task changes
  useEffect(() => {
    if (task?.subtasks) {
      setSubtasks(task.subtasks);
    }
  }, [task]);

  const completedCount = subtasks.filter((s) => s.completed).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const toggleSubtask = async (subtaskId: number | undefined) => {
    if (!subtaskId) return;

    // Find the subtask to get its current completed status
    const subtask = subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;

    const newCompletedStatus = !subtask.completed;

    // Optimistically update UI
    setSubtasks(prev =>
      prev.map(st =>
        st.id === subtaskId ? { ...st, completed: newCompletedStatus } : st
      )
    );

    try {
      // Update on backend
      await subtaskService.updateSubtask(subtaskId, newCompletedStatus);
    } catch (error) {
      console.error('Failed to update subtask:', error);
      // Revert on error
      setSubtasks(prev =>
        prev.map(st =>
          st.id === subtaskId ? { ...st, completed: !newCompletedStatus } : st
        )
      );
    }
  };

  return (
    <Container size="xl" px="md">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <ActionIcon variant="subtle" size="lg" onClick={() => navigate(-1)}>
            <IconChevronLeft size={24} />
          </ActionIcon>
          <Title order={2}>Detail Task</Title>
          <ActionIcon variant="subtle" size="lg" onClick={() => setIsEditModalOpen(true)}>
            <Text size="xl">⋯</Text>
          </ActionIcon>
        </Group>

        {/* Days Left Badge */}
        {daysLeft !== null && (
          <Badge
            size="lg"
            radius="md"
            variant="light"
            color={daysLeft < 0 ? 'red' : daysLeft <= 2 ? 'orange' : 'blue'}
            style={{ alignSelf: 'flex-start' }}
          >
            {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue!` : `${daysLeft} days left!`}
          </Badge>
        )}

        {/* Task Title & Description */}
        <div>
          <Title order={1} size="h2" mb="sm">
            {task.title}
          </Title>
          {task.description && (
            <Text c="dimmed" size="sm">
              {task.description}
            </Text>
          )}
        </div>

        {/* Date & Time */}
        <Group gap="md">
          {task.dueDate && (
            <>
              <Badge
                leftSection={<IconCalendar size={14} />}
                variant="outline"
                size="lg"
                radius="md"
                color="violet"
              >
                {new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Badge>
              <Badge
                leftSection={<IconClock size={14} />}
                variant="outline"
                size="lg"
                radius="md"
                color="violet"
              >
                {new Date(task.dueDate).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Badge>
            </>
          )}
        </Group>

        {/* Progress Card */}
        <Paper
          p="xl"
          radius="xl"
          style={{
            background: 'linear-gradient(135deg, #2D1B69 0%, #6C5DD3 100%)',
            color: 'white',
          }}
        >
          <Group justify="space-between" align="center" mb="md">
            <div>
              <Title order={1} c="white" size="2.5rem">
                {progressPercent}%
              </Title>
              <Text size="sm" opacity={0.9}>
                Task Completed
              </Text>
            </div>
            <ActionIcon size="xl" radius="xl" variant="white" c="#6C5DD3">
              <IconCheck size={24} />
            </ActionIcon>
          </Group>
          <Progress value={progressPercent} size="sm" radius="xl" color="yellow" />
        </Paper>

        {/* Task List / Subtasks */}
        {subtasks.length > 0 && (
          <div>
            <Title order={3} size="h4" mb="md">
              Task List
            </Title>
            <Stack gap="md">
              {subtasks.map((subtask) => (
                <Group key={subtask.id} justify="space-between">
                  <Text
                    c={subtask.completed ? 'dimmed' : 'inherit'}
                    td={subtask.completed ? 'line-through' : 'none'}
                  >
                    {subtask.title}
                  </Text>
                  <Checkbox
                    checked={subtask.completed}
                    onChange={() => toggleSubtask(subtask.id)}
                    radius="xl"
                    size="lg"
                    color="violet"
                  />
                </Group>
              ))}
            </Stack>
          </div>
        )}

        {/* Status Badges */}
        <Group gap="xs">
          <Badge variant="light" size="lg" color="blue">
            {task.status.replace('_', ' ')}
          </Badge>
          <Badge variant="light" size="lg" color="violet">
            {task.priority}
          </Badge>
          {task.category && (
            <Badge variant="outline" size="lg">
              {task.category}
            </Badge>
          )}
        </Group>
      </Stack>

      {/* Edit Modal */}
      <Modal
        opened={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        title="Edit Task"
        centered
        size="lg"
      >
        {selectedTask && (
          <TaskForm
            task={selectedTask}
            onSubmit={handleEditTask}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedTask(null);
            }}
            isLoading={false}
          />
        )}
      </Modal>
    </Container>
  );
};
