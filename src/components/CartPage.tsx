// src/components/CartPage.tsx
import { useCart } from '../hooks/useCart';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../services/api';
import './CartPage.css';

export function CartPage() {
  const { items, isLoading, updateQuantity, removeFromCart, getTotalItems, clearCart } = useCart();

  // Вычисляем общую сумму в шмеклях (можно добавить переключатель валют)
  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.product.price_shmeckles * item.quantity, 0);
  };
  
  // Вычисляем общую сумму в флёрбосах
  const getTotalPriceFlurbos = () => {
    return items.reduce((total, item) => total + item.product.price_flurbos * item.quantity, 0);
  };

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Ошибка обновления количества:', error);
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <h1>Корзина</h1>
        <p>Загрузка корзины...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <h1>Корзина</h1>
        <div className="empty-cart">
          <p>Ваша корзина пуста</p>
          <Link to="/products" className="continue-shopping-link">
            Перейти к покупкам
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Корзина ({getTotalItems()} товаров)</h1>
      
      <div className="cart-items">
        {items.map((item) => {
          const imageUrl = getImageUrl(item.product.image_url);
          
          return (
            <div key={item.product.id} className="cart-item">
              {/* Изображение товара или placeholder */}
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={item.product.name}
                  className="cart-item-image"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                    if (placeholder) {
                      placeholder.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div className="cart-item-image-placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>
                📦
              </div>
            
            <div className="item-info">
              <h3>{item.product.name}</h3>
              <p className="item-description">{item.product.description}</p>
              <div className="item-price">
                <p>💰 {item.product.price_shmeckles} шмеклей</p>
                <p>🌟 {item.product.price_flurbos} флёрбосов</p>
              </div>
            </div>
            
            <div className="item-controls">
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  −
                </button>
                <span className="quantity">{item.quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              
              <div className="item-total">
                <p><strong>💰 {item.product.price_shmeckles * item.quantity} шм.</strong></p>
                <p><strong>🌟 {item.product.price_flurbos * item.quantity} фл.</strong></p>
              </div>
              
              <button 
                className="remove-btn"
                onClick={() => handleRemoveItem(item.product.id)}
              >
                Удалить
              </button>
            </div>
          </div>
          );
        })}
      </div>
      
      <div className="cart-summary">
        <div className="total-section">
          <h3>Итого:</h3>
          <p>💰 {getTotalPrice().toFixed(2)} шмеклей</p>
          <p>🌟 {getTotalPriceFlurbos().toFixed(2)} флёрбосов</p>
          <div className="cart-actions">
            <button className="clear-cart-btn" onClick={clearCart}>
              Очистить корзину
            </button>
            <button className="checkout-btn">
              Оформить заказ
            </button>
          </div>
        </div>
        
        <Link to="/products" className="continue-shopping-link">
          ← Продолжить покупки
        </Link>
      </div>
    </div>
  );
}