import jwt from "jsonwebtoken";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

import {
    asyncHandler,
    ApiError,
    logger
} from "../utils/index.js";

import { User } from "../models/user.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        let token = null;

        // Extract token from Authorization header
        const authHeader = req.headers["authorization"];
        if (authHeader?.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        // Fallback: Check cookies if no token in header
        if (!token && req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            logger.warn("Authentication failed: No token found in header or cookies");
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                ReasonPhrases.UNAUTHORIZED,
                ["Authentication token required"]
            );
        }

        // Verify token signature & expiration
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            logger.error("Invalid or expired token", { reason: err.message });
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                ReasonPhrases.UNAUTHORIZED,
                ["Invalid or expired token"]
            );
        }

        // Fetch user
        const user = await User.findById(decoded._id)
            .select("-password -securityAnswer -refreshToken");

        if (!user) {
            logger.warn("Token valid but corresponding user no longer exists", {
                userId: decoded._id,
            });
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                ReasonPhrases.UNAUTHORIZED,
                ["User no longer exists"]
            );
        }

        req.user = user;

        logger.info(`Authenticated user: ${user._id}`);

        next();
    } catch (error) {
        next(
            new ApiError(
                error.statusCode || StatusCodes.UNAUTHORIZED,
                error.message || ReasonPhrases.UNAUTHORIZED,
                error.errors || []
            ));
    }
});

export { verifyJWT };