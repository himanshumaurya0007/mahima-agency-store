// frontend/src/utils/validate.js

import { fields } from "./fields.js";
import { emailRegex, phoneRegex, usernameRegex, passwordRegex } from "./regex.js";
import { errorMessages } from "./errorMessages.js";

export const validateField = (name, value) => {
    switch (name) {
        case "firstName":
        case "lastName":
            return !value.trim() ? errorMessages.REQUIRED(fields[name]) : "";

        case "email":
            if (!value.trim()) return errorMessages.REQUIRED(fields.email);
            return emailRegex.test(value) ? "" : errorMessages.EMAIL_INVALID;

        case "phone":
            if (!value.trim()) return errorMessages.REQUIRED(fields.phone);
            return phoneRegex.test(value) ? "" : errorMessages.PHONE_INVALID;

        case "username":
            if (!value.trim()) return errorMessages.REQUIRED(fields.username);
            if (!usernameRegex.test(value)) return errorMessages.USERNAME_INVALID;
            return "";

        case "password":
            if (!value.trim()) return errorMessages.REQUIRED(fields.password);
            return passwordRegex.test(value) ? "" : errorMessages.PASSWORD_INVALID;

        case "securityQuestion":
            return !value ? errorMessages.REQUIRED(fields.securityQuestion) : "";

        case "securityAnswer":
            return !value.trim() ? errorMessages.REQUIRED(fields.securityAnswer) : "";

        default:
            return "";
    }
};
