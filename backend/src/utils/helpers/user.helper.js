import { StatusCodes, ReasonPhrases } from "http-status-codes";

import { ApiError } from "../core/index.js";

/**
 * Format a user object for API responses
 * @param {Object} user - Mongoose User document or plain object
 * @returns {Object} Formatted user object (safe for clients)
 */
const formatUser = (user) => ({
    _id: user._id,

    // Basic identity fields
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    username: user.username,

    // Security (excludes sensitive fields)
    securityQuestion: user.securityQuestion,

    // Address fields
    place: user.place,
    city: user.city,
    state: user.state,
    stateCode: user.stateCode,
    pinCode: user.pinCode,

    // Metadata
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

const ensureAuthenticated = (req) => {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            ReasonPhrases.UNAUTHORIZED,
            ["User not authenticated"]
        );
    }

    return userId;
};

export {
    ensureAuthenticated,
    formatUser
};