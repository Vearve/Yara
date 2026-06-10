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

// Shared refresh lock — prevents N concurrent 401s from firing N refresh calls
let refreshPromise: Promise<string> | null = null;

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
          // All concurrent 401s share one refresh call
          if (!refreshPromise) {
            refreshPromise = http
              .post('/api/v1/auth/token/refresh/', JSON.stringify({ refresh }), {
                headers: { 'Content-Type': 'application/json' },
              })
              .then((res) => {
                localStorage.setItem('access', res.data.access);
                return res.data.access as string;
              })
              .finally(() => {
                refreshPromise = null;
              });
          }
          const newToken = await refreshPromise;
          const hdrs: AxiosRequestHeaders = (original.headers || {}) as AxiosRequestHeaders;
          hdrs.Authorization = `Bearer ${newToken}`;
          original.headers = hdrs;
          return http(original as any);
        } catch (e) {
          refreshPromise = null;
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
