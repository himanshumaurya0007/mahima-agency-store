import { Router } from 'express';

import { validateProduct } from "../middlewares/validations/appValidation.middleware.js";
import { verifyJWT } from "../middlewares/user.middleware.js";

import {
    addProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from "../controllers/product.controller.js";

const router = Router();

// ===============================
// 🔐 PROTECTED ROUTES (JWT Required)
// ===============================
router.use(verifyJWT); // Protect all routes below this line

router
    .route('/')
    .get(getAllProducts)
    .post(validateProduct, addProduct);

router
    .route('/:id')
    .get(getProductById)
    .put(validateProduct, updateProduct)
    .delete(deleteProduct);

export default router;
