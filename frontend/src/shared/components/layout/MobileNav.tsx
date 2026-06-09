import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckCircle, Smile, Droplets, BarChart3, Settings } from 'lucide-react';

const mobileItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/habits', icon: CheckCircle, label: 'Habits' },
  { path: '/mood', icon: Smile, label: 'Mood' },
  { path: '/hydration', icon: Droplets, label: 'Water' },
  { path: '/analytics', icon: BarChart3, label: 'Stats' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-border bg-surface px-2 pb-safe lg:hidden">
      {mobileItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-2 px-3 text-xs font-medium transition-colors ${
              isActive ? 'text-accent' : 'text-text-secondary'
            }`
          }
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
