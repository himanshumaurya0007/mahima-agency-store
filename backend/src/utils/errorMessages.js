// utils/errorMessages.js

export const errorMessages = {
    // Generic
    REQUIRED: (field) => `${field} is required`,
    STRING_BASE: (field) => `${field} must be a string`,
    MIN_LENGTH: (field, min) => `${field} must be at least ${min} characters`,
    MAX_LENGTH: (field, max) => `${field} must not exceed ${max} characters`,

    // Specific fields
    EMAIL_INVALID: "Email must be a valid email address",
    PHONE_INVALID: "Phone number must be a valid Indian phone number (10 digits, cannot start with 0)",
    USERNAME_INVALID: "Username may only contain letters, numbers, and underscores",
    PASSWORD_INVALID:
        "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character",
};
