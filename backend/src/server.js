import dotenv from "dotenv";
dotenv.config({ path: './.env' });

import connectDB from "./config/db.js";
import { app } from './app.js'
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            logger.info(`Server running at: http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        logger.error("Failed to start server:", err);
    });
