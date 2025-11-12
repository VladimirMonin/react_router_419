// src/hooks/useAuth.ts
import { useState } from 'react';

// Имитируем состояние аутентификации
export const useAuth = () => {
  // По умолчанию пользователь не авторизован
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = () => {
    // В реальном приложении здесь был бы запрос к API
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  return { isLoggedIn, login, logout };
};
