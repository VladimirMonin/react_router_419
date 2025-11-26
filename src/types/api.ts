// src/types/api.ts
// Типы данных, полностью соответствующие контрактам FastAPI

/**
 * Категория товара
 */
export interface Category {
  /** Уникальный идентификатор категории */
  id: number;
  /** Название категории */
  name: string;
  /** Описание категории (опционально) */
  description?: string;
}

/**
 * Тег товара
 */
export interface Tag {
  /** Уникальный идентификатор тега */
  id: number;
  /** Название тега */
  name: string;
}

/**
 * Продукт - полная схема из FastAPI
 */
export interface Product {
  /** Уникальный идентификатор продукта */
  id: number;
  /** Название продукта */
  name: string;
  /** Подробное описание продукта */
  description?: string;
  /** URL-адрес изображения продукта */
  image_url?: string;
  /** Цена продукта в Шмеклях */
  price_shmeckles: number;
  /** Цена продукта в Флёрбосах */
  price_flurbos: number;
  /** Категория продукта (вложенный объект) */
  category?: Category;
  /** Список тегов продукта (вложенные объекты) */
  tags: Tag[];
}

/**
 * Ответ при успешном входе
 */
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

/**
 * Данные пользователя
 */
export interface User {
  id: string; // UUID usually
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
}

/**
 * Данные для регистрации
 */
export interface RegisterData {
  email: string;
  password: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
}

// ========== КОРЗИНА ==========

/**
 * Элемент корзины (позиция) - ответ от сервера
 */
export interface ServerCartItem {
  /** Уникальный идентификатор позиции в корзине */
  id: number;
  /** ID продукта */
  product_id: number;
  /** Количество товара */
  quantity: number;
  /** Вложенный объект продукта */
  product: Product;
}

/**
 * Корзина пользователя
 */
export interface Cart {
  /** Уникальный идентификатор корзины */
  id: number;
  /** Список позиций в корзине */
  items: ServerCartItem[];
  /** Общая сумма корзины в шмеклях */
  total_price: number;
}

/**
 * DTO для добавления товара в корзину
 */
export interface CartItemAdd {
  product_id: number;
  quantity: number;
}

/**
 * DTO для обновления количества товара
 */
export interface CartItemUpdate {
  quantity: number;
}

/**
 * Пакет товаров для синхронизации (merge)
 */
export interface CartItemBatch {
  items: CartItemAdd[];
}

// ========== ЗАКАЗЫ ==========

/**
 * Элемент заказа (позиция с фиксированной ценой)
 */
export interface OrderItem {
  /** ID позиции */
  id: number;
  /** ID продукта */
  product_id: number;
  /** Количество */
  quantity: number;
  /** Зафиксированная цена на момент заказа */
  frozen_price: number;
  /** Название товара (на момент заказа) */
  product_name: string;
}

/**
 * Заказ
 */
export interface Order {
  /** Уникальный идентификатор заказа */
  id: number;
  /** Статус заказа */
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  /** Общая сумма заказа */
  total_amount: number;
  /** Дата создания заказа (ISO строка) */
  created_at: string;
  /** Адрес доставки */
  delivery_address: string;
  /** Телефон для связи */
  phone?: string;
  /** Позиции заказа */
  items: OrderItem[];
}

/**
 * DTO для создания заказа
 */
export interface OrderCreate {
  /** Адрес доставки (обязательно) */
  delivery_address: string;
  /** Телефон для связи (опционально) */
  phone?: string;
}
