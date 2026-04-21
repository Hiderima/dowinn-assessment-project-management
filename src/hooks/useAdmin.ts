import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/** Returns whether the current user has the `admin` role in the user_roles table. */
export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false); // True if user holds the admin role.
  const [loading, setLoading] = useState(true);  // True while the role check is in flight.

  useEffect(() => {
    if (!user) { setIsAdmin(false); setLoading(false); return; }

    // Look up an admin role row for the current user (server-side, never trust client state).
    const check = async () => {
      const { data } = await supabase
        .from('user_roles' as any)
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      setIsAdmin(!!data);
      setLoading(false);
    };
    check();
  }, [user]);

  return { isAdmin, loading };
}
