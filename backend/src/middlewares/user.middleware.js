import jwt from 'jsonwebtoken';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import logger from "../utils/logger.js";
import { User } from "../models/user.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Extract token from "Authorization" header
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            logger.warn("Missing or malformed Authorization header");
            throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
        }

        const token = authHeader.split(" ")[1];


        // Verify token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            logger.error("JWT verification failed", { error: err.message });
            throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
        }

        // Fetch user from DB
        const user = await User.findById(decodedToken._id).select(
            "-password -securityAnswer -refreshToken"
        );

        if (!user) {
            logger.warn("User not found for decodedToken JWT", { userId: decodedToken._id });
            throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
        }

        // Attach user to request object
        req.user = user;

        logger.info("JWT verified successfully", { userId: user._id });
        next();

    } catch (error) {
        // next(error);
        throw new ApiError(
            error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
            error.errors || []
        );
    }
});

export { verifyJWT };
