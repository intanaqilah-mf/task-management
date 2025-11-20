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
  Avatar,
  ActionIcon,
  Paper,
} from '@mantine/core';
import {
  IconPlus,
  IconClock,
  IconChevronRight,
  IconCheck,
} from '@tabler/icons-react';
import { useTasks } from '@/hooks/useTasks';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/layout/BottomNav';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';

export const DashboardPage = () => {
  const { tasks, createTask } = useTasks();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
      const dueDateStr = typeof task.dueDate === 'string' ? task.dueDate!.split('T')[0] : task.dueDate!;
      const date = new Date(dueDateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
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
                </Group>
                <Avatar.Group>
                  <Avatar color="blue" radius="xl" size="sm">
                    U
                  </Avatar>
                  <Avatar color="orange" radius="xl" size="sm">
                    A
                  </Avatar>
                  <Avatar color="pink" radius="xl" size="sm">
                    B
                  </Avatar>
                </Avatar.Group>
              </Group>

              <Title order={4} size="h5" mb="md">
                {getClosestTask()!.title}
              </Title>

              <Group gap="sm">
                <Group gap={4}>
                  <IconClock size={14} color="#8B5CF6" />
                  <Text size="xs" c="dimmed">
                    Tuesday
                  </Text>
                </Group>
                <ActionIcon variant="subtle" size="sm" color="gray">
                  <IconChevronRight size={14} />
                </ActionIcon>
              </Group>
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
                    </Group>
                    <Avatar.Group>
                      <Avatar color="blue" radius="xl" size="sm">
                        U
                      </Avatar>
                      <Avatar color="green" radius="xl" size="sm">
                        A
                      </Avatar>
                      <Avatar color="purple" radius="xl" size="sm">
                        B
                      </Avatar>
                    </Avatar.Group>
                  </Group>

                  <Title
                    order={4}
                    size="h5"
                    mb="md"
                    c={isCompleted ? 'dimmed' : 'inherit'}
                    td={isCompleted ? 'line-through' : 'none'}
                  >
                    {task.title}
                  </Title>

                  <Group gap="sm">
                    <Badge variant="light" color="violet" leftSection="📋">
                      {completedCount}/{totalSubtasks}
                    </Badge>
                    <Badge variant="light" color="violet" leftSection="💬">
                      12
                    </Badge>
                    <ActionIcon
                      size="xl"
                      radius="xl"
                      variant="light"
                      color={isCompleted ? 'green' : 'violet'}
                      style={{ marginLeft: 'auto' }}
                    >
                      {isCompleted ? (
                        <IconCheck size={20} />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      )}
                    </ActionIcon>
                  </Group>
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
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
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
                          {formatTimeRange(task.startTime, task.endTime)}
                        </Text>
                      </Group>
                      <Avatar.Group>
                        <Avatar color="blue" radius="xl" size="sm">
                          U
                        </Avatar>
                        <Avatar color="green" radius="xl" size="sm">
                          A
                        </Avatar>
                      </Avatar.Group>
                    </Group>

                    <Title
                      order={4}
                      size="h5"
                      mb="md"
                      c={isCompleted ? 'dimmed' : 'inherit'}
                      td={isCompleted ? 'line-through' : 'none'}
                    >
                      {task.title}
                    </Title>

                    <Group gap="sm">
                      <Badge variant="light" color="violet" leftSection="📋">
                        {completedCount}/{totalSubtasks}
                      </Badge>
                      <Badge variant="light" color="violet">
                        {task.category}
                      </Badge>
                      <Badge variant="light" color="blue">
                        {task.priority}
                      </Badge>
                      <ActionIcon
                        size="xl"
                        radius="xl"
                        variant="light"
                        color={isCompleted ? 'green' : 'violet'}
                        style={{ marginLeft: 'auto' }}
                      >
                        {isCompleted ? (
                          <IconCheck size={20} />
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        )}
                      </ActionIcon>
                    </Group>
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
  </>
  );
};
