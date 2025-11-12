// src/hooks/useCart.tsx
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../data/products';

// Тип для элемента корзины (товар + количество)
export interface CartItem {
  product: Product;
  quantity: number;
}

// Тип для контекста корзины
interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  getTotalItems: () => number;
  clearCart: () => void;
}

// Создаем контекст
const CartContext = createContext<CartContextType | undefined>(undefined);

// Провайдер контекста корзины
interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Добавить товар в корзину (или увеличить количество если уже есть)
  const addToCart = (product: Product) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Товар уже в корзине - увеличиваем количество
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Товара нет в корзине - добавляем новый
        return [...prevItems, { product, quantity: 1 }];
      }
    });
  };

  // Полностью удалить товар из корзины
  const removeFromCart = (productId: number) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  // Обновить количество товара в корзине
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Получить общее количество товаров в корзине
  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // Очистить корзину
  const clearCart = () => {
    setItems([]);
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalItems,
    clearCart,
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