import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TaskListPage } from './pages/TaskListPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { CreateTaskPage } from './pages/CreateTaskPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'tasks',
        element: <TaskListPage />,
      },
      {
        path: 'tasks/new',
        element: <CreateTaskPage />,
      },
      {
        path: 'tasks/:id',
        element: <TaskDetailPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
