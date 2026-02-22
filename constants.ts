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
  { id: '12', name: 'Питомцы', icon: 'github', color: '#E0A800', type: 'expense' }, // Dark Yellow (Distinct from #FFD60A)
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