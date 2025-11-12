// src/components/ProductsPage.tsx
import { useState, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from './ProductCard';
import './ProductsPage.css';

export function ProductsPage() {
  // Состояние для контролируемого поля поиска
  const [searchQuery, setSearchQuery] = useState('');
  
  // Получаем товары из API
  const { products, loading, error } = useProducts();

  // Функция для фильтрации товаров по названию
  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Обработка состояния загрузки
  if (loading) {
    return (
      <div className="products-page-container">
        <h1 className="products-page-title">Каталог товаров</h1>
        <p className="loading-message">Загрузка товаров...</p>
      </div>
    );
  }

  // Обработка ошибок
  if (error) {
    return (
      <div className="products-page-container">
        <h1 className="products-page-title">Каталог товаров</h1>
        <p className="error-message">Ошибка загрузки: {error}</p>
      </div>
    );
  }

  return (
    <div className="products-page-container">
      <h1 className="products-page-title">Каталог товаров</h1>
      
      {/* Контролируемая форма поиска */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Поиск товаров по названию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <p className="no-products">Товары не найдены</p>
      ) : (
        <ul className="products-list">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      )}
    </div>
  );
}
