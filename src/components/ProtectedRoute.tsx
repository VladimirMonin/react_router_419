// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  isLoggedIn: boolean;
}

export const ProtectedRoute = ({ isLoggedIn }: ProtectedRouteProps) => {
//   Определяем текущее местоположение пользователя
  const location = useLocation();

  if (!isLoggedIn) {
    // Если пользователь не авторизован, перенаправляем его на страницу входа.
    // Мы также передаем в `state` текущий путь, чтобы после входа
    // можно было вернуть пользователя обратно.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Если авторизован, рендерим дочерний маршрут через <Outlet />
  return <Outlet />;
};
