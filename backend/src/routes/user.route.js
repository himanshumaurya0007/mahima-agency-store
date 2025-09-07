import { Router } from 'express';

import { validateRegister, validateLogin, validateSecurityQuestion, validateSecurityAnswer, validateResetPassword } from '../middlewares/validateUser.middleware.js';
import { registerUser, loginUser, logoutUser, fetchSecurityQuestion, validateSecurityAnswerController, resetUserPassword } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/user.middleware.js";

const router = Router();

router.route('/register').post(validateRegister, registerUser);
router.route('/login').post(validateLogin, loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

router.route('/security-question').get(validateSecurityQuestion, fetchSecurityQuestion);
router.route('/security-answer/verify').post(validateSecurityAnswer, validateSecurityAnswerController);
router.route('/password/reset').patch(validateResetPassword, resetUserPassword);

export default router;
