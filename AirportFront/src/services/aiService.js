import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/ai`,
  headers: { 'Content-Type': 'application/json' },
});

export const aiService = {
  async recommend(message) {
    const response = await apiClient.post('/recommend', { message });
    return response.data.data;
  },
};
