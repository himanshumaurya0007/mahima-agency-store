import { Router } from 'express';

import { validateProductCategory } from "../../middlewares/validations/appMasterValidation.middleware.js";
import { verifyJWT } from "../../middlewares/user.middleware.js";

import {
    createProductCategory,
    getAllProductCategories,
    getProductCategoryById,
    updateProductCategoryStatus,
    deleteProductCategory,
} from "../../controllers/master/productCategory.controller.js";

const router = Router();

/**
 * Base: /api/v1/masters/products/categories
 */

// ===============================
// 🔐 PROTECTED ROUTES (JWT Required)
// ===============================

router.use(verifyJWT); // Protect all routes below this line

router
    .route('/')
    .get(getAllProductCategories)
    .post(validateProductCategory, createProductCategory);

router
    .route('/:id')
    .get(getProductCategoryById)
    .put(updateProductCategoryStatus)
    .delete(deleteProductCategory);

export default router;
