import express from "express";

import productCategoryRouter from "./productCategory.route.js";
import productPackSizeRouter from "./productPackSize.route.js";

const router = express.Router();

/**
 * Base: /api/v1/master/product
 */

router.use("/categories", productCategoryRouter);
router.use("/pack-sizes", productPackSizeRouter);
// Future: router.use("/brand", productBrandRouter);
// Future: router.use("/type", productTypeRouter);

export default router;
