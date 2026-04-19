import type { DashboardStats, FarmTransaction, VaccineDueItem } from './types';

const BASE = '/api';

function getToken() {
  return localStorage.getItem('jwt_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    ...options,
  });

  if (res.status === 401) {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_username');
    window.location.reload();
    throw new Error('Phiên đăng nhập hết hạn');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi server');
  return data as T;
}

export const api = {
  login: (username: string, password: string) =>
    fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data === 'string' ? data : (data.error || 'Đăng nhập thất bại'));
      return data as { token: string; username: string };
    }),

  getGoats: () => request<any[]>('/goats'),
  getHerdGoats: () => request<any[]>('/goats/herd'),
  getInactiveGoats: () => request<any[]>('/goats/inactive'),
  getGoat: (id: string) => request<any>(`/goats/${id}`),
  createGoat: (body: any) => request<any>('/goats', { method: 'POST', body: JSON.stringify(body) }),
  updateGoat: (id: string, body: any) => request<any>(`/goats/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  updateWeight: (id: string, body: any) => request<any>(`/goats/${id}/weight`, { method: 'PUT', body: JSON.stringify(body) }),
  sell: (id: string, body: any) => request<any>(`/goats/${id}/sell`, { method: 'POST', body: JSON.stringify(body) }),
  markDead: (id: string, body: any) => request<any>(`/goats/${id}/dead`, { method: 'POST', body: JSON.stringify(body) }),
  slaughter: (id: string, body: any) => request<any>(`/goats/${id}/slaughter`, { method: 'POST', body: JSON.stringify(body) }),
  chichThuoc: (id: string, body: any) => request<any>(`/goats/${id}/chich-thuoc`, { method: 'POST', body: JSON.stringify(body) }),
  getVaccineDue: (days = 7) => request<VaccineDueItem[]>(`/goats/vaccine-due?days=${days}`),
  getNeedsWeight: (days = 30) => request<any[]>(`/goats/needs-weight?days=${days}`),
  deleteGoat: (id: string) => request<any>(`/goats/${id}`, { method: 'DELETE' }),
  getLogs: (id: string) => request<any[]>(`/goats/${id}/logs`),
  getChildren: (id: string) => request<any[]>(`/goats/${id}/children`),
  getDashboardStats: (from?: string, to?: string) => {
    const p = new URLSearchParams();
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    const q = p.toString();
    return request<DashboardStats>(`/goats/stats${q ? '?' + q : ''}`);
  },
  getTransactions: (type?: string, from?: string, to?: string) => {
    const p = new URLSearchParams();
    if (type) p.set('type', type);
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    const q = p.toString();
    return request<FarmTransaction[]>(`/transactions${q ? '?' + q : ''}`);
  },
  createTransaction: (body: Omit<FarmTransaction, 'id' | 'createdAt'>) =>
    request<FarmTransaction>('/transactions', { method: 'POST', body: JSON.stringify(body) }),
  updateTransaction: (id: string, body: Omit<FarmTransaction, 'id' | 'createdAt'>) =>
    request<FarmTransaction>(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTransaction: (id: string) =>
    request<{ message: string }>(`/transactions/${id}`, { method: 'DELETE' }),

  exportGoats: async () => {
    const res = await fetch(`${BASE}/export/goats`, { headers: authHeaders() });
    if (res.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('jwt_username');
      window.location.reload();
      throw new Error('Phiên đăng nhập hết hạn');
    }
    if (!res.ok) throw new Error('Xuất file thất bại');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dan-de.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  },
};
