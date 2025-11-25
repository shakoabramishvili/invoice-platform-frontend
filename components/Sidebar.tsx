'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  FileX,
  Users,
  Settings,
  ChevronDown,
  ShoppingCart,
  Building2,
  X,
  ArrowLeftToLine,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  title: string;
  href: string;
  icon: any;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Invoices',
    href: '/dashboard/invoices',
    icon: FileText,
  },
  {
    title: 'Canceled Invoices',
    href: '/dashboard/invoices/canceled',
    icon: FileX,
  },
  {
    title: 'Sales Report',
    href: '/dashboard/sales-report',
    icon: BarChart3,
  },
  {
    title: 'Administrator',
    href: '/dashboard/administrator',
    icon: Users,
    children: [
      {
        title: 'Users',
        href: '/dashboard/administrator/users',
        icon: Users,
      },
      {
        title: 'Customers',
        href: '/dashboard/administrator/buyers',
        icon: ShoppingCart,
      },
      {
        title: 'Suppliers',
        href: '/dashboard/administrator/sellers',
        icon: Building2,
      },
    ],
  },
  // {
  //   title: 'Settings',
  //   href: '/dashboard/settings',
  //   icon: Settings,
  // },
];

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<{ top: number } | null>(null);
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
    // Dispatch custom event to notify layout
    window.dispatchEvent(new Event('sidebar-toggle'));
  };

  // Toggle submenu expansion
  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  // Check if path is active
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    // Exact match for /dashboard/invoices to prevent matching /dashboard/invoices/canceled
    if (href === '/dashboard/invoices') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Check if any child is active
  const hasActiveChild = (item: NavItem) => {
    if (!item.children) return false;
    return item.children.some((child) => isActive(child.href));
  };

  // Expand parent if child is active
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children && hasActiveChild(item)) {
        if (!expandedItems.includes(item.title)) {
          setExpandedItems((prev) => [...prev, item.title]);
        }
      }
    });
  }, [pathname]);

  const renderNavItem = (item: NavItem, isChild = false) => {
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const Icon = item.icon;
    const isHovered = hoveredItem === item.title;

    if (isCollapsed && !isChild) {
      return (
        <div
          key={item.title}
          ref={(el) => {
            itemRefs.current[item.title] = el;
          }}
          onMouseEnter={(e) => {
            if (hasChildren) {
              const rect = e.currentTarget.getBoundingClientRect();
              setSubmenuPosition({ top: rect.top });
              setHoveredItem(item.title);
            }
          }}
          onMouseLeave={() => {
            if (hasChildren) {
              setHoveredItem(null);
              setSubmenuPosition(null);
            }
          }}
          className="relative"
        >
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={hasChildren ? '#' : item.href}
                  onClick={(e) => {
                    if (hasChildren) {
                      e.preventDefault();
                    }
                  }}
                  className={cn(
                    'flex items-center justify-center h-10 w-10 rounded-md transition-all duration-200 mx-auto',
                    active || hasActiveChild(item)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Floating submenu panel */}
          {hasChildren && isHovered && submenuPosition && (
            <div
              className="fixed left-16 bg-background border rounded-md shadow-lg py-2 px-1 min-w-[200px] z-50"
              style={{ top: `${submenuPosition.top}px` }}
              onMouseEnter={() => setHoveredItem(item.title)}
              onMouseLeave={() => {
                setHoveredItem(null);
                setSubmenuPosition(null);
              }}
            >
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {item.title}
              </div>
              <div className="space-y-1 mt-1">
                {item.children!.map((child) => {
                  const childActive = isActive(child.href);
                  const ChildIcon = child.icon;
                  return (
                    <Link
                      key={child.title}
                      href={child.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200',
                        childActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <ChildIcon className="h-4 w-4 shrink-0" />
                      <span className="text-sm">{child.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={item.title}>
        <Link
          href={hasChildren ? '#' : item.href}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpanded(item.title);
            }
          }}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200',
            isChild && 'pl-10',
            active
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            hasChildren && 'justify-between'
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 shrink-0" />
            <span className="text-sm">{item.title}</span>
          </div>
          {hasChildren && (
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          )}
        </Link>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderNavItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <>
      {!isCollapsed && (
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Navigation</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
              onClick={toggleCollapsed}
            >
              <ArrowLeftToLine className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          </div>
        </div>
      )}
      {isCollapsed && (
        <div className="px-3 pt-4 pb-2">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto w-full p-0 hover:bg-transparent"
                  onClick={toggleCollapsed}
                >
                  <ChevronRight className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors mx-auto" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Expand</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => renderNavItem(item))}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col fixed left-0 top-24 bottom-0 border-r bg-background transition-all duration-300 z-40',
          isCollapsed ? 'w-16' : 'w-60'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onMobileClose}
          />

          {/* Sidebar */}
          <aside className="fixed left-0 top-24 bottom-0 w-60 border-r bg-background z-50 md:hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onMobileClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
