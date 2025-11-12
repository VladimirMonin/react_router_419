// src/components/MainLayout.tsx
import { Outlet, NavLink } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import './MainLayout.css'; // Подключим стили для макета

interface MainLayoutProps {
  isLoggedIn: boolean;
  logout: () => void;
}


export function MainLayout({ isLoggedIn, logout }: MainLayoutProps) {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <div className="app-layout">
      <header className="app-header">
        <nav className="container">
          <NavLink to="/">Главная</NavLink>
          <NavLink to="/products">Каталог</NavLink>
          
          {/* Иконка корзины с счетчиком */}
          <NavLink to="/cart" className="cart-link">
            🛒 Корзина
            {totalItems > 0 && <span className="cart-counter">{totalItems}</span>}
          </NavLink>
          
          {isLoggedIn ? (
            <>
             <NavLink to="/profile">Личный кабинет</NavLink>
              <button onClick={logout}>Выйти</button>
            </>
          ) : (
            <NavLink to="/login">Войти</NavLink>
          )}
         
        </nav>
      </header>

      <main className="app-content">
        {/* Это место, куда будет "вставляться" содержимое дочерних маршрутов */}
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>&copy; 2025 - React Router 419 shop</p>
        </div>
      </footer>
    </div>
  );
}
