// frontend/src/validations/userValidationSchemas.js
import * as Yup from "yup";
import { fields } from "./fields";
import { errorMessages } from "./errorMessages";
import { emailRegex, phoneRegex, usernameRegex, passwordRegex } from "./regex";
import { SECURITY_QUESTIONS } from "./constants";

// Register Schema
export const registerUserValidationSchema = Yup.object().shape({
    firstName: Yup.string()
        .min(2, errorMessages.MIN_LENGTH(fields.firstName, 2))
        .max(50, errorMessages.MAX_LENGTH(fields.firstName, 50))
        .trim()
        .lowercase()
        .required(errorMessages.REQUIRED(fields.firstName)),

    lastName: Yup.string()
        .min(2, errorMessages.MIN_LENGTH(fields.lastName, 2))
        .max(50, errorMessages.MAX_LENGTH(fields.lastName, 50))
        .trim()
        .lowercase()
        .required(errorMessages.REQUIRED(fields.lastName)),

    email: Yup.string()
        .matches(emailRegex, errorMessages.EMAIL_INVALID)
        .trim()
        .lowercase()
        .required(errorMessages.REQUIRED(fields.email)),

    phone: Yup.string()
        .trim()
        .matches(phoneRegex, errorMessages.PHONE_INVALID)
        .required(errorMessages.REQUIRED(fields.phone)),

    username: Yup.string()
        .min(3, errorMessages.MIN_LENGTH(fields.username, 3))
        .max(30, errorMessages.MAX_LENGTH(fields.username, 30))
        .matches(usernameRegex, errorMessages.USERNAME_INVALID)
        .trim()
        .lowercase()
        .required(errorMessages.REQUIRED(fields.username)),

    securityQuestion: Yup.string()
        .oneOf(SECURITY_QUESTIONS, "Invalid security question")
        .required(errorMessages.REQUIRED(fields.securityQuestion)),

    securityAnswer: Yup.string()
        .min(3, errorMessages.MIN_LENGTH(fields.securityAnswer, 3))
        .max(50, errorMessages.MAX_LENGTH(fields.securityAnswer, 50))
        .trim()
        .lowercase()
        .required(errorMessages.REQUIRED(fields.securityAnswer)),

    password: Yup.string()
        .matches(passwordRegex, errorMessages.PASSWORD_INVALID)
        .min(8, errorMessages.MIN_LENGTH(fields.password, 8))
        .max(100, errorMessages.MAX_LENGTH(fields.password, 100))
        .trim()
        .lowercase()
        .required(errorMessages.REQUIRED(fields.password)),
});

// Login Schema
export const loginUserValidationSchema = Yup.object().shape({
    email: Yup.string()
        .trim()
        .lowercase()
        .matches(emailRegex, errorMessages.EMAIL_INVALID),

    username: Yup.string()
        .trim()
        .lowercase()
        .matches(usernameRegex, errorMessages.USERNAME_INVALID),

    password: Yup.string()
        .trim()
        .lowercase()
        .matches(passwordRegex, errorMessages.PASSWORD_INVALID)
        .required(errorMessages.REQUIRED(fields.password)),
}).test("oneOfRequired", "Either email or username is required", (value) =>
    Boolean(value.email || value.username)
);

// Security Answer Schema
export const securityAnswerValidationSchema = Yup.object().shape({
    email: Yup.string()
        .trim()
        .lowercase()
        .matches(emailRegex, errorMessages.EMAIL_INVALID),

    username: Yup.string()
        .trim()
        .lowercase()
        .matches(usernameRegex, errorMessages.USERNAME_INVALID),

    securityAnswer: Yup.string()
        .trim()
        .min(3, errorMessages.MIN_LENGTH(fields.securityAnswer, 3))
        .max(50, errorMessages.MAX_LENGTH(fields.securityAnswer, 50))
        .required(errorMessages.REQUIRED(fields.securityAnswer)),
}).test("oneOfRequired", "Either email or username is required", (value) =>
    Boolean(value.email || value.username)
);

// Reset Password Schema
export const resetPasswordValidationSchema = Yup.object().shape({
    email: Yup.string()
        .trim()
        .lowercase()
        .matches(emailRegex, errorMessages.EMAIL_INVALID),

    username: Yup.string()
        .trim()
        .lowercase()
        .matches(usernameRegex, errorMessages.USERNAME_INVALID),

    newPassword: Yup.string()
        .matches(passwordRegex, errorMessages.PASSWORD_INVALID)
        .min(8, errorMessages.MIN_LENGTH(fields.password, 8))
        .max(100, errorMessages.MAX_LENGTH(fields.password, 100))
        .trim()
        .required(errorMessages.REQUIRED(fields.password)),
}).test("oneOfRequired", "Either email or username is required", (value) =>
    Boolean(value.email || value.username)
);
