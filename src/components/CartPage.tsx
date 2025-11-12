// src/components/CartPage.tsx
import { useCart } from '../hooks/useCart';
import { Link } from 'react-router-dom';

export function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalItems, clearCart } = useCart();

  // Вычисляем общую сумму в шмеклях (можно добавить переключатель валют)
  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.product.price_shmeckles * item.quantity, 0);
  };
  
  // Вычисляем общую сумму в флёрбосах
  const getTotalPriceFlurbos = () => {
    return items.reduce((total, item) => total + item.product.price_flurbos * item.quantity, 0);
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: number) => {
    removeFromCart(productId);
  };

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
        {items.map((item) => (
          <div key={item.product.id} className="cart-item">
            {/* Изображение товара */}
            {item.product.image_url && (
              <img 
                src={item.product.image_url} 
                alt={item.product.name}
                style={{ width: '80px', height: '80px', objectFit: 'cover', marginRight: '15px' }}
              />
            )}
            
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
        ))}
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