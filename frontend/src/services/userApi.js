// frontend/src/services/userApi.js
import baseApi from "./baseApi";

/**
 * User Authentication & Management APIs
 * These functions wrap API calls for register, login, logout.
 */
const userApi = {
    /**
     * Register a new user
     * @param {Object} userData - user registration payload
     * @returns {Promise<Object>} - response from backend
     */
    register: async (userData) => {
        const response = await baseApi.post("/user/register", userData);
        return response.data;
    },

    /**
     * Login user
     * @param {Object} credentials - { email OR username, password }
     * @returns {Promise<Object>} - response with tokens + user info
     */
    login: async (credentials) => {
        const response = await baseApi.post("/user/login", credentials);
        return response.data;
    },

    /**
     * Logout user
     * Clears refreshToken + cookies
     * @returns {Promise<Object>} - response with success message
     */
    logout: async () => {
        const response = await baseApi.post("/user/logout");
        return response.data;
    },

    // ADD THESE NEW PASSWORD RESET METHODS:

    /**
     * Get security question by username
     * @param {string} username - Username to get security question for
     * @returns {Promise<Object>} - Response with security question
     */
    getSecurityQuestion: async (username) => {
        const response = await baseApi.post("/user/get-security-question", { username });
        return response.data;
    },

    /**
     * Verify security answer
     * @param {Object} data - { username, securityAnswer }
     * @returns {Promise<Object>} - Response with verification result
     */
    verifySecurityAnswer: async (data) => {
        const response = await baseApi.post("/user/verify-security-answer", data);
        return response.data;
    },

    /**
     * Reset password
     * @param {Object} data - { username, newPassword }
     * @returns {Promise<Object>} - Response with reset result
     */
    resetPassword: async (data) => {
        const response = await baseApi.post("/user/reset-password", data);
        return response.data;
    },
    
};

export default userApi;
