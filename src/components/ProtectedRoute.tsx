// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = () => {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  // Показываем загрузку пока проверяем токен
  if (isLoading) {
    return <div className="container">Загрузка...</div>;
  }

  if (!user) {
    // Если пользователь не авторизован, перенаправляем его на страницу входа.
    // Мы также передаем в `state` текущий путь, чтобы после входа
    // можно было вернуть пользователя обратно.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Если авторизован, рендерим дочерний маршрут через <Outlet />
  return <Outlet />;
};
