import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const bookingService = {
  createBooking: async (token, bookingData) => {
    return await axios.post(`${API_URL}/bookings`, bookingData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getUserBookings: async (token) => {
    return await axios.get(`${API_URL}/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  cancelBooking: async (token, bookingId) => {
    return await axios.patch(`${API_URL}/bookings/${bookingId}/cancel`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getBookingHistory: async (token, filters) => {
    return await axios.get(`${API_URL}/bookings/history`, {
      headers: { Authorization: `Bearer ${token}` },
      params: filters
    });
  }
};