import { Router } from 'express';

import { validateProductPackSize } from '../../middlewares/validations/master/productPackSizeValidation.middleware.js';
import { verifyJWT } from "../../middlewares/user.middleware.js";

import {
    createProductPackSize,
    getAllProductPackSizes,
    getProductPackSizeById,
    updateProductPackSizeStatus,
    deleteProductPackSize
} from "../../controllers/master/productPackSize.controller.js";

const router = Router();

/**
 * Base: /api/v1/master/product/pack-size
 */

// ===============================
// 🔐 PROTECTED ROUTES (JWT Required)
// ===============================

router.use(verifyJWT); // Protect all routes below this line

router
    .route('/')
    .get(getAllProductPackSizes)
    .post(validateProductPackSize, createProductPackSize);

router
    .route('/:id')
    .get(getProductPackSizeById)
    .put(updateProductPackSizeStatus)
    .delete(deleteProductPackSize);

export default router;
