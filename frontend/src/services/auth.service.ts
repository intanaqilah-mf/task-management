import { apiClient } from './api';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '@/constants/config';
import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Backend expects OAuth2PasswordRequestForm (form data)
    const formData = new URLSearchParams();
    formData.append('username', credentials.email); // OAuth2 uses 'username' field
    formData.append('password', credentials.password);

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail || error.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();

    // Store token and user data
    if (data.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    }

    return data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      credentials
    );

    // Store token and user data
    if (response.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
    }

    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // Always clear local storage, even if API call fails
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
  },

  getStoredToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  getStoredUser(): User | null {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  },
};
