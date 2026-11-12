import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    // Attempt to get token if authStore is initialized
    try {
      const token = await useAuthStore.getState().getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // ignore
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
