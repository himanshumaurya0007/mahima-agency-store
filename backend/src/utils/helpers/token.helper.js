import jwt from "jsonwebtoken";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

import {
    ApiError,
    logger
} from "../../utils/index.js";

import { User } from "../../models/user.model.js";

/**
 * Generates and persists access/refresh tokens for a user.
 * @param {string} userId - MongoDB ObjectId of the user
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}  - ApiResponse containing tokens
 */
export const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                ReasonPhrases.NOT_FOUND,
                [`User with id ${userId} not found`]
            );
        }

        // Generate tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Save refresh token in DB
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        logger.debug(`Tokens generated successfully for userId: ${userId}`);

        // Return plain tokens
        return { accessToken, refreshToken };
    } catch (error) {
        logger.error(`Error generating tokens for userId ${userId}: ${error.message}`, { stack: error.stack });
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            ReasonPhrases.INTERNAL_SERVER_ERROR,
            [error.message]
        );
    }
};

export const setAuthCookies = (res, accessToken, refreshToken) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        // maxAge: process.env.REFRESH_TOKEN_MAX_AGE || 7 * 24 * 60 * 60 * 1000,
        maxAge: process.env.REFRESH_TOKEN_MAX_AGE || 604800000,
    };

    res
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions);
};

export const findUserByEmailOrUsername = async (query = {}, selectFields = "") => {
    const filters = [];
    if (query.email) filters.push({ email: query.email });
    if (query.username) filters.push({ username: query.username });
    return User.findOne({ $or: filters }).select(selectFields);
}