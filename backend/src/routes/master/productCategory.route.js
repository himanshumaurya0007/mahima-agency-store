import { Router } from 'express';

import { validateProductCategory } from '../../middlewares/validations/master/productCategoryValidation.middleware.js';
import { verifyJWT } from "../../middlewares/user.middleware.js";

import {
    createProductCategory,
    getAllProductCategories,
    getProductCategoryById,
    deleteProductCategory,
// } from "../controllers/master/productCategory.controller.js";
} from "../../controllers/master/productCategory.controller.js";

const router = Router();

/**
 * Base: /api/v1/master/product/category
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
    .delete(deleteProductCategory);

export default router;
