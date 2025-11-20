import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Card,
  Group,
  Stack,
  Badge,
  ActionIcon,
  Paper,
  Modal,
  TextInput,
  Textarea,
  Select,
  Divider,
} from '@mantine/core';
import {
  IconPlus,
  IconClock,
  IconChevronRight,
  IconTrash,
} from '@tabler/icons-react';
import { useTasks } from '@/hooks/useTasks';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/layout/BottomNav';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';
import type { TaskCategory } from '@/types';
import { BASE_CONSTANTS, parseDateInMalaysiaTimezone } from '@/constants/base.constant';

interface SubTask {
  id?: number;
  title: string;
  completed?: boolean;
}

export const DashboardPage = () => {
  const { tasks, createTask, updateTask, deleteTask } = useTasks();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

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

  const handleOpenEditModal = (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setEditTitle(task.title);
    setEditCategory(task.category || '');
    setEditDueDate(task.dueDate ? (typeof task.dueDate === 'string' ? task.dueDate.split('T')[0] : task.dueDate) : '');
    setEditStartTime(task.startTime || '');
    setEditEndTime(task.endTime || '');
    setEditNotes(task.description || '');
    setEditSubTasks(task.subtasks || []);
    setIsEditModalOpen(true);
  };

  const handleAddSubTask = () => {
    if (newSubTask.trim()) {
      setEditSubTasks([...editSubTasks, { title: newSubTask, completed: false }]);
      setNewSubTask('');
    }
  };

  const handleRemoveSubTask = (index: number) => {
    setEditSubTasks(editSubTasks.filter((_, i) => i !== index));
  };

  const handleEditTaskSubmit = async () => {
    if (!editingTask) return;
    setIsSubmitting(true);
    try {
      await updateTask({
        id: editingTask.id,
        title: editTitle,
        description: editNotes,
        category: (editCategory as TaskCategory) || undefined,
        dueDate: editDueDate ? `${editDueDate}T00:00:00` : undefined,
        startTime: editStartTime,
        endTime: editEndTime,
        status: editingTask.status,
        priority: editingTask.priority,
        subtasks: editSubTasks.map(st => ({
          title: st.title,
          completed: st.completed || false
        })),
      });
      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTask(null);
    setNewSubTask('');
    setIsSubmitting(false);
  };

  const handleDeleteTask = async (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskToDelete(taskId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete === null) return;
    try {
      await deleteTask(String(taskToDelete));
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };

  // Helper function to get current date in Malaysia timezone
  const getMalaysiaDate = () => {
    const now = new Date();
    const malaysiaDateStr = now.toLocaleDateString('en-US', {
      timeZone: BASE_CONSTANTS.MALAYSIA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const [month, day, year] = malaysiaDateStr.split('/');
    return `${year}-${month}-${day}`;
  };

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

  const handleCreateTask = async (taskData: any) => {
    try {
      await createTask({
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        dueDate: taskData.dueDate,
        startTime: taskData.startTime,
        endTime: taskData.endTime,
        status: 'TODO',
        priority: 'MEDIUM',
        subtasks: taskData.subtasks || [],
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const tasksByStatus = {
    TODO: tasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    COMPLETED: tasks.filter((t) => t.status === 'COMPLETED'),
  };

  // Get the closest ongoing or upcoming task
  const getClosestTask = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

    // Filter today's tasks with time ranges, excluding 100% completed tasks
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const todaysTasks = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const dueDateStr = typeof t.dueDate === 'string' ? t.dueDate.split('T')[0] : t.dueDate;

      // Exclude 100% completed tasks from being the "closest task"
      const completionPercent = getTaskCompletionPercent(t);
      if (completionPercent === 100) return false;

      return (
        dueDateStr === todayStr &&
        t.startTime &&
        t.endTime
      );
    });

    if (todaysTasks.length === 0) return null;

    // Sort by proximity to current time
    const sorted = todaysTasks.sort((a, b) => {
      const [aStartHour, aStartMin] = a.startTime!.split(':').map(Number);
      const [aEndHour, aEndMin] = a.endTime!.split(':').map(Number);
      const aStart = aStartHour * 60 + aStartMin;
      const aEnd = aEndHour * 60 + aEndMin;

      const [bStartHour, bStartMin] = b.startTime!.split(':').map(Number);
      const [bEndHour, bEndMin] = b.endTime!.split(':').map(Number);
      const bStart = bStartHour * 60 + bStartMin;
      const bEnd = bEndHour * 60 + bEndMin;

      // If task is ongoing (current time is between start and end)
      const aIsOngoing = currentTime >= aStart && currentTime <= aEnd;
      const bIsOngoing = currentTime >= bStart && currentTime <= bEnd;

      if (aIsOngoing && !bIsOngoing) return -1;
      if (!aIsOngoing && bIsOngoing) return 1;

      // If both ongoing or both not ongoing, sort by how close the end time is
      if (aIsOngoing && bIsOngoing) {
        return Math.abs(currentTime - aEnd) - Math.abs(currentTime - bEnd);
      }

      // For upcoming tasks, sort by start time
      return aStart - bStart;
    });

    return sorted[0];
  };

  // Get today's tasks (excluding the closest one)
  const getTodaysTasks = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const closestTask = getClosestTask();

    return tasks
      .filter((t) => {
        if (!t.dueDate) return false;
        if (closestTask && t.id === closestTask.id) return false;
        const dueDateStr = typeof t.dueDate === 'string' ? t.dueDate.split('T')[0] : t.dueDate;
        return dueDateStr === todayStr;
      })
      .sort((a, b) => {
        if (!a.startTime || !b.startTime) return 0;
        return a.startTime.localeCompare(b.startTime);
      });
  };

  // Get upcoming tasks grouped by date
  const getUpcomingTasksByDate = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const upcomingTasks = tasks
      .filter((t) => {
        if (!t.dueDate) return false;
        const dueDateStr = typeof t.dueDate === 'string' ? t.dueDate.split('T')[0] : t.dueDate;
        return dueDateStr !== todayStr && dueDateStr > todayStr;
      })
      .sort((a, b) => {
        const aDate = typeof a.dueDate === 'string' ? a.dueDate.split('T')[0] : a.dueDate!;
        const bDate = typeof b.dueDate === 'string' ? b.dueDate.split('T')[0] : b.dueDate!;
        return aDate.localeCompare(bDate);
      });

    // Group by date
    const grouped = upcomingTasks.reduce((acc, task) => {
      const dueDateStr = typeof task.dueDate === 'string' ? task.dueDate! : task.dueDate!;
      const date = parseDateInMalaysiaTimezone(dueDateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: BASE_CONSTANTS.MALAYSIA_TIMEZONE,
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(task);
      return acc;
    }, {} as Record<string, typeof tasks>);

    return grouped;
  };

  const formatTimeRange = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return 'No time set';

    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  // Helper function to calculate task completion percentage
  const getTaskCompletionPercent = (task: any) => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completedCount = task.subtasks.filter((s: any) => s.completed).length;
    return Math.round((completedCount / task.subtasks.length) * 100);
  };

  // Helper function to sort tasks - completed tasks go to bottom
  const sortTasksByCompletion = (tasksToSort: any[]) => {
    return [...tasksToSort].sort((a, b) => {
      const aPercent = getTaskCompletionPercent(a);
      const bPercent = getTaskCompletionPercent(b);

      // If both are 100% or both are not 100%, maintain original order
      if ((aPercent === 100 && bPercent === 100) || (aPercent !== 100 && bPercent !== 100)) {
        return 0;
      }

      // Move 100% tasks to bottom
      if (aPercent === 100) return 1;
      if (bPercent === 100) return -1;

      return 0;
    });
  };

  return (
    <>
      <Container size="xl" px="md" pb={100}>
        <Stack gap="xl">
          {/* Hero Section */}
          <div>
            <Title order={1} size="h1" fw={700} style={{ fontSize: '2rem' }}>
              Let's organize your
                tasks today! 👋
              </Title>

          {/* Remaining Tasks Card */}
          <Paper
            mt="xl"
            p="xl"
            radius="xl"
            style={{
              background: 'linear-gradient(135deg, #6C5DD3 0%, #8B7FE8 100%)',
              color: 'white',
            }}
          >
            <Group justify="space-between" align="center">
              <div>
                <Text size="sm" opacity={0.9} mb={4}>
                  Remaining Tasks
                </Text>
                <Title order={1} c="white" size="3rem">
                  {tasksByStatus.TODO.length + tasksByStatus.IN_PROGRESS.length}
                </Title>
              </div>
              <ActionIcon
                size="xl"
                radius="xl"
                variant="white"
                c="#6C5DD3"
                onClick={() => {
                  const today = new Date();
                  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                  navigate(`/tasks?date=${todayStr}`);
                }}
              >
                <IconChevronRight size={24} />
              </ActionIcon>
            </Group>
          </Paper>
        </div>

        {/* Closest Task */}
        {getClosestTask() && (
          <div>
            <Card
              p="lg"
              radius="lg"
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => {
                const task = getClosestTask()!;
                const taskDate = task.dueDate ? (typeof task.dueDate === 'string' ? task.dueDate.split('T')[0] : task.dueDate) : '';
                navigate(`/tasks?date=${taskDate}`);
              }}
            >
              <Group justify="space-between" mb="sm">
                <Group gap="xs">
                  <IconClock size={16} color="#999" />
                  <Text size="sm" c="dimmed">
                    {formatTimeRange(getClosestTask()!.startTime, getClosestTask()!.endTime)}
                  </Text>
                  {(() => {
                    const task = getClosestTask()!;
                    const completedCount = task.subtasks?.filter((s: any) => s.completed).length || 0;
                    const totalSubtasks = task.subtasks?.length || 0;
                    return totalSubtasks > 0 ? (
                      <Badge variant="light" color="violet" leftSection="📋">
                        {completedCount}/{totalSubtasks}
                      </Badge>
                    ) : null;
                  })()}
                  {getClosestTask()!.priority && (
                    <Badge variant="light" color={getPriorityColor(getClosestTask()!.priority!)}>
                      {getClosestTask()!.priority}
                    </Badge>
                  )}
                  {getClosestTask()!.category && (
                    <Badge variant="light" color={getCategoryColor(getClosestTask()!.category!)}>
                      {getClosestTask()!.category}
                    </Badge>
                  )}
                </Group>

                <Group gap="xs">
                  <ActionIcon
                    size="md"
                    radius="md"
                    variant="subtle"
                    color="blue"
                    onClick={(e) => handleOpenEditModal(getClosestTask()!, e)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </ActionIcon>
                  <ActionIcon
                    size="md"
                    radius="md"
                    variant="subtle"
                    color="red"
                    onClick={(e) => handleDeleteTask(getClosestTask()!.id, e)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>

              <Title order={4} size="h5">
                {getClosestTask()!.title}
              </Title>
            </Card>
          </div>
        )}

        {/* Today's Tasks */}
        <div>
          <Title order={2} size="h3" mb="md">
            Today's Task
          </Title>

          <Stack gap="md">
            {sortTasksByCompletion(getTodaysTasks()).map((task) => {
              const completionPercent = getTaskCompletionPercent(task);
              const isCompleted = completionPercent === 100;
              const completedCount = task.subtasks?.filter((s: any) => s.completed).length || 0;
              const totalSubtasks = task.subtasks?.length || 0;

              return (
                <Card
                  key={task.id}
                  p="lg"
                  radius="lg"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    opacity: isCompleted ? 0.6 : 1,
                    backgroundColor: isCompleted ? '#f5f5f5' : 'white',
                  }}
                  onClick={() => {
                    const taskDate = task.dueDate ? (typeof task.dueDate === 'string' ? task.dueDate.split('T')[0] : task.dueDate) : '';
                    navigate(`/tasks?date=${taskDate}`);
                  }}
                >
                  <Group justify="space-between" mb="sm">
                    <Group gap="xs">
                      <IconClock size={16} color="#999" />
                      <Text
                        size="sm"
                        c="dimmed"
                        td={isCompleted ? 'line-through' : 'none'}
                      >
                        {formatTimeRange(task.startTime, task.endTime)}
                      </Text>
                      {totalSubtasks > 0 && (
                        <Badge variant="light" color="violet" leftSection="📋">
                          {completedCount}/{totalSubtasks}
                        </Badge>
                      )}
                      {task.priority && (
                        <Badge variant="light" color={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      )}
                      {task.category && (
                        <Badge variant="light" color={getCategoryColor(task.category)}>
                          {task.category}
                        </Badge>
                      )}
                    </Group>

                    <Group gap="xs">
                      <ActionIcon
                        size="md"
                        radius="md"
                        variant="subtle"
                        color="blue"
                        onClick={(e) => handleOpenEditModal(task, e)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </ActionIcon>
                      <ActionIcon
                        size="md"
                        radius="md"
                        variant="subtle"
                        color="red"
                        onClick={(e) => handleDeleteTask(task.id, e)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Title
                    order={4}
                    size="h5"
                    c={isCompleted ? 'dimmed' : 'inherit'}
                    td={isCompleted ? 'line-through' : 'none'}
                  >
                    {task.title}
                  </Title>
                </Card>
              );
            })}

            {getTodaysTasks().length === 0 && !getClosestTask() && (
              <Card p="xl" radius="lg" withBorder style={{ textAlign: 'center' }}>
                <Text c="dimmed">No tasks for today. Create your first task!</Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  mt="md"
                  onClick={() => navigate('/tasks/new')}
                >
                  Create Task
                </Button>
              </Card>
            )}
          </Stack>
        </div>

        {/* Upcoming Tasks by Date */}
        {Object.entries(getUpcomingTasksByDate()).map(([date, dateTasks]) => (
          <div key={date}>
            <Title order={2} size="h3" mb="md">
              {date}
            </Title>

            <Stack gap="md">
              {sortTasksByCompletion(dateTasks).map((task) => {
                const completionPercent = getTaskCompletionPercent(task);
                const isCompleted = completionPercent === 100;
                const completedCount = task.subtasks?.filter((s: any) => s.completed).length || 0;
                const totalSubtasks = task.subtasks?.length || 0;

                return (
                  <Card
                    key={task.id}
                    p="lg"
                    radius="lg"
                    withBorder
                    style={{
                      cursor: 'pointer',
                      opacity: isCompleted ? 0.6 : 1,
                      backgroundColor: isCompleted ? '#f5f5f5' : 'white',
                    }}
                    onClick={() => {
                      const taskDate = task.dueDate ? (typeof task.dueDate === 'string' ? task.dueDate.split('T')[0] : task.dueDate) : '';
                      navigate(`/tasks?date=${taskDate}`);
                    }}
                  >
                    <Group justify="space-between" mb="sm">
                      <Group gap="xs">
                        <IconClock size={16} color="#999" />
                        <Text
                          size="sm"
                          c="dimmed"
                          td={isCompleted ? 'line-through' : 'none'}
                        >
                          {parseDateInMalaysiaTimezone(typeof task.dueDate === 'string' ? task.dueDate : task.dueDate!).toLocaleDateString('en-US', {
                            weekday: 'long',
                            timeZone: BASE_CONSTANTS.MALAYSIA_TIMEZONE,
                          })}, {formatTimeRange(task.startTime, task.endTime)}
                        </Text>
                        {totalSubtasks > 0 && (
                          <Badge variant="light" color="violet" leftSection="📋">
                            {completedCount}/{totalSubtasks}
                          </Badge>
                        )}
                        {task.priority && (
                          <Badge variant="light" color={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        )}
                        {task.category && (
                          <Badge variant="light" color={getCategoryColor(task.category)}>
                            {task.category}
                          </Badge>
                        )}
                      </Group>

                      <Group gap="xs">
                        <ActionIcon
                          size="md"
                          radius="md"
                          variant="subtle"
                          color="blue"
                          onClick={(e) => handleOpenEditModal(task, e)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </ActionIcon>
                        <ActionIcon
                          size="md"
                          radius="md"
                          variant="subtle"
                          color="red"
                          onClick={(e) => handleDeleteTask(task.id, e)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>

                    <Title
                      order={4}
                      size="h5"
                      c={isCompleted ? 'dimmed' : 'inherit'}
                      td={isCompleted ? 'line-through' : 'none'}
                    >
                      {task.title}
                    </Title>
                  </Card>
                );
              })}
            </Stack>
          </div>
        ))}
      </Stack>
    </Container>

    {/* Bottom Navigation */}
    <BottomNav onCreateTask={() => setIsCreateModalOpen(true)} />

    {/* Create Task Modal */}
    <CreateTaskModal
      opened={isCreateModalOpen}
      onClose={() => setIsCreateModalOpen(false)}
      onSubmit={handleCreateTask}
    />

    {/* Edit Task Modal */}
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
          onClick={handleEditTaskSubmit}
          disabled={!editTitle.trim() || isSubmitting}
          loading={isSubmitting}
          mt="md"
        >
          Update Task
        </Button>
      </Stack>
    </Modal>

    {/* Delete Confirmation Modal */}
    <Modal
      opened={deleteConfirmOpen}
      onClose={cancelDelete}
      title={
        <Text size="lg" fw={600}>
          Confirm Delete
        </Text>
      }
      size="sm"
      centered
    >
      <Stack gap="md">
        <Text size="sm">
          Are you sure you want to delete this task? This action cannot be undone.
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete}>
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  </>
  );
};
