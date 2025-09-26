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
