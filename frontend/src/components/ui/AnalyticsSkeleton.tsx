import { Container, Stack, Skeleton, Paper, Group } from '@mantine/core';

export const AnalyticsSkeleton = () => {
  return (
    <Container size="xl" px={{ base: 'xs', sm: 'md', md: 'lg' }} pb={100}>
      <Stack gap="xl" pt="md">
        {/* Header Skeleton */}
        <Skeleton height={40} width={150} />

        {/* Weekly Progress Chart Skeleton */}
        <Paper p={{ base: 'sm', sm: 'md', md: 'lg' }} radius="md" withBorder>
          <Skeleton height={16} width={120} mb="xs" />
          <Group gap="md" mb="md">
            <Skeleton height={12} width={80} />
            <Skeleton height={12} width={80} />
          </Group>
          <Skeleton height={200} />
        </Paper>

        {/* Stats Grid Skeleton */}
        <Group grow style={{ flexDirection: 'row' }}>
          <Paper p={{ base: 'sm', sm: 'md', md: 'lg' }} radius="md" withBorder style={{ flex: '1 1 calc(50% - 8px)', minWidth: '280px' }}>
            <Skeleton height={16} width={120} mb="xs" />
            <Skeleton height={32} width={60} mb="xs" />
            <Skeleton height={14} width={150} />
          </Paper>

          <Paper p={{ base: 'sm', sm: 'md', md: 'lg' }} radius="md" withBorder style={{ flex: '1 1 calc(50% - 8px)', minWidth: '280px' }}>
            <Skeleton height={16} width={120} mb="xs" />
            <Skeleton height={32} width={60} mb="xs" />
            <Skeleton height={14} width={150} />
          </Paper>
        </Group>

        {/* Productivity Score Skeleton */}
        <Paper p={{ base: 'sm', sm: 'md', md: 'lg' }} radius="md" withBorder>
          <Skeleton height={16} width={140} mb="xs" />
          <Group align="baseline" gap="xs" mb="md">
            <Skeleton height={32} width={60} />
            <Skeleton height={20} width={40} />
          </Group>
          <Skeleton height={24} width={200} mb="md" radius="xl" />
          <Skeleton height={8} radius="sm" />
        </Paper>

        {/* Time Spent Skeleton */}
        <Paper p={{ base: 'sm', sm: 'md', md: 'lg' }} radius="md" withBorder>
          <Skeleton height={16} width={140} mb="xs" />
          <Skeleton height={32} width={100} mb="md" />
          <Skeleton height={12} radius="md" />
          <Skeleton height={14} width={200} mt="xs" />
        </Paper>
      </Stack>
    </Container>
  );
};
