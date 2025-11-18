import { Router } from 'express';

import { validateProductVolumeUnit } from "../../middlewares/validations/appMasterValidation.middleware.js";
import { verifyJWT } from "../../middlewares/user.middleware.js";

import {
    createProductVolumeUnit,
    getAllProductVolumeUnits,
    getProductVolumeUnitById,
    updateProductVolumeUnitStatus,
    deleteProductVolumeUnit
} from "../../controllers/master/productVolumeUnit.controller.js";

const router = Router();

/**
 * Base: /api/v1/masters/products/volume-units
 */

router
    .route('/')
    .get(getAllProductVolumeUnits)
    .post(validateProductVolumeUnit, createProductVolumeUnit);

router
    .route('/:id')
    .get(getProductVolumeUnitById)
    .put(updateProductVolumeUnitStatus)
    .delete(deleteProductVolumeUnit);

export default router;
