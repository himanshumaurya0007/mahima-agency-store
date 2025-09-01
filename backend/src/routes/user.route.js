import { Router } from 'express';

import { validateUser } from '../middlewares/validateUser.middleware.js';
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route('/register').post(validateUser, registerUser);

export default router;