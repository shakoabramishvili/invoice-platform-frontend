import { create } from 'zustand';
import { User, UserFormData } from '@/types';
import { usersService, UserQueryParams } from '@/lib/api/users.service';

interface UserState {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UserActions {
  fetchUsers: (params?: UserQueryParams) => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  createUser: (data: UserFormData) => Promise<User>;
  updateUser: (id: string, data: Partial<UserFormData>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  updateUserStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') => Promise<void>;
  updateUserRole: (id: string, role: 'ADMIN' | 'OPERATOR' | 'VIEWER') => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  clearError: () => void;
}

type UserStore = UserState & UserActions;

const initialState: UserState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const useUserStore = create<UserStore>((set, get) => ({
  ...initialState,

  fetchUsers: async (params?: UserQueryParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await usersService.getAll(params);
      set({
        users: response.data,
        pagination: response.meta || initialState.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch users',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchUserById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await usersService.getById(id);
      set({
        selectedUser: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch user',
        isLoading: false,
      });
      throw error;
    }
  },

  createUser: async (data: UserFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await usersService.create(data);
      const newUser = response.data;

      set((state) => ({
        users: [newUser, ...state.users],
        isLoading: false,
      }));

      return newUser;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create user',
        isLoading: false,
      });
      throw error;
    }
  },

  updateUser: async (id: string, data: Partial<UserFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await usersService.update(id, data);
      const updatedUser = response.data;

      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? updatedUser : user
        ),
        selectedUser:
          state.selectedUser?.id === id ? updatedUser : state.selectedUser,
        isLoading: false,
      }));

      return updatedUser;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update user',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await usersService.delete(id);

      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        selectedUser:
          state.selectedUser?.id === id ? null : state.selectedUser,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete user',
        isLoading: false,
      });
      throw error;
    }
  },

  updateUserStatus: async (id: string, status: 'ACTIVE' | 'INACTIVE') => {
    set({ isLoading: true, error: null });
    try {
      const response = await usersService.updateStatus(id, status);
      const updatedUser = response.data;

      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? updatedUser : user
        ),
        selectedUser:
          state.selectedUser?.id === id ? updatedUser : state.selectedUser,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update user status',
        isLoading: false,
      });
      throw error;
    }
  },

  updateUserRole: async (id: string, role: 'ADMIN' | 'OPERATOR' | 'VIEWER') => {
    set({ isLoading: true, error: null });
    try {
      const response = await usersService.updateRole(id, role);
      const updatedUser = response.data;

      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? updatedUser : user
        ),
        selectedUser:
          state.selectedUser?.id === id ? updatedUser : state.selectedUser,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update user role',
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedUser: (user: User | null) => {
    set({ selectedUser: user });
  },

  clearError: () => {
    set({ error: null });
  },
}));
