import { Router } from 'express';

import { validateProductPackSize } from "../../middlewares/validations/appMasterValidation.middleware.js";

import {
    createProductPackSize,
    getAllProductPackSizes,
    getProductPackSizeById,
    updateProductPackSizeStatus,
    deleteProductPackSize
} from "../../controllers/master/productPackSize.controller.js";

const router = Router();

/**
 * Base: /api/v1/masters/products/pack-sizes
 */

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
