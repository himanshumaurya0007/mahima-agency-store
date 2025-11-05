// frontend/src/services/userApi.js
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

import baseApi from './baseApi';

/**
 * User Authentication & Management APIs
 * These functions wrap API calls for register, login, logout, and account recovery (security Q&A, password reset).
 */
const userApi = {
  /**
   * Register a new user
   * @param {Object} userData - user registration payload
   * @returns {Promise<ApiResponse>} - standardized response
   */
  registerUser: asyncHandler(async (userData) => {
    const response = await baseApi.post('/users/register', userData);
    return ApiResponse.fromAxios(response);
  }),

  /**
   * Login user
   * @param {Object} credentials - { email OR username, password }
   * @returns {Promise<ApiResponse>} - tokens + user info
   */
  loginUser: asyncHandler(async (credentials) => {
    const response = await baseApi.post('/users/login', credentials);
    return ApiResponse.fromAxios(response);
  }),

  /**
   * Logout user
   * Clears refreshToken + cookies
   * @returns {Promise<ApiResponse>} - success message
   */
  logoutUser: asyncHandler(async () => {
    const response = await baseApi.post('/users/logout');
    return ApiResponse.fromAxios(response);
  }),

  /**
   * Get security question by email or username
   * @param {Object} query - { email OR username }
   * @returns {Promise<ApiResponse>} - security question
   */
  fetchSecurityQuestion: asyncHandler(async (query) => {
    const response = await baseApi.get('/users/security-question', {
      params: query,
    });
    return ApiResponse.fromAxios(response);
  }),

  /**
   * Verify security answer
   * @param {Object} data - { email OR username, securityAnswer }
   * @returns {Promise<ApiResponse>} - verification result
   */
  validateSecurityAnswer: asyncHandler(async (data) => {
    const response = await baseApi.post('/users/security-answer/verify', data);
    return ApiResponse.fromAxios(response);
  }),

  /**
   * Reset password
   * @param {Object} data - { email OR username, newPassword }
   * @returns {Promise<ApiResponse>} - reset result
   */
  resetUserPassword: asyncHandler(async (data) => {
    const response = await baseApi.patch('/users/password/reset', data);
    return ApiResponse.fromAxios(response);
  }),
};

export default userApi;
