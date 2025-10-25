// src/services/authService.js
import { toast } from 'react-hot-toast';
import baseApi from './baseApi';
import userApi from './userApi';

class AuthService {
  constructor() {
    this.setupInterceptors();
  }

  // Setup Axios Interceptors for Token Management
  setupInterceptors() {
    // Request interceptor - add auth headers
    baseApi.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    baseApi.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const response = await baseApi.post('/user/refresh-token');
            if (response.data?.data?.accessToken) {
              localStorage.setItem('authToken', response.data.data.accessToken);
              originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
              return baseApi(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError.message);
            this.clearAuthData();
            toast.error('Session expired. Please login again.');
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Get tokens and user data
  getAccessToken() {
    return localStorage.getItem('authToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  getUserData() {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to parse user data:', error.message);
      return null;
    }
  }

  isAuthenticated() {
    const token = this.getAccessToken();
    const userData = this.getUserData();
    return !!(token && userData);
  }

  clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
  }

  // Login user
  async login(credentials) {
    try {
      const response = await userApi.loginUser(credentials);
      
      if (response.success && response.data?.data) {
        const { user, accessToken, refreshToken } = response.data.data;
        
        if (user && accessToken) {
          localStorage.setItem('authToken', accessToken);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          localStorage.setItem('userData', JSON.stringify(user));
          
          toast.success('Login successful!');
          return { success: true, user };
        } else {
          throw new Error('Missing user data or token in response');
        }
      } else {
        throw new Error('Invalid response structure from server');
      }
    } catch (error) {
      console.error('Login failed:', error.message);
      throw error;
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await userApi.registerUser(userData);
      
      if (response.success) {
        toast.success('Registration successful! Please login.');
        return { success: true };
      } else {
        throw new Error('Registration failed - invalid response');
      }
    } catch (error) {
      console.error('Registration failed:', error.message);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      await userApi.logoutUser();
    } catch (error) {
      console.error('Logout API error:', error.message);
    } finally {
      this.clearAuthData();
      toast.success('Logged out successfully');
    }
  }

//   // Validate The Access Token 
//   async validateToken() {
//   try {
//     const token = this.getAccessToken();
//     if (!token) return false;
    
//     // Make a lightweight API call to verify token
//     const response = await baseApi.get('/user/verify-token');
//     return response.data.success;
//   // eslint-disable-next-line no-unused-vars
//   } catch (error) {
//     return false;
//   }
// }
}

export default new AuthService();
