import { useState } from 'react';
import { Container, Title, Tabs, Card, Group, Text, Badge, Avatar, Stack, ActionIcon } from '@mantine/core';
import { IconClock, IconChevronLeft } from '@tabler/icons-react';
import { useTasks } from '@/hooks/useTasks';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BottomNav } from '@/components/layout/BottomNav';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';

export const TaskListPage = () => {
  const { tasks, createTask } = useTasks();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
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
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

  // Get date from URL parameter or use today
  const dateParam = searchParams.get('date');
  const targetDate = dateParam ? new Date(dateParam) : new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

  // Get tasks for the target date (from URL or today)
  const dateTasks = tasks.filter(t => {
    if (t.status === 'COMPLETED') return false;
    if (!t.dueDate) return false;
    const dueDateStr = typeof t.dueDate === 'string' ? t.dueDate.split('T')[0] : t.dueDate;
    return dueDateStr === targetDateStr;
  });

  // Apply category filter if selected
  let filteredTasks = dateTasks;
  if (category) {
    filteredTasks = filteredTasks.filter(t => t.category === category);
  }

  // Classify today's tasks based on time
  const dueSoon = filteredTasks.filter((t) => {
    if (!t.startTime) return false;

    // Check if it's starting soon (within next 2 hours)
    const [startHour, startMin] = t.startTime.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMin;
    const timeDiff = startTimeMinutes - currentTime;
    return timeDiff > 0 && timeDiff <= 120; // Within next 2 hours
  });

  const upcoming = filteredTasks.filter((t) => {
    if (!t.startTime) return false;

    // Check if it's upcoming (more than 2 hours away)
    const [startHour, startMin] = t.startTime.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMin;
    const timeDiff = startTimeMinutes - currentTime;
    return timeDiff > 120; // More than 2 hours away
  });

  const overdue = filteredTasks.filter((t) => {
    if (!t.endTime) return false;

    // Check if end time has passed
    const [endHour, endMin] = t.endTime.split(':').map(Number);
    const endTimeMinutes = endHour * 60 + endMin;
    return currentTime > endTimeMinutes;
  });

  const formatTimeRange = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return null;

    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const TaskCard = ({ task }: { task: any }) => (
    <Card
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
            {task.startTime && task.endTime
              ? `Today, ${formatTimeRange(task.startTime, task.endTime)}`
              : task.dueDate
              ? new Date(task.dueDate).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'No due date'}
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

      <Title order={4} size="h5" mb="sm">
        {task.title}
      </Title>

      <Group gap="sm">
        <Badge variant="light" color="violet" leftSection="📋">
          3/9
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
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
          </svg>
        </ActionIcon>
      </Group>
    </Card>
  );

  // Use target date's tasks for category counts (before category filtering)
  const categoryCards = [
    {
      title: 'Work',
      count: dateTasks.filter((t) => t.category === 'WORK').length,
      color: '#6C5DD3',
      gradient: 'linear-gradient(135deg, #6C5DD3 0%, #8B7FE8 100%)',
      category: 'WORK',
    },
    {
      title: 'Business',
      count: dateTasks.filter((t) => t.category === 'SHOPPING').length,
      color: '#FFD93D',
      gradient: 'linear-gradient(135deg, #FFD93D 0%, #FFE566 100%)',
      category: 'SHOPPING',
    },
    {
      title: 'Personal',
      count: dateTasks.filter((t) => t.category === 'PERSONAL').length,
      color: '#4ADE80',
      gradient: 'linear-gradient(135deg, #4ADE80 0%, #6EE7A8 100%)',
      category: 'PERSONAL',
    },
  ];

  return (
    <>
      <Container size="xl" px="md" pb={100}>
        <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <ActionIcon variant="subtle" size="lg" onClick={() => navigate('/dashboard')}>
              <IconChevronLeft size={24} />
            </ActionIcon>
            <Title order={2} size="h2" fw={600}>
              Tasks
            </Title>
          </Group>
          <ActionIcon variant="subtle" size="lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
              <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
              <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
            </svg>
          </ActionIcon>
        </Group>

        {/* Category Cards */}
        <Group grow={!category}>
          {categoryCards.map((cat) => {
            // If a category is selected, only show that category
            if (category && cat.category !== category) {
              return null;
            }

            return (
              <Card
                key={cat.title}
                p="md"
                radius="xl"
                style={{
                  background: cat.gradient,
                  color: cat.title === 'Business' ? '#333' : 'white',
                  cursor: 'pointer',
                  minHeight: '100px',
                  // When a category is selected, make it take full width
                  ...(category ? { flex: 1, width: '100%' } : {}),
                }}
                onClick={() => {
                  // If clicking the already selected category, deselect it
                  if (category === cat.category) {
                    const params = new URLSearchParams(searchParams);
                    params.delete('category');
                    navigate(`/tasks?${params.toString()}`);
                  } else {
                    // Otherwise, select this category
                    const params = new URLSearchParams(searchParams);
                    params.set('category', cat.category);
                    navigate(`/tasks?${params.toString()}`);
                  }
                }}
              >
                <Stack gap="xs" align="center">
                  <Title order={3} c="inherit" size="h5" fw={600}>
                    {cat.title}
                  </Title>
                  <Text size="lg" fw={500} opacity={0.9}>
                    {cat.count} remaining task{cat.count !== 1 ? 's' : ''}
                  </Text>
                </Stack>
              </Card>
            );
          })}
        </Group>

        {/* Tabs */}
        <Tabs defaultValue="dueSoon" variant="pills">
          <Tabs.List grow>
            <Tabs.Tab value="dueSoon">Due Soon</Tabs.Tab>
            <Tabs.Tab value="upcoming">Upcoming</Tabs.Tab>
            <Tabs.Tab value="overdue">Overdue</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="dueSoon" pt="xl">
            <Stack gap="md">
              {dueSoon.length > 0 ? (
                dueSoon.map((task) => <TaskCard key={task.id} task={task} />)
              ) : (
                <Card p="xl" radius="lg" withBorder style={{ textAlign: 'center' }}>
                  <Text c="dimmed">No tasks due soon</Text>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="upcoming" pt="xl">
            <Stack gap="md">
              {upcoming.length > 0 ? (
                upcoming.map((task) => <TaskCard key={task.id} task={task} />)
              ) : (
                <Card p="xl" radius="lg" withBorder style={{ textAlign: 'center' }}>
                  <Text c="dimmed">No upcoming tasks</Text>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="overdue" pt="xl">
            <Stack gap="md">
              {overdue.length > 0 ? (
                overdue.map((task) => <TaskCard key={task.id} task={task} />)
              ) : (
                <Card p="xl" radius="lg" withBorder style={{ textAlign: 'center' }}>
                  <Text c="dimmed">No overdue tasks</Text>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>
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
