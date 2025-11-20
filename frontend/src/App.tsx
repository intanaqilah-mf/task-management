import { RouterProvider } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import { ErrorBoundary } from './components/ErrorBoundary';
import { router } from './router';
import '@mantine/core/styles.css';

const theme = createTheme({
  primaryColor: 'violet',
  colors: {
    violet: [
      '#f3f0ff',
      '#e5dbff',
      '#d0bfff',
      '#b197fc',
      '#9775fa',
      '#845ef7',
      '#7950f2',
      '#7048e8',
      '#6741d9',
      '#5f3dc4',
    ],
  },
});

function App() {
  return (
    <ErrorBoundary>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <RouterProvider router={router} />
      </MantineProvider>
    </ErrorBoundary>
  );
}

export default App;
