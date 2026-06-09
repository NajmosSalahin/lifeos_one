import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, CheckCircle, Smile, Moon, Droplets, Wind,
  BookOpen, Target, BarChart3, Calendar, Download, Settings,
  LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
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

interface SidebarProps {
  collapsed: boolean;
  width: number;
}

export function Sidebar({ collapsed, width }: SidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : width }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-border bg-surface"
    >
      <div className={cn('flex h-14 items-center border-b border-border px-4', collapsed && 'justify-center')}>
        {!collapsed && <span className="text-lg font-bold text-accent">LifeOS</span>}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
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
