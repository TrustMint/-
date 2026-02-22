import { Category, Transaction } from './types';

export const CURRENCY_SYMBOL: Record<string, string> = {
  RUB: '₽',
};

export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses (19)
  { id: '1', name: 'Продукты', icon: 'shopping-cart', color: '#FF9F0A', type: 'expense' },
  { id: '2', name: 'Транспорт', icon: 'car', color: '#0A84FF', type: 'expense' },
  { id: '3', name: 'Жилье', icon: 'home', color: '#BF5AF2', type: 'expense' },
  { id: '4', name: 'Кафе', icon: 'coffee', color: '#FF453A', type: 'expense' },
  { id: '7', name: 'Здоровье', icon: 'heart', color: '#FF375F', type: 'expense' },
  { id: '8', name: 'Одежда', icon: 'shopping-bag', color: '#5E5CE6', type: 'expense' },
  { id: '9', name: 'Связь', icon: 'smartphone', color: '#64D2FF', type: 'expense' },
  { id: '10', name: 'Спорт', icon: 'activity', color: '#30D158', type: 'expense' },
  { id: '11', name: 'Авто', icon: 'tool', color: '#AC8E68', type: 'expense' },
  { id: '12', name: 'Питомцы', icon: 'github', color: '#E0A800', type: 'expense' },
  { id: '13', name: 'Образование', icon: 'book', color: '#FF9500', type: 'expense' },
  { id: '14', name: 'Подарки', icon: 'gift', color: '#FF2D55', type: 'expense' },
  { id: '15', name: 'Путешествия', icon: 'map', color: '#40C8E0', type: 'expense' },
  { id: '16', name: 'Красота', icon: 'sun', color: '#D188CF', type: 'expense' },
  { id: '17', name: 'Техника', icon: 'monitor', color: '#8E8E93', type: 'expense' },
  { id: '21', name: 'Развлечения', icon: 'music', color: '#FF2D55', type: 'expense' },
  { id: '22', name: 'Семья', icon: 'user', color: '#BF5AF2', type: 'expense' },
  { id: '23', name: 'Подписки', icon: 'credit-card', color: '#5E5CE6', type: 'expense' },
  { id: '24', name: 'Разное', icon: 'list', color: '#8E8E93', type: 'expense' },
  
  // Income (10)
  { id: '5', name: 'Зарплата', icon: 'briefcase', color: '#32D74B', type: 'income' },
  { id: '6', name: 'Фриланс', icon: 'laptop', color: '#64D2FF', type: 'income' },
  { id: '18', name: 'Инвестиции', icon: 'trending-up', color: '#30B0C7', type: 'income' },
  { id: '19', name: 'Подарки', icon: 'gift', color: '#FFD60A', type: 'income' },
  { id: '20', name: 'Кэшбэк', icon: 'percent', color: '#FF9F0A', type: 'income' },
  { id: '25', name: 'Бизнес', icon: 'briefcase', color: '#BF5AF2', type: 'income' },
  { id: '26', name: 'Аренда', icon: 'home', color: '#0A84FF', type: 'income' },
  { id: '27', name: 'Продажа', icon: 'tag', color: '#FF375F', type: 'income' },
  { id: '28', name: 'Пособия', icon: 'shield', color: '#5E5CE6', type: 'income' },
  { id: '29', name: 'Разное', icon: 'list', color: '#8E8E93', type: 'income' },
];