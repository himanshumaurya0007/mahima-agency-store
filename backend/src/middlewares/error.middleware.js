import { ApiError } from "../utils/ApiError.js";

export const errorMiddleware = (err, req, res, next) => {
    console.error("Error:", err);

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        });
    }

    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
