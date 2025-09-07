import dotenv from "dotenv";
dotenv.config({ path: './.env' });

// ADD THESE DEBUG LOGS
console.log('🔍 Environment Variables Check:');
console.log('ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET ? '✅ Loaded' : '❌ Missing');
console.log('REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET ? '✅ Loaded' : '❌ Missing');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Loaded' : '❌ Missing');

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
