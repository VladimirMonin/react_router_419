// src/components/ProductDetailPage.tsx
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProduct } from '../hooks/useProducts';
import { getImageUrl } from '../services/api';
import { useEffect } from 'react';
import './ProductDetailPage.css';

export function ProductDetailPage() {
  // Хук useParams извлекает динамические параметры из URL (:id)
  const { productID } = useParams<{ productID: string }>();
  const navigate = useNavigate();
  
  // Преобразуем строковый ID в число
  const productId = productID ? parseInt(productID, 10) : 0;
  
  // Получаем товар из API
  const { product, loading, error } = useProduct(productId);
  
  const imageUrl = product ? getImageUrl(product.image_url) : undefined;

  // Перенаправляем на страницу "Товар не найден" при ошибке 404
  useEffect(() => {
    if (error && error.includes('не найден')) {
      navigate('/product-not-found');
    }
  }, [error, navigate]);

  // Обработка состояния загрузки
  if (loading) {
    return (
      <div className="container">
        <p>Загрузка информации о товаре...</p>
      </div>
    );
  }

  // Обработка ошибок
  if (error) {
    return (
      <div className="container">
        <p style={{ color: 'red' }}>Ошибка: {error}</p>
        <Link to="/products" className="back-link">← Вернуться к списку товаров</Link>
      </div>
    );
  }

  // Если товар не загружен (null)
  if (!product) {
    return null;
  }

  // Отображаем детальную информацию о товаре
  return (
    <div className="container">
      <div className="product-detail">
        {/* Изображение товара или placeholder */}
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.name}
            className="product-detail-image"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
              if (placeholder) {
                placeholder.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div className="product-detail-image-placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>
          📦
        </div>
        
        <h1>{product.name}</h1>
        
        {/* Цены в обеих валютах */}
        <div className="product-detail-prices">
          <p>💰 {product.price_shmeckles} шмеклей</p>
          <p>🌟 {product.price_flurbos} флёрбосов</p>
        </div>
        
        <p className="product-detail-description">{product.description}</p>
        
        {/* Категория */}
        {product.category && (
          <div className="product-detail-category">
            <p><strong>📂 Категория:</strong> {product.category.name}</p>
            {product.category.description && (
              <p className="category-description">{product.category.description}</p>
            )}
          </div>
        )}
        
        {/* Теги */}
        {product.tags && product.tags.length > 0 && (
          <div className="product-detail-tags-section">
            <p><strong>Теги:</strong></p>
            <div className="product-detail-tags">
              {product.tags.map(tag => (
                <span key={tag.id} className="product-detail-tag">
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <Link to="/products" className="back-link">
          ← Вернуться к списку товаров
        </Link>
      </div>
    </div>
  );
}
