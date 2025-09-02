import { Router } from 'express';

import { validateRegister, validateLogin } from '../middlewares/validateUser.middleware.js';
import { registerUser, loginUser } from "../controllers/user.controller.js";

const router = Router();

router.route('/register').post(validateRegister, registerUser);

router.route('/login').post(validateLogin, loginUser);

export default router;