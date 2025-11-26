// src/components/LoginPage.tsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi, cartApi } from '../services/api';
import { CART_STORAGE_KEY, clearLocalStorageCart, useCart } from '../hooks/useCart';
import type { CartItemAdd } from '../types/api';
import './LoginPage.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { refreshCart } = useCart();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Получаем путь, с которого пользователя перенаправили, или '/' по умолчанию
  const from = location.state?.from?.pathname || '/';

  /**
   * Синхронизация локальной корзины с сервером
   * Читает данные из localStorage и отправляет их на сервер через merge
   */
  const syncLocalCartWithServer = async (token: string): Promise<void> => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      
      if (!storedCart) {
        return; // Локальная корзина пуста, синхронизация не нужна
      }

      const localItems = JSON.parse(storedCart) as Array<{ product: { id: number }; quantity: number }>;
      
      if (localItems.length === 0) {
        return; // Корзина пуста
      }

      setStatusMessage('Синхронизируем вашу корзину...');

      // Преобразуем локальные данные в формат для API
      const itemsToMerge: CartItemAdd[] = localItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      // Временно устанавливаем токен для запроса
      localStorage.setItem('token', token);

      // Отправляем merge запрос
      await cartApi.merge({ items: itemsToMerge });

      // Очищаем локальную корзину после успешной синхронизации
      clearLocalStorageCart();
      
      setStatusMessage('Корзина синхронизирована!');
    } catch (error) {
      console.error('Ошибка синхронизации корзины:', error);
      // Не прерываем логин, если синхронизация не удалась
      setStatusMessage('Не удалось синхронизировать корзину');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');
    setIsLoading(true);

    try {
      // ВАЖНО: fastapi-users требует форму, а не JSON
      const formData = new URLSearchParams();
      formData.append('username', email); // Поле называется username, но передаем email
      formData.append('password', password);

      setStatusMessage('Выполняем вход...');
      const response = await authApi.login(formData);
      
      // Синхронизируем локальную корзину с сервером ПЕРЕД логином в контекст
      await syncLocalCartWithServer(response.access_token);
      
      // Сохраняем токен и получаем данные пользователя
      await login(response.access_token);
      
      // Обновляем корзину из контекста (загрузит актуальные данные с сервера)
      await refreshCart();
      
      // Перенаправляем на исходную страницу
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
      setStatusMessage('');
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

        {statusMessage && (
          <div className="login-status">
            {statusMessage}
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
