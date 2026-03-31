const API_BASE = '/api';

// Get token from localStorage (set on login)
function getToken(): string | null {
  return localStorage.getItem('auth-token');
}

function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem('auth-token', token);
  } else {
    localStorage.removeItem('auth-token');
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['x-user-id'] = token;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// Auth helpers
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post<{ data: { user: { _id: string; email: string; name: string; createdAt: string }; token: string } }>('/auth/login', { email, password });
    setToken(response.data.token);
    return response.data.user;
  },
  register: async (email: string, name: string, password: string) => {
    const response = await api.post<{ data: { user: { _id: string; email: string; name: string; createdAt: string }; token: string } }>('/auth/register', { email, name, password });
    setToken(response.data.token);
    return response.data.user;
  },
  logout: () => {
    setToken(null);
  },
  getCurrentUser: async () => {
    const response = await api.get<{ data: { _id: string; email: string; name: string; createdAt: string } }>('/auth/me');
    return response.data;
  },
};

// Transaction types (matching backend)
export interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionInput {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export const transactionsApi = {
  getAll: async () => {
    const response = await api.get<{ data: Transaction[] }>('/transactions');
    return response.data;
  },
  create: async (transaction: TransactionInput) => {
    const response = await api.post<{ data: Transaction }>('/transactions', transaction);
    return response.data;
  },
  update: async (id: string, transaction: TransactionInput) => {
    const response = await api.put<{ data: Transaction }>(`/transactions/${id}`, transaction);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<{ data: { success: boolean } }>(`/transactions/${id}`);
    return response.data;
  },
};