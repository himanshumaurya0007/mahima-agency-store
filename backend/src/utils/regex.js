// utils/regex.js

// Email validation (RFC-like, simple practical version)
export const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

// Indian phone validation: 10 digits, must not start with 0
export const phoneRegex = /^[1-9][0-9]{9}$/;

// Username validation (alphanumeric + underscores)
export const usernameRegex = /^[a-zA-Z0-9_]+$/;

// Password validation (uppercase, lowercase, number, special char, min 8)
export const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,100}$/;

// Havmor Platform Customer ID validation
export const havmorPlatformCustomerIdRegex = /^[0-9]{8}$/;

// PAN Card Number validation (e.g., ABCDE1234F)
export const panCardRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// GSTIN Number validation (15 characters: 2 digits state code + PAN + 3 chars + 1 digit + 1 letter)
export const gstinNumberRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// Indian PIN Code validation (6 digits, cannot start with 0)
export const pinCodeRegex = /^[1-9][0-9]{5}$/;