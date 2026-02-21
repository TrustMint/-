import { Category, Transaction } from './types';

export const CURRENCY_SYMBOL: Record<string, string> = {
  RUB: '₽',
};

export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses
  { id: '1', name: 'Продукты', icon: 'shopping-cart', color: '#FF9F0A', type: 'expense' }, // Orange
  { id: '2', name: 'Транспорт', icon: 'car', color: '#0A84FF', type: 'expense' }, // Blue
  { id: '3', name: 'Жилье', icon: 'home', color: '#BF5AF2', type: 'expense' }, // Purple
  { id: '4', name: 'Кафе', icon: 'coffee', color: '#FF453A', type: 'expense' }, // Red
  { id: '7', name: 'Здоровье', icon: 'heart', color: '#FF375F', type: 'expense' }, // Pink
  { id: '8', name: 'Одежда', icon: 'shopping-bag', color: '#5E5CE6', type: 'expense' }, // Indigo
  { id: '9', name: 'Связь', icon: 'smartphone', color: '#64D2FF', type: 'expense' }, // Light Blue
  { id: '10', name: 'Спорт', icon: 'activity', color: '#30D158', type: 'expense' }, // Green
  { id: '11', name: 'Авто', icon: 'tool', color: '#AC8E68', type: 'expense' }, // Brown
  { id: '12', name: 'Питомцы', icon: 'github', color: '#FFD60A', type: 'expense' }, // Yellow
  { id: '13', name: 'Образование', icon: 'book', color: '#FF9500', type: 'expense' }, // Dark Orange
  { id: '14', name: 'Подарки', icon: 'gift', color: '#FF2D55', type: 'expense' }, // Red/Pink
  { id: '15', name: 'Путешествия', icon: 'map', color: '#40C8E0', type: 'expense' }, // Teal
  { id: '16', name: 'Красота', icon: 'sun', color: '#D188CF', type: 'expense' }, // Lavender
  { id: '17', name: 'Техника', icon: 'monitor', color: '#8E8E93', type: 'expense' }, // Gray
  
  // Income
  { id: '5', name: 'Зарплата', icon: 'briefcase', color: '#32D74B', type: 'income' }, // Bright Green
  { id: '6', name: 'Фриланс', icon: 'laptop', color: '#64D2FF', type: 'income' }, // Cyan
  { id: '18', name: 'Инвестиции', icon: 'trending-up', color: '#30B0C7', type: 'income' }, // Teal Blue
  { id: '19', name: 'Подарки', icon: 'gift', color: '#FFD60A', type: 'income' }, // Yellow
  { id: '20', name: 'Кэшбэк', icon: 'percent', color: '#FF9F0A', type: 'income' }, // Orange
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