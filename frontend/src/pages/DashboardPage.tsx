import {
  Container,
  Title,
  Text,
  Button,
  Grid,
  Card,
  Group,
  Stack,
  ThemeIcon,
  Badge,
  Avatar,
  ActionIcon,
  Paper,
} from '@mantine/core';
import {
  IconPlus,
  IconBriefcase,
  IconShoppingCart,
  IconUser,
  IconClock,
  IconChevronRight,
  IconCheck,
} from '@tabler/icons-react';
import { useTasks } from '@/hooks/useTasks';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const { tasks } = useTasks();
  const navigate = useNavigate();

  const tasksByCategory = {
    WORK: tasks.filter((t) => t.category === 'WORK'),
    PERSONAL: tasks.filter((t) => t.category === 'PERSONAL'),
    SHOPPING: tasks.filter((t) => t.category === 'SHOPPING'),
  };

  const tasksByStatus = {
    TODO: tasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    COMPLETED: tasks.filter((t) => t.status === 'COMPLETED'),
  };

  const categoryCards = [
    {
      title: 'Work',
      count: tasksByCategory.WORK.length,
      color: '#6C5DD3',
      gradient: 'linear-gradient(135deg, #6C5DD3 0%, #8B7FE8 100%)',
      icon: IconBriefcase,
      category: 'WORK',
    },
    {
      title: 'Business',
      count: tasksByCategory.SHOPPING.length,
      color: '#FFD93D',
      gradient: 'linear-gradient(135deg, #FFD93D 0%, #FFE566 100%)',
      icon: IconShoppingCart,
      category: 'SHOPPING',
    },
    {
      title: 'Personal',
      count: tasksByCategory.PERSONAL.length,
      color: '#4ADE80',
      gradient: 'linear-gradient(135deg, #4ADE80 0%, #6EE7A8 100%)',
      icon: IconUser,
      category: 'PERSONAL',
    },
  ];

  // Get the closest ongoing or upcoming task
  const getClosestTask = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

    const incompleteTasks = tasks.filter((t) => t.status !== 'COMPLETED');

    // Filter today's tasks with time ranges
    const todaysTasks = incompleteTasks.filter((t) => {
      if (!t.dueDate) return false;
      const taskDate = new Date(t.dueDate);
      return (
        taskDate.toDateString() === now.toDateString() &&
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
    const closestTask = getClosestTask();

    return tasks
      .filter((t) => {
        if (!t.dueDate || t.status === 'COMPLETED') return false;
        if (closestTask && t.id === closestTask.id) return false;
        const taskDate = new Date(t.dueDate);
        return taskDate.toDateString() === now.toDateString();
      })
      .sort((a, b) => {
        if (!a.startTime || !b.startTime) return 0;
        return a.startTime.localeCompare(b.startTime);
      });
  };

  // Get upcoming tasks grouped by date
  const getUpcomingTasksByDate = () => {
    const now = new Date();
    const today = now.toDateString();

    const upcomingTasks = tasks
      .filter((t) => {
        if (!t.dueDate || t.status === 'COMPLETED') return false;
        const taskDate = new Date(t.dueDate);
        return taskDate.toDateString() !== today && taskDate > now;
      })
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

    // Group by date
    const grouped = upcomingTasks.reduce((acc, task) => {
      const date = new Date(task.dueDate!).toDateString();
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

  return (
    <Container size="xl" px="md">
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
                onClick={() => navigate('/tasks')}
              >
                <IconChevronRight size={24} />
              </ActionIcon>
            </Group>
          </Paper>
        </div>

        {/* Category Cards */}
        <Grid>
          {categoryCards.map((cat) => (
            <Grid.Col key={cat.title} span={{ base: 12, xs: 6, sm: 4 }}>
              <Card
                p="lg"
                radius="xl"
                style={{
                  background: cat.gradient,
                  color: cat.title === 'Business' ? '#333' : 'white',
                  cursor: 'pointer',
                  minHeight: '160px',
                  position: 'relative',
                }}
                onClick={() => navigate(`/tasks?category=${cat.category}`)}
              >
                <Stack justify="space-between" h="100%">
                  <Group justify="space-between">
                    <ThemeIcon
                      size="lg"
                      radius="md"
                      variant="white"
                      c={cat.color}
                      style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                    >
                      <cat.icon size={20} />
                    </ThemeIcon>
                    <ActionIcon
                      variant="subtle"
                      c={cat.title === 'Business' ? '#333' : 'white'}
                      size="sm"
                    >
                      <IconChevronRight size={18} />
                    </ActionIcon>
                  </Group>
                  <div>
                    <Title order={3} c="inherit" size="h4">
                      {cat.title}
                    </Title>
                    <Text size="sm" opacity={0.9}>
                      {cat.count} remaining task{cat.count !== 1 ? 's' : ''}
                    </Text>
                  </div>
                </Stack>
              </Card>
            </Grid.Col>
          ))}

          {/* Add Category Card */}
          <Grid.Col span={{ base: 12, xs: 6, sm: 4 }}>
            <Card
              p="lg"
              radius="xl"
              withBorder
              style={{
                minHeight: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px dashed #dee2e6',
              }}
              onClick={() => navigate('/tasks/new')}
            >
              <ActionIcon size="xl" radius="xl" variant="light" color="gray">
                <IconPlus size={24} />
              </ActionIcon>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Closest Task */}
        {getClosestTask() && (
          <div>
            <Card
              p="lg"
              radius="lg"
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/tasks/${getClosestTask()!.id}`)}
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
            {getTodaysTasks().map((task) => (
              <Card
                key={task.id}
                p="lg"
                radius="lg"
                withBorder
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <Group justify="space-between" mb="sm">
                  <Group gap="xs">
                    <IconClock size={16} color="#999" />
                    <Text size="sm" c="dimmed">
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

                <Title order={4} size="h5" mb="md">
                  {task.title}
                </Title>

                <Group gap="sm">
                  <Badge variant="light" color="violet" leftSection="📋">
                    {task.description ? '3/9' : '0/0'}
                  </Badge>
                  <Badge variant="light" color="violet" leftSection="💬">
                    12
                  </Badge>
                  <ActionIcon
                    size="xl"
                    radius="xl"
                    variant="light"
                    color="violet"
                    style={{ marginLeft: 'auto' }}
                  >
                    <IconCheck size={20} />
                  </ActionIcon>
                </Group>
              </Card>
            ))}

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
              {dateTasks.map((task) => (
                <Card
                  key={task.id}
                  p="lg"
                  radius="lg"
                  withBorder
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  <Group justify="space-between" mb="sm">
                    <Group gap="xs">
                      <IconClock size={16} color="#999" />
                      <Text size="sm" c="dimmed">
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

                  <Title order={4} size="h5" mb="md">
                    {task.title}
                  </Title>

                  <Group gap="sm">
                    <Badge variant="light" color="violet">
                      {task.category}
                    </Badge>
                    <Badge variant="light" color="blue">
                      {task.priority}
                    </Badge>
                  </Group>
                </Card>
              ))}
            </Stack>
          </div>
        ))}
      </Stack>
    </Container>
  );
};
