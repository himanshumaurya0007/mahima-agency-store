import { StatusCodes } from "http-status-codes";

import {
    ApiResponse,
    ApiError,
    asyncHandler,
    logger,
    mongooseErrorHandler,
    FIELDS,
    MESSAGES,
} from "../../utils/index.js";

import { AddressIndianState } from "../../models/master/addressIndianState.model.js";

/**
 * ------------------------------------------------------------------------
 * @route   POST /api/v1/masters/addresses/indian-states
 * @desc    Create a new Indian State
 * @access  Protected (JWT)
 * ------------------------------------------------------------------------
 */
const createAddressIndianState = asyncHandler(async (req, res, next) => {
    try {
        const { name, code } = req.body;

        // Check for duplicate
        const existingState = await AddressIndianState.findOne({
            $or: [{ name }, { code }],
        });

        if (existingState) {
            logger.warn(`Duplicate Indian State creation attempt`, { name, code });

            return next(
                new ApiError(
                    StatusCodes.CONFLICT,
                    MESSAGES.DUPLICATE_VALUE(FIELDS.ADDRESS_INDIAN_STATE),
                    [
                        existingState.name === name
                            ? `${FIELDS.ADDRESS_INDIAN_STATE} '${name}' already exists`
                            : `${FIELDS.ADDRESS_INDIAN_STATE_CODE} '${code}' already exists`,
                    ]
                )
            );
        }

        // Create new state
        const newState = await AddressIndianState.create({
            name,
            code,
            isActive: true,
        });

        logger.info(`Indian State created`, { id: newState._id, name, code });

        return res
            .status(StatusCodes.CREATED)
            .json(
                new ApiResponse(
                    StatusCodes.CREATED,
                    newState,
                    `${FIELDS.ADDRESS_INDIAN_STATE} created successfully`
                )
            );
    } catch (error) {
        const formattedError =
            mongooseErrorHandler(error) || ApiError.fromUnknown(error);
        next(formattedError);
    }
});

/**
 * ------------------------------------------------------------------------
 * @route   GET /api/v1/masters/addresses/indian-states
 * @desc    Retrieve all active Indian States
 * @access  Protected (JWT)
 * ------------------------------------------------------------------------
 */
const getAllAddressIndianStates = asyncHandler(async (req, res, next) => {
    try {
        const states = await AddressIndianState.find({ isActive: true }).sort({
            name: 1,
        });

        if (!states.length) {
            logger.info("No active Indian States found.");
            return res
                .status(StatusCodes.OK)
                .json(
                    new ApiResponse(
                        StatusCodes.OK,
                        [],
                        `${FIELDS.ADDRESS_INDIAN_STATE}s not found`
                    )
                );
        }

        logger.info(`Fetched ${states.length} active Indian States`);

        return res
            .status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    states,
                    `${FIELDS.ADDRESS_INDIAN_STATE}s retrieved successfully`
                )
            );
    } catch (error) {
        const formattedError =
            mongooseErrorHandler(error) || ApiError.fromUnknown(error);
        next(formattedError);
    }
});

/**
 * ------------------------------------------------------------------------
 * @route   GET /api/v1/masters/addresses/indian-states/:id
 * @desc    Retrieve a specific Indian State by ID
 * @access  Protected (JWT)
 * ------------------------------------------------------------------------
 */
const getAddressIndianStateById = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;

        const state = await AddressIndianState.findById(id);

        if (!state) {
            logger.warn(`Indian State not found`, { id });

            return next(
                new ApiError(
                    StatusCodes.NOT_FOUND,
                    MESSAGES.NOT_FOUND(FIELDS.ADDRESS_INDIAN_STATE),
                    [`${FIELDS.ADDRESS_INDIAN_STATE} with ID '${id}' not found`]
                )
            );
        }

        logger.info(`Fetched Indian State`, { id });

        return res
            .status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    state,
                    `${FIELDS.ADDRESS_INDIAN_STATE} retrieved successfully`
                )
            );
    } catch (error) {
        const formattedError =
            mongooseErrorHandler(error) || ApiError.fromUnknown(error);
        next(formattedError);
    }
});

/**
 * ------------------------------------------------------------------------
 * @route   PUT /api/v1/masters/addresses/indian-states/:id
 * @desc    Soft delete (disable) or reactivate an Indian State
 * @access  Protected (JWT)
 * ------------------------------------------------------------------------
 */
const updateAddressIndianStateStatus = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return next(
                new ApiError(
                    StatusCodes.BAD_REQUEST,
                    MESSAGES.INVALID_VALUE(FIELDS.IS_ACTIVE),
                    [`${FIELDS.IS_ACTIVE} must be a boolean`]
                )
            );
        }

        const state = await AddressIndianState.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!state) {
            logger.warn(`Attempted to update status of non-existing Indian State`, {
                id,
            });

            return next(
                new ApiError(
                    StatusCodes.NOT_FOUND,
                    MESSAGES.NOT_FOUND(FIELDS.ADDRESS_INDIAN_STATE),
                    [`${FIELDS.ADDRESS_INDIAN_STATE} with ID '${id}' not found`]
                )
            );
        }

        const action = isActive ? "re-activated" : "disabled";

        logger.info(`Indian State ${action}`, {
            id,
            name: state.name,
        });

        return res
            .status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    state,
                    `${FIELDS.ADDRESS_INDIAN_STATE} ${action} successfully`
                )
            );
    } catch (error) {
        const formattedError =
            mongooseErrorHandler(error) || ApiError.fromUnknown(error);
        next(formattedError);
    }
});

/**
 * ------------------------------------------------------------------------
 * @route   DELETE /api/v1/masters/addresses/indian-states/:id
 * @desc    Hard delete an Indian State by ID
 * @access  Protected (JWT)
 * ------------------------------------------------------------------------
 */
const deleteAddressIndianState = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;

        const state = await AddressIndianState.findByIdAndDelete(id);

        if (!state) {
            logger.warn(`Attempted to delete non-existing Indian State`, { id });

            return next(
                new ApiError(
                    StatusCodes.NOT_FOUND,
                    MESSAGES.NOT_FOUND(FIELDS.ADDRESS_INDIAN_STATE),
                    [`${FIELDS.ADDRESS_INDIAN_STATE} with ID '${id}' not found`]
                )
            );
        }

        logger.info(`Hard deleted Indian State`, { id, name: state.name });

        return res
            .status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    state,
                    `${FIELDS.ADDRESS_INDIAN_STATE} permanently deleted successfully`
                )
            );
    } catch (error) {
        const formattedError =
            mongooseErrorHandler(error) || ApiError.fromUnknown(error);
        next(formattedError);
    }
});

export {
    createAddressIndianState,
    getAllAddressIndianStates,
    getAddressIndianStateById,
    updateAddressIndianStateStatus,
    deleteAddressIndianState,
};
