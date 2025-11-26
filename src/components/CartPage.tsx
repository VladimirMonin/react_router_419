// src/components/CartPage.tsx
import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { Link } from 'react-router-dom';
import { getImageUrl, ordersApi } from '../services/api';
import type { Order } from '../types/api';
import './CartPage.css';

export function CartPage() {
  const { items, isLoading, updateQuantity, removeFromCart, getTotalItems, clearCart } = useCart();
  
  // Состояния для формы оформления заказа
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

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

  // Обработчик оформления заказа
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');
    setIsSubmitting(true);

    try {
      // Создаём заказ (бэкенд сам возьмёт товары из корзины пользователя)
      const order = await ordersApi.create({
        delivery_address: deliveryAddress,
        phone: phone || undefined,
      });

      // Сохраняем созданный заказ для отображения
      setCreatedOrder(order);
      
      // Очищаем корзину (бэкенд уже очистил её, обновляем локальное состояние)
      clearCart();
      
      // Сбрасываем форму
      setShowCheckoutForm(false);
      setDeliveryAddress('');
      setPhone('');
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'Ошибка создания заказа');
    } finally {
      setIsSubmitting(false);
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

  // Если заказ успешно создан, показываем сообщение
  if (createdOrder) {
    return (
      <div className="container">
        <div className="order-success">
          <h1>🎉 Заказ успешно оформлен!</h1>
          <div className="order-details">
            <p><strong>Номер заказа:</strong> #{createdOrder.id}</p>
            <p><strong>Сумма:</strong> 💰 {createdOrder.total_amount.toFixed(2)} шмеклей</p>
            <p><strong>Адрес доставки:</strong> {createdOrder.delivery_address}</p>
            {createdOrder.phone && <p><strong>Телефон:</strong> {createdOrder.phone}</p>}
            <p><strong>Статус:</strong> {createdOrder.status === 'pending' ? '⏳ Ожидает обработки' : createdOrder.status}</p>
          </div>
          <div className="order-success-actions">
            <Link to="/profile" className="view-orders-link">
              Посмотреть мои заказы
            </Link>
            <Link to="/products" className="continue-shopping-link">
              Продолжить покупки
            </Link>
          </div>
        </div>
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
            <button 
              className="checkout-btn"
              onClick={() => setShowCheckoutForm(true)}
            >
              Оформить заказ
            </button>
          </div>
        </div>
        
        <Link to="/products" className="continue-shopping-link">
          ← Продолжить покупки
        </Link>
      </div>

      {/* Модальная форма оформления заказа */}
      {showCheckoutForm && (
        <div className="checkout-modal-overlay" onClick={() => setShowCheckoutForm(false)}>
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Оформление заказа</h2>
            
            <form onSubmit={handleCheckout} className="checkout-form">
              <div className="checkout-form-group">
                <label htmlFor="delivery_address">Адрес доставки *</label>
                <textarea
                  id="delivery_address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="Введите полный адрес доставки"
                  rows={3}
                />
              </div>

              <div className="checkout-form-group">
                <label htmlFor="phone">Телефон для связи</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="+7 (___) ___-__-__"
                />
              </div>

              <div className="checkout-summary">
                <p><strong>Товаров:</strong> {getTotalItems()}</p>
                <p><strong>Сумма:</strong> 💰 {getTotalPrice().toFixed(2)} шмеклей</p>
              </div>

              {orderError && (
                <div className="checkout-error">
                  {orderError}
                </div>
              )}

              <div className="checkout-actions">
                <button 
                  type="button" 
                  className="checkout-cancel-btn"
                  onClick={() => setShowCheckoutForm(false)}
                  disabled={isSubmitting}
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  className="checkout-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Оформляем...' : 'Подтвердить заказ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}