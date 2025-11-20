import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import type { LoginCredentials, RegisterCredentials } from '@/types';

export const useAuth = () => {
  const navigate = useNavigate();
  const addToast = useUIStore((state) => state.addToast);
  const { user, isAuthenticated, isLoading, error, login, register, logout, checkAuth, clearError } =
    useAuthStore();

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
      addToast({
        type: 'success',
        message: 'Login successful!',
      });
      navigate('/dashboard');
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Login failed',
      });
      throw error;
    }
  };

  const handleRegister = async (credentials: RegisterCredentials) => {
    try {
      await register(credentials);
      addToast({
        type: 'success',
        message: 'Registration successful!',
      });
      navigate('/dashboard');
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Registration failed',
      });
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Clear notification localStorage AND sessionStorage on logout
      localStorage.removeItem('lastNotificationTime');
      localStorage.removeItem('overdueTaskIndex');
      sessionStorage.removeItem('notificationsShownThisSession');
      addToast({
        type: 'success',
        message: 'Logged out successfully',
      });
      navigate('/login');
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Logout failed',
      });
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    checkAuth,
    clearError,
  };
};
