import { createValidator } from "./index.js";

// User authentication 
import {
    registerValidationSchema,
    loginValidationSchema,
    securityQuestionValidationSchema,
    securityAnswerValidationSchema,
    resetPasswordValidationSchema
} from "../../validations/user.validation.js";

export const validateRegister = createValidator(
    registerValidationSchema,
    "Register"
);
export const validateLogin = createValidator(
    loginValidationSchema,
    "Login"
);
export const validateSecurityQuestion = createValidator(
    securityQuestionValidationSchema,
    "Security Question", "query"
);
export const validateSecurityAnswer = createValidator(
    securityAnswerValidationSchema,
    "Security Answer"
);
export const validateResetPassword = createValidator(
    resetPasswordValidationSchema,
    "Reset Password"
);

// Customers
import { customerValidationSchema } from "../../validations/customer.validation.js";

export const validateCustomer = createValidator(
    customerValidationSchema,
    "Customer"
);
