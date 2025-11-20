import { Card, Skeleton, Group, Stack } from '@mantine/core';

export const TaskCardSkeleton = () => {
  return (
    <Card p="lg" radius="lg" withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <Skeleton height={16} width={16} circle />
            <Skeleton height={16} width={120} />
            <Skeleton height={20} width={60} radius="xl" />
            <Skeleton height={20} width={60} radius="xl" />
          </Group>
          <Group gap="xs">
            <Skeleton height={32} width={32} radius="md" />
            <Skeleton height={32} width={32} radius="md" />
          </Group>
        </Group>
        <Skeleton height={24} width="80%" />
      </Stack>
    </Card>
  );
};

export const TaskCardSkeletonList = ({ count = 3 }: { count?: number }) => {
  return (
    <Stack gap="md">
      {Array.from({ length: count }).map((_, index) => (
        <TaskCardSkeleton key={index} />
      ))}
    </Stack>
  );
};
