
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const projectAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (project) => api.post('/projects', project),
  update: (id, project) => api.put(`/projects/${id}`, project),
  assignDevelopers: (id, developerIds) => api.post(`/projects/${id}/assign`, { developerIds }),
  removeDevelopers: (id, developerIds) => api.post(`/projects/${id}/remove`, { developerIds }),
  addPhase: (id, phase) => api.post(`/projects/${id}/phases`, phase),
  updatePhase: (projectId, phaseId, data) => api.put(`/projects/${projectId}/phases/${phaseId}`, data),
  delete: (projectId) => api.delete(`/projects/${projectId}`),
};

export const developerAPI = {
  getAll: () => api.get('/developers'),
  getProfile: () => api.get('/developers/profile'),
  updateProfile: (data) => api.put('/developers/profile', data),
};

export default api;