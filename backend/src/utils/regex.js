// Email validation (RFC-like, simple practical version)
export const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

// Phone validation (E.164 format)
export const phoneRegex = /^\+?[1-9]\d{1,14}$/;

// Username validation (alphanumeric + underscores)
export const usernameRegex = /^[a-zA-Z0-9_]+$/;

// Password validation (uppercase, lowercase, number, special char, min 8)
export const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,100}$/;
