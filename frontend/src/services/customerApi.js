// src/services/customerApi.js
import baseApi from './baseApi';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';

class CustomerApi {
  /**
   * Add a new customer
   * @param {Object} customerData - Customer data including address
   * @returns {Promise<ApiResponse>}
   */
  async addCustomer(customerData) {
    try {
      const response = await baseApi.post('/customer', customerData);
      // ✅ Pass the inner data object
      return new ApiResponse(
        response.data.statusCode,
        response.data.data,
        response.data.message
      );
    } catch (error) {
      throw ApiError.fromAxios(error);
    }
  }

  /**
   * Get all customers for authenticated user
   * @returns {Promise<ApiResponse>}
   */
  async getAllCustomers() {
    try {
      const response = await baseApi.get('/customer');
      // ✅ Pass the inner data object (which contains 'customers' array)
      return new ApiResponse(
        response.data.statusCode,
        response.data.data,
        response.data.message
      );
    } catch (error) {
      throw ApiError.fromAxios(error);
    }
  }

  /**
   * Get customer by ID (temporaryCustomerId or havmorPlatformCustomerId)
   * @param {string} id - Customer ID
   * @returns {Promise<ApiResponse>}
   */
  async getCustomerById(id) {
    try {
      const response = await baseApi.get(`/customer/${id}`);
      // ✅ Pass the inner data object
      return new ApiResponse(
        response.data.statusCode,
        response.data.data,
        response.data.message
      );
    } catch (error) {
      throw ApiError.fromAxios(error);
    }
  }

  /**
   * Update customer by ID
   * @param {string} id - Customer ID
   * @param {Object} customerData - Updated customer data
   * @returns {Promise<ApiResponse>}
   */
  async updateCustomer(id, customerData) {
    try {
      const response = await baseApi.put(`/customer/${id}`, customerData);
      // ✅ Pass the inner data object
      return new ApiResponse(
        response.data.statusCode,
        response.data.data,
        response.data.message
      );
    } catch (error) {
      throw ApiError.fromAxios(error);
    }
  }

  /**
   * Delete customer by ID
   * @param {string} id - Customer ID
   * @returns {Promise<ApiResponse>}
   */
  async deleteCustomer(id) {
    try {
      const response = await baseApi.delete(`/customer/${id}`);
      // ✅ Pass the inner data object
      return new ApiResponse(
        response.data.statusCode,
        response.data.data,
        response.data.message
      );
    } catch (error) {
      throw ApiError.fromAxios(error);
    }
  }
}

export default new CustomerApi();
