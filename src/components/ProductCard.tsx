// src/components/ProductCard.tsx
import { Link } from 'react-router-dom';
import type { Product } from '../types/api';
import { useCart } from '../hooks/useCart';
// Import css
import '../App.css';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <li className="product-card">
      {/* Изображение продукта */}
      {product.image_url && (
        <img 
          src={product.image_url} 
          alt={product.name}
          className="product-image"
        />
      )}
      
      <h3>{product.name}</h3>
      
      {/* Цены в обеих валютах */}
      <div className="product-prices">
        <p>💰 {product.price_shmeckles} шмеклей</p>
        <p>🌟 {product.price_flurbos} флёрбосов</p>
      </div>
      
      <p>{product.description}</p>
      
      {/* Категория */}
      {product.category && (
        <p className="product-category">
          📂 Категория: {product.category.name}
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
        <button className="add-to-cart-button" onClick={handleAddToCart}>
          В корзину
        </button>
      </div>
    </li>
  );
}
