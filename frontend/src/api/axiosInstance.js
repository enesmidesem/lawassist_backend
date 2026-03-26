import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

const isAuthEndpoint = (url) => {
  if (!url) return false;
  return url === '/admin/login' || url.startsWith('/auth/');
};

axiosInstance.interceptors.request.use(
  (config) => {
    if (isAuthEndpoint(config.url)) {
      return config;
    }
    if (config.url?.startsWith('/admin')) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (isAuthEndpoint(url)) {
        return Promise.reject(error);
      }
      if (url.startsWith('/admin')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        if (!window.location.pathname.startsWith('/admin/login')) {
          window.location.href = '/admin/login';
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
