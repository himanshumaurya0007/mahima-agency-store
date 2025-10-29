import { Router } from 'express';

import {
    validateRegister,
    validateLogin,
    validateSecurityQuestion,
    validateSecurityAnswer,
    validateResetPassword
} from "../middlewares/validations/appValidation.middleware.js";
import { verifyJWT } from "../middlewares/user.middleware.js";

import {
    registerUser,
    loginUser,
    logoutUser,
    fetchSecurityQuestion,
    validateSecurityAnswerController,
    resetUserPassword,
    refreshTokens
} from "../controllers/user.controller.js";

const router = Router();

// ===============================
// 🔓 PUBLIC ROUTES (No JWT Required)
// ===============================

// User registration
router
    .route('/register')
    .post(validateRegister, registerUser);

// User login
router
    .route('/login')
    .post(validateLogin, loginUser);

// Forgot password flow
router
    .route('/security-question')
    .get(validateSecurityQuestion, fetchSecurityQuestion);

router
    .route('/security-answer/verify')
    .post(validateSecurityAnswer, validateSecurityAnswerController);

router
    .route('/password/reset')
    .patch(validateResetPassword, resetUserPassword);

// Refresh tokens
router
    .route('/tokens')
    .post(refreshTokens);

// ===============================
// 🔐 PROTECTED ROUTES (JWT Required)
// ===============================

router.use(verifyJWT); // Protect all routes below this line

// Logout User
router
    .route("/logout")
    .post(logoutUser);

export default router;
