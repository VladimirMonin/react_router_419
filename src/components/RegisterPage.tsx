// src/components/RegisterPage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './RegisterPage.css';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 3) {
      setError('Пароль должен содержать минимум 3 символа');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password);
      
      // После успешной регистрации перенаправляем на страницу входа
      // В fastapi-users после регистрации нужно отдельно войти
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Регистрация</h1>
      
      <form onSubmit={handleSubmit} className="register-form">
        <div className="register-form-group">
          <label htmlFor="email" className="register-form-label">
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="register-form-input"
          />
        </div>

        <div className="register-form-group">
          <label htmlFor="password" className="register-form-label">
            Пароль:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="register-form-input"
          />
        </div>

        <div className="register-form-group">
          <label htmlFor="confirmPassword" className="register-form-label">
            Подтвердите пароль:
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            className="register-form-input"
          />
        </div>

        {error && (
          <div className="register-error">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading}
          className="register-button"
        >
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>

        <p className="register-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  );
};
