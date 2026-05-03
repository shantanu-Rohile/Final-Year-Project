import axios from 'axios';
import { API_URL } from '../config/backend.js';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('api/auth/signup', data),
  login: (data) => api.post('api/auth/login', data),
  getMe: () => api.get('api/auth/me'),

  // ✅ Update with FormData support
  update: (formData) => {
    const data = new FormData();
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("password", formData.password);
    if (formData.profilePicture) {
      data.append("profilePicture", formData.profilePicture); // file object
    }

    return api.put("api/auth/update", data, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },
  // new helper for removing profile picture
  removePicture:()=>api.put("api/auth/remove-picture")
};