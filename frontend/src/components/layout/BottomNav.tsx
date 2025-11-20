import { ActionIcon, Group, Paper } from '@mantine/core';
import { IconHome, IconPlus, IconChartBar } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BottomNavProps {
  onCreateTask: () => void;
}

export const BottomNav = ({ onCreateTask }: BottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Paper
      shadow="md"
      radius={0}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderTop: '1px solid #e9ecef',
      }}
    >
      <Group justify="space-evenly" align="center" p="lg" style={{ position: 'relative' }}>
        {/* Home */}
        <ActionIcon
          variant={isActive('/dashboard') ? 'filled' : 'subtle'}
          size="lg"
          color={isActive('/dashboard') ? 'violet' : 'gray'}
          onClick={() => navigate('/dashboard')}
        >
          <IconHome size={24} />
        </ActionIcon>

        {/* Add Task (Center Button) */}
        <ActionIcon
          variant="filled"
          size={56}
          radius="xl"
          color="violet"
          onClick={onCreateTask}
          style={{
            position: 'absolute',
            top: '-28px',
            left: '50%',
            transform: 'translateX(-50%)',
            boxShadow: '0 4px 12px rgba(108, 93, 211, 0.4)',
          }}
        >
          <IconPlus size={28} />
        </ActionIcon>

        {/* Analytics */}
        <ActionIcon
          variant={isActive('/analytics') ? 'filled' : 'subtle'}
          size="lg"
          color={isActive('/analytics') ? 'violet' : 'gray'}
          onClick={() => navigate('/analytics')}
        >
          <IconChartBar size={24} />
        </ActionIcon>
      </Group>
    </Paper>
  );
};
