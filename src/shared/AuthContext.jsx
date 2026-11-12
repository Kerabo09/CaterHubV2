import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { sb } from './supabase';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [me, setMe] = useState(null),
    [ready, setReady] = useState(false);
  const refresh = useCallback(async () => {
    const {
      data: { session },
    } = await sb.auth.getSession();
    if (!session) {
      setMe(null);
      setReady(true);
      return null;
    }
    const { data } = await sb
      .from('users')
      .select('user_id,name,roles(role_name)')
      .eq('user_id', session.user.id)
      .maybeSingle();
    const m = data ? { id: data.user_id, name: data.name, role: data.roles.role_name } : null;
    setMe(m);
    setReady(true);
    return m;
  }, []);
  useEffect(() => {
    refresh().catch(() => setReady(true));
  }, [refresh]);
  const logout = async () => {
    await sb.auth.signOut();
    setMe(null);
  };
  if (!ready)
    return (
      <div className="wrap page">
        <p className="mut">Loading…</p>
      </div>
    );
  return <Ctx.Provider value={{ me, refresh, logout }}>{children}</Ctx.Provider>;
}
export function Guard({ role, children }) {
  const { me } = useAuth();
  const loc = useLocation();
  // remember where the user wanted to go, so login can send them back
  if (!me) return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />;
  if (role && me.role !== role) return <Navigate to={me.role === 'Caterer Owner' ? '/owner' : '/'} replace />;
  return children;
}
