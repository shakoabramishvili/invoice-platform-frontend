import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginFormData, RegisterFormData } from '@/types';
import { authService } from '@/lib/api/auth.service';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  updateUser: (user: User) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (credentials: LoginFormData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);

          const { accessToken, refreshToken, user } = response.data;

          // Store tokens in localStorage
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          // Store tokens in cookies for middleware
          document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Strict`;
          document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Strict`;

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (data: RegisterFormData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);

          const { accessToken, refreshToken, user } = response.data;

          // Store tokens in localStorage
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          // Store tokens in cookies for middleware
          document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Strict`;
          document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Strict`;

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Registration failed',
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear tokens from localStorage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          // Clear tokens from cookies
          document.cookie = 'accessToken=; path=/; max-age=0';
          document.cookie = 'refreshToken=; path=/; max-age=0';

          set({
            ...initialState,
          });
        }
      },

      refreshTokens: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await authService.refresh(refreshToken);
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Store new tokens in localStorage
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Store new tokens in cookies
          document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Strict`;
          if (newRefreshToken) {
            document.cookie = `refreshToken=${newRefreshToken}; path=/; max-age=604800; SameSite=Strict`;
          }

          set({
            accessToken,
            refreshToken: newRefreshToken || refreshToken,
          });
        } catch (error) {
          // If refresh fails, logout the user
          get().logout();
          throw error;
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        const { accessToken } = get();
        if (!accessToken) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          set({ isLoading: true });
          const response = await authService.getMe();
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
          });
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
