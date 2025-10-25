import { fields } from './fields.js';
import { emailRegex, phoneRegex, usernameRegex } from './regex.js';
import { errorMessages } from './errorMessages.js';

// Enhanced password validation helper
export const validatePassword = (password) => {
  if (!password) return errorMessages.REQUIRED(fields.password);
  if (password.length < 8) return 'Minimum 8 characters';

  const missing = [];
  if (!/[A-Z]/.test(password)) missing.push('uppercase');
  if (!/[a-z]/.test(password)) missing.push('lowercase');
  if (!/\d/.test(password)) missing.push('number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) missing.push('special char');

  if (missing.length > 0) {
    return `Missing: ${missing.join(', ')}`;
  }

  return '';
};

export const validateField = (name, value) => {
  switch (name) {
    case 'firstName':
    case 'lastName':
      return !value.trim() ? errorMessages.REQUIRED(fields[name]) : '';
    
    case 'email':
      if (!value.trim()) return errorMessages.REQUIRED(fields.email);
      return emailRegex.test(value) ? '' : errorMessages.EMAIL_INVALID;
    
    case 'phone':
      if (!value.trim()) return errorMessages.REQUIRED(fields.phone);
      return phoneRegex.test(value) ? '' : errorMessages.PHONE_INVALID;
    
    case 'username':
      if (!value.trim()) return errorMessages.REQUIRED(fields.username);
      if (!usernameRegex.test(value)) return errorMessages.USERNAME_INVALID;
      return '';
    
    case 'password':
      return validatePassword(value);
    
    case 'securityQuestion':
      return !value ? errorMessages.REQUIRED(fields.securityQuestion) : '';
    
    case 'securityAnswer':
      return !value.trim() ? errorMessages.REQUIRED(fields.securityAnswer) : '';
    
    default:
      return '';
  }
};


/**
 * Validate customer field
 * @param {string} fieldName - Field name (supports nested paths like 'customerAddress.city')
 * @param {any} value - Field value
 * @param {Object} formData - Complete form data for cross-field validation
 * @param {Object} schema - Validation schema
 * @returns {string} Error message or empty string
 */
export const validateCustomerField = (fieldName, value, formData = {}, schema) => {
  // Schema must be passed from the calling component
  if (!schema) {
    console.error('Validation schema is required for validateCustomerField');
    return '';
  }

  const fieldSchema = schema[fieldName];
  if (!fieldSchema) return '';

  // Check if field is required
  if (fieldSchema.required) {
    const isRequired = typeof fieldSchema.required === 'function' 
      ? fieldSchema.required(formData) 
      : fieldSchema.required;
    
    if (isRequired && (!value || (typeof value === 'string' && !value.trim()))) {
      const displayName = fieldName.includes('.') 
        ? fieldName.split('.').pop() 
        : fieldName;
      return `${displayName.charAt(0).toUpperCase() + displayName.slice(1)} is required`;
    }
  }

  // Run validation function
  if (fieldSchema.validate) {
    return fieldSchema.validate(value, formData);
  }

  return '';
};

/**
 * Validate entire customer form
 * @param {Object} formData - Complete form data
 * @param {Object} schema - Validation schema
 * @returns {Object} { valid: boolean, errors: Object }
 */
export const validateCustomerForm = (formData, schema) => {
  if (!schema) {
    console.error('Validation schema is required for validateCustomerForm');
    return { valid: false, errors: { _form: 'Validation schema missing' } };
  }

  const errors = {};
  let valid = true;

  Object.keys(schema).forEach((fieldName) => {
    // Get nested field value (e.g., 'customerAddress.city')
    const value = fieldName.includes('.') 
      ? fieldName.split('.').reduce((obj, key) => obj?.[key], formData)
      : formData[fieldName];

    const error = validateCustomerField(fieldName, value, formData, schema);
    if (error) {
      errors[fieldName] = error;
      valid = false;
    }
  });

  return { valid, errors };
};
