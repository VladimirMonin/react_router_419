// src/hooks/useProducts.ts
// Кастомные хуки для работы с продуктами через API

import { useState, useEffect } from 'react';
import type { Product } from '../types/api';
import { productsApi } from '../services/api';

/**
 * Хук для получения списка всех продуктов
 */
export const useProducts = () => {

// Объявление состояний.
// 1. products, setProducts - для хранения списка продуктов
// 2. loading, setLoading - для состояния загрузки
// 3. error, setError - для хранения ошибок
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // При старте загрузки сбрасываем ошибку и ставим loading в true
        setLoading(true);
        setError(null);
        // Вызов API для получения всех продуктов
        const data = await productsApi.getAll();
        // Обновление состояния products полученными данными
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        console.error('Ошибка загрузки продуктов:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};

/**
 * Хук для получения одного продукта по ID
 */
export const useProduct = (id: number) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productsApi.getById(id);
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        console.error(`Ошибка загрузки продукта ${id}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
};
