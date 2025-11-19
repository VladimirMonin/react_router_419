// src/services/api.ts
// API клиент для взаимодействия с FastAPI бекендом

import type { Product, LoginResponse, User, RegisterData } from '../types/api';

// Базовый URL API - используем прокси
const API_BASE_URL = '/api';

/**
 * Получить полный URL изображения
 * Если image_url относительный (начинается с /), добавляем базовый URL
 */
export const getImageUrl = (imageUrl: string | undefined): string | undefined => {
  if (!imageUrl) return undefined;
  
  // Если URL уже полный (начинается с http:// или https://)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Если относительный путь (начинается с /)
  if (imageUrl.startsWith('/')) {
    // В режиме разработки через прокси нам нужен полный путь для картинок,
    // так как они не проксируются автоматически в src тегах img,
    // если только мы не настроим это специально.
    // Но обычно картинки раздаются статикой.
    // Если бэкенд отдает /static/image.jpg, то нам нужно http://localhost:8000/static/image.jpg
    // Прокси работает для fetch запросов. Для <img src> он сработает только если мы укажем /api/static/...
    // Но обычно бэкенд возвращает URL без /api префикса для статики.
    // Поэтому для картинок лучше оставить прямой URL к бэкенду или настроить прокси и для них.
    // В данном случае, давайте пока оставим как есть, но учтем, что API_BASE_URL теперь /api.
    // Если imageUrl = /static/img.png, то результат будет /api/static/img.png.
    // Прокси перепишет это в http://localhost:8000/static/img.png. Это должно сработать!
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  // Если путь без слеша в начале
  return `${API_BASE_URL}/${imageUrl}`;
};

/**
 * API для аутентификации
 */
export const authApi = {
  async login(formData: URLSearchParams): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/jwt/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Ошибка входа');
    }

    return response.json();
  },

  async register(data: RegisterData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Ошибка регистрации');
    }

    return response.json();
  },

  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Не удалось получить профиль');
    return response.json();
  },
};

/**
 * API для работы с продуктами
 */
export const productsApi = {
  /**
   * Получить все продукты
   */
  async getAll(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products/`);
    
    // Проверка статуса ответа
    if (!response.ok) {
      throw new Error(`Ошибка загрузки продуктов: ${response.status} ${response.statusText}`);
    }
    
    // Получение данных из ответа
    const data: Product[] = await response.json();
    return data;
  },

  /**
   * Получить продукт по ID
   */
  async getById(id: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    
    // Проверка статуса ответа
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Продукт не найден');
      }
      throw new Error(`Ошибка загрузки продукта: ${response.status} ${response.statusText}`);
    }
    
    const data: Product = await response.json();
    return data;
  },
};
