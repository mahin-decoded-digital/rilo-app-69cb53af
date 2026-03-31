export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}