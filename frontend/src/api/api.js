import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('flowlens_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const endpoints = {
  googleStatus: () => api.get('/auth/google-status'),
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateSettings: (data) => api.patch('/auth/settings', data),
  listUsers: () => api.get('/auth/users'),
  setRole: (data) => api.patch('/auth/role', data),

  uploadFile: (formData) =>
    api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  importSheet: (data) => api.post('/sheets/import', data),

  listDatasets: () => api.get('/datasets'),
  deleteDataset: (id) => api.delete(`/datasets/${id}`),

  runAnalysis: (datasetId, zThreshold) => api.post(`/analysis/${datasetId}/run`, { zThreshold }),
  getLatestAnalysis: (datasetId) => api.get(`/analysis/${datasetId}/latest`),

  downloadReportUrl: (datasetId) => `${API_URL}/api/report/${datasetId}/pdf`,
};

export const API_BASE = API_URL;
export default api;
