'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, User } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-24 border-b bg-background z-50">
      <div className="flex h-full items-center justify-between px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img
            src="https://fra1.digitaloceanspaces.com/interavia/uploads/ba900d82-8b74-45ad-8e89-457ad3c2dcdb.png"
            alt="Interavia Logo"
            className="h-20"
          />
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg hover:bg-accent px-2 py-1.5 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={(user as any)?.profilePicture} alt={user?.fullName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user?.fullName ? getInitials(user.fullName) : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium">
                {user?.fullName || 'User'}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.fullName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
