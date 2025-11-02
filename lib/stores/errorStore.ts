import { create } from 'zustand';

interface ErrorState {
  error: {
    message: string;
    error?: string;
    statusCode?: number;
  } | null;
  isOpen: boolean;
}

interface ErrorActions {
  showError: (error: { message: string; error?: string; statusCode?: number }) => void;
  clearError: () => void;
}

type ErrorStore = ErrorState & ErrorActions;

export const useErrorStore = create<ErrorStore>((set) => ({
  error: null,
  isOpen: false,

  showError: (error) => {
    set({
      error,
      isOpen: true,
    });
  },

  clearError: () => {
    set({
      error: null,
      isOpen: false,
    });
  },
}));
