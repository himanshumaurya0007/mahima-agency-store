import { Router } from 'express';

import { validateRegister, validateLogin } from '../middlewares/validateUser.middleware.js';
import { 
    registerUser, 
    loginUser, 
    logoutUser,
    getSecurityQuestion,      // Add these imports
    verifySecurityAnswer,     // Add these imports
    resetPassword             // Add these imports
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/user.middleware.js";

const router = Router();

// Existing routes
router.route('/register').post(validateRegister, registerUser);
router.route('/login').post(validateLogin, loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

// Add these new password reset routes
router.route('/get-security-question').post(getSecurityQuestion);
router.route('/verify-security-answer').post(verifySecurityAnswer);
router.route('/reset-password').post(resetPassword);

export default router;
