import jwt from "jsonwebtoken";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

import {
    asyncHandler,
    ApiError,
    logger
} from "../utils/index.js";

import { User } from "../models/user.model.js";

/**
 * JWT Authentication Guard
 * ------------------------------------------------------------------
 * - Extracts JWT from Authorization header or cookies
 * - Verifies signature and expiration
 * - Loads user into req.user
 * - Throws structured ApiError for all auth failure states
 * ------------------------------------------------------------------
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {

    // Extract JWT from header
    let token = req.headers?.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.cookies?.accessToken;

    if (!token) {
        logger.warn("Authentication failed: No token provided");
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "Authentication token required",
            ["Token missing from header or cookies"]
        );
    }

    // Verify token validity
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        logger.warn("Authentication failed: Invalid or expired token", {
            reason: err.message,
        });

        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "Invalid or expired token",
            [err.message]
        );
    }

    // Validate user existence
    const user = await User.findById(decoded._id)
        .select("-password -securityAnswer -refreshToken");

    if (!user) {
        logger.warn("Authentication failed: User not found", {
            userId: decoded._id,
        });

        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            "User no longer exists",
            [`User with ID ${decoded._id} not found`]
        );
    }

    req.user = user;
    logger.info(`Authenticated user: ${user._id}`);

    next();
});
