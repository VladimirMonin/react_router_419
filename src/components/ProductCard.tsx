// src/components/ProductCard.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/api';
import { useCart } from '../hooks/useCart';
import { getImageUrl } from '../services/api';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const imageUrl = getImageUrl(product.image_url);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product);
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <li className="product-card">
      {/* Изображение продукта или placeholder */}
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={product.name}
          className="product-image"
          onError={(e) => {
            // Если изображение не загрузилось, показываем placeholder
            e.currentTarget.style.display = 'none';
            const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
            if (placeholder) {
              placeholder.style.display = 'flex';
            }
          }}
        />
      ) : null}
      <div className="product-image-placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>
        📦
      </div>
      
      <h3>{product.name}</h3>
      
      {/* Цены в обеих валютах */}
      <div className="product-prices">
        <p>💰 {product.price_shmeckles} шм.</p>
        <p>🌟 {product.price_flurbos} фл.</p>
      </div>
      
      {/* Категория */}
      {product.category && (
        <p className="product-category">
          📂 {product.category.name}
        </p>
      )}
      
      {/* Теги */}
      {product.tags && product.tags.length > 0 && (
        <div className="product-tags">
          {product.tags.map(tag => (
            <span key={tag.id} className="product-tag">
              #{tag.name}
            </span>
          ))}
        </div>
      )}
      
      <div className="product-buttons">
        {/* Link создает навигационную ссылку без перезагрузки страницы */}
        <button className="details-button">
          <Link to={`/products/${product.id}`}>Подробнее</Link>
        </button>
        
        {/* Кнопка добавления в корзину */}
        <button 
          className="add-to-cart-button" 
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? 'Добавляем...' : 'В корзину'}
        </button>
      </div>
    </li>
  );
}
