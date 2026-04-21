import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

/** Shape of the auth context exposed to consumers. */
interface AuthContextType {
  user: User | null;          // Currently signed-in user, or null if signed out.
  session: Session | null;    // Active Supabase session (tokens, expiry, etc.).
  loading: boolean;           // True while the initial session is being resolved.
  signOut: () => Promise<void>; // Sign the current user out.
}

const AuthContext = createContext<AuthContextType>({ user: null, session: null, loading: true, signOut: async () => {} });

/** Provider — subscribes to Supabase auth changes and exposes user/session globally. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for sign-in / sign-out / token refresh events.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Resolve any existing session on mount.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Convenience hook — read the current auth state from anywhere. */
export const useAuth = () => useContext(AuthContext);
