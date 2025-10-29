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

import { ProductVolumeUnit } from "../../models/master/productVolumeUnit.model.js";

/**
 * ============================================================================
 * 🧩 PRODUCT VOLUME UNIT CONTROLLER
 * ----------------------------------------------------------------------------
 * CRUD operations:
 *  - Create
 *  - Read all
 *  - Read by ID
 *  - Update (Soft delete via isActive)
 *  - Hard delete
 * ============================================================================
 */

/* ----------------------------------------------------------------------------
 * 🟢 CREATE PRODUCT VOLUME UNIT
 * ---------------------------------------------------------------------------- */
const createProductVolumeUnit = asyncHandler(async (req, res, next) => {
    try {
        const { name, isActive } = req.body;

        // Validate required field
        if (!name?.trim()) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                MESSAGES.REQUIRED(FIELDS.VOLUME_UNIT)
            );
        }

        // Check for existing record (case-insensitive)
        const existing = await ProductVolumeUnit.findOne({
            name: name.toUpperCase(),
        });
        if (existing) {
            throw new ApiError(
                StatusCodes.CONFLICT,
                MESSAGES.DUPLICATE_VALUE(FIELDS.VOLUME_UNIT),
                [`${FIELDS.VOLUME_UNIT} '${name}' already exists`]
            );
        }

        const volumeUnit = await ProductVolumeUnit.create({
            name: name.toUpperCase(),
            isActive: typeof isActive === "boolean" ? isActive : true,
        });

        logger.info(`✅ Created ${FIELDS.VOLUME_UNIT}: ${volumeUnit.name}`);

        return res
            .status(StatusCodes.CREATED)
            .json(
                new ApiResponse(
                    StatusCodes.CREATED,
                    volumeUnit,
                    `${FIELDS.VOLUME_UNIT} created successfully`
                )
            );
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/* ----------------------------------------------------------------------------
 * 🟡 GET ALL PRODUCT VOLUME UNITS
 * ---------------------------------------------------------------------------- */
const getAllProductVolumeUnits = asyncHandler(async (req, res, next) => {
    try {
        const volumeUnits = await ProductVolumeUnit.find().sort({ name: 1 });

        return res
            .status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    volumeUnits,
                    `${FIELDS.VOLUME_UNIT}s fetched successfully`
                )
            );
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/* ----------------------------------------------------------------------------
 * 🟠 GET PRODUCT VOLUME UNIT BY ID
 * ---------------------------------------------------------------------------- */
const getProductVolumeUnitById = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;

        const volumeUnit = await ProductVolumeUnit.findById(id);
        if (!volumeUnit) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                MESSAGES.NOT_FOUND(FIELDS.VOLUME_UNIT)
            );
        }

        return res
            .status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    volumeUnit,
                    `${FIELDS.VOLUME_UNIT} fetched successfully`
                )
            );
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/* ----------------------------------------------------------------------------
 * 🧯 UPDATE PRODUCT VOLUME UNIT (Soft Delete / Enable Disable)
 * ---------------------------------------------------------------------------- */
const updateProductVolumeUnitStatus = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                MESSAGES.BOOLEAN_BASE(FIELDS.IS_ACTIVE),
                [`${FIELDS.IS_ACTIVE} must be true or false`]
            );
        }

        const volumeUnit = await ProductVolumeUnit.findById(id);
        if (!volumeUnit) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                MESSAGES.NOT_FOUND(FIELDS.VOLUME_UNIT)
            );
        }

        volumeUnit.isActive = isActive;
        await volumeUnit.save();

        const message = isActive
            ? `${FIELDS.VOLUME_UNIT} enabled successfully`
            : `${FIELDS.VOLUME_UNIT} disabled successfully`;

        logger.info(
            `🟠 Updated ${FIELDS.VOLUME_UNIT} (${volumeUnit.name}) → isActive=${isActive}`
        );

        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, volumeUnit, message));
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/* ----------------------------------------------------------------------------
 * 🔴 HARD DELETE PRODUCT VOLUME UNIT
 * ---------------------------------------------------------------------------- */
const deleteProductVolumeUnit = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;

        const volumeUnit = await ProductVolumeUnit.findById(id);
        if (!volumeUnit) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                MESSAGES.NOT_FOUND(FIELDS.VOLUME_UNIT)
            );
        }

        await ProductVolumeUnit.findByIdAndDelete(id);

        logger.warn(`🗑️ Deleted ${FIELDS.VOLUME_UNIT}: ${volumeUnit.name}`);

        return res
            .status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    null,
                    `${FIELDS.VOLUME_UNIT} deleted successfully`
                )
            );
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

export {
    getAllProductVolumeUnits,
    createProductVolumeUnit,
    getProductVolumeUnitById,
    updateProductVolumeUnitStatus,
    deleteProductVolumeUnit
};