// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { ProductsPage } from './components/ProductsPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { NotFoundPage } from './components/NotFoundPage';
import { MainLayout } from './components/MainLayout';
import { ProfilePage } from './components/ProfilePage';
import { ProductNotFoundPage } from './components/ProductNotFoundPage';
import { LoginPage } from './components/LoginPage';
import { CartPage } from './components/CartPage';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
// Простой компонент для главной страницы
function HomePage() {
  return (
    <div className="container">
      <h1>Добро пожаловать в наш магазин!</h1>
        <p>Используйте навигацию, чтобы просмотреть каталог товаров.</p>
    </div>
  );
}

function App() {
  const { isLoggedIn, login, logout } = useAuth();
  return (
    <>
      {/* Можно добавить общую навигацию здесь, если нужно */}
      <Routes>
        {/* Родительский маршрут для MainLayout */}
        <Route path="/" element={<MainLayout isLoggedIn={isLoggedIn} logout={logout} />}>

          {/* Дочерние маршруты. Рендер внутри Outlet. Index - означает что маршрут будет активен когда URL совпадает с родительским / */}
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:productID" element={<ProductDetailPage />} />
          <Route path="login" element={<LoginPage login={login} />} />
          
          {/* Страница корзины */}
          <Route path="cart" element={<CartPage />} />
          
          {/* Секция защищенных маршрутов */}
          <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          {/* Отдельный маршрут "Товар не найден - 404" */}
          <Route path="product-not-found" element={<ProductNotFoundPage />} />
          {/* wildcard - все остальное */}
          <Route path="*" element={<NotFoundPage />} />

          {/*
            // Пример вложенных маршрутов для личного кабинета пользователя:
            <Route path="profile" element={<ProfileLayout />}>
              <Route index element={<Profile />} /> // /profile
              <Route path="settings" element={<ProfileSettings />} /> // /profile/settings
              <Route path="orders" element={<ProfileOrders />} /> // /profile/orders
              <Route path="*" element={<ProfileNotFound />} /> // для несуществующих страниц профиля
            </Route>
          */}

        </Route>
      </Routes>
    </>
  );
}

export default App;
