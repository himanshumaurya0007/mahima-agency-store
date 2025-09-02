import { StatusCodes, ReasonPhrases } from "http-status-codes";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";
import { User } from "../models/user.model.js";
import { fields } from "../utils/fields.js";

/**
 * Generates and persists access/refresh tokens for a user.
 * @param {string} userId - MongoDB ObjectId of the user
 * @returns {Promise<ApiResponse>} - ApiResponse containing tokens
 */
const generateAccessAndRefreshTokens = async (userId) => {
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
        logger.error(`Error generating tokens for userId ${userId}: ${error.message}`, {
            stack: error.stack,
        });
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            ReasonPhrases.INTERNAL_SERVER_ERROR,
            [error.message]
        );
    }
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/user/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res, next) => {
    try {
        const { firstName, lastName, email, phone, username, password, securityQuestion, securityAnswer } = req.body;

        // 1. Check if user already exists (by email or username)
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            throw new ApiError(
                StatusCodes.CONFLICT,
                ReasonPhrases.CONFLICT,
                [`${fields.email} or ${fields.username} already exists`]
            );
        }

        // 2. Create new user
        const user = await User.create({
            firstName,
            lastName,
            email,
            phone,
            username,
            password,
            securityQuestion,
            securityAnswer,
        });

        logger.info(`New user registered: ${user.email} (id: ${user._id})`);

        // 3. Generate tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        // 4. Send response (exclude sensitive fields)
        return res.status(StatusCodes.CREATED).json(
            new ApiResponse(
                StatusCodes.CREATED,
                {
                    user: {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        phone: user.phone,
                        username: user.username,
                        securityQuestion: user.securityQuestion,
                    },
                    // accessToken + refreshToken
                    accessToken,
                    refreshToken,
                },
                "User registered successfully"
            )
        );
    } catch (error) {
        logger.error(`User registration failed: ${error.message}`, { stack: error.stack });
        next(
            error instanceof ApiError
                ? error
                : new ApiError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    ReasonPhrases.INTERNAL_SERVER_ERROR,
                    [error.message]
                ));
    }
});

export { registerUser };