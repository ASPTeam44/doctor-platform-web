import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types/auth';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import { authApi, LoginPayload, RegisterPayload } from '@/lib/api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => tokenStorage.getUser());
  const [token, setToken] = useState<string | null>(() => tokenStorage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    tokenStorage.clearAuth();
    setUser(null);
    setToken(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!tokenStorage.getToken()) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authApi.getProfile();
      if (res.user) {
        setUser(res.user);
        tokenStorage.setUser(res.user);
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshProfile();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('doctalk:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('doctalk:unauthorized', handleUnauthorized);
    };
  }, [refreshProfile, logout]);

  const login = async (credentials: LoginPayload): Promise<User> => {
    const data = await authApi.login(credentials);
    tokenStorage.setToken(data.token);
    tokenStorage.setUser(data.user);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    await authApi.register(payload);
    // Auto-login upon successful registration
    const loginRes = await authApi.login({
      email: payload.email,
      password: payload.password,
    });
    tokenStorage.setToken(loginRes.token);
    tokenStorage.setUser(loginRes.user);
    setToken(loginRes.token);
    setUser(loginRes.user);
    return loginRes.user;
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
