import express from "express";

import productCategoryRouter from "./productCategory.route.js";
import productPackSizeRouter from "./productPackSize.route.js";
import productVolumeUnitRouter from "./productVolumeUnit.route.js";

const router = express.Router();

/**
 * Base: /api/v1/masters/products
 */

router.use("/categories", productCategoryRouter);
router.use("/pack-sizes", productPackSizeRouter);
router.use("/volume-units", productVolumeUnitRouter);

export default router;
