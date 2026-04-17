import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: data => api.post('/auth/register', data),
  login: data => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const productsAPI = {
  getAll: (category) => api.get('/products', { params: category ? { category } : {} }),
  getOne: (id) => api.get(`/products/${id}`),
};

export const ordersAPI = {
  place: (data) => api.post('/orders', data),
  myOrders: () => api.get('/orders/my'),
  getOne: (id) => api.get(`/orders/${id}`),
};

export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  orders: () => api.get('/admin/orders'),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  products: () => api.get('/admin/products'),
  addProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
};

export default api;
