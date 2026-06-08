import axios from 'axios';
import type { AxiosRequestHeaders } from 'axios';

// In development, use /api (Vite will proxy to backend)
// In production, use full URL from env
const envBaseURL = (import.meta.env.VITE_API_BASE_URL || '').trim();
const normalizedBaseURL = envBaseURL
  ? envBaseURL.replace(/\/+$/, '').replace(/\/api$/, '')
  : '/api';

const baseURL = normalizedBaseURL;

const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  const workspaceId = localStorage.getItem('workspaceId');

  const headers: AxiosRequestHeaders = (config.headers || {}) as AxiosRequestHeaders;
  if (
    config.data &&
    typeof config.data === 'object' &&
    !(config.data instanceof FormData) &&
    !(config.data instanceof URLSearchParams)
  ) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (workspaceId) {
    headers['X-Workspace-ID'] = workspaceId as any;
  }
  config.headers = headers;
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
          const refreshPayload = JSON.stringify({ refresh });
          const res = await http.post('/api/v1/auth/token/refresh/', refreshPayload, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          localStorage.setItem('access', res.data.access);
          const hdrs: AxiosRequestHeaders = (original.headers || {}) as AxiosRequestHeaders;
          hdrs.Authorization = `Bearer ${res.data.access}`;
          hdrs['Content-Type'] = 'application/json';
          original.headers = hdrs;
          return http(original as any);
        } catch (e) {
          localStorage.clear();
          window.location.replace('/');
        }
      } else {
        localStorage.clear();
        window.location.replace('/');
      }
    }
    return Promise.reject(error);
  }
);

export default http;
