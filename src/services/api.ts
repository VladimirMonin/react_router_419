// src/services/api.ts
// API клиент для взаимодействия с FastAPI бекендом

import type { 
  Product, 
  LoginResponse, 
  User, 
  RegisterData,
  Cart,
  CartItemAdd,
  CartItemUpdate,
  CartItemBatch,
  ServerCartItem,
  Order,
  OrderCreate
} from '../types/api';

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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
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

// ========== ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ АВТОРИЗОВАННЫХ ЗАПРОСОВ ==========

/**
 * Получить токен из localStorage
 */
const getToken = (): string | null => localStorage.getItem('token');

/**
 * Выполнить авторизованный запрос
 */
const authorizedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('Необходима авторизация');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
  }
  
  return response;
};

// ========== API ДЛЯ КОРЗИНЫ ==========

/**
 * API для работы с корзиной (требует авторизации)
 */
export const cartApi = {
  /**
   * Получить текущую корзину пользователя
   */
  async get(): Promise<Cart> {
    const response = await authorizedFetch(`${API_BASE_URL}/cart/`);
    
    if (!response.ok) {
      throw new Error(`Ошибка загрузки корзины: ${response.status}`);
    }
    
    return response.json();
  },

  /**
   * Добавить товар в корзину
   */
  async addItem(data: CartItemAdd): Promise<ServerCartItem> {
    const response = await authorizedFetch(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Ошибка добавления товара в корзину');
    }
    
    return response.json();
  },

  /**
   * Обновить количество товара в корзине
   */
  async updateQuantity(itemId: number, data: CartItemUpdate): Promise<ServerCartItem> {
    const response = await authorizedFetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Ошибка обновления количества');
    }
    
    return response.json();
  },

  /**
   * Удалить товар из корзины
   */
  async removeItem(itemId: number): Promise<void> {
    const response = await authorizedFetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Ошибка удаления товара из корзины');
    }
  },

  /**
   * Синхронизировать локальную корзину с серверной (merge)
   * Используется при логине для объединения корзин
   */
  async merge(data: CartItemBatch): Promise<Cart> {
    const response = await authorizedFetch(`${API_BASE_URL}/cart/merge`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Ошибка синхронизации корзины');
    }
    
    return response.json();
  },
};

// ========== API ДЛЯ ЗАКАЗОВ ==========

/**
 * API для работы с заказами (требует авторизации)
 */
export const ordersApi = {
  /**
   * Создать заказ из текущей корзины
   * Бэкенд сам возьмёт товары из корзины пользователя
   */
  async create(data: OrderCreate): Promise<Order> {
    const response = await authorizedFetch(`${API_BASE_URL}/orders/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Ошибка создания заказа');
    }
    
    return response.json();
  },

  /**
   * Получить все заказы текущего пользователя
   */
  async getAll(): Promise<Order[]> {
    const response = await authorizedFetch(`${API_BASE_URL}/orders/`);
    
    if (!response.ok) {
      throw new Error('Ошибка загрузки заказов');
    }
    
    return response.json();
  },

  /**
   * Получить заказ по ID
   */
  async getById(orderId: number): Promise<Order> {
    const response = await authorizedFetch(`${API_BASE_URL}/orders/${orderId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Заказ не найден');
      }
      throw new Error('Ошибка загрузки заказа');
    }
    
    return response.json();
  },
};
