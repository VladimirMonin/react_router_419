import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ordersApi } from '../services/api';
import { AdminBadge } from './AdminBadge';
import { VerifiedBadge } from './VerifiedBadge';
import type { Order } from '../types/api';
import './ProfilePage.css';

/**
 * Форматирование даты из ISO строки в читаемый формат
 */
const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Получить человекочитаемый статус заказа
 */
const getStatusLabel = (status: Order['status']): { label: string; emoji: string } => {
    const statuses: Record<Order['status'], { label: string; emoji: string }> = {
        pending: { label: 'Ожидает обработки', emoji: '⏳' },
        confirmed: { label: 'Подтверждён', emoji: '✅' },
        shipped: { label: 'Отправлен', emoji: '📦' },
        delivered: { label: 'Доставлен', emoji: '🎉' },
        cancelled: { label: 'Отменён', emoji: '❌' },
    };
    return statuses[status] || { label: status, emoji: '❓' };
};

export function ProfilePage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [ordersError, setOrdersError] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    // Загружаем заказы при монтировании компонента
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const userOrders = await ordersApi.getAll();
                // Сортируем по дате создания (новые первые)
                userOrders.sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setOrders(userOrders);
            } catch (error) {
                console.error('Ошибка загрузки заказов:', error);
                setOrdersError(error instanceof Error ? error.message : 'Не удалось загрузить заказы');
            } finally {
                setIsLoadingOrders(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    // Переключение развёрнутого заказа (аккордеон)
    const toggleOrderDetails = (orderId: number) => {
        setExpandedOrderId(prev => prev === orderId ? null : orderId);
    };

    if (!user) {
        return (
            <div className="container profile-container">
                <h1 className="profile-title">Личный кабинет</h1>
                <p>Загрузка данных пользователя...</p>
            </div>
        );
    }

    return (
        <div className="container profile-container">
            <h1 className="profile-title">Личный кабинет</h1>
            
            <div className="profile-info">
                <div className="profile-info-item">
                    <span className="profile-info-label">Email:</span>
                    <span className="profile-info-value">{user.email}</span>
                </div>

                <div className="profile-info-item">
                    <span className="profile-info-label">ID:</span>
                    <span className="profile-info-value">{user.id}</span>
                </div>

                <div className="profile-info-item">
                    <span className="profile-info-label">Статус:</span>
                    <span className="profile-info-value">
                        {user.is_active ? '✓ Активен' : '✗ Неактивен'}
                    </span>
                </div>
            </div>

            <div className="profile-badges">
                <AdminBadge isAdmin={user.is_superuser} />
                <VerifiedBadge isVerified={user.is_verified} />
            </div>

            {/* Секция истории заказов */}
            <div className="orders-section">
                <h2 className="orders-title">📋 Мои заказы</h2>

                {isLoadingOrders && (
                    <p className="orders-loading">Загрузка заказов...</p>
                )}

                {ordersError && (
                    <div className="orders-error">{ordersError}</div>
                )}

                {!isLoadingOrders && !ordersError && orders.length === 0 && (
                    <p className="orders-empty">У вас пока нет заказов</p>
                )}

                {!isLoadingOrders && !ordersError && orders.length > 0 && (
                    <div className="orders-list">
                        {orders.map(order => {
                            const status = getStatusLabel(order.status);
                            const isExpanded = expandedOrderId === order.id;

                            return (
                                <div key={order.id} className="order-card">
                                    <div 
                                        className="order-header"
                                        onClick={() => toggleOrderDetails(order.id)}
                                    >
                                        <div className="order-main-info">
                                            <span className="order-number">Заказ #{order.id}</span>
                                            <span className="order-date">{formatDate(order.created_at)}</span>
                                        </div>
                                        <div className="order-summary-info">
                                            <span className="order-status">
                                                {status.emoji} {status.label}
                                            </span>
                                            <span className="order-total">
                                                💰 {order.total_amount.toFixed(2)} шм.
                                            </span>
                                        </div>
                                        <span className="order-toggle">
                                            {isExpanded ? '▲' : '▼'}
                                        </span>
                                    </div>

                                    {isExpanded && (
                                        <div className="order-details">
                                            <div className="order-address">
                                                <strong>Адрес доставки:</strong> {order.delivery_address}
                                            </div>
                                            {order.phone && (
                                                <div className="order-phone">
                                                    <strong>Телефон:</strong> {order.phone}
                                                </div>
                                            )}
                                            
                                            <div className="order-items">
                                                <strong>Состав заказа:</strong>
                                                <ul className="order-items-list">
                                                    {order.items.map(item => (
                                                        <li key={item.id} className="order-item">
                                                            <span className="order-item-name">
                                                                {item.product_name}
                                                            </span>
                                                            <span className="order-item-details">
                                                                {item.quantity} × {item.frozen_price.toFixed(2)} шм. = 
                                                                <strong> {(item.quantity * item.frozen_price).toFixed(2)} шм.</strong>
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}