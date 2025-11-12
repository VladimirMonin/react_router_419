// src/components/ProductsPage.tsx
import { useState, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from './ProductCard';

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
      <div className="container">
        <h1>Каталог товаров</h1>
        <p>Загрузка товаров...</p>
      </div>
    );
  }

  // Обработка ошибок
  if (error) {
    return (
      <div className="container">
        <h1>Каталог товаров</h1>
        <p style={{ color: 'red' }}>Ошибка загрузки: {error}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Каталог товаров</h1>
      
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
        <p>Товары не найдены</p>
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
