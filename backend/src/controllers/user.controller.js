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

        // 4. Send response (exclude sensitive fields) [WITHOUT tokens]
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

/**
 * @desc    Login user (Tokens generated here)
 * @route   POST /api/v1/user/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res, next) => {
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
        )
    );
});

/**
 * @desc    Logout user (clear tokens + invalidate refreshToken)
 * @route   POST /api/v1/user/logout
 * @access  Private (requires JWT)
 */
const logoutUser = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.user?._id; // set by verifyJWT middleware

        if (!userId) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED, ["User not authenticated"]);
        }

        // Invalidate refreshToken in DB
        await User.findByIdAndUpdate(
            userId,
            { $unset: { refreshToken: "" } }, // remove refreshToken
            { new: true }
        );

        logger.info(`User logged out: ${userId}`);

        // Clear cookies
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        };

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
                )
        );
    }
});

/**
 * @desc    Get security question by username
 * @route   POST /api/v1/user/get-security-question
 * @access  Public
 */
const getSecurityQuestion = asyncHandler(async (req, res, next) => {
    try {
        const { username } = req.body;

        if (!username?.trim()) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Username is required");
        }

        const user = await User.findOne({ username: username.trim().toLowerCase() }).select("securityQuestion");
        
        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Username not found");
        }

        logger.info(`Security question retrieved for user: ${username}`);

        return res.status(StatusCodes.OK).json(
            new ApiResponse(
                StatusCodes.OK,
                { securityQuestion: user.securityQuestion },
                "Security question retrieved successfully"
            )
        );
    } catch (error) {
        logger.error(`Get security question failed: ${error.message}`, { stack: error.stack });
        next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Something went wrong"));
    }
});

/**
 * @desc    Verify security answer
 * @route   POST /api/v1/user/verify-security-answer
 * @access  Public
 */
const verifySecurityAnswer = asyncHandler(async (req, res, next) => {
    try {
        const { username, securityAnswer } = req.body;

        if (!username?.trim() || !securityAnswer?.trim()) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Username and security answer are required");
        }

        const user = await User.findOne({ username: username.trim().toLowerCase() }).select("+securityAnswer");
        
        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Username not found");
        }

        const isAnswerValid = await user.compareSecurityAnswer(securityAnswer.trim());
        if (!isAnswerValid) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Incorrect security answer");
        }

        logger.info(`Security answer verified for user: ${username}`);

        return res.status(StatusCodes.OK).json(
            new ApiResponse(
                StatusCodes.OK,
                { verified: true },
                "Security answer verified successfully"
            )
        );
    } catch (error) {
        logger.error(`Security answer verification failed: ${error.message}`, { stack: error.stack });
        next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Something went wrong"));
    }
});

/**
 * @desc    Reset password
 * @route   POST /api/v1/user/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res, next) => {
    try {
        const { username, newPassword } = req.body;

        if (!username?.trim() || !newPassword?.trim()) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Username and new password are required");
        }

        // Validate new password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,100}$/;
        if (!passwordRegex.test(newPassword)) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST, 
                "Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character, minimum 8 characters"
            );
        }

        const user = await User.findOne({ username: username.trim().toLowerCase() });
        
        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Username not found");
        }

        // Update password (will be hashed by pre-save middleware)
        user.password = newPassword;
        await user.save();

        logger.info(`Password reset successful for user: ${username}`);

        return res.status(StatusCodes.OK).json(
            new ApiResponse(
                StatusCodes.OK,
                null,
                "Password reset successful. You can now login with your new password."
            )
        );
    } catch (error) {
        logger.error(`Password reset failed: ${error.message}`, { stack: error.stack });
        next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Something went wrong"));
    }
});


export { registerUser, loginUser, logoutUser, getSecurityQuestion, verifySecurityAnswer, resetPassword };
