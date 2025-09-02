import { Router } from 'express';

import { validateRegister, validateLogin } from '../middlewares/validateUser.middleware.js';
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/user.middleware.js";

const router = Router();

router.route('/register').post(validateRegister, registerUser);

router.route('/login').post(validateLogin, loginUser);

router.route("/logout").post(verifyJWT, logoutUser);

export default router;