import axios from 'axios';
const api = axios.create({ 
  baseURL: process.env.REACT_APP_API_URL 
    ? `${process.env.REACT_APP_API_URL}/api` 
    : '/api' 
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
export const register      = (data)     => api.post('/auth/register', data);
export const login         = (data)     => api.post('/auth/login', data);
export const getMessages   = ()         => api.get('/messages');
export const getStats      = ()         => api.get('/messages/stats');
export const getMessage    = (id)       => api.get(`/messages/${id}`);
export const createMessage = (data)     => api.post('/messages', data);
export const updateMessage = (id, data) => api.put(`/messages/${id}`, data);
export const deleteMessage = (id)       => api.delete(`/messages/${id}`);
export const getLogs       = ()         => api.get('/logs');
export default api;
