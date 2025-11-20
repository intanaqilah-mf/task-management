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
  TextInput,
  Textarea,
  Select,
  Divider,
} from '@mantine/core';
import { IconChevronLeft, IconCalendar, IconClock, IconCheck, IconPlus, IconTrash } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTasks } from '@/hooks/useTasks';
import { subtaskService } from '@/services/subtask.service';
import type { TaskCategory } from '@/types';
import { BASE_CONSTANTS, parseDateInMalaysiaTimezone } from '@/constants/base.constant';

interface SubTask {
  id?: number;
  title: string;
  completed?: boolean;
}

export const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask } = useTasks();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const task = tasks.find((t) => String(t.id) === id);

  // Helper function to get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'red';
      case 'HIGH':
        return 'orange';
      case 'MEDIUM':
        return 'yellow';
      case 'LOW':
        return 'gray';
      default:
        return 'blue';
    }
  };

  // Helper function to get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'WORK':
        return 'violet';
      case 'PERSONAL':
        return 'green';
      case 'SHOPPING':
        return 'yellow';
      case 'HEALTH':
        return 'pink';
      case 'FINANCE':
        return 'teal';
      case 'EDUCATION':
        return 'blue';
      default:
        return 'gray';
    }
  };

  // Get subtasks from task - MUST be declared before any early returns
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<TaskCategory | ''>('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSubTasks, setEditSubTasks] = useState<SubTask[]>([]);
  const [newSubTask, setNewSubTask] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update subtasks when task changes
  useEffect(() => {
    if (task?.subtasks) {
      setSubtasks(task.subtasks);
    }
  }, [task]);

  // Populate edit form when modal opens
  useEffect(() => {
    if (isEditModalOpen && task) {
      setEditTitle(task.title);
      setEditCategory(task.category || '');
      setEditDueDate(task.dueDate ? (typeof task.dueDate === 'string' ? task.dueDate.split('T')[0] : task.dueDate) : '');
      setEditStartTime(task.startTime || '');
      setEditEndTime(task.endTime || '');
      setEditNotes(task.description || '');
      setEditSubTasks(task.subtasks || []);
    }
  }, [isEditModalOpen, task]);

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

  const handleAddSubTask = () => {
    if (newSubTask.trim()) {
      setEditSubTasks([...editSubTasks, { title: newSubTask, completed: false }]);
      setNewSubTask('');
    }
  };

  const handleRemoveSubTask = (index: number) => {
    setEditSubTasks(editSubTasks.filter((_, i) => i !== index));
  };

  const handleEditTask = async () => {
    if (!task) return;
    setIsSubmitting(true);
    try {
      await updateTask({
        id: task.id,
        title: editTitle,
        description: editNotes,
        category: (editCategory as TaskCategory) || undefined,
        dueDate: editDueDate ? `${editDueDate}T00:00:00` : undefined,
        startTime: editStartTime,
        endTime: editEndTime,
        status: task.status,
        priority: task.priority,
        subtasks: editSubTasks.map(st => ({
          title: st.title,
          completed: st.completed || false
        })),
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setNewSubTask('');
    setIsSubmitting(false);
  };

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
        <Group justify="space-between" align="flex-start">
          <ActionIcon variant="subtle" size="lg" onClick={() => navigate(-1)}>
            <IconChevronLeft size={24} />
          </ActionIcon>
          <Stack gap="xs" align="center" style={{ flex: 1 }}>
            <Title order={2}>{task.title}</Title>
            {task.description && (
              <Text c="dimmed" size="sm" ta="center">
                {task.description}
              </Text>
            )}
          </Stack>
          <ActionIcon variant="subtle" size="lg" onClick={() => setIsEditModalOpen(true)}>
            <Text size="xl">⋯</Text>
          </ActionIcon>
        </Group>

        {/* All Badges */}
        <Group gap="xs" wrap="wrap">
          {daysLeft !== null && (
            <Badge
              size="lg"
              radius="md"
              variant="light"
              color={daysLeft < 0 ? 'red' : daysLeft <= 2 ? 'orange' : 'blue'}
            >
              {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue!` : `${daysLeft} days left!`}
            </Badge>
          )}
          <Badge variant="light" size="lg" color="blue">
            {task.status.replace('_', ' ')}
          </Badge>
          {task.priority && (
            <Badge variant="light" size="lg" color={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          )}
          {task.category && (
            <Badge variant="light" size="lg" color={getCategoryColor(task.category)}>
              {task.category}
            </Badge>
          )}
          {task.dueDate && (
            <>
              <Badge
                leftSection={<IconCalendar size={14} />}
                variant="outline"
                size="lg"
                radius="md"
                color="violet"
              >
                {parseDateInMalaysiaTimezone(typeof task.dueDate === 'string' ? task.dueDate : task.dueDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  timeZone: BASE_CONSTANTS.MALAYSIA_TIMEZONE,
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
                  timeZone: BASE_CONSTANTS.MALAYSIA_TIMEZONE,
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
      </Stack>

      {/* Edit Modal */}
      <Modal
        opened={isEditModalOpen}
        onClose={handleCloseEditModal}
        title={
          <Text size="lg" fw={600}>
            Edit Task
          </Text>
        }
        size="md"
        styles={{
          inner: {
            paddingTop: '2rem',
          },
          header: {
            paddingBottom: '1rem',
          },
          body: {
            paddingTop: 0,
            paddingBottom: '2rem',
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto',
          },
        }}
      >
        <Stack gap="md">
          {/* Task Title */}
          <TextInput
            label="Task Title"
            placeholder="Research and Planning"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
            styles={{
              label: { fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' },
            }}
          />

          {/* Project Folder (Category) */}
          <Select
            label="Project Folder"
            placeholder="Select category"
            value={editCategory}
            onChange={(value) => setEditCategory((value as TaskCategory) || '')}
            data={[
              { value: 'PERSONAL', label: 'Personal' },
              { value: 'WORK', label: 'Work' },
              { value: 'SHOPPING', label: 'Business' },
            ]}
            styles={{
              label: { fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' },
            }}
          />

          {/* Due Date */}
          <TextInput
            label="Due Date"
            type="date"
            placeholder="Pick date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            styles={{
              label: { fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' },
            }}
          />

          {/* Time Range */}
          <Group grow>
            <TextInput
              label="Start Time"
              type="time"
              value={editStartTime}
              onChange={(e) => setEditStartTime(e.target.value)}
              styles={{
                label: { fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' },
              }}
            />

            <TextInput
              label="End Time"
              type="time"
              value={editEndTime}
              onChange={(e) => setEditEndTime(e.target.value)}
              styles={{
                label: { fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' },
              }}
            />
          </Group>

          {/* Notes */}
          <Textarea
            label="Notes"
            placeholder="Gather insights on user needs, market trends..."
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            minRows={3}
            styles={{
              label: { fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' },
            }}
          />

          <Divider />

          {/* Task List (Subtasks) */}
          <div>
            <Text size="sm" fw={500} mb="sm">
              Task List
            </Text>

            {/* Existing Subtasks */}
            <Stack gap="xs" mb="sm">
              {editSubTasks.map((subTask, index) => (
                <Group key={index} justify="space-between" wrap="nowrap">
                  <Text size="sm" style={{ flex: 1 }}>
                    {subTask.title}
                  </Text>
                  <ActionIcon
                    size="sm"
                    color="red"
                    variant="subtle"
                    onClick={() => handleRemoveSubTask(index)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>

            {/* Add New Subtask */}
            <Group gap="xs" wrap="nowrap">
              <TextInput
                placeholder="Add new subtask..."
                value={newSubTask}
                onChange={(e) => setNewSubTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSubTask();
                  }
                }}
                style={{ flex: 1 }}
              />
              <ActionIcon
                size="lg"
                color="violet"
                variant="light"
                onClick={handleAddSubTask}
              >
                <IconPlus size={18} />
              </ActionIcon>
            </Group>
          </div>

          {/* Submit Button */}
          <Button
            fullWidth
            size="lg"
            color="violet"
            onClick={handleEditTask}
            disabled={!editTitle.trim() || isSubmitting}
            loading={isSubmitting}
            mt="md"
          >
            Update Task
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
};
