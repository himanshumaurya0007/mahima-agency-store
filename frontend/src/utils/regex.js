// frontend/src/utils/regex.js

// Email validation
export const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

// Indian phone validation: 10 digits, must not start with 0
export const phoneRegex = /^[1-9][0-9]{9}$/;

// Username validation (alphanumeric + underscores)
export const usernameRegex = /^[a-zA-Z0-9_]+$/;

// Password validation
export const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,100}$/;
