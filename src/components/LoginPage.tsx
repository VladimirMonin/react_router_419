// src/components/LoginPage.tsx
import { useLocation, useNavigate } from 'react-router-dom';

interface LoginPageProps {
  login: () => void;
}


export const LoginPage = ({ login }: LoginPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Получаем путь, с которого пользователя перенаправили, или '/' по умолчанию
  const from = location.state?.from?.pathname || '/';

  const handleLogin = () => {
    login();
    // После "успешного" входа возвращаем пользователя обратно
    navigate(from, { replace: true });
  };

  return (
    <div className="container">
      <h1>Требуется вход</h1>
      <p>Вы должны войти в систему, чтобы просмотреть страницу по адресу: {from}</p>
      <button onClick={handleLogin}>Войти</button>
    </div>
  );
};