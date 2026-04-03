import React, { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, saveToken, clearToken, getToken, getStoredUserId } from '../api/auth';

interface AuthContextValue {
  token: string | null;
  userId: string | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(getToken);
  const [userId, setUserId] = useState<string | null>(getStoredUserId);

  const login = useCallback(async (username: string, password: string) => {
    const data = await apiLogin(username, password);
    saveToken(data.access_token, username);
    setToken(data.access_token);
    setUserId(username);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUserId(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, userId, isLoggedIn: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
