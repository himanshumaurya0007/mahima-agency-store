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

import { ProductPackSize } from "../../models/master/productPackSize.model.js";

/**
 * ============================================================================
 * 🧩 PRODUCT PACK SIZE CONTROLLER
 * ----------------------------------------------------------------------------
 * CRUD operations:
 *  - Create
 *  - Read all
 *  - Read by ID
 *  - Update (soft delete via isActive)
 *  - Hard delete
 * ============================================================================
 */

/* ----------------------------------------------------------------------------
 * 🟢 CREATE PRODUCT PACK SIZE
 * ---------------------------------------------------------------------------- */
const createProductPackSize = asyncHandler(async (req, res, next) => {
    try {
        const { name } = req.body;

        if (!name?.trim()) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                MESSAGES.REQUIRED(FIELDS.PACK_SIZE)
            );
        }

        const existing = await ProductPackSize.findOne({ name: name.toUpperCase() });
        if (existing) {
            throw new ApiError(
                StatusCodes.CONFLICT,
                MESSAGES.DUPLICATE_VALUE(FIELDS.PACK_SIZE),
                [`${FIELDS.PACK_SIZE} '${name}' already exists`]
            );
        }

        const packSize = await ProductPackSize.create({
            name: name.toUpperCase(),
            isActive: true,
        });

        logger.info(`✅ Created ${FIELDS.PACK_SIZE}: ${packSize.name}`);

        return res
            .status(StatusCodes.CREATED)
            .json(
                new ApiResponse(
                    StatusCodes.CREATED,
                    packSize,
                    `${FIELDS.PACK_SIZE} created successfully`
                )
            );
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/* ----------------------------------------------------------------------------
 * 🟡 GET ALL PRODUCT PACK SIZES
 * ---------------------------------------------------------------------------- */
const getAllProductPackSizes = asyncHandler(async (req, res, next) => {
    try {
        const packSizes = await ProductPackSize.find().sort({ name: 1 });

        return res
            .status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    packSizes,
                    `${FIELDS.PACK_SIZE}s fetched successfully`
                )
            );
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/* ----------------------------------------------------------------------------
 * 🟠 GET PRODUCT PACK SIZE BY ID
 * ---------------------------------------------------------------------------- */
const getProductPackSizeById = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;

        const packSize = await ProductPackSize.findById(id);
        if (!packSize) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                MESSAGES.NOT_FOUND(FIELDS.PACK_SIZE)
            );
        }

        return res
            .status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    packSize,
                    `${FIELDS.PACK_SIZE} fetched successfully`
                )
            );
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/* ----------------------------------------------------------------------------
 * 🧯 UPDATE PRODUCT PACK SIZE (Soft Delete via isActive)
 * ---------------------------------------------------------------------------- */
const updateProductPackSizeStatus = asyncHandler(async (req, res, next) => {
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

        const packSize = await ProductPackSize.findById(id);
        if (!packSize) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                MESSAGES.NOT_FOUND(FIELDS.PACK_SIZE)
            );
        }

        packSize.isActive = isActive;
        await packSize.save();

        const message = isActive
            ? `${FIELDS.PACK_SIZE} enabled successfully`
            : `${FIELDS.PACK_SIZE} disabled successfully`;

        logger.info(
            `🟠 Updated ${FIELDS.PACK_SIZE} (${packSize.name}) → isActive=${isActive}`
        );

        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, packSize, message));
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/* ----------------------------------------------------------------------------
 * 🔴 HARD DELETE PRODUCT PACK SIZE
 * ---------------------------------------------------------------------------- */
const deleteProductPackSize = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;

        const packSize = await ProductPackSize.findById(id);
        if (!packSize) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                MESSAGES.NOT_FOUND(FIELDS.PACK_SIZE)
            );
        }

        await ProductPackSize.findByIdAndDelete(id);

        logger.warn(`🗑️ Deleted ${FIELDS.PACK_SIZE}: ${packSize.name}`);

        return res
            .status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    null,
                    `${FIELDS.PACK_SIZE} deleted successfully`
                )
            );
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

export {
    getAllProductPackSizes,
    createProductPackSize,
    getProductPackSizeById,
    updateProductPackSizeStatus,
    deleteProductPackSize
};