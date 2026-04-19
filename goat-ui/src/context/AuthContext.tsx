import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextValue {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwt_token'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('jwt_username'));

  const login = (t: string, u: string) => {
    localStorage.setItem('jwt_token', t);
    localStorage.setItem('jwt_username', u);
    setToken(t);
    setUsername(u);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_username');
    setToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, username, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
