import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api';
import { setUnauthorizedHandler, TOKEN_KEY } from '../api/client';
import { useAppDispatch } from '../store';
import { clearExpenses } from '../store/expensesSlice';
import { resetFilters } from '../store/filtersSlice';
import type { AuthResponse, User } from '../types';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  /** True while checking a saved token on first load. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));
  const dispatch = useAppDispatch();

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    // Don't leave the previous user's list or filters in the store.
    dispatch(clearExpenses());
    dispatch(resetFilters());
  }, [dispatch]);

  // Restore the session from a saved token.
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsLoading(false));
  }, []);

  // Any 401 from the API (expired token) signs the user out.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const startSession = ({ token, user }: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
    return user;
  };

  const login = useCallback(
    async (email: string, password: string) => startSession(await authApi.login(email, password)),
    [],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) =>
      startSession(await authApi.register(name, email, password)),
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAdmin: user?.role === 'admin', isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
