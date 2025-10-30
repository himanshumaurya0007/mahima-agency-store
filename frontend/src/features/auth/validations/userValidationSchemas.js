import * as Yup from 'yup';
import { FIELDS, MESSAGES, REGEX, ENUMS } from '../../../utils/index';

// ---------------------------
// 🧾 REGISTER USER SCHEMA
// ---------------------------
export const registerUserValidationSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, MESSAGES.MIN_LENGTH(FIELDS.FIRST_NAME, 2))
    .max(50, MESSAGES.MAX_LENGTH(FIELDS.FIRST_NAME, 50))
    .trim()
    .lowercase()
    .required(MESSAGES.REQUIRED(FIELDS.FIRST_NAME)),

  lastName: Yup.string()
    .min(2, MESSAGES.MIN_LENGTH(FIELDS.LAST_NAME, 2))
    .max(50, MESSAGES.MAX_LENGTH(FIELDS.LAST_NAME, 50))
    .trim()
    .lowercase()
    .required(MESSAGES.REQUIRED(FIELDS.LAST_NAME)),

  email: Yup.string()
    .matches(REGEX.EMAIL, MESSAGES.EMAIL_INVALID)
    .trim()
    .lowercase()
    .required(MESSAGES.REQUIRED(FIELDS.EMAIL)),

  phone: Yup.string()
    .matches(REGEX.PHONE, MESSAGES.PHONE_INVALID)
    .trim()
    .required(MESSAGES.REQUIRED(FIELDS.PHONE)),

  username: Yup.string()
    .min(3, MESSAGES.MIN_LENGTH(FIELDS.USERNAME, 3))
    .max(30, MESSAGES.MAX_LENGTH(FIELDS.USERNAME, 30))
    .matches(REGEX.USERNAME, MESSAGES.USERNAME_INVALID)
    .trim()
    .lowercase()
    .required(MESSAGES.REQUIRED(FIELDS.USERNAME)),

  securityQuestion: Yup.string()
    .oneOf(ENUMS.SECURITY_QUESTIONS, MESSAGES.ENUM_BASE(FIELDS.SECURITY_QUESTION, ENUMS.SECURITY_QUESTIONS))
    .required(MESSAGES.REQUIRED(FIELDS.SECURITY_QUESTION)),

  securityAnswer: Yup.string()
    .min(3, MESSAGES.MIN_LENGTH(FIELDS.SECURITY_ANSWER, 3))
    .max(50, MESSAGES.MAX_LENGTH(FIELDS.SECURITY_ANSWER, 50))
    .trim()
    .required(MESSAGES.REQUIRED(FIELDS.SECURITY_ANSWER)),

  password: Yup.string()
    .matches(REGEX.PASSWORD, MESSAGES.PASSWORD_INVALID)
    .min(8, MESSAGES.MIN_LENGTH(FIELDS.PASSWORD, 8))
    .max(100, MESSAGES.MAX_LENGTH(FIELDS.PASSWORD, 100))
    .trim()
    .required(MESSAGES.REQUIRED(FIELDS.PASSWORD)),
});

// ---------------------------
// 🔐 LOGIN SCHEMA
// ---------------------------
export const loginUserValidationSchema = Yup.object()
  .shape({
    email: Yup.string()
      .trim()
      .lowercase()
      .matches(REGEX.EMAIL, MESSAGES.EMAIL_INVALID),

    username: Yup.string()
      .trim()
      .lowercase()
      .matches(REGEX.USERNAME, MESSAGES.USERNAME_INVALID),

    password: Yup.string()
      .trim()
      .matches(REGEX.PASSWORD, MESSAGES.PASSWORD_INVALID)
      .required(MESSAGES.REQUIRED(FIELDS.PASSWORD)),
  })
  .test('oneOfRequired', 'Either Email or Username is required', (value) =>
    Boolean(value.email || value.username),
  );

// ---------------------------
// 🔒 SECURITY ANSWER SCHEMA
// ---------------------------
export const securityAnswerValidationSchema = Yup.object()
  .shape({
    email: Yup.string()
      .trim()
      .lowercase()
      .matches(REGEX.EMAIL, MESSAGES.EMAIL_INVALID),

    username: Yup.string()
      .trim()
      .lowercase()
      .matches(REGEX.USERNAME, MESSAGES.USERNAME_INVALID),

    securityAnswer: Yup.string()
      .min(3, MESSAGES.MIN_LENGTH(FIELDS.SECURITY_ANSWER, 3))
      .max(50, MESSAGES.MAX_LENGTH(FIELDS.SECURITY_ANSWER, 50))
      .trim()
      .required(MESSAGES.REQUIRED(FIELDS.SECURITY_ANSWER)),
  })
  .test('oneOfRequired', 'Either Email or Username is required', (value) =>
    Boolean(value.email || value.username),
  );

// ---------------------------
// 🔁 RESET PASSWORD SCHEMA
// ---------------------------
export const resetPasswordValidationSchema = Yup.object()
  .shape({
    email: Yup.string()
      .trim()
      .lowercase()
      .matches(REGEX.EMAIL, MESSAGES.EMAIL_INVALID),

    username: Yup.string()
      .trim()
      .lowercase()
      .matches(REGEX.USERNAME, MESSAGES.USERNAME_INVALID),

    newPassword: Yup.string()
      .matches(REGEX.PASSWORD, MESSAGES.PASSWORD_INVALID)
      .min(8, MESSAGES.MIN_LENGTH(FIELDS.NEW_PASSWORD, 8))
      .max(100, MESSAGES.MAX_LENGTH(FIELDS.NEW_PASSWORD, 100))
      .trim()
      .required(MESSAGES.REQUIRED(FIELDS.NEW_PASSWORD)),
  })
  .test('oneOfRequired', 'Either Email or Username is required', (value) =>
    Boolean(value.email || value.username),
  );
