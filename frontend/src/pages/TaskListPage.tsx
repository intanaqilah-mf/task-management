import { Container, Title, Tabs, Card, Group, Text, Badge, Avatar, Stack, ActionIcon } from '@mantine/core';
import { IconClock, IconChevronLeft } from '@tabler/icons-react';
import { useTasks } from '@/hooks/useTasks';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const TaskListPage = () => {
  const { tasks } = useTasks();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const filteredTasks = category
    ? tasks.filter(t => t.category === category)
    : tasks;

  const dueSoon = filteredTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) < nextWeek && t.status !== 'COMPLETED'
  );

  const upcoming = filteredTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) >= nextWeek && t.status !== 'COMPLETED'
  );

  const overdue = filteredTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < today && t.status !== 'COMPLETED'
  );

  const getCategoryInfo = () => {
    const categories: Record<string, { title: string; color: string; gradient: string }> = {
      WORK: {
        title: 'Work Tasks',
        color: '#6C5DD3',
        gradient: 'linear-gradient(135deg, #6C5DD3 0%, #8B7FE8 100%)',
      },
      SHOPPING: {
        title: 'Business Tasks',
        color: '#FFD93D',
        gradient: 'linear-gradient(135deg, #FFD93D 0%, #FFE566 100%)',
      },
      PERSONAL: {
        title: 'Personal Tasks',
        color: '#4ADE80',
        gradient: 'linear-gradient(135deg, #4ADE80 0%, #6EE7A8 100%)',
      },
    };
    return category ? categories[category] : { title: 'Tasks', color: '#6C5DD3', gradient: '' };
  };

  const categoryInfo = getCategoryInfo();

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
            {task.dueDate
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
        </Avatar.Group>
      </Group>

      <Title order={4} size="h5" mb="sm">
        {task.title}
      </Title>

      {task.description && (
        <Text size="sm" c="dimmed" lineClamp={2} mb="sm">
          {task.description}
        </Text>
      )}

      <Group gap="xs">
        <Badge variant="light" size="sm" color="violet">
          {task.priority}
        </Badge>
        {task.category && (
          <Badge variant="outline" size="sm">
            {task.category}
          </Badge>
        )}
      </Group>
    </Card>
  );

  return (
    <Container size="xl" px="md">
      <Stack gap="xl">
        {/* Header */}
        <Group>
          <ActionIcon variant="subtle" size="lg" onClick={() => navigate('/dashboard')}>
            <IconChevronLeft size={24} />
          </ActionIcon>
          <Title order={2}>{categoryInfo.title}</Title>
        </Group>

        {/* Category Header Card */}
        {category && (
          <Card
            p="xl"
            radius="xl"
            style={{
              background: categoryInfo.gradient,
              color: category === 'SHOPPING' ? '#333' : 'white',
              textAlign: 'center',
            }}
          >
            <Title order={2} c="inherit" size="h3" mb="xs">
              {categoryInfo.title.replace(' Tasks', '')}
            </Title>
            <Text size="lg" opacity={0.9}>
              {filteredTasks.length} Remaining Task{filteredTasks.length !== 1 ? 's' : ''}
            </Text>
          </Card>
        )}

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
  );
};
