import type { Asset, AssetDetail, ImportResult } from '../types';

const BASE = '/api';

// ApiError carries the backend's human-readable message and HTTP status.
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, init);
  } catch {
    throw new ApiError('Cannot reach the server. Is the backend running?', 0);
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  roots: () => request<{ assets: Asset[] }>('/assets/roots').then((r) => r.assets),

  children: (id: string) =>
    request<{ assets: Asset[] }>(`/assets/${encodeURIComponent(id)}/children`).then((r) => r.assets),

  ancestors: (id: string) =>
    request<{ assets: Asset[] }>(`/assets/${encodeURIComponent(id)}/ancestors`).then((r) => r.assets),

  getAsset: (id: string) => request<AssetDetail>(`/assets/${encodeURIComponent(id)}`),

  search: (q: string, type: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (type) params.set('type', type);
    return request<{ assets: Asset[] }>(`/assets/search?${params.toString()}`).then((r) => r.assets);
  },

  importCsv: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<ImportResult>('/imports', { method: 'POST', body: form });
  },
};
