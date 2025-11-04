import mongoose from "mongoose";

import { logger } from "../utils/index.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGO_URI}/${process.env.DB_NAME}`
        );
        logger.info(`MongoDB connected! Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        logger.error("MongoDB connection failed", { error: error.message });
        process.exit(1);
    }
}

export default connectDB;