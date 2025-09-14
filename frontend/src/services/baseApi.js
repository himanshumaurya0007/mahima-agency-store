// frontend/src/services/baseApi.js
import axios from 'axios';

/**
 * Axios instance for centralized API configuration.
 * All other service files (userApi, postApi, etc.) will import this.
 */
const baseApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ allow sending cookies (for tokens)
});

export default baseApi;
