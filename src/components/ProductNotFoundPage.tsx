// components/ProductNotFoundPage.tsx

import { Link } from 'react-router-dom';
import './ProductNotFoundPage.css'; // Подключим стили для этой страницы

export function ProductNotFoundPage() {
  return (
    <div className="container-product-not-found" >
      <h1>Товар не найден</h1>
      <p>Извините, но запрашиваемый товар не существует.</p>
      <button>
        <Link to="/products">Вернуться к списку товаров</Link>
      </button>
    </div>
  );
}
