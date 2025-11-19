import { Router } from 'express';

import { validateAddressindianState } from "../../middlewares/validations/appMasterValidation.middleware.js";

import {
    createAddressIndianState,
    getAllAddressIndianStates,
    getAddressIndianStateById,
    updateAddressIndianStateStatus,
    deleteAddressIndianState,
} from "../../controllers/master/addressIndianState.controller.js";

const router = Router();

/**
 * Base: /api/v1/masters/products/categories
 */

router
    .route('/')
    .get(getAllAddressIndianStates)
    .post(validateAddressindianState, createAddressIndianState);

router
    .route('/:id')
    .get(getAddressIndianStateById)
    .put(updateAddressIndianStateStatus)
    .delete(deleteAddressIndianState);

export default router;
