// frontend/src/utils/asyncHandler.js
import ApiError from './ApiError';

export const asyncHandler = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw error instanceof ApiError ? error : ApiError.fromAxios(error);
    }
  };
};
