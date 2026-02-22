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
  addCategory: (c: Omit<Category, 'id'>) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
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
        setCategories(DEFAULT_CATEGORIES);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string, email?: string) => {
    setLoading(true);
    const localTxs = await db.getAllTransactions();
    setTransactions(localTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    const localCats = await db.getAllCategories();
    if (localCats.length > 0) setCategories(localCats);

    let currentUser: UserProfile = {
        id: userId,
        email: email || '',
        currency: 'RUB',
        theme: 'dark',
        full_name: email?.split('@')[0] || 'Пользователь',
        monthly_limit: 50000
    };

    if (navigator.onLine) {
        // Fetch Profile
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (profileData) currentUser = profileData as UserProfile;
        
        // Fetch Transactions
        const { data: txData } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
        if (txData) {
            setTransactions(txData);
            txData.forEach(tx => db.putTransaction(tx));
        }

        // Fetch Categories
        const { data: catData } = await supabase.from('categories').select('*').or(`user_id.eq.${userId},is_default.eq.true`);
        if (catData && catData.length > 0) {
            setCategories(catData);
            catData.forEach(cat => db.putCategory(cat));
        } else {
            // Seed default categories if none exist
            // (Optional: usually handled by DB migration or initial seed script, but here we can just use local defaults)
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

  const addCategory = async (c: Omit<Category, 'id'>) => {
    if (!session) return null;
    const newCat: Category = { ...c, id: crypto.randomUUID(), user_id: session.user.id };
    
    // Optimistic update
    setCategories(prev => [...prev, newCat]);
    await db.putCategory(newCat);
    
    if (online) {
        const { error } = await supabase.from('categories').insert(newCat);
        if (error) {
            console.error('Error adding category to Supabase:', error);
            // Rollback if needed, or queue for sync
        }
    }
    return newCat;
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    await db.deleteCategory(id);
    if (online) {
        await supabase.from('categories').delete().eq('id', id);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
      if (!session || !user) return;
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      if (online) {
          await supabase.from('profiles').update(updates).eq('id', user.id);
      }
  };

  const uploadAvatar = async (file: File) => {
      if (!session || !user) return;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

      if (uploadError) {
          throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppContext.Provider value={{ session, user, transactions, categories, loading, online, addTransaction, deleteTransaction, addCategory, deleteCategory, updateProfile, uploadAvatar, signOut }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useStore must be used within AppProvider');
  return context;
};
