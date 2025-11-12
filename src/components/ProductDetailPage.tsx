// src/components/ProductDetailPage.tsx
import { useParams } from 'react-router-dom';
import { products } from '../data/products';
import { useEffect } from 'react';
// Импорт хука для перенаправления
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export function ProductDetailPage() {
  // Хук useParams извлекает динамические параметры из URL (:id)
//   "products/:productID"
  const { productID } = useParams<{ productID: string }>();
  const navigate = useNavigate();
  // Ищем продукт в нашем "датасете" по id.
  // Приводим id из данных к строке для корректного сравнения.
  const product = products.find((p) => p.id.toString() === productID);

  useEffect(() => {
    if (!product) {
      navigate('/product-not-found');
    }
  }, [product, navigate]);

  if (!product) {
    return null;
  }


  // Если найден - отображаем его данные.
  return (
    <div className="container">
      <div className="detail">
        <h1>{product.name}</h1>
        <p><strong>Цена:</strong> {product.price} руб.</p>
        <p>{product.description}</p>
        <Link to="/products">← Вернуться к списку товаров</Link>
      </div>
    </div>
  );
}
