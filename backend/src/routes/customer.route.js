import { Router } from 'express';

import { validateCustomer } from '../middlewares/customerValidation.middleware.js';
import { verifyJWT } from "../middlewares/user.middleware.js";

// import { addCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer } from "../controllers/customer.controller.js";
import { addCustomer, getAllCustomers, getCustomerById, deleteCustomer } from "../controllers/customer.controller.js";

const router = Router();

router.route('/').post(verifyJWT, validateCustomer, addCustomer);
router.route('/').get(verifyJWT, getAllCustomers);
router.route('/:id').get(verifyJWT, getCustomerById);
// router.route('/:id').put(verifyJWT, validateCustomer, updateCustomer);
router.route('/:id').delete(verifyJWT, deleteCustomer);

export default router;
