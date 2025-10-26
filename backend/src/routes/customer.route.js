import { Router } from 'express';

import { validateCustomer } from '../middlewares/customerValidation.middleware.js';
import { verifyJWT } from "../middlewares/user.middleware.js";

import {
    addCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
} from "../controllers/customer.controller.js";

const router = Router();

// ===============================
// 🔐 PROTECTED ROUTES (JWT Required)
// ===============================
router.use(verifyJWT); // Protect all routes below this line

router
    .route('/')
    .get(getAllCustomers)
    .post(validateCustomer, addCustomer);

router
    .route('/:id')
    .get(getCustomerById)
    .put(validateCustomer, updateCustomer)
    .delete(deleteCustomer);

export default router;
