// src/context/AuthContext.tsx
import { createContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../services/api';
import type { User } from '../types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // При загрузке приложения проверяем наличие токена
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.getProfile(token);
        setUser(userData);
      } catch {
        // Токен невалидный - удаляем
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (token: string) => {
    // Сохраняем токен
    localStorage.setItem('token', token);
    
    // Получаем данные пользователя
    try {
      const userData = await authApi.getProfile(token);
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const register = async (email: string, password: string) => {
    const userData = await authApi.register({ email, password });
    setUser(userData);
    
    // После регистрации автоматически входим
    // Но нужно получить токен. В fastapi-users после регистрации нужно отдельно залогиниться
    // Поэтому просто зарегистрируем, а вход будет отдельно
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
