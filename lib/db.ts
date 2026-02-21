import { openDB, DBSchema } from 'idb';
import { Transaction, Category } from '../types';

interface FinTrackDB extends DBSchema {
  transactions: {
    key: string;
    value: Transaction;
    indexes: { 'by-date': string; 'synced': number };
  };
  categories: {
    key: string;
    value: Category;
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      action: 'create' | 'update' | 'delete';
      payload: any;
      timestamp: number;
    };
  };
}

const dbPromise = openDB<FinTrackDB>('fintrack-db', 2, {
  upgrade(db, oldVersion, newVersion, transaction) {
    if (oldVersion < 1) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txStore.createIndex('by-date', 'date');
        txStore.createIndex('synced', 'synced');
        db.createObjectStore('syncQueue', { keyPath: 'id' });
    }
    if (oldVersion < 2) {
        db.createObjectStore('categories', { keyPath: 'id' });
    }
  },
});

export const db = {
  async getAllTransactions() {
    return (await dbPromise).getAll('transactions');
  },
  async putTransaction(tx: Transaction) {
    return (await dbPromise).put('transactions', tx);
  },
  async deleteTransaction(id: string) {
    return (await dbPromise).delete('transactions', id);
  },
  async getAllCategories() {
    return (await dbPromise).getAll('categories');
  },
  async putCategory(cat: Category) {
    return (await dbPromise).put('categories', cat);
  },
  async deleteCategory(id: string) {
    return (await dbPromise).delete('categories', id);
  },
  async addToSyncQueue(item: any) {
    return (await dbPromise).put('syncQueue', item);
  },
  async getSyncQueue() {
    return (await dbPromise).getAll('syncQueue');
  },
  async removeFromSyncQueue(id: string) {
    return (await dbPromise).delete('syncQueue', id);
  }
};
