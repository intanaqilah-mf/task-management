import { useUIStore } from '@/stores/uiStore';

export const useTheme = () => {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  return {
    theme,
    setTheme,
    toggleTheme,
  };
};
