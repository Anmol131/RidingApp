import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('riderToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const riderAPI = {
  register: (data) => api.post('/riders', data),
  login: (data) => api.post('/riders/login', data),
  getProfile: (id) => api.get(`/riders/${id}`),
  updateProfile: (id, data) => api.put(`/riders/${id}`, data),
  updateStatus: (id, isActive) => api.put(`/riders/${id}`, { isActive }),
};

export const rideAPI = {
  getRides: () => api.get('/rides'),
  getRide: (id) => api.get(`/rides/${id}`),
  acceptRide: (id, riderId) => api.put(`/rides/${id}`, { riderId, status: 'accepted' }),
  updateRide: (id, data) => api.put(`/rides/${id}`, data),
  endRide: (id, fare) => api.put(`/rides/${id}`, { status: 'completed', fare }),
};

export const feedbackAPI = {
  getRiderFeedbacks: (riderId) => api.get(`/feedbacks/rider/${riderId}`),
};

export default api;
