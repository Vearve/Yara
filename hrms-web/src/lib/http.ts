import axios from 'axios';
import type { AxiosRequestHeaders } from 'axios';

// In development, use /api (Vite will proxy to backend)
// In production, use full URL from env
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const http = axios.create({ baseURL });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  const workspaceId = localStorage.getItem('workspaceId');
  if (token) {
    const headers: AxiosRequestHeaders = (config.headers || {}) as AxiosRequestHeaders;
    headers.Authorization = `Bearer ${token}`;
    if (workspaceId) {
      headers['X-Workspace-ID'] = workspaceId as any;
    }
    config.headers = headers;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        try {
          const res = await http.post('/api/v1/auth/token/refresh/', { refresh });
          localStorage.setItem('access', res.data.access);
          const hdrs: AxiosRequestHeaders = (original.headers || {}) as AxiosRequestHeaders;
          hdrs.Authorization = `Bearer ${res.data.access}`;
          original.headers = hdrs;
          return http(original as any);
        } catch (e) {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default http;
