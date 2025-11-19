import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AppShell, Burger, Group, Text, NavLink, Avatar, Menu, ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDashboard, IconLogout, IconUser, IconChevronDown } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';

export const MainLayout = () => {
  const [opened, { toggle }] = useDisclosure();
  const { isAuthenticated, checkAuth, isLoading, user, logout } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text size="xl" fw={700}>Task Manager</Text>
          </Group>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Group style={{ cursor: 'pointer' }}>
                <Avatar color="blue" radius="xl">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Avatar>
                <div style={{ display: 'none' }} className="sm:block">
                  <Text size="sm" fw={500}>{user?.name || 'User'}</Text>
                  <Text size="xs" c="dimmed">{user?.email}</Text>
                </div>
                <ActionIcon variant="subtle" size="sm">
                  <IconChevronDown size={16} />
                </ActionIcon>
              </Group>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>
              <Menu.Item leftSection={<IconUser size={14} />}>
                Profile
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconLogout size={14} />}
                onClick={logout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          href="/dashboard"
          label="Dashboard"
          leftSection={<IconDashboard size={16} />}
          active
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
