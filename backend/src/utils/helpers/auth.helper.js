import { StatusCodes, ReasonPhrases } from "http-status-codes";

import { ApiError } from "../core/index.js";

export const ensureAuthenticated = (req) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            ReasonPhrases.UNAUTHORIZED,
            ["User not authenticated"]
        );
    }

    return userId;
};