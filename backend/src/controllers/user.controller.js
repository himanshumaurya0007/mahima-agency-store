import { StatusCodes, ReasonPhrases } from "http-status-codes";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import {
    asyncHandler,
    ApiResponse,
    ApiError,
    logger,
    FIELDS,
    generateAccessAndRefreshTokens,
    setAuthCookies,
    findUserByEmailOrUsername,
    mongooseErrorHandler,
    ensureAuthenticated,
    formatUser
} from "../utils/index.js";

import { User } from "../models/user.model.js";

/**
 * @route   POST /api/v1/users/register
 * @desc    Register user
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res, next) => {
    try {
        const userData = req.body;

        const existingUser = await findUserByEmailOrUsername({
            email: userData.email,
            username: userData.username
        });

        if (existingUser) {
            throw new ApiError(
                StatusCodes.CONFLICT,
                ReasonPhrases.CONFLICT,
                [`${FIELDS.EMAIL} or ${FIELDS.USERNAME} already exists`]
            );
        }

        const newUser = await User.create({
            ...userData,
            refreshToken: userData.refreshToken ?? null,
        });

        logger.info(`New user registered: ${newUser._id}`);

        return res.status(StatusCodes.CREATED)
            .json(
                new ApiResponse(
                    StatusCodes.CREATED,
                    { user: formatUser(newUser) },
                    "User registered successfully. Please login to continue."
                ));
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/**
 * @route   POST /api/v1/users/login
 * @desc    Login user (generate tokens & set cookies)
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;

        const user = await findUserByEmailOrUsername(
            { email, username },
            "+password +refreshToken"
        );

        // Case 1: User does not exist --> Ask user to register
        if (!user) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                ReasonPhrases.NOT_FOUND,
                ["User account does not exist. Please register first and try again."]
            );
        }

        // Case 2: User exists but password is incorrect
        if (!(await user.comparePassword(password))) {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                ReasonPhrases.UNAUTHORIZED,
                ["Invalid credentials"]
            );
        }

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        setAuthCookies(res, accessToken, refreshToken);

        logger.info(`User logged in: ${user._id}`);

        return res.status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    {
                        user: formatUser(user),
                        // accessToken, // Optional: may also remove this if relying purely on cookie
                        // refreshToken,
                    },
                    "Login successful"
                ));
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/**
 * @route   POST /api/v1/users/logout
 * @desc    Logout user: clear cookies and invalidate refresh token in DB
 * @access  Protected (JWT)
 */
const logoutUser = asyncHandler(async (req, res, next) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken;

        const userId = ensureAuthenticated(req);

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        };

        // CASE 1: No refresh token cookie → Already logged out or token manually removed
        if (!incomingRefreshToken) {
            logger.warn(`Logout attempted without refresh token. user:${userId}`);

            return res.status(StatusCodes.OK)
                .clearCookie("accessToken", cookieOptions)
                .clearCookie("refreshToken", cookieOptions)
                .json(
                    new ApiResponse(
                        StatusCodes.OK,
                        null,
                        "Session already expired or invalid — logout completed."
                    ));
        }

        // Fetch user from DB including stored refresh token
        const user = await User.findById(userId).select("+refreshToken");

        if (!user) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                ReasonPhrases.NOT_FOUND,
                ["User not found"]
            );
        }

        if (!user.refreshToken) {
            // No stored token but cookie exists → suspicious or old token
            logger.warn(`User refresh token missing in DB during logout user:${userId}`);

            return res.status(StatusCodes.OK)
                .clearCookie("accessToken", cookieOptions)
                .clearCookie("refreshToken", cookieOptions)
                .json(
                    new ApiResponse(
                        StatusCodes.OK,
                        null,
                        "Logout successful"
                    ));
        }

        // Validate refresh token (compare hashed)
        const isValid = await bcrypt.compare(incomingRefreshToken, user.refreshToken);

        if (!isValid) {
            // Invalid token → possibly stolen token attempt → revoke token
            logger.error(`Refresh token mismatch during logout. Possible security event. user:${userId}`);

            user.refreshToken = null;
            await user.save({ validateBeforeSave: false });

            return res
                .clearCookie("accessToken", cookieOptions)
                .clearCookie("refreshToken", cookieOptions)
                .status(StatusCodes.OK)
                .json(
                    new ApiResponse(
                        StatusCodes.OK,
                        null,
                        "Logout forced — invalid session token cleared"
                    )
                );
        }

        // CASE: Token is valid → proper logout
        user.refreshToken = null;
        await user.save({ validateBeforeSave: false });

        logger.info(`User logged out successfully: ${userId}`);

        return res
            .clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptions)
            .status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    null,
                    "Logout successful"
                ));
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/**
 * @route   GET /api/v1/users/security-question
 * @desc    Fetch security question for a user (by email or username)
 * @access  Public
 */
