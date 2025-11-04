export const MESSAGES = {
    // ---------------------------
    // 🧩 GENERIC VALIDATION MESSAGES
    // ---------------------------
    REQUIRED: (field) => `${field} is required`,
    STRING_BASE: (field) => `${field} must be a string`,
    NUMBER_BASE: (field) => `${field} must be a number`,
    BOOLEAN_BASE: (field) => `${field} must be true or false`,
    ARRAY_BASE: (field) => `${field} must be an array`,
    OBJECT_BASE: (field) => `${field} must be a valid object`,
    ENUM_BASE: (field, validValues) => `${field} must be one of: ${validValues.join(", ")}`,

    MIN_LENGTH: (field, min) => `${field} must be at least ${min} characters`,
    MAX_LENGTH: (field, max) => `${field} must not exceed ${max} characters`,
    EXACT_LENGTH: (field, len) => `${field} must be exactly ${len} characters`,
    PATTERN_MISMATCH: (field) => `${field} format is invalid`,

    INVALID_TYPE: (field, type) => `${field} must be of type ${type}`,
    INVALID_VALUE: (field) => `${field} contains an invalid value`,
    DUPLICATE_VALUE: (field) => `${field} already exists`,
    NOT_FOUND: (entity) => `${entity} not found`,

    // ---------------------------
    // 👤 USER & AUTHENTICATION
    // ---------------------------
    EMAIL_INVALID: "Email must be a valid email address",
    EMAIL_EXISTS: "An account with this email already exists",
    PHONE_INVALID: "Phone number must be a valid Indian phone number (10 digits, cannot start with 0)",
    PHONE_EXISTS: "An account with this phone number already exists",
    USERNAME_INVALID: "Username may only contain letters, numbers, and underscores",
    USERNAME_EXISTS: "Username already taken",
    PASSWORD_INVALID:
        "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character",
    PASSWORD_MISMATCH: "Passwords do not match",
    OLD_PASSWORD_INCORRECT: "Old password is incorrect",
    UNAUTHORIZED: "Unauthorized access",
    TOKEN_INVALID: "Invalid or expired token",
    TOKEN_MISSING: "Authentication token missing",
    REFRESH_TOKEN_EXPIRED: "Refresh token has expired",
    SECURITY_ANSWER_INVALID: "Security answer is incorrect",

    // ---------------------------
    // 🏪 CUSTOMER / BUSINESS DETAILS
    // ---------------------------
    TEMPORARY_CUSTOMER_ID_INVALID: "Temporary Customer ID must be a valid 8 digits",
    CUSTOMER_ID_INVALID: "Customer ID must be a valid Havmor Platform Customer ID with 8 digits",
    CUSTOMER_STATUS_INVALID: "Customer status must be either TEMPORARY or PERMANENT",
    SHOP_NAME_INVALID: "Shop name must contain only letters, numbers, spaces, and common punctuation",
    HAVMOR_PLATFORM_ID_MISSING: "Havmor Platform Customer ID is required for permanent customers",

    PAN_CARD_INVALID: "PAN Card number must be a valid Indian PAN (e.g., ABCDE1234F)",
    GSTIN_NUMBER_INVALID: "GSTIN number must be a valid Indian GSTIN (15 characters, alphanumeric)",

    // ---------------------------
    // 🏠 ADDRESS VALIDATION
    // ---------------------------
    ADDRESS_INVALID: "Address must be a valid object",
    CITY_INVALID: "City name must contain only alphabets and spaces",
    STATE_INVALID: "State must be a valid Indian state name",
    STATE_CODE_INVALID: "State code must be a valid 2-letter abbreviation",
    PINCODE_INVALID: "PIN code must be a valid Indian PIN code (6 digits)",
    PLACE_INVALID: "Place must be a valid locality or area name",

    // ---------------------------
    // 🔐 SECURITY & SESSION
    // ---------------------------
    ACCESS_DENIED: "Access denied. You do not have permission to perform this action",
    LOGIN_REQUIRED: "You must be logged in to access this resource",
    SESSION_EXPIRED: "Your session has expired, please log in again",
    ACCOUNT_LOCKED: "Your account has been temporarily locked due to multiple failed login attempts",
    ACCOUNT_INACTIVE: "Your account is inactive. Please contact support.",

    // ---------------------------
    // 🧱 SYSTEM / SERVER MESSAGES
    // ---------------------------
    INTERNAL_ERROR: "An unexpected server error occurred",
    DATABASE_CONNECTION_FAILED: "Database connection failed",
    RESOURCE_CONFLICT: "The resource you are trying to create already exists",
    INVALID_REQUEST: "Invalid request parameters",
    BAD_REQUEST: "Bad request. Please check the input data",
    SERVICE_UNAVAILABLE: "Service temporarily unavailable. Please try again later",
};
