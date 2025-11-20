import { Container, Stack, Skeleton, Paper, Group, Card } from '@mantine/core';
import { TaskCardSkeletonList } from './TaskCardSkeleton';

export const DashboardSkeleton = () => {
  return (
    <Container size="xl" px="md" pb={100}>
      <Stack gap="xl">
        {/* Hero Section Skeleton */}
        <div>
          <Skeleton height={48} width="70%" mb="xl" />

          {/* Remaining Tasks Card Skeleton */}
          <Paper
            p="xl"
            radius="xl"
            style={{
              background: 'linear-gradient(135deg, #E0E0E0 0%, #F0F0F0 100%)',
            }}
          >
            <Group justify="space-between" align="center">
              <div>
                <Skeleton height={16} width={120} mb={8} />
                <Skeleton height={48} width={80} />
              </div>
              <Skeleton height={48} width={48} circle />
            </Group>
          </Paper>
        </div>

        {/* Search Skeleton */}
        <Skeleton height={42} radius="md" />

        {/* Closest Task Skeleton */}
        <Card p="lg" radius="lg" withBorder>
          <Stack gap="sm">
            <Group justify="space-between">
              <Group gap="xs">
                <Skeleton height={16} width={16} circle />
                <Skeleton height={16} width={150} />
              </Group>
              <Group gap="xs">
                <Skeleton height={32} width={32} radius="md" />
                <Skeleton height={32} width={32} radius="md" />
              </Group>
            </Group>
            <Skeleton height={24} width="60%" />
          </Stack>
        </Card>

        {/* Today's Tasks Section */}
        <div>
          <Skeleton height={32} width={150} mb="md" />
          <TaskCardSkeletonList count={2} />
        </div>

        {/* Upcoming Tasks Section */}
        <div>
          <Skeleton height={32} width={200} mb="md" />
          <TaskCardSkeletonList count={2} />
        </div>
      </Stack>
    </Container>
  );
};
