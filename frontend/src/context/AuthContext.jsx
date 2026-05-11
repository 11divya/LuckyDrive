import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ApiService from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = ApiService.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    ApiService.me()
      .then((data) => setUser(data?.user || data))
      .catch(() => ApiService.setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setError(null);
    try {
      const data = await ApiService.login({ email, password });
      ApiService.setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const signup = useCallback(async (payload) => {
    setError(null);
    try {
      const data = await ApiService.signup(payload);
      ApiService.setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await ApiService.logout();
    } catch {
      // ignore — we still clear locally
    }
    ApiService.setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, error, login, signup, logout }),
    [user, loading, error, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>');
  return ctx;
}
