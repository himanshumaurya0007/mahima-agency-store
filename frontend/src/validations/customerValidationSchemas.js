// src/validations/customerValidationSchemas.js
import {
  panCardRegex,
  gstinNumberRegex,
  pinCodeRegex,
  shopNameRegex,
} from '../utils/customerRegex';
import { emailRegex, phoneRegex } from '../utils/regex';
import { INDIAN_STATE_NAMES } from '../utils/indianStates';

// Customer validation schema (for both add and update)
export const customerValidationSchema = {
  customerStatus: {
    required: true,
    validate: (value) => {
      const validStatuses = ['TEMPORARY', 'PERMANENT'];
      if (!validStatuses.includes(value.toUpperCase())) {
        return 'Customer status must be either TEMPORARY or PERMANENT';
      }
      return null;
    },
  },

  // ✅ FIXED: Don't validate havmorPlatformCustomerId during TEMP→PERM conversion
  havmorPlatformCustomerId: {
    required: false,
    minLength: 8,
    maxLength: 8,
    pattern: /^[0-9]{8}$/,
    message: 'Havmor Platform ID must be exactly 8 digits',
    validate: (value, formData) => {
      // ✅ Skip validation if empty (backend will handle conversion)
      if (!value || !value.trim()) {
        return null;
      }

      // Only validate format if value is provided
      if (!/^[0-9]{8}$/.test(value)) {
        return 'Havmor Platform ID must be exactly 8 digits';
      }

      return null;
    },
  },

  shopName: {
    required: true,
    validate: (value) => {
      if (!value || !value.trim()) return 'Shop name is required';
      if (value.trim().length < 2) return 'Shop name must be at least 2 characters';
      if (value.trim().length > 100) return 'Shop name must not exceed 100 characters';
      if (!shopNameRegex.test(value)) {
        return 'Shop name contains invalid characters';
      }
      return '';
    },
  },

  firstName: {
    required: false,
    validate: (value) => {
      if (!value) return '';
      if (value.trim().length < 2) return 'First name must be at least 2 characters';
      if (value.trim().length > 50) return 'First name must not exceed 50 characters';
      return '';
    },
  },

  lastName: {
    required: false,
    validate: (value) => {
      if (!value) return '';
      if (value.trim().length < 2) return 'Last name must be at least 2 characters';
      if (value.trim().length > 50) return 'Last name must not exceed 50 characters';
      return '';
    },
  },

  email: {
    required: false,
    validate: (value) => {
      if (!value) return '';
      if (!emailRegex.test(value)) return 'Please enter a valid email address';
      return '';
    },
  },

  phone: {
    required: true,
    validate: (value) => {
      if (!value || !value.trim()) return 'Phone number is required';
      const digits = value.replace(/\D/g, '');
      if (!phoneRegex.test(digits)) {
        return 'Phone number must be 10 digits and cannot start with 0';
      }
      return '';
    },
  },

  panCardNumber: {
    required: false,
    validate: (value) => {
      if (!value) return '';
      if (!panCardRegex.test(value.toUpperCase())) {
        return 'PAN Card must be in format: ABCDE1234F';
      }
      return '';
    },
  },

  gstinNumber: {
    required: false,
    validate: (value) => {
      if (!value) return '';
      if (!gstinNumberRegex.test(value.toUpperCase())) {
        return 'GSTIN must be a valid 15-character Indian GSTIN';
      }
      return '';
    },
  },

  // Address fields
  'customerAddress.place': {
    required: true,
    validate: (value) => {
      if (!value || !value.trim()) return 'Place/Address Line 1 is required';
      if (value.trim().length < 3) return 'Place must be at least 3 characters';
      if (value.trim().length > 200) return 'Place must not exceed 200 characters';
      return '';
    },
  },

  'customerAddress.city': {
    required: true,
    validate: (value) => {
      if (!value || !value.trim()) return 'City is required';
      if (value.trim().length < 2) return 'City must be at least 2 characters';
      if (value.trim().length > 50) return 'City must not exceed 50 characters';
      return '';
    },
  },

  'customerAddress.state': {
    required: true,
    validate: (value) => {
      if (!value || !value.trim()) return 'State is required';
      if (!INDIAN_STATE_NAMES.includes(value.toUpperCase())) {
        return 'Please select a valid Indian state';
      }
      return '';
    },
  },

  'customerAddress.pinCode': {
    required: true,
    validate: (value) => {
      if (!value || !value.trim()) return 'PIN code is required';
      if (!pinCodeRegex.test(value)) {
        return 'PIN code must be 6 digits and cannot start with 0';
      }
      return '';
    },
  },
};
