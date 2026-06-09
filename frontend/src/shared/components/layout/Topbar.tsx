import { useState, useRef, useEffect } from 'react';
import { PanelLeft, ChevronDown, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { Avatar } from '../common/Avatar';
import { supabase } from '../../../app/supabase';

export function Topbar() {
  const { user, clearAuth } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearAuth();
    navigate('/login');
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4">
      <button
        onClick={toggleSidebar}
        className="rounded-md p-2 text-text-secondary hover:bg-surface-raised hover:text-text-primary transition-colors"
      >
        <PanelLeft size={18} />
      </button>

      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 rounded-md p-1.5 hover:bg-surface-raised transition-colors"
        >
          <Avatar name={user?.name || 'User'} url={user?.avatarUrl} size="sm" />
          <span className="text-sm font-medium text-text-primary max-w-[120px] truncate">
            {user?.name || 'User'}
          </span>
          <ChevronDown size={14} className="text-text-secondary" />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-surface-raised py-1 shadow-lg"
            >
              <div className="border-b border-border px-3 py-2">
                <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                <p className="text-xs text-text-secondary truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { navigate('/settings'); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
              >
                <Settings size={14} /> Settings
              </button>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
