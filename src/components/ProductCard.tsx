// src/components/ProductCard.tsx
import { Link } from 'react-router-dom';
import type { Product } from '../data/products';
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
      <h3>{product.name}</h3>
      <p>Цена: {product.price} руб.</p>
      <p>{product.description}</p>
      
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
