// src/components/LoginPage.tsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/api';
import './LoginPage.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Получаем путь, с которого пользователя перенаправили, или '/' по умолчанию
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // ВАЖНО: fastapi-users требует форму, а не JSON
      const formData = new URLSearchParams();
      formData.append('username', email); // Поле называется username, но передаем email
      formData.append('password', password);

      const response = await authApi.login(formData);
      
      // Сохраняем токен и получаем данные пользователя
      await login(response.access_token);
      
      // Перенаправляем на исходную страницу
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Вход</h1>
      <p>Вы должны войти в систему, чтобы просмотреть страницу по адресу: {from}</p>
      
      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-form-group">
          <label htmlFor="email" className="login-form-label">
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="login-form-input"
          />
        </div>

        <div className="login-form-group">
          <label htmlFor="password" className="login-form-label">
            Пароль:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="login-form-input"
          />
        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading}
          className="login-button"
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
};
