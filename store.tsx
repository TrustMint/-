import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, Category, UserProfile } from './types';
import { supabase } from './lib/supabase';
import { db } from './lib/db';
import { DEFAULT_CATEGORIES } from './constants';
import { Session } from '@supabase/supabase-js';

interface AppState {
  session: Session | null;
  user: UserProfile | null;
  transactions: Transaction[];
  categories: Category[];
  loading: boolean;
  online: boolean;
  addTransaction: (t: Omit<Transaction, 'id' | 'user_id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (c: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(navigator.onLine);

  // Network Status
  useEffect(() => {
    const handleOnline = () => { setOnline(true); syncOfflineData(); };
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserData(session.user.id, session.user.email);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserData(session.user.id, session.user.email);
      else {
        setUser(null);
        setTransactions([]);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string, email?: string) => {
    setLoading(true);
    const localTxs = await db.getAllTransactions();
    setTransactions(localTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    let currentUser: UserProfile = {
        id: userId,
        email: email || '',
        currency: 'RUB',
        theme: 'dark',
        full_name: email?.split('@')[0] || 'Пользователь'
    };

    if (navigator.onLine) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (profileData) currentUser = profileData as UserProfile;
        
        const { data: txData } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
        if (txData) {
            setTransactions(txData);
            txData.forEach(tx => db.putTransaction(tx));
        }
    }
    setUser(currentUser);
    setLoading(false);
  };

  const syncOfflineData = async () => {
    const queue = await db.getSyncQueue();
    for (const item of queue) {
        if (item.action === 'create') {
            const { error } = await supabase.from('transactions').insert(item.payload);
            if (!error) await db.removeFromSyncQueue(item.id);
        } else if (item.action === 'delete') {
            const { error } = await supabase.from('transactions').delete().eq('id', item.payload.id);
            if (!error) await db.removeFromSyncQueue(item.id);
        }
    }
  };

  const addTransaction = async (t: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!session) return;
    const newTx: Transaction = { ...t, id: crypto.randomUUID(), user_id: session.user.id, synced: false };
    setTransactions(prev => [newTx, ...prev]);
    await db.putTransaction(newTx);
    if (online) {
        const { error } = await supabase.from('transactions').insert({ ...newTx, synced: true });
        if (error) await db.addToSyncQueue({ id: newTx.id, action: 'create', payload: newTx, timestamp: Date.now() });
    } else {
        await db.addToSyncQueue({ id: newTx.id, action: 'create', payload: newTx, timestamp: Date.now() });
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    await db.deleteTransaction(id);
    if (online) await supabase.from('transactions').delete().eq('id', id);
    else await db.addToSyncQueue({ id: `del-${id}`, action: 'delete', payload: { id }, timestamp: Date.now() });
  };

  // Простая реализация управления категориями (пока локально + мок)
  const addCategory = async (c: Omit<Category, 'id'>) => {
    const newCat = { ...c, id: crypto.randomUUID() };
    setCategories(prev => [...prev, newCat]);
    // В реальном приложении здесь был бы запрос к Supabase
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    // В реальном приложении здесь был бы запрос к Supabase
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppContext.Provider value={{ session, user, transactions, categories, loading, online, addTransaction, deleteTransaction, addCategory, deleteCategory, signOut }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useStore must be used within AppProvider');
  return context;
};
