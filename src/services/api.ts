// src/services/api.ts
// API клиент для взаимодействия с FastAPI бекендом

import type { Product } from '../types/api';

// Базовый URL API - можно настроить через переменные окружения
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
