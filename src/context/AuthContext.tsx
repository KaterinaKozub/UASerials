import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { getSession, loginUser, logoutUser, registerUser, type User } from '../services/auth';

interface AuthCtx {
  user: User | null;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getSession);
  const register = useCallback(async (n: string, e: string, p: string) => setUser(await registerUser(n, e, p)), []);
  const login = useCallback(async (e: string, p: string) => setUser(await loginUser(e, p)), []);
  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);
  const value = useMemo(() => ({ user, register, login, logout }), [user, register, login, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth має використовуватись всередині AuthProvider');
  return ctx;
}
