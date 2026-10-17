import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api';
import { ApiError, setUnauthorizedHandler, TOKEN_KEY } from '../api/client';
import { useAppDispatch } from '../store';
import { clearExpenses } from '../store/expensesSlice';
import { resetFilters } from '../store/filtersSlice';
import type { AuthResponse, User } from '../types';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  /** True while checking a saved token on first load. */
  isLoading: boolean;
  /** True right after the user signs out, so the next login starts on the dashboard. */
  signedOut: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const USER_KEY = 'retain_user';

// The last known user, so pages can show straight away while the token is re-checked.
function cachedUser(): User | null {
  if (!localStorage.getItem(TOKEN_KEY)) return null;
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') as User | null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(cachedUser);
  // Only block the screen when there's a token but no remembered user.
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)) && !cachedUser());
  const [signedOut, setSignedOut] = useState(false);
  const dispatch = useAppDispatch();

  const saveUser = (next: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(next));
    setUser(next);
  };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setSignedOut(true);
    setUser(null);
    // Don't leave the previous user's list or filters in the store.
    dispatch(clearExpenses());
    dispatch(resetFilters());
  }, [dispatch]);

  // Re-check the saved token in the background. Only a 401 (expired / invalid) signs the
  // user out – a network blip or server error keeps them signed in.
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authApi
      .me()
      .then(({ user }) => saveUser(user))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) logout();
      })
      .finally(() => setIsLoading(false));
  }, [logout]);

  // Any 401 from the API (expired token) signs the user out.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const startSession = ({ token, user }: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, token);
    saveUser(user);
    setSignedOut(false);
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
    () => ({ user, isAdmin: user?.role === 'admin', isLoading, signedOut, login, register, logout }),
    [user, isLoading, signedOut, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
