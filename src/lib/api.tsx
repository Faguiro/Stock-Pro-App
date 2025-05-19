// lib/api.ts
import axios from 'axios';
// import { redirect } from 'next/navigation';

type FailedRequest = {
  resolve: (access_token: string) => void;
  reject: (error: any) => void;
};

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  // baseURL: 'http://3.148.189.38:8000/api/v1',
});

api.interceptors.request.use(config => {
  const access_token = localStorage.getItem('access_token');
  if (access_token) {
    config.headers.Authorization = `Bearer ${access_token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: any, access_token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(access_token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      console.log('Refreshing token...');

      const refreshToken = localStorage.getItem('refresh_token');
      console.log('Refresh token:', refreshToken);
      if (!refreshToken) {
        window.location.href = '/login';
        return Promise.reject('No refresh access_token found');
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const res = await api.post('/auth/refresh', {
            refresh_token: refreshToken,
          });

          const newToken = res.data.access_token;
          localStorage.setItem('access_token', newToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

          processQueue(null, newToken);
          return api(originalRequest);
        } catch (err) {
          processQueue(err, null);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (access_token: string) => {
            originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
            resolve(api(originalRequest));
          },
          reject: (err: any) => {
            reject(err);
          },
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
