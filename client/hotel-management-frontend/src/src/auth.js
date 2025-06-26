import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
  register: async (userData) => {
    return await axios.post(`${API_URL}/auth/register`, userData);
  },
  login: async (credentials) => {
    return await axios.post(`${API_URL}/auth/login`, credentials);
  },
  profile: async (token) => {
    return await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  changePassword: async (token, passwords) => {
    return await axios.patch(`${API_URL}/auth/change-password`, passwords, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};