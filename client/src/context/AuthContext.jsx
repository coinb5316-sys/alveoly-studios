import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

const TOKEN_KEY = 'alveoly_token';
const USER_KEY = 'alveoly_user';

function normalizeUser(raw) {
  if (!raw) return null;
  return {
    id: raw.id || raw._id || null,
    email: raw.email || '',
    credits: typeof raw.credits === 'number' ? raw.credits : 0,
    role: raw.role || 'user', // <-- CRITICAL for admin access
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? normalizeUser(JSON.parse(raw)) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      if (!token) { setReady(true); return; }
      try {
        const res = await api.get('/auth/me');
        if (cancelled) return;
        const fresh = res.data?.user;
        if (fresh) setUser(normalizeUser(fresh));
        setReady(true);
      } catch (err) {
        if (cancelled) return;
        if (err.response?.status === 401) {
          setUser(null);
          setToken(null);
        }
        setReady(true);
      }
    };
    verify();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback((userData, authToken) => {
    setUser(normalizeUser(userData));
    setToken(authToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      const fresh = res.data?.user;
      if (fresh) setUser(normalizeUser(fresh));
      return fresh;
    } catch { return null; }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        ready,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}