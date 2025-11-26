// src/hooks/useCart.tsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../types/api';
import { cartApi } from '../services/api';
import { useAuth } from './useAuth';

// Ключ для хранения корзины в localStorage
export const CART_STORAGE_KEY = 'cart_items';

// Тип для элемента корзины (товар + количество)
// Локальная версия (для localStorage и UI)
export interface CartItem {
  product: Product;
  quantity: number;
  // ID позиции на сервере (только для авторизованных пользователей)
  serverItemId?: number;
}

// Тип для контекста корзины
interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  getTotalItems: () => number;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

// Создаем контекст
const CartContext = createContext<CartContextType | undefined>(undefined);

// Провайдер контекста корзины
interface CartProviderProps {
  children: ReactNode;
}

// ========== ФУНКЦИИ ДЛЯ РАБОТЫ С LOCALSTORAGE ==========

/**
 * Загрузить корзину из localStorage
 */
const loadFromLocalStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Ошибка чтения корзины из localStorage:', error);
  }
  return [];
};

/**
 * Сохранить корзину в localStorage
 */
const saveToLocalStorage = (items: CartItem[]): void => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Ошибка сохранения корзины в localStorage:', error);
  }
};

/**
 * Очистить корзину в localStorage
 */
export const clearLocalStorageCart = (): void => {
  localStorage.removeItem(CART_STORAGE_KEY);
};

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // ========== ЗАГРУЗКА КОРЗИНЫ ==========
  
  /**
   * Загрузить корзину (с сервера или из localStorage)
   */
  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    
    try {
      if (user) {
        // Авторизованный пользователь - загружаем с сервера
        const serverCart = await cartApi.get();
        
        // Преобразуем серверный формат в локальный
        const cartItems: CartItem[] = serverCart.items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          serverItemId: item.id, // Сохраняем ID позиции на сервере
        }));
        
        setItems(cartItems);
      } else {
        // Гость - загружаем из localStorage
        const localItems = loadFromLocalStorage();
        setItems(localItems);
      }
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
      // В случае ошибки загружаем из localStorage как fallback
      const localItems = loadFromLocalStorage();
      setItems(localItems);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Загружаем корзину при изменении пользователя
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ========== ДОБАВЛЕНИЕ ТОВАРА ==========
  
  const addToCart = async (product: Product) => {
    if (user) {
      // Авторизованный пользователь - добавляем на сервер
      try {
        const newItem = await cartApi.addItem({
          product_id: product.id,
          quantity: 1,
        });
        
        // Обновляем локальный стейт
        setItems(prevItems => {
          const existingIndex = prevItems.findIndex(item => item.product.id === product.id);
          
          if (existingIndex >= 0) {
            // Товар уже был - обновляем количество и serverItemId
            return prevItems.map((item, index) =>
              index === existingIndex
                ? { ...item, quantity: newItem.quantity, serverItemId: newItem.id }
                : item
            );
          } else {
            // Новый товар
            return [...prevItems, {
              product: newItem.product,
              quantity: newItem.quantity,
              serverItemId: newItem.id,
            }];
          }
        });
      } catch (error) {
        console.error('Ошибка добавления товара:', error);
        throw error;
      }
    } else {
      // Гость - сохраняем в localStorage
      setItems(prevItems => {
        const existingItem = prevItems.find(item => item.product.id === product.id);
        
        let newItems: CartItem[];
        if (existingItem) {
          // Товар уже в корзине - увеличиваем количество
          newItems = prevItems.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          // Товара нет в корзине - добавляем новый
          newItems = [...prevItems, { product, quantity: 1 }];
        }
        
        // Сохраняем в localStorage
        saveToLocalStorage(newItems);
        return newItems;
      });
    }
  };

  // ========== УДАЛЕНИЕ ТОВАРА ==========
  
  const removeFromCart = async (productId: number) => {
    if (user) {
      // Авторизованный пользователь - удаляем на сервере
      const item = items.find(item => item.product.id === productId);
      
      if (item?.serverItemId) {
        try {
          await cartApi.removeItem(item.serverItemId);
          setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
        } catch (error) {
          console.error('Ошибка удаления товара:', error);
          throw error;
        }
      }
    } else {
      // Гость - удаляем из localStorage
      setItems(prevItems => {
        const newItems = prevItems.filter(item => item.product.id !== productId);
        saveToLocalStorage(newItems);
        return newItems;
      });
    }
  };

  // ========== ОБНОВЛЕНИЕ КОЛИЧЕСТВА ==========
  
  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (user) {
      // Авторизованный пользователь - обновляем на сервере
      const item = items.find(item => item.product.id === productId);
      
      if (item?.serverItemId) {
        try {
          const updated = await cartApi.updateQuantity(item.serverItemId, { quantity });
          
          setItems(prevItems =>
            prevItems.map(item =>
              item.product.id === productId
                ? { ...item, quantity: updated.quantity }
                : item
            )
          );
        } catch (error) {
          console.error('Ошибка обновления количества:', error);
          throw error;
        }
      }
    } else {
      // Гость - обновляем в localStorage
      setItems(prevItems => {
        const newItems = prevItems.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        );
        saveToLocalStorage(newItems);
        return newItems;
      });
    }
  };

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
  
  // Получить общее количество товаров в корзине
  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // Очистить корзину
  const clearCart = () => {
    setItems([]);
    if (!user) {
      clearLocalStorageCart();
    }
  };

  // Принудительно обновить корзину с сервера
  const refreshCart = async () => {
    await fetchCart();
  };

  const value: CartContextType = {
    items,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalItems,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Хук для использования контекста корзины
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart должен использоваться внутри CartProvider');
  }
  return context;
}