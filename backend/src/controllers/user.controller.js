import { StatusCodes, ReasonPhrases } from "http-status-codes";
import jwt from "jsonwebtoken";

import {
    asyncHandler,
    ApiResponse,
    ApiError,
    logger,
    FIELDS,
    generateAccessAndRefreshTokens,
    setAuthCookies,
    findUserByEmailOrUsername
} from "../utils/index.js";

import { User } from "../models/user.model.js";

/**
 * @desc    Register a new user (NO tokens here)
 * @route   POST /api/v1/user/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, phone, username, password, securityQuestion, securityAnswer } = req.body;

    // 1. Check if user already exists (by email or username)
    const existingUser = await findUserByEmailOrUsername({ email, username });

    if (existingUser) {
        throw new ApiError(
            StatusCodes.CONFLICT,
            ReasonPhrases.CONFLICT,
            [`${FIELDS.EMAIL} or ${FIELDS.USERNAME} already exists`]
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

    // 3. Send response (exclude sensitive FIELDS) [WITHOUT tokens]
    return res.status(StatusCodes.CREATED)
        .json(
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
                `User registered successfully. Please login to continue.`
            ));

});

/**
 * @desc    Login user (Tokens generated here)
 * @route   POST /api/v1/user/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res, next) => {
    const { email, username, password } = req.body;

    // 1. Find user by email OR username
    const user = await findUserByEmailOrUsername({ email, username }, "+password");

    if (!user) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            ReasonPhrases.UNAUTHORIZED,
            ["Invalid credentials"]
        );
    }

    // 2. Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            ReasonPhrases.UNAUTHORIZED,
            ["Invalid credentials"]
        );
    }

    // 3. Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // 4. Set Cookies
    setAuthCookies(res, accessToken, refreshToken);

    logger.info(`User logged in: ${user.username}`);

    // 5. Send response with tokens
    return res.status(StatusCodes.OK)
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

});

/**
 * @desc    Logout user (clear tokens + invalidate refreshToken)
 * @route   POST /api/v1/user/logout
 * @access  Private (requires JWT)
 */
const logoutUser = asyncHandler(async (req, res, next) => {
    // 1. Extract authenticated userId from request
    const userId = req.user?._id; // set by verifyJWT middleware

    if (!userId) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            ReasonPhrases.UNAUTHORIZED,
            ["User not authenticated"]
        );
    }

    // 2. Invalidate refreshToken in DB (remove from user document)
    await User.findByIdAndUpdate(
        userId,
        { $unset: { refreshToken: "" } }, // remove refreshToken
        { new: true }
    );

    // 3. Cookies options
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/"
    };

    logger.info(`User logged out: ${userId}`);

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
            ));
});

/**
 * @desc    Fetch security question for a user (by email or username)
 * @route   GET /api/v1/user/security-question
 * @access  Public
 */
const fetchSecurityQuestion = asyncHandler(async (req, res, next) => {
    const { email, username } = req.query;

    // 1. Find user by email or username
    const user = await findUserByEmailOrUsername({ email, username }, "+securityQuestion");

    if (!user) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            ReasonPhrases.NOT_FOUND,
            ["User not found"]
        );
    }

    logger.info(`Security question fetched for user: ${email || username}`);

    // 2. Send response (Return only the security question (never answer))
    return res.status(StatusCodes.OK)
        .json(
            new ApiResponse(
                StatusCodes.OK,
                { securityQuestion: user.securityQuestion },
                `Security question fetched successfully`
            ));
});

/**
 * @desc    Validate user’s security answer
 * @route   POST /api/v1/user/security-answer/verify
 * @access  Public
 */
const validateSecurityAnswerController = asyncHandler(async (req, res, next) => {
    const { email, username, securityAnswer } = req.body;

    // 1. Find user
    const user = await findUserByEmailOrUsername({ email, username }, "+securityAnswer");

    if (!user) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            ReasonPhrases.NOT_FOUND,
            ["User not found"]
        );
    }

    // 2. Compare provided answer (case-sensitive)
    const isAnswerValid = await user.compareSecurityAnswer(securityAnswer);

    if (!isAnswerValid) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            ReasonPhrases.UNAUTHORIZED,
            ["Invalid security answer"]
        );
    }

    logger.info(`Security answer validated for user: ${email || username}`);

    // 3. Send response (Return success)
    return res.status(StatusCodes.OK)
        .json(
            new ApiResponse(
                StatusCodes.OK,
                null,
                `Security answer validated successfully`
            ));
});

/**
 * @desc    Reset user’s password (after security answer verified)
 * @route   PATCH /api/v1/user/password/reset
 * @access  Public
 */
const resetUserPassword = asyncHandler(async (req, res, next) => {
    const { email, username, newPassword } = req.body;

    // 1. Find user
    const user = await findUserByEmailOrUsername({ email, username }, "+password");

    if (!user) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            ReasonPhrases.NOT_FOUND,
            ["User not found"]
        );
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
            `Password reset successfully. Please login with your new password.`
        ));
});

/**
 * @desc    Refresh access token using refresh token
 * @route   POST /api/v1/user/tokens
 * @access  Public
 */
const refreshTokens = asyncHandler(async (req, res, next) => {
    // 1. Extract refresh token (from cookie or body)
    const incomingRefreshToken = req.cookies.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            ReasonPhrases.UNAUTHORIZED,
            ["Refresh token missing"]
        );
    }

    // 2. Verify refresh token signature
    let decodedToken;

    try {
        decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
    } catch (error) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            ReasonPhrases.UNAUTHORIZED,
            ["Invalid or expired refresh token"]
        );
    }


    // 3. Find user & check stored refresh token
    const user = await User.findById(decodedToken?._id);
    if (!user) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            ReasonPhrases.NOT_FOUND,
            ["User not found"]
        );
    }

    if (user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            ReasonPhrases.UNAUTHORIZED,
            ["Refresh token mismatch or already used"]
        );
    }

    // 4. Generate new access & refresh tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    // 5. Set Cookies
    setAuthCookies(res, accessToken, newRefreshToken);

    logger.info(`Access token refreshed for user: ${user.username}`);

    // 6. Send response
    return res
        .status(StatusCodes.OK)
        .json(
            new ApiResponse(
                StatusCodes.OK,
                {
                    accessToken,
                    refreshToken: newRefreshToken,
                },
                "Access token refreshed successfully"
            ));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    fetchSecurityQuestion,
    validateSecurityAnswerController,
    resetUserPassword,
    refreshTokens
};
