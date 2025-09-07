// frontend/src/services/userApi.js
import baseApi from "./baseApi";

/**
 * User Authentication & Management APIs
 * These functions wrap API calls for register, login, logout,
 * and account recovery (security Q&A, password reset).
 */
const userApi = {
    /**
     * Register a new user
     * @param {Object} userData - user registration payload
     * @returns {Promise<Object>} - response from backend
     */
    registerUser: async (userData) => {
        const response = await baseApi.post("/user/register", userData);
        return response.data;
    },

    /**
     * Login user
     * @param {Object} credentials - { email OR username, password }
     * @returns {Promise<Object>} - response with tokens + user info
     */
    loginUser: async (credentials) => {
        const response = await baseApi.post("/user/login", credentials);
        return response.data;
    },

    /**
     * Logout user
     * Clears refreshToken + cookies
     * @returns {Promise<Object>} - response with success message
     */
    logoutUser: async () => {
        const response = await baseApi.post("/user/logout");
        return response.data;
    },

    /**
     * Get security question by email or username
     * @param {Object} query - { email OR username }
     * @returns {Promise<Object>} - Response with security question
     */
    fetchSecurityQuestion: async (query) => {
        const response = await baseApi.get("/user/security-question", {
            params: query, // ✅ must send as query params
        });
        return response.data;
    },

    /**
     * Verify security answer
     * @param {Object} data - { email OR username, securityAnswer }
     * @returns {Promise<Object>} - Response with verification result
     */
    validateSecurityAnswer: async (data) => {
        const response = await baseApi.post("/user/security-answer/verify", data);
        return response.data;
    },

    /**
     * Reset password
     * @param {Object} data - { email OR username, newPassword }
     * @returns {Promise<Object>} - Response with reset result
     */
    resetUserPassword: async (data) => {
        const response = await baseApi.patch("/user/password/reset", data);
        return response.data;
    },
};

export default userApi;
