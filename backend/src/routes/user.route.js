import { Router } from 'express';

import { validateUser, validateLogin } from '../middlewares/validateUser.middleware.js';
import { registerUser, loginUser } from "../controllers/user.controller.js";

const router = Router();

router.route('/register').post(validateUser, registerUser);

router.route('/login').post(validateLogin, loginUser);

export default router;