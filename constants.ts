import { Category, Transaction } from './types';

export const CURRENCY_SYMBOL: Record<string, string> = {
  RUB: '₽',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Продукты', icon: 'shopping-cart', color: '#FF9F0A', type: 'expense' },
  { id: '2', name: 'Транспорт', icon: 'car', color: '#0A84FF', type: 'expense' },
  { id: '3', name: 'Жилье', icon: 'home', color: '#BF5AF2', type: 'expense' },
  { id: '4', name: 'Развлечения', icon: 'coffee', color: '#FF453A', type: 'expense' },
  { id: '5', name: 'Зарплата', icon: 'briefcase', color: '#30D158', type: 'income' },
  { id: '6', name: 'Фриланс', icon: 'laptop', color: '#64D2FF', type: 'income' },
  { id: '7', name: 'Здоровье', icon: 'plus', color: '#FF375F', type: 'expense' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', amount: 4500.00, currency: 'RUB', category_id: '1', date: new Date().toISOString(), type: 'expense', description: 'Пятерочка', user_id: 'mock-user' },
  { id: 't2', amount: 350.00, currency: 'RUB', category_id: '2', date: new Date().toISOString(), type: 'expense', description: 'Яндекс Такси', user_id: 'mock-user' },
  { id: 't3', amount: 80000.00, currency: 'RUB', category_id: '5', date: new Date(Date.now() - 86400000).toISOString(), type: 'income', description: 'Аванс за март', user_id: 'mock-user' },
  { id: 't4', amount: 2500.00, currency: 'RUB', category_id: '4', date: new Date(Date.now() - 86400000).toISOString(), type: 'expense', description: 'Кинотеатр', user_id: 'mock-user' },
  { id: 't5', amount: 900.00, currency: 'RUB', category_id: '3', date: new Date(Date.now() - 172800000).toISOString(), type: 'expense', description: 'Интернет Дом.ру', user_id: 'mock-user' },
  { id: 't6', amount: 250.00, currency: 'RUB', category_id: '4', date: new Date(Date.now() - 259200000).toISOString(), type: 'expense', description: 'Кофе с собой', user_id: 'mock-user' },
  { id: 't7', amount: 15000.00, currency: 'RUB', category_id: '6', date: new Date(Date.now() - 345600000).toISOString(), type: 'income', description: 'Дизайн логотипа', user_id: 'mock-user' },
];