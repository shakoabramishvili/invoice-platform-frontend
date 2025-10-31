import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginFormData, RegisterFormData } from '@/types';
import { authService } from '@/lib/api/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
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
          console.log('Login response:', response);
          const { user } = response.data;

          // HttpOnly cookies are set by the backend automatically
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          console.log('Auth state updated, user:', user);
        } catch (error: any) {
          console.error('Login error:', error);
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
          const { user } = response.data;

          // HttpOnly cookies are set by the backend automatically
          set({
            user,
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
          // Backend will clear HttpOnly cookies
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear auth state
          set({
            ...initialState,
          });
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
        try {
          set({ isLoading: true });
          const response = await authService.getMe();
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // If getMe fails, user is not authenticated (HttpOnly cookie may be expired or invalid)
          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
