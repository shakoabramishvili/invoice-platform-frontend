/**
 * Initialize stores on app load
 * This should be called once when the app starts
 */

import { useAuthStore } from './authStore';
import { useThemeStore } from './themeStore';

export const initializeStores = async () => {
  // Initialize theme
  const themeStore = useThemeStore.getState();
  if (typeof window !== 'undefined') {
    const theme = themeStore.theme;
    const resolved = theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : theme;

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
  }

  // Check authentication status
  // HttpOnly cookies are sent automatically, so we just check if user is authenticated
  const authStore = useAuthStore.getState();

  if (authStore.isAuthenticated) {
    try {
      await authStore.checkAuth();
    } catch (error) {
      console.error('Auth check failed:', error);
      // If auth check fails, clear the auth state
      authStore.logout();
    }
  }
};

/**
 * Use this hook to initialize stores in a React component
 * Call it in your root layout or _app.tsx
 */
export const useInitializeStores = () => {
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    if (!initialized) {
      initializeStores().finally(() => {
        setInitialized(true);
      });
    }
  }, [initialized]);

  return initialized;
};

// React import for the hook
import React from 'react';
