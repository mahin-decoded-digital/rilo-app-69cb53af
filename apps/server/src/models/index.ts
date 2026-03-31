export type TransactionType = 'income' | 'expense';

export interface Transaction {
  _id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}