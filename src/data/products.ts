// src/data/products.ts

// Определяем тип для одного продукта для строгой типизации
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

// Экспортируем массив с данными о товарах
export const products: Product[] = [
  { id: 101, name: 'Смарт-часы Pro', price: 15000, description: 'Стильные и многофункциональные смарт-часы.' },
  { id: 102, name: 'Беспроводные наушники Air', price: 8000, description: 'Кристально чистый звук без проводов.' },
  { id: 103, name: 'Ноутбук UltraBook X', price: 85000, description: 'Мощный и легкий ноутбук для работы и развлечений.' },
  { id: 104, name: 'Кофемашина Barista', price: 25000, description: 'Идеальный эспрессо каждое утро.' },
  { id: 105, name: 'Игровая консоль NextGen', price: 45000, description: 'Погрузитесь в мир игр нового поколения.' },
  { id: 106, name: 'Электрический самокат City', price: 32000, description: 'Быстрое и экологичное передвижение по городу.' },
  { id: 107, name: 'Умная колонка Voice', price: 7000, description: 'Ваш персональный ассистент с отличным звуком.' },
  { id: 108, name: 'Рюкзак TravelPro', price: 6000, description: 'Надежный рюкзак для путешествий и города.' },
  { id: 109, name: 'Внешний аккумулятор Power+', price: 3500, description: 'Зарядит ваши устройства в любом месте.' },
  { id: 110, name: '4K Монитор ViewMax', price: 28000, description: 'Потрясающая детализация изображения.' },
];
