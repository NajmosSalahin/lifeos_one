import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../shared/stores/authStore';
import { supabase } from '../../../app/supabase';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, setSession, setUser } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!session) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setSession(data.session);
          setUser({
            id: data.session.user.id,
            email: data.session.user.email ?? '',
            name: data.session.user.user_metadata?.name ?? data.session.user.email?.split('@')[0] ?? 'User',
            avatarUrl: data.session.user.user_metadata?.avatar_url,
          });
        }
      });
    }
  }, []);

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
