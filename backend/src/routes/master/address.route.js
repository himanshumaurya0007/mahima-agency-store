import express from "express";

import addressIndianStateRouter from "./addressIndianState.route.js";

const router = express.Router();

/**
 * Base: /api/v1/masters/addresses
 */

router.use("/indian-states", addressIndianStateRouter);

export default router;
