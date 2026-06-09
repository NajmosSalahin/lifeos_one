import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: { id: string; email: string; name: string; avatarUrl?: string | null } | null;
  setSession: (session: Session | null) => void;
  setUser: (user: AuthState['user']) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  clearAuth: () => set({ session: null, user: null }),
}));
