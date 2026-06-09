import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard, CheckCircle, Smile, Moon, Droplets, Wind,
  BookOpen, Target, BarChart3, Calendar, Download, Settings,
  LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import apiClient from '../../api/client';
import { queryKeys } from '../../api/queryKeys';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  prefetch?: () => Promise<unknown>;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Habits', path: '/habits', icon: CheckCircle },
  { label: 'Mood', path: '/mood', icon: Smile },
  { label: 'Sleep', path: '/sleep', icon: Moon },
  { label: 'Hydration', path: '/hydration', icon: Droplets },
  { label: 'Breathing', path: '/breathing', icon: Wind },
  { label: 'Journal', path: '/journal', icon: BookOpen },
  { label: 'Goals', path: '/goals', icon: Target },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Calendar', path: '/calendar', icon: Calendar },
  { label: 'Exports', path: '/exports', icon: Download },
  { label: 'Settings', path: '/settings', icon: Settings },
];

function getPrefetchEntry(path: string, queryClient: ReturnType<typeof useQueryClient>): (() => Promise<unknown>) | undefined {
  switch (path) {
    case '/habits':
      return () => queryClient.prefetchQuery({ queryKey: queryKeys.habits.list(), queryFn: () => apiClient.get('/habits').then(r => r.data.data), staleTime: 15_000 });
    case '/mood':
      return () => queryClient.prefetchQuery({ queryKey: queryKeys.mood.list(), queryFn: () => apiClient.get('/mood').then(r => r.data.data), staleTime: 15_000 });
    case '/sleep':
      return () => queryClient.prefetchQuery({ queryKey: queryKeys.sleep.list(), queryFn: () => apiClient.get('/sleep').then(r => r.data.data), staleTime: 15_000 });
    case '/hydration':
      return () => queryClient.prefetchQuery({ queryKey: queryKeys.hydration.logs(), queryFn: () => apiClient.get('/hydration').then(r => r.data.data), staleTime: 15_000 });
    case '/breathing':
      return () => queryClient.prefetchQuery({ queryKey: queryKeys.breathing.techniques(), queryFn: () => apiClient.get('/breathing/techniques').then(r => r.data.data), staleTime: 15_000 });
    case '/journal':
      return () => queryClient.prefetchQuery({ queryKey: queryKeys.journal.list(), queryFn: () => apiClient.get('/journal').then(r => r.data.data), staleTime: 15_000 });
    case '/goals':
      return () => queryClient.prefetchQuery({ queryKey: queryKeys.goals.list(), queryFn: () => apiClient.get('/goals').then(r => r.data.data), staleTime: 15_000 });
    case '/analytics':
      return () => queryClient.prefetchQuery({ queryKey: queryKeys.analytics.overview(), queryFn: () => apiClient.get('/analytics/overview').then(r => r.data.data), staleTime: 15_000 });
    case '/settings':
      return () => queryClient.prefetchQuery({ queryKey: queryKeys.user.preferences(), queryFn: () => apiClient.get('/user/preferences').then(r => r.data.data), staleTime: 15_000 });
    default:
      return undefined;
  }
}

interface SidebarProps {
  collapsed: boolean;
  width: number;
}

export function Sidebar({ collapsed, width }: SidebarProps) {
  const queryClient = useQueryClient();

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : width }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-border bg-surface"
    >
      <div className={cn('flex h-14 items-center border-b border-border px-4', collapsed && 'justify-center')}>
        {!collapsed && <span className="text-lg font-bold text-accent">LifeOS</span>}
      </div>
      <nav className="flex-1 space-y-3 overflow-y-auto p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onMouseEnter={() => getPrefetchEntry(item.path, queryClient)?.()}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-fast',
                isActive
                  ? 'bg-accent-subtle text-accent'
                  : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'
              )
            }
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
}
