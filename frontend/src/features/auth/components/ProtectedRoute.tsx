import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../shared/stores/authStore';
import { supabase } from '../../../app/supabase';

function setUserFromSession(
  setUser: (user: { id: string; email: string; name: string; avatarUrl?: string | null }) => void,
  session: { user: { id: string; email?: string; user_metadata?: { name?: string; avatar_url?: string } } }
) {
  setUser({
    id: session.user.id,
    email: session.user.email ?? '',
    name: session.user.user_metadata?.name ?? session.user.email?.split('@')[0] ?? 'User',
    avatarUrl: session.user.user_metadata?.avatar_url,
  });
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, setSession, setUser } = useAuthStore();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
        setUserFromSession(setUser, data.session);
      }
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) {
        setSession(newSession);
        setUserFromSession(setUser, newSession);
      } else {
        setSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
