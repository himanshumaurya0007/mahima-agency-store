import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import logger from "../utils/logger.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        logger.info(`MongoDB connected! Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        logger.error("MongoDB connection failed", { error: error.message });
        process.exit(1);
    }
}

export default connectDB;