import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { useUIStore } from '../../stores/uiStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export function AppShell() {
  const { sidebarCollapsed, sidebarWidth } = useUIStore();
  const isMobile = useMediaQuery('(max-width: 1023px)');

  if (isMobile) {
    return (
      <div className="flex min-h-screen flex-col">
        <Topbar />
        <main className="flex-1 p-4 pb-20">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={sidebarCollapsed} width={sidebarWidth} />
      <div
        className="flex flex-1 flex-col transition-all duration-200"
        style={{ marginLeft: sidebarCollapsed ? 64 : sidebarWidth }}
      >
        <Topbar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
