// src/features/master/services/master.api.js

import baseApi from '../../../services/baseApi';
import ApiResponse from '../../../utils/ApiResponse';
import ApiError from '../../../utils/ApiError';

/**
 * Master Data API Service
 * Handles CRUD operations for master data
 */
class MasterApi {
  async getAll(endpoint) {
    try {
      const response = await baseApi.get(endpoint);
      return new ApiResponse(
        response.data.statusCode,
        response.data.data,
        response.data.message
      );
    } catch (error) {
      throw ApiError.fromAxios(error);
    }
  }

  async create(endpoint, data) {
    try {
      const payload = { ...data, isActive: true };
      const response = await baseApi.post(endpoint, payload);
      return new ApiResponse(
        response.data.statusCode,
        response.data.data,
        response.data.message
      );
    } catch (error) {
      throw ApiError.fromAxios(error);
    }
  }

  async toggleStatus(endpoint, id, currentStatus) {
    try {
      const payload = { isActive: !currentStatus };
      const response = await baseApi.put(`${endpoint}/${id}`, payload);
      return new ApiResponse(
        response.data.statusCode,
        response.data.data,
        response.data.message
      );
    } catch (error) {
      throw ApiError.fromAxios(error);
    }
  }

  async delete(endpoint, id) {
    try {
      const response = await baseApi.delete(`${endpoint}/${id}`);
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

export default new MasterApi();
