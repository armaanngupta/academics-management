import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const authAPI = {
  register: (username, email, password) =>
    axiosInstance.post('/auth/register', { username, email, password }),
  login: (username, password) =>
    axiosInstance.post('/auth/login', { username, password }),
};

// Marksheet APIs
export const marksheetAPI = {
  addMarksheet: (data) => axiosInstance.post('/marksheets/add', data),
  getAllMarksheets: (params = {}) => axiosInstance.get('/marksheets', { params }),
  getMarksheetSummary: () => axiosInstance.get('/marksheets/summary'),
  searchMarksheets: (query) => axiosInstance.get('/marksheets/search', { params: { query } }),
  getMarksheetById: (id) => axiosInstance.get(`/marksheets/${id}`),
  updateMarksheet: (id, data) => axiosInstance.put(`/marksheets/${id}`, data),
  deleteMarksheet: (id) => axiosInstance.delete(`/marksheets/${id}`),
  toggleIssuedStatus: (id) => axiosInstance.patch(`/marksheets/${id}/toggle-issued`),
};

export const adminAPI = {
  listAdmins: () => axiosInstance.get('/admins'),
  createAdmin: (data) => axiosInstance.post('/admins', data),
  deleteAdmin: (id) => axiosInstance.delete(`/admins/${id}`),
};

export default axiosInstance;
