'use client';

import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/lib/stores/themeStore';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useThemeStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9"
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
