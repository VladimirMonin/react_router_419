// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { ProductsPage } from './components/ProductsPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { NotFoundPage } from './components/NotFoundPage';
import { MainLayout } from './components/MainLayout';
import { ProfilePage } from './components/ProfilePage';
import { ProductNotFoundPage } from './components/ProductNotFoundPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { CartPage } from './components/CartPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

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
  return (
    <AuthProvider>
      <Routes>
        {/* Родительский маршрут для MainLayout */}
        <Route path="/" element={<MainLayout />}>

          {/* Дочерние маршруты. Рендер внутри Outlet. Index - означает что маршрут будет активен когда URL совпадает с родительским / */}
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:productID" element={<ProductDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Секция защищенных маршрутов */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="cart" element={<CartPage />} />
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
    </AuthProvider>
  );
}

export default App;
