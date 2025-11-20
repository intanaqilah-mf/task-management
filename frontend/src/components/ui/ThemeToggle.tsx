import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export const ThemeToggle = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ActionIcon
      variant="default"
      onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
      size="lg"
      radius="md"
      aria-label="Toggle color scheme"
      style={{
        border: '1px solid #e0e0e0',
      }}
    >
      {isDark ? (
        <IconSun size={20} stroke={1.5} />
      ) : (
        <IconMoon size={20} stroke={1.5} />
      )}
    </ActionIcon>
  );
};
