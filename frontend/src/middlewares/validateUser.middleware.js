// frontend/src/middlewares/validateUser.middleware.js

import { ValidationError } from 'yup';

/**
 * Generic form validator (similar to backend validate middleware)
 * @param {Yup.Schema} schema - Yup validation schema
 * @param {Object} data - Form data to validate
 * @returns {Object} - { valid: boolean, errors: object }
 */
export const validateForm = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { valid: true, errors: {} };
  } catch (err) {
    if (err instanceof ValidationError) {
      const errors = {};
      err.inner.forEach((e) => {
        if (e.path) errors[e.path] = e.message;
      });
      return { valid: false, errors };
    }
    // Unexpected error
    return { valid: false, errors: { global: 'Frontend validation failed' } };
  }
};
