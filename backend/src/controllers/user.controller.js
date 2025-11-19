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
 * @route   POST /api/v1/users/register
 * @desc    Register a new user (No tokens here). Validation is expected at route-level.
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res, next) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        username,
        password,
        securityQuestion,
        securityAnswer,
        place,
        city,
        state,
        stateCode,
        pinCode,
        refreshToken, // optional
    } = req.body;

    // 1) Ensure no existing user with same email OR username
    const existingUser = await findUserByEmailOrUsername({ email, username });

    if (existingUser) {
        throw new ApiError(
            StatusCodes.CONFLICT,
            ReasonPhrases.CONFLICT,
            [`${FIELDS.EMAIL} or ${FIELDS.USERNAME} already exists`]
        );
    }

    // 2) Create user
    const user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        username,
        password,
        securityQuestion,
        securityAnswer,
        place,
        city,
        state,
        stateCode,
        pinCode,
        refreshToken: refreshToken ?? null,
    });

    logger.info(`New user registered: ${user.email} (id: ${user._id})`);

    // 3) Return created user summary (no tokens)
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
                    place: user.place,
                    city: user.city,
                    state: user.state,
                    stateCode: user.stateCode,
                    pinCode: user.pinCode,
                },
            },
            "User registered successfully. Please login to continue."
        )
    );
});

/**
 * @route   POST /api/v1/users/login
 * @desc    Login user (generate tokens & set cookies)
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res, next) => {
    const { email, username, password } = req.body;

    // 1) Find user by email OR username (include password to compare)
    const user = await findUserByEmailOrUsername({ email, username }, "+password +refreshToken");

    if (!user) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            ReasonPhrases.UNAUTHORIZED,
            ["Invalid credentials"]
        );
    }

    // 2) Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            ReasonPhrases.UNAUTHORIZED,
            ["Invalid credentials"]
        );
    }

    // 3) Generate access & refresh tokens using existing helper
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // 4) Set cookies (httpOnly, secure, sameSite, etc.)
    setAuthCookies(res, accessToken, refreshToken);

    logger.info(`User logged in: ${user.username || user.email} (id: ${user._id})`);

    // 5) Return safe user info + tokens in body (cookies already set)
    return res.status(StatusCodes.OK).json(
        new ApiResponse(
            StatusCodes.OK,
            {
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    username: user.username,
                    place: user.place,
                    city: user.city,
                    state: user.state,
                    stateCode: user.stateCode,
                    pinCode: user.pinCode,
                },
                accessToken,
                refreshToken,
            },
            "Login successful"
        )
    );
});

/**
 * @route   POST /api/v1/users/logout
 * @desc    Logout user: clear cookies and invalidate refresh token in DB
 * @access  Protected (JWT)
 */
const logoutUser = asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            ReasonPhrases.UNAUTHORIZED,
            ["User not authenticated"]
        );
    }

    // Remove stored refreshToken from user document
    await User.findByIdAndUpdate(
        userId,
        { $unset: { refreshToken: "" } },
        { new: true }
    );

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
    };

    logger.info(`User logged out: ${userId}`);

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
});

/**
 * @route   GET /api/v1/users/security-question
 * @desc    Fetch security question for a user (by email or username)
 * @access  Public
 */
const fetchSecurityQuestion = asyncHandler(async (req, res, next) => {
    const { email, username } = req.query;

    const user = await findUserByEmailOrUsername({ email, username }, "+securityQuestion");

    if (!user) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            ReasonPhrases.NOT_FOUND,
            ["User not found"]
        );
    }

    logger.info(`Security question fetched for user: ${email || username}`);

    return res.status(StatusCodes.OK).json(
        new ApiResponse(
            StatusCodes.OK,
            { securityQuestion: user.securityQuestion },
            "Security question fetched successfully"
        )
    );
});

/**
 * @route   POST /api/v1/users/security-answer/verify
 * @desc    Validate user’s security answer
 * @access  Public
 */
const validateSecurityAnswerController = asyncHandler(async (req, res, next) => {
    const { email, username, securityAnswer } = req.body;

    const user = await findUserByEmailOrUsername({ email, username }, "+securityAnswer");

    if (!user) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            ReasonPhrases.NOT_FOUND,
            ["User not found"]
        );
    }

    const isAnswerValid = await user.compareSecurityAnswer(securityAnswer);

    if (!isAnswerValid) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            ReasonPhrases.UNAUTHORIZED,
            ["Invalid security answer"]
        );
    }

    logger.info(`Security answer validated for user: ${email || username}`);

    return res.status(StatusCodes.OK).json(
        new ApiResponse(
            StatusCodes.OK,
            null,
            "Security answer validated successfully"
        )
    );
});

/**
 * @route   PATCH /api/v1/users/password/reset
 * @desc    Reset user’s password (public; validated via security answer flow)
 * @access  Public
 */
const resetUserPassword = asyncHandler(async (req, res, next) => {
    const { email, username, newPassword } = req.body;

    const user = await findUserByEmailOrUsername({ email, username }, "+password");

    if (!user) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            ReasonPhrases.NOT_FOUND,
            ["User not found"]
        );
    }

    // Assign new password — pre-save hook on model will hash it
    user.password = newPassword;
    user.markModified("password");
    await user.save({ validateModifiedOnly: true });

    logger.info(`Password reset successful for user: ${email || username}`);

    return res.status(StatusCodes.OK).json(
        new ApiResponse(
            StatusCodes.OK,
            null,
            "Password reset successfully. Please login with your new password."
        )
    );
});

/**
 * @route   POST /api/v1/users/tokens
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
const refreshTokens = asyncHandler(async (req, res, next) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            ReasonPhrases.UNAUTHORIZED,
            ["Refresh token missing"]
        );
    }

    // Verify signature & expiry
    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            ReasonPhrases.UNAUTHORIZED,
            ["Invalid or expired refresh token"]
        );
    }

    // Validate user exists and stored refreshToken matches incoming one
    const user = await User.findById(decodedToken?._id).select("+refreshToken");
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

    // Generate new tokens (helper expected to handle persistence)
    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Set cookies
    setAuthCookies(res, accessToken, newRefreshToken);

    logger.info(`Access token refreshed for user: ${user.username || user.email} (id: ${user._id})`);

    return res.status(StatusCodes.OK).json(
        new ApiResponse(
            StatusCodes.OK,
            {
                accessToken,
                refreshToken: newRefreshToken,
            },
            "Access token refreshed successfully"
        )
    );
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