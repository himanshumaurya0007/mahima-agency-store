import express from "express";
import productRouter from "./product.route.js";
// Future: import customerRouter from "./customer.route.js";
// Future: import invoiceRouter from "./invoice.route.js";

const router = express.Router();

/**
 * Base: /api/v1/master
 */

// Product-related master routes
router.use("/products", productRouter);

// Future extensions:
// router.use("/customer", customerRouter);
// router.use("/invoice", invoiceRouter);

export default router;
