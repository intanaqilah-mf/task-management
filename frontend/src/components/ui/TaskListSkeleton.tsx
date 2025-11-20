import { Container, Stack, Skeleton, Group, Card } from '@mantine/core';
import { TaskCardSkeletonList } from './TaskCardSkeleton';

export const TaskListSkeleton = () => {
  return (
    <Container size="xl" px="md" pb={100}>
      <Stack gap="xl">
        {/* Header Skeleton */}
        <Group justify="space-between" align="center">
          <Skeleton height={32} width={32} circle />
          <Skeleton height={32} width={120} />
          <Skeleton height={32} width={32} circle />
        </Group>

        {/* Category Cards Skeleton */}
        <Group grow>
          <Card p="md" radius="xl" style={{ minHeight: '100px' }}>
            <Stack gap="xs" align="center">
              <Skeleton height={24} width={80} />
              <Skeleton height={20} width={150} />
            </Stack>
          </Card>
          <Card p="md" radius="xl" style={{ minHeight: '100px' }}>
            <Stack gap="xs" align="center">
              <Skeleton height={24} width={80} />
              <Skeleton height={20} width={150} />
            </Stack>
          </Card>
          <Card p="md" radius="xl" style={{ minHeight: '100px' }}>
            <Stack gap="xs" align="center">
              <Skeleton height={24} width={80} />
              <Skeleton height={20} width={150} />
            </Stack>
          </Card>
        </Group>

        {/* Search Skeleton */}
        <Skeleton height={42} radius="md" />

        {/* Tabs Skeleton */}
        <div>
          <Group gap="md" mb="xl">
            <Skeleton height={36} width={100} radius="xl" />
            <Skeleton height={36} width={100} radius="xl" />
            <Skeleton height={36} width={100} radius="xl" />
          </Group>

          <TaskCardSkeletonList count={3} />
        </div>
      </Stack>
    </Container>
  );
};
