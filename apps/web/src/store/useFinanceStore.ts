import { create } from 'zustand';
import type { Transaction, TransactionType } from '@/types/finance';
import { transactionsApi, type TransactionInput } from '@/lib/api';

export interface FinanceState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<TransactionInput, 'userId'>) => Promise<void>;
  updateTransaction: (id: string, updates: Omit<TransactionInput, 'userId'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
  getCategoryBreakdown: (type: TransactionType) => Record<string, number>;
  clearError: () => void;
}

export const useFinanceStore = create<FinanceState>()((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await transactionsApi.getAll();
      // Map _id to id for frontend compatibility
      const mappedTransactions = transactions.map(t => ({
        ...t,
        id: t._id,
      }));
      set({ transactions: mappedTransactions, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch transactions', 
        isLoading: false 
      });
    }
  },

  addTransaction: async (transaction) => {
    set({ isLoading: true, error: null });
    try {
      const newTransaction = await transactionsApi.create(transaction);
      const mappedTransaction = {
        ...newTransaction,
        id: newTransaction._id,
      };
      set((state) => ({
        transactions: [...state.transactions, mappedTransaction],
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add transaction', 
        isLoading: false 
      });
      throw error;
    }
  },

  updateTransaction: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTransaction = await transactionsApi.update(id, updates);
      const mappedTransaction = {
        ...updatedTransaction,
        id: updatedTransaction._id,
      };
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? mappedTransaction : t
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update transaction', 
        isLoading: false 
      });
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await transactionsApi.delete(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete transaction', 
        isLoading: false 
      });
      throw error;
    }
  },

  getTotalIncome: () => {
    const { transactions } = get();
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getTotalExpenses: () => {
    const { transactions } = get();
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getBalance: () => {
    const { getTotalIncome, getTotalExpenses } = get();
    return getTotalIncome() - getTotalExpenses();
  },

  getCategoryBreakdown: (type) => {
    const { transactions } = get();
    const filtered = transactions.filter((t) => t.type === type);
    return filtered.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
  },

  clearError: () => set({ error: null }),
}));