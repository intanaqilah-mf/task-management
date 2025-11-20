import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon, IconLogout } from '@tabler/icons-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      width: '100%',
      borderBottom: '1px solid var(--mantine-color-default-border)',
      backgroundColor: 'var(--mantine-color-body)',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        display: 'flex',
        height: '64px',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
      }}>
        {/* Left Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Task Manager</h1>
        </div>

        {/* Right Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Theme Toggle */}
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={() => toggleColorScheme()}
            title="Toggle theme"
          >
            {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
          </ActionIcon>

          {/* User Avatar with name */}
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--mantine-color-default-hover)',
            }}>
              <div style={{
                height: '32px',
                width: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--mantine-color-violet-filled)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 500,
              }}>
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div style={{ display: 'none' }} className="sm:block">
                <p style={{ fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>
                  {user.name || 'User'}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--mantine-color-dimmed)', margin: 0 }}>
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={logout}
            title="Logout"
            color="red"
          >
            <IconLogout size={20} />
          </ActionIcon>
        </div>
      </div>
    </header>
  );
};
