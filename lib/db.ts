import { openDB, DBSchema } from 'idb';
import { Transaction } from '../types';

interface FinTrackDB extends DBSchema {
  transactions: {
    key: string;
    value: Transaction;
    indexes: { 'by-date': string; 'synced': number };
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

const dbPromise = openDB<FinTrackDB>('fintrack-db', 1, {
  upgrade(db) {
    const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
    txStore.createIndex('by-date', 'date');
    txStore.createIndex('synced', 'synced');

    db.createObjectStore('syncQueue', { keyPath: 'id' });
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
