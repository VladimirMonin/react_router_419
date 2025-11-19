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
