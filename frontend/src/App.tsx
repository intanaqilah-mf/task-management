import { RouterProvider } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { ErrorBoundary } from './components/ErrorBoundary';
import { router } from './router';
import '@mantine/core/styles.css';

function App() {
  return (
    <ErrorBoundary>
      <MantineProvider>
        <RouterProvider router={router} />
      </MantineProvider>
    </ErrorBoundary>
  );
}

export default App;
