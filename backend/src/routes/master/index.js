import express from "express";

import { verifyJWT } from "../../middlewares/user.middleware.js";

import addressRouter from "./address.route.js";
import productRouter from "./product.route.js";
// Future: import customerRouter from "./customer.route.js";
// Future: import invoiceRouter from "./invoice.route.js";

const router = express.Router();

/**
 * Base: /api/v1/masters
 */

// ===============================
// 🔐 PROTECTED ROUTES (JWT Required)
// ===============================

router.use(verifyJWT); // Protect all routes below this line

router.use("/addresses", addressRouter);
router.use("/products", productRouter);

// Future extensions:
// router.use("/customer", customerRouter);
// router.use("/invoice", invoiceRouter);

export default router;
