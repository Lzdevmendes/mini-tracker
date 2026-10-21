import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthResponse, UserInfo } from '../types';
import { clearStoredSession } from '../services/api';

interface AuthContextValue {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (auth: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'foody_auth_token';
const USER_STORAGE_KEY = 'foody_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState<UserInfo | null>(() => {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserInfo;
    } catch {
      return null;
    }
  });

  const setSession = (auth: AuthResponse) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, auth.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(auth.user));
    setToken(auth.token);
    setUser(auth.user);
  };

  const logout = () => {
    clearStoredSession();
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        setSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
