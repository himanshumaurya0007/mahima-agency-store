import express from "express";
import productCategoryRouter from "./productCategory.route.js";

const router = express.Router();

/**
 * Base: /api/v1/master/product
 */

router.use("/category", productCategoryRouter);
// Future: router.use("/brand", productBrandRouter);
// Future: router.use("/type", productTypeRouter);

export default router;
