import { Router } from 'express';

import { validateAddCustomer, validateUpdateCustomer } from '../middlewares/validateCustomer.middleware.js';
import { verifyJWT } from "../middlewares/user.middleware.js";

import { addCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer } from "../controllers/customer.controller.js";

const router = Router();

router.route('/').post(verifyJWT, validateAddCustomer, addCustomer);
router.route('/').get(verifyJWT, getAllCustomers);
router.route('/:id').get(verifyJWT, getCustomerById);
router.route('/:id').put(verifyJWT, validateUpdateCustomer, updateCustomer);
router.route('/:id').delete(verifyJWT, deleteCustomer);

export default router;
