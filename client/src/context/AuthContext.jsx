import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('zs_token'));

  useEffect(() => {
    if (!localStorage.getItem('zs_token')) return;
    api.get('/auth/me')
      .then((r) => setUser(r.data))
      .catch(() => localStorage.removeItem('zs_token'))
      .finally(() => setLoading(false));
  }, []);

  const authenticate = useCallback(async (path, payload) => {
    const { data } = await api.post(path, payload);
    localStorage.setItem('zs_token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const value = {
    user, loading, setUser,
    login: (p) => authenticate('/auth/login', p),
    register: (p) => authenticate('/auth/register', p),
    logout: () => { localStorage.removeItem('zs_token'); setUser(null); },
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
