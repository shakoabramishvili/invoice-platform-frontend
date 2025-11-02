'use client';

import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ErrorModal from '@/components/ErrorModal';
import { useErrorStore } from '@/lib/stores/errorStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { error, isOpen, clearError } = useErrorStore();

  // Listen for sidebar collapse state changes from localStorage
  useEffect(() => {
    const checkCollapsed = () => {
      const savedState = localStorage.getItem('sidebar-collapsed');
      setIsCollapsed(savedState === 'true');
    };

    checkCollapsed();

    // Listen for storage changes
    window.addEventListener('storage', checkCollapsed);

    // Custom event for same-window updates
    const handleSidebarToggle = () => checkCollapsed();
    window.addEventListener('sidebar-toggle', handleSidebarToggle);

    return () => {
      window.removeEventListener('storage', checkCollapsed);
      window.removeEventListener('sidebar-toggle', handleSidebarToggle);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-28 z-30 md:hidden"
        onClick={() => setIsMobileSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Main content */}
      <main
        className={cn(
          'pt-24 transition-all duration-300',
          isCollapsed ? 'md:pl-16' : 'md:pl-60'
        )}
      >
        <div className="p-6">{children}</div>
      </main>

      {/* Global Error Modal */}
      <ErrorModal
        isOpen={isOpen}
        onClose={clearError}
        error={error}
      />
    </div>
  );
}
