import { StatusCodes, ReasonPhrases } from "http-status-codes";
import jwt from "jsonwebtoken";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";
import { User } from "../models/user.model.js";
import { fields } from "../utils/fields.js";

/**
 * Generates and persists access/refresh tokens for a user.
 * @param {string} userId - MongoDB ObjectId of the user
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}  - ApiResponse containing tokens
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
        logger.error(`Error generating tokens for userId ${userId}: ${error.message}`, { stack: error.stack });
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            ReasonPhrases.INTERNAL_SERVER_ERROR,
            [error.message]
        );
    }
};

/**
 * @desc    Register a new user (NO tokens here)
 * @route   POST /api/v1/user/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res, next) => {
    try {
        const { firstName, lastName, email, phone, username, password, securityQuestion, securityAnswer } = req.body;

        // 1. Check if user already exists (by email or username)
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });

        if (existingUser) {
            throw new ApiError(StatusCodes.CONFLICT, ReasonPhrases.CONFLICT, [`${fields.email} or ${fields.username} already exists`]);
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

        // 3. Send response (exclude sensitive fields) [WITHOUT tokens]
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
                },
                "User registered successfully. Please login to continue."
            ));
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

/**
 * @desc    Login user (Tokens generated here)
 * @route   POST /api/v1/user/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;

        // 1. Find user by email OR username
        const user = await User.findOne({
            $or: [{ email }, { username }],
        }).select("+password"); // explicitly select password

        if (!user) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED, ["Invalid credentials"]);
        }

        // 2. Compare passwords
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED, ["Invalid credentials"]);
        }

        // 3. Generate tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        logger.info(`User logged in: ${user.username}`);

        // 4. Cookie options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // secure only in prod
            sameSite: "strict",
        };

        // 5. Send response with tokens
        return res.status(StatusCodes.OK)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    {
                        user: {
                            _id: user._id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            username: user.username,
                        },
                        accessToken,
                        refreshToken,
                    },
                    "Login successful"
                ));
    } catch (error) {
        logger.error(`User login failed: ${error.message}`, { stack: error.stack });
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

/**
 * @desc    Logout user (clear tokens + invalidate refreshToken)
 * @route   POST /api/v1/user/logout
 * @access  Private (requires JWT)
 */
const logoutUser = asyncHandler(async (req, res, next) => {
    try {
        // 1. Extract authenticated userId from request
        const userId = req.user?._id; // set by verifyJWT middleware

        if (!userId) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED, ["User not authenticated"]);
        }

        // 2. Invalidate refreshToken in DB (remove from user document)
        await User.findByIdAndUpdate(
            userId,
            { $unset: { refreshToken: "" } }, // remove refreshToken
            { new: true }
        );

        logger.info(`User logged out: ${userId}`);

        // 3. Cookie options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        };

        // 4. Send response (Clear access & refresh tokens from cookies)
        return res
            .status(StatusCodes.OK)
            .clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptions)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    null,
                    "Logout successful"
                )
            );
    } catch (error) {
        logger.error(`User logout failed: ${error.message}`, { stack: error.stack });
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

/**
 * @desc    Fetch security question for a user (by email or username)
 * @route   GET /api/v1/user/security-question
 * @access  Public
 */
const fetchSecurityQuestion = asyncHandler(async (req, res, next) => {
    try {
        const { email, username } = req.query;

        // 1. Find user by email or username
        const user = await User.findOne({
            $or: [{ email }, { username }],
        }).select("+securityQuestion");

        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, ["User not found"]);
        }

        logger.info(`Security question fetched for user: ${email || username}`);

        // 2. Send response (Return only the security question (never answer))
        return res.status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    { securityQuestion: user.securityQuestion },
                    "Security question fetched successfully"
                ));
    } catch (error) {
        logger.error(`Failed to fetch security question: ${error.message}`, { stack: error.stack });
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

/**
 * @desc    Validate user’s security answer
 * @route   POST /api/v1/user/security-answer/verify
 * @access  Public
 */
const validateSecurityAnswerController = asyncHandler(async (req, res, next) => {
    try {
        const { email, username, securityAnswer } = req.body;

        // 1. Find user
        const user = await User.findOne({
            $or: [{ email }, { username }],
        }).select("+securityAnswer"); // ensure answer is selected

        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, ["User not found"]);
        }

        // 2. Compare provided answer (case-sensitive)
        const isAnswerValid = await user.compareSecurityAnswer(securityAnswer);

        if (!isAnswerValid) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED, ["Invalid security answer"]);
        }

        logger.info(`Security answer validated for user: ${email || username}`);

        // 3. Send response (Return success)
        return res.status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    null,
                    "Security answer validated successfully"
                ));
    } catch (error) {
        logger.error(`Failed to validate security answer: ${error.message}`, { stack: error.stack });
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

/**
 * @desc    Reset user’s password (after security answer verified)
 * @route   PATCH /api/v1/user/password/reset
 * @access  Public
 */
const resetUserPassword = asyncHandler(async (req, res, next) => {
    try {
        const { email, username, newPassword } = req.body;

        // 1. Find user
        const user = await User.findOne({
            $or: [{ email }, { username }],
        }).select("+password");

        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, ["User not found"]);
        }

        // 2. Update password (pre-save hook will hash it)
        user.password = newPassword;
        user.markModified("password"); // ensure password gets rehashed
        await user.save({ validateModifiedOnly: true });


        logger.info(`Password reset successful for user: ${email || username}`);

        // 3. Return success response
        return res.status(StatusCodes.OK).json(
            new ApiResponse(
                StatusCodes.OK,
                null,
                "Password reset successfully. Please login with your new password."
            ));
    } catch (error) {
        logger.error(`Password reset failed: ${error.message}`, { stack: error.stack });
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

/**
 * @desc    Refresh access token using refresh token
 * @route   POST /api/v1/user/tokens
 * @access  Public
 */
const refreshTokens = asyncHandler(async (req, res, next) => {
    try {
        // 1. Extract refresh token (from cookie or body)
        const incomingRefreshToken = req.cookies.refreshToken || req.body?.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED, ["Refresh token missing"]);
        }

        // 2. Verify refresh token signature
        let decodedToken;
        try {
            decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            );
        } catch (err) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED, ["Invalid or expired refresh token"]);
        }

        // 3. Find user & check stored refresh token
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, ["User not found"]);
        }

        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED, ["Refresh token mismatch or already used"]);
        }

        // 4. Generate new access & refresh tokens
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        logger.info(`Access token refreshed for user: ${user.username}`);

        // 5. Cookie options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        };

        // 6. Send response
        return res
            .status(StatusCodes.OK)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    {
                        accessToken,
                        refreshToken: newRefreshToken,
                    },
                    "Access token refreshed successfully"
                ));
    } catch (error) {
        logger.error(`Access token refresh failed: ${error.message}`, { stack: error.stack });
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

export { registerUser, loginUser, logoutUser, fetchSecurityQuestion, validateSecurityAnswerController, resetUserPassword, refreshTokens };
