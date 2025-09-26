// src/utils/errorMessages.js

export const errorMessages = {
  REQUIRED: (field) => `${field} is required`,
  STRING_BASE: (field) => `${field} must be text`,
  MIN_LENGTH: (field, min) => `${field} must have ≥ ${min} chars`,
  MAX_LENGTH: (field, max) => `${field} cannot exceed ${max} chars`,

  EMAIL_INVALID: 'Enter a valid email',
  PHONE_INVALID: 'Phone must be 10 digits, no starting 0',
  USERNAME_INVALID: 'Username: letters, numbers, underscores only'

  // For Password The ErrorMessage is Handled in validate.js
  // PASSWORD_INVALID: 'Password needs uppercase, lowercase, number & symbol',
};
