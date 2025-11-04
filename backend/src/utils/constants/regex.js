// utils/regex.js

export const REGEX = {
    // ---------------------------
    // 📧 USER & AUTHENTICATION
    // ---------------------------

    // Email validation (RFC-like, practical version)
    EMAIL: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,

    // Indian phone number: 10 digits, must not start with 0
    PHONE: /^[1-9][0-9]{9}$/,

    // Username: alphanumeric + underscores only
    USERNAME: /^[a-zA-Z0-9_]+$/,

    // Password: uppercase, lowercase, number, special char, min 8 chars
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,100}$/,

    // ---------------------------
    // 🏪 CUSTOMER / BUSINESS
    // ---------------------------

    // Havmor Platform Customer ID: 8 digits
    HAVMOR_PLATFORM_CUSTOMER_ID: /^[0-9]{8}$/,

    // Temporary Customer ID: 8 digits
    TEMPORARY_CUSTOMER_ID: /^[0-9]{8}$/,

    // PAN Card Number: e.g., ABCDE1234F
    PAN_CARD: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,

    // GSTIN Number: 15 characters (2 digits state code + PAN + 3 chars + 1 digit + 1 letter)
    GSTIN_NUMBER: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,

    // ---------------------------
    // 🏠 ADDRESS VALIDATION
    // ---------------------------

    // Indian PIN Code: 6 digits, cannot start with 0
    PIN_CODE: /^[1-9][0-9]{5}$/,

    // Optional additions (future use)
    CITY: /^[a-zA-Z\s]+$/,
    STATE_CODE: /^[A-Z]{2}$/,

    MATERIAL_CODE: /^40\d{4}$/,
    HSN_CODE: /^\d{8}$/,
};