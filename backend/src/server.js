import dotenv from "dotenv"
import connectDB from "./config/db.js";
import { app } from './app.js'
import logger from "./utils/logger.js";

dotenv.config({ path: "./.env"});

const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            logger.log(`Server running at: http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        logger.error("Failed to start server:", err);
    });
