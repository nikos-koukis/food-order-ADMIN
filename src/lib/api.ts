import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await api.post('/auth/refresh');
        // Retry original request
        return api(error.config);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data).then((res) => res.data);
export const refresh = () => api.post('/auth/refresh').then((res) => res.data);
export const logout = () => api.post('/auth/logout').then((res) => res.data);
export const verifyToken = () => api.get('/auth/verify').then((res) => res.data);