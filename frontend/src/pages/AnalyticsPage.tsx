import { Container, Title, Text, Paper, Group, Stack, Badge, Progress } from '@mantine/core';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTasks } from '@/hooks/useTasks';
import { BottomNav } from '@/components/layout/BottomNav';
import { useState } from 'react';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';
import { AnalyticsSkeleton } from '@/components/ui/AnalyticsSkeleton';
import { DueDateNotifications } from '@/components/notifications/DueDateNotifications';
import { parseDateInMalaysiaTimezone } from '@/constants/base.constant';

export const AnalyticsPage = () => {
  const { tasks, createTask, isLoading } = useTasks();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Show loading skeleton while fetching tasks
  if (isLoading && tasks.length === 0) {
    return (
      <>
        <AnalyticsSkeleton />
        <BottomNav onCreateTask={() => setIsCreateModalOpen(true)} />
      </>
    );
  }

  // Helper function to calculate task completion percentage
  const getTaskCompletionPercent = (task: any) => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completedCount = task.subtasks.filter((s: any) => s.completed).length;
    return Math.round((completedCount / task.subtasks.length) * 100);
  };

  // Calculate completion rate
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => getTaskCompletionPercent(t) === 100).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate remaining tasks
  const remainingTasks = tasks.filter(t => getTaskCompletionPercent(t) !== 100).length;

  // Calculate overdue tasks
  const now = new Date();
  const overdueTasks = tasks.filter(t => {
    if (getTaskCompletionPercent(t) === 100) return false;
    if (!t.dueDate) return false;
    const dueDate = parseDateInMalaysiaTimezone(typeof t.dueDate === 'string' ? t.dueDate : t.dueDate);
    return dueDate < now;
  }).length;

  // Calculate productivity score based on:
  // - Completion rate (50%)
  // - High priority tasks completed (30%)
  // - Tasks completed on time (20%)
  const calculateProductivityScore = () => {
    if (totalTasks === 0) return 0;

    // Completion rate component (50%)
    const completionComponent = (completedTasks / totalTasks) * 50;

    // High priority tasks completed component (30%)
    const highPriorityTotal = tasks.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT').length;
    const highPriorityCompleted = tasks.filter(t => (t.priority === 'HIGH' || t.priority === 'URGENT') && getTaskCompletionPercent(t) === 100).length;
    const highPriorityComponent = highPriorityTotal > 0 ? (highPriorityCompleted / highPriorityTotal) * 30 : 15;

    // On-time completion component (20%)
    const tasksWithDueDate = tasks.filter(t => t.dueDate && getTaskCompletionPercent(t) === 100).length;
    const onTimeCompleted = tasks.filter(t => {
      if (getTaskCompletionPercent(t) !== 100 || !t.dueDate || !t.updatedAt) return false;
      const dueDate = parseDateInMalaysiaTimezone(typeof t.dueDate === 'string' ? t.dueDate : t.dueDate);
      const completedDate = new Date(t.updatedAt);
      return completedDate <= dueDate;
    }).length;
    const onTimeComponent = tasksWithDueDate > 0 ? (onTimeCompleted / tasksWithDueDate) * 20 : 10;

    return Math.round(completionComponent + highPriorityComponent + onTimeComponent);
  };

  const productivityScore = calculateProductivityScore();

  // Get productivity strength message
  const getProductivityStrength = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: '#4ADE80', message: 'Outstanding task completion!' };
    if (score >= 60) return { label: 'Good', color: '#60A5FA', message: 'Strong performance on high-priority tasks' };
    if (score >= 40) return { label: 'Fair', color: '#FBBF24', message: 'Room for improvement' };
    return { label: 'Needs Work', color: '#F87171', message: 'Focus on completing tasks' };
  };

  const productivityStrength = getProductivityStrength(productivityScore);

  // Mock time spent data (2h 15m format)
  const mockTimeSpent = { hours: 2, minutes: 15 };
  const weeklyGoalMinutes = 10 * 60; // 10 hours
  const currentMinutes = mockTimeSpent.hours * 60 + mockTimeSpent.minutes;
  const timeProgress = Math.round((currentMinutes / weeklyGoalMinutes) * 100);
  const remainingMinutes = weeklyGoalMinutes - currentMinutes;
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingMins = remainingMinutes % 60;

  // Calculate weekly progress data (last 7 days)
  const getWeeklyProgressData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate which day index should be "today" in our Mon-Sun array
    const todayIndex = currentDay === 0 ? 6 : currentDay - 1; // Convert to Mon=0, Sun=6

    return days.map((day, index) => {
      // Calculate the date for this day
      const daysAgo = todayIndex - index;
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      // Count all tasks with this due date
      const tasksOnDay = tasks.filter(t => {
        if (!t.dueDate) return false;
        const dueDateOnly = typeof t.dueDate === 'string' ? t.dueDate.split('T')[0] : t.dueDate;
        return dueDateOnly === dateStr;
      });

      // Count completed tasks
      const completedOnDay = tasksOnDay.filter(t => getTaskCompletionPercent(t) === 100).length;
      const incompleteOnDay = tasksOnDay.length - completedOnDay;

      return {
        name: day,
        completed: completedOnDay,
        incomplete: incompleteOnDay,
      };
    });
  };

  const weeklyData = getWeeklyProgressData();

  return (
    <>
      <DueDateNotifications />

      <Container size="xl" px={{ base: 'xs', sm: 'md', md: 'lg' }} pb={100}>
        <Stack gap="xl" pt="md">
          {/* Header */}
          <Title order={1} size="h1" fw={700}>
            Analytics
          </Title>

          {/* Weekly Progress Chart */}
          <Paper p={{ base: 'sm', sm: 'md', md: 'lg' }} radius="md" withBorder>
            <Text size="sm" fw={600} mb="xs" c="dimmed">
              Weekly Progress
            </Text>
            <Group gap="md" mb="md">
              <Group gap="xs">
                <div style={{ width: 12, height: 12, backgroundColor: '#7C3AED', borderRadius: 2 }} />
                <Text size="xs" c="dimmed">Completed</Text>
              </Group>
              <Group gap="xs">
                <div style={{ width: 12, height: 12, backgroundColor: '#E9D5FF', borderRadius: 2 }} />
                <Text size="xs" c="dimmed">Incomplete</Text>
              </Group>
            </Group>
            <ResponsiveContainer width="100%" height={window.innerWidth < 768 ? 180 : 200}>
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#999' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#999' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                />
                <Bar dataKey="completed" stackId="a" fill="#7C3AED" radius={[0, 0, 0, 0]} />
                <Bar dataKey="incomplete" stackId="a" fill="#E9D5FF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* Stats Grid */}
          <Group grow style={{ flexDirection: 'row' }}>
            {/* Completion Rate */}
            <Paper p={{ base: 'sm', sm: 'md', md: 'lg' }} radius="md" withBorder style={{ flex: '1 1 calc(50% - 8px)', minWidth: '280px' }}>
              <Text size="sm" fw={600} c="dimmed" mb="xs">
                Completion Rate
              </Text>
              <Text size="xl" fw={700} mb="xs">
                {completionRate}%
              </Text>
              <Text size="xs" c="dimmed">
                Remaining {remainingTasks} Task{remainingTasks !== 1 ? 's' : ''}
              </Text>
            </Paper>

            {/* Overdue Tasks */}
            <Paper p={{ base: 'sm', sm: 'md', md: 'lg' }} radius="md" withBorder style={{ flex: '1 1 calc(50% - 8px)', minWidth: '280px' }}>
              <Text size="sm" fw={600} c="dimmed" mb="xs">
                Overdue Tasks
              </Text>
              <Text size="xl" fw={700} mb="xs">
                {overdueTasks}
              </Text>
              <Text size="xs" c="dimmed">
                +{overdueTasks > 0 ? ((overdueTasks / totalTasks) * 100).toFixed(0) : 0}% from last week
              </Text>
            </Paper>
          </Group>

          {/* Productivity Score */}
          <Paper p={{ base: 'sm', sm: 'md', md: 'lg' }} radius="md" withBorder>
            <Text size="sm" fw={600} c="dimmed" mb="xs">
              Productivity Score
            </Text>
            <Group align="baseline" gap="xs" mb="md">
              <Text size="xl" fw={700}>
                {productivityScore}
              </Text>
              <Text size="md" c="dimmed">
                /100
              </Text>
            </Group>
            <Badge
              variant="light"
              color="green"
              size="md"
              mb="md"
              style={{ backgroundColor: `${productivityStrength.color}15`, color: productivityStrength.color }}
            >
              {productivityStrength.label}: {productivityStrength.message}
            </Badge>
            <Progress value={productivityScore} color="violet" size="sm" />
          </Paper>

          {/* Time Spent on Tasks */}
          <Paper p={{ base: 'sm', sm: 'md', md: 'lg' }} radius="md" withBorder>
            <Text size="sm" fw={600} c="dimmed" mb="xs">
              Time Spent on Tasks
            </Text>
            <Text size="xl" fw={700} mb="md">
              {mockTimeSpent.hours}h {mockTimeSpent.minutes}m
            </Text>
            <Progress
              value={timeProgress}
              size="lg"
              radius="md"
              styles={{
                root: { backgroundColor: '#f3f4f6' },
                section: {
                  background: 'linear-gradient(90deg, #F97316 0%, #FB923C 100%)'
                }
              }}
            />
            <Text size="xs" c="dimmed" mt="xs">
              {remainingHours}h {remainingMins}m more to achieve your weekly goal!
            </Text>
          </Paper>
        </Stack>
      </Container>

      <BottomNav onCreateTask={() => setIsCreateModalOpen(true)} />

      <CreateTaskModal
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createTask}
      />
    </>
  );
};
