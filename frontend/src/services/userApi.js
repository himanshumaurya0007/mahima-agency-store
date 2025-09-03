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
};

export default userApi;
