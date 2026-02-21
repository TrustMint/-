export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType | 'both';
  user_id?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  category_id: string;
  date: string; // ISO string
  description?: string;
  type: TransactionType;
  user_id: string;
  synced?: boolean; // For offline sync
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  currency: string;
  theme: 'dark' | 'light';
}
