// src/components/ProductDetailPage.tsx
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProduct } from '../hooks/useProducts';
import { useEffect } from 'react';

export function ProductDetailPage() {
  // Хук useParams извлекает динамические параметры из URL (:id)
  const { productID } = useParams<{ productID: string }>();
  const navigate = useNavigate();
  
  // Преобразуем строковый ID в число
  const productId = productID ? parseInt(productID, 10) : 0;
  
  // Получаем товар из API
  const { product, loading, error } = useProduct(productId);

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
        <Link to="/products">← Вернуться к списку товаров</Link>
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
      <div className="detail">
        {/* Изображение товара */}
        {product.image_url && (
          <img 
            src={product.image_url} 
            alt={product.name}
            style={{ maxWidth: '400px', marginBottom: '20px' }}
          />
        )}
        
        <h1>{product.name}</h1>
        
        {/* Цены в обеих валютах */}
        <div style={{ marginBottom: '15px' }}>
          <p><strong>Цена:</strong></p>
          <p>💰 {product.price_shmeckles} шмеклей</p>
          <p>🌟 {product.price_flurbos} флёрбосов</p>
        </div>
        
        <p>{product.description}</p>
        
        {/* Категория */}
        {product.category && (
          <div style={{ marginTop: '20px' }}>
            <p><strong>📂 Категория:</strong> {product.category.name}</p>
            {product.category.description && (
              <p style={{ fontStyle: 'italic' }}>{product.category.description}</p>
            )}
          </div>
        )}
        
        {/* Теги */}
        {product.tags && product.tags.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <p><strong>Теги:</strong></p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {product.tags.map(tag => (
                <span 
                  key={tag.id} 
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div style={{ marginTop: '30px' }}>
          <Link to="/products">← Вернуться к списку товаров</Link>
        </div>
      </div>
    </div>
  );
}
