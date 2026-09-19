const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: options.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    ...options
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),

  createApplication: (body) => request('/api/applications', { method: 'POST', body: JSON.stringify(body) }),
  myApplications: () => request('/api/applications/mine'),
  getApplication: (id) => request(`/api/applications/${id}`),
  adminListApplications: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/applications${qs ? `?${qs}` : ''}`);
  },
  adminUpdateStatus: (id, body) => request(`/api/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
  adminStats: () => request('/api/applications/stats/summary'),

  uploadDocument: (applicationId, formData) => request(`/api/documents/${applicationId}`, { method: 'POST', body: formData }),
  listDocuments: (applicationId) => request(`/api/documents/application/${applicationId}`),

  verify: (reference) => request(`/api/verify/${encodeURIComponent(reference)}`)
};
