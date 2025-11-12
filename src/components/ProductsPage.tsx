// src/components/ProductsPage.tsx
import { useState } from 'react';
import { products } from '../data/products';
import { ProductCard } from './ProductCard';

export function ProductsPage() {
  // Состояние для контролируемого поля поиска
  const [searchQuery, setSearchQuery] = useState('');

  // Функция для фильтрации товаров по названию
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <ul className="products-list">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>
    </div>
  );
}
