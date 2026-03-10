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
  const token = localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userAPI = {
  register: (data) => api.post('/users', data),
  login: (data) => api.post('/users/login', data),
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (id, data) => api.put(`/users/${id}`, data),
};

export const rideAPI = {
  getRandomLocations: () => api.get('/rides/random-locations'),
  createRide: (data) => api.post('/rides', data),
  getRides: () => api.get('/rides'),
  getRide: (id) => api.get(`/rides/${id}`),
  updateRide: (id, data) => api.put(`/rides/${id}`, data),
  cancelRide: (id) => api.put(`/rides/${id}`, { status: 'cancelled' }),
};

export const feedbackAPI = {
  createFeedback: (data) => api.post('/feedbacks', data),
  getRideFeedback: (rideId) => api.get(`/feedbacks/ride/${rideId}`),
};

export default api;
