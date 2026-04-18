const BASE = 'http://localhost:8080/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi server');
  return data as T;
}

export const api = {
  getGoats: () => request<any[]>('/goats'),
  getHerdGoats: () => request<any[]>('/goats/herd'),
  getInactiveGoats: () => request<any[]>('/goats/inactive'),
  getGoat: (id: string) => request<any>(`/goats/${id}`),
  createGoat: (body: any) => request<any>('/goats', { method: 'POST', body: JSON.stringify(body) }),
  updateWeight: (id: string, body: any) => request<any>(`/goats/${id}/weight`, { method: 'PUT', body: JSON.stringify(body) }),
  sell: (id: string, body: any) => request<any>(`/goats/${id}/sell`, { method: 'POST', body: JSON.stringify(body) }),
  markDead: (id: string, body: any) => request<any>(`/goats/${id}/dead`, { method: 'POST', body: JSON.stringify(body) }),
  slaughter: (id: string, body: any) => request<any>(`/goats/${id}/slaughter`, { method: 'POST', body: JSON.stringify(body) }),
  getLogs: (id: string) => request<any[]>(`/goats/${id}/logs`),
  getChildren: (id: string) => request<any[]>(`/goats/${id}/children`),
};