const fetchSecurityQuestion = asyncHandler(async (req, res, next) => {
    try {
        const { email, username } = req.query;

        const user = await findUserByEmailOrUsername(
            { email, username },
            "+securityQuestion"
        );

        if (!user) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                ReasonPhrases.NOT_FOUND,
                ["User not found"]
            );
        }

        logger.info(`Security question fetched for user: ${email || username}`);

        return res.status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    { securityQuestion: user.securityQuestion },
                    "Security question fetched successfully"
                ));
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/**
 * @route   POST /api/v1/users/security-answer/verify
 * @desc    Validate user’s security answer
 * @access  Public
 */
const validateSecurityAnswerController = asyncHandler(async (req, res, next) => {
    try {
        const { email, username, securityAnswer } = req.body;

        const user = await findUserByEmailOrUsername(
            { email, username },
            "+securityAnswer"
        );

        if (!user) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                ReasonPhrases.NOT_FOUND,
                ["User not found"]
            );
        }

        if (!(await user.compareSecurityAnswer(securityAnswer))) {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                ReasonPhrases.UNAUTHORIZED,
                ["Invalid security answer"]
            );
        }

        logger.info(`Security answer validated for: ${email || username}`);

        return res.status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    null,
                    "Security answer validated"
                ));
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/**
 * @route   PATCH /api/v1/users/password/reset
 * @desc    Reset user’s password (public; validated via security answer flow)
 * @access  Public
 */
const resetUserPassword = asyncHandler(async (req, res, next) => {
    try {
        const { email, username, newPassword } = req.body;

        const user = await findUserByEmailOrUsername(
            { email, username },
            "+password"
        );

        if (!user) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                ReasonPhrases.NOT_FOUND,
                ["User not found"]
            );
        }

        user.password = newPassword;
        user.markModified("password");
        await user.save({ validateModifiedOnly: true });

        logger.info(`Password reset for user: ${email || username}`);

        return res.status(StatusCodes.OK).json(
            new ApiResponse(
                StatusCodes.OK,
                null,
                "Password reset successfully. Please login again."
            ));
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/**
 * @route   POST /api/v1/users/tokens
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
const refreshTokens = asyncHandler(async (req, res, next) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                ReasonPhrases.UNAUTHORIZED,
                ["Refresh token missing"]
            );
        }

        let decoded;
        try {
            decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (err) {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                ReasonPhrases.UNAUTHORIZED,
                ["Invalid or expired refresh token"]
            );
        }

        const user = await User.findById(decoded?._id).select("+refreshToken");

        if (!user) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                ReasonPhrases.NOT_FOUND,
                ["User associated with token no longer exists"]
            );
        }

        // Compare hashed refresh token
        const isValidRefreshToken = await bcrypt.compare(incomingRefreshToken, user.refreshToken);

        if (!isValidRefreshToken) {
            // Possible stolen token → Forced logout (token revocation)
            user.refreshToken = null;
            await user.save({ validateBeforeSave: false });

            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                ReasonPhrases.UNAUTHORIZED,
                ["Invalid refresh token — session revoked"]
            );
        }

        // Generate fresh Access + Refresh tokens (TOKEN ROTATION)
        const { accessToken, refreshToken: newRefreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        // Send rotated tokens back as HttpOnly cookies
        setAuthCookies(res, accessToken, newRefreshToken);

        logger.info(`Token refreshed for user ${user._id}`);

        return res.status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    // { accessToken, refreshToken },
                    null,
                    "Access token refreshed successfully"
                ));
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

// const userProfile = asyncHandler(async (req, res, next) => {
//     return res.status(StatusCodes.OK)
//         .json(
//             new ApiResponse(
//                 StatusCodes.OK,
//                 // { accessToken, refreshToken },
//                 null,
//                 "I am user"
//             ));
// });

export {
    registerUser,
    loginUser,
    logoutUser,
    fetchSecurityQuestion,
    validateSecurityAnswerController,
    resetUserPassword,
    refreshTokens,
    // userProfile
};