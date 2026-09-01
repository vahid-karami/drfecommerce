import axios from 'axios';
import { ENDPOINTS } from './endpoints';

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
  if (tokens.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
      if (tokens.refresh) {
        try {
          const response = await axios.post(ENDPOINTS.tokenRefresh, {
            refresh: tokens.refresh,
          });
          const newTokens = {
            access: response.data.access,
            refresh: tokens.refresh,
          };
          localStorage.setItem('tokens', JSON.stringify(newTokens));
          originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('tokens');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
