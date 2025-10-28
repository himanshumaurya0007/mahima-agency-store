// backend/src/controllers/master/productCategory.controller.js

import { StatusCodes } from "http-status-codes";
import { productCategoryValidationSchema } from "../../validations/master/productCategory.validation.js";
import {
    asyncHandler,
    ApiResponse,
    ApiError,
    logger,
    mongooseErrorHandler,
    MESSAGES,
    FIELDS
} from "../../utils/index.js";
import { ProductCategory } from "../../models/master/productCategory.model.js";

/**
 * ------------------------------------------------------------------------
 * 🎯 CREATE Product Category
 * @route POST /api/v1/master/product/category
 * @access Protected
 * ------------------------------------------------------------------------
 */
export const createProductCategory = asyncHandler(async (req, res, next) => {
    const { error, value } = productCategoryValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        logger.warn(`[ProductCategory] Validation failed: ${error.message}`);
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            MESSAGES.BAD_REQUEST,
            error.details.map((d) => d.message)
        );
    }

    const { category, categoryCode } = value;

    try {
        // Check for existing category
        const existing = await ProductCategory.findOne({ category });
        if (existing) {
            throw new ApiError(
                StatusCodes.CONFLICT,
                MESSAGES.DUPLICATE_VALUE(FIELDS.PRODUCT_CATEGORY)
            );
        }

        const newCategory = await ProductCategory.create({ category, categoryCode });

        logger.info(`[ProductCategory] Created: ${category} (${categoryCode})`);
        return res
            .status(StatusCodes.CREATED)
            .json(
                new ApiResponse(
                    StatusCodes.CREATED,
                    newCategory,
                    `${FIELDS.PRODUCT_CATEGORY} created successfully`
                )
            );
    } catch (err) {
        const handledError = mongooseErrorHandler(err) || ApiError.fromUnknown(err);
        return next(handledError);
    }
});

/**
 * ------------------------------------------------------------------------
 * 📋 GET All Product Categories
 * @route GET /api/v1/master/product/category
 * @access Protected
 * ------------------------------------------------------------------------
 */
export const getAllProductCategories = asyncHandler(async (req, res, next) => {
    try {
        const categories = await ProductCategory.find().sort({ category: 1 });

        if (!categories || categories.length === 0) {
            throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.NOT_FOUND(FIELDS.PRODUCT_CATEGORY));
        }

        return res
            .status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    categories,
                    `${FIELDS.PRODUCT_CATEGORY} fetched successfully`
                )
            );
    } catch (err) {
        const handledError = mongooseErrorHandler(err) || ApiError.fromUnknown(err);
        return next(handledError);
    }
});

/**
 * ------------------------------------------------------------------------
 * 🔍 GET Product Category by ID
 * @route GET /api/v1/master/product/category/:id
 * @access Protected
 * ------------------------------------------------------------------------
 */
export const getProductCategoryById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        const category = await ProductCategory.findById(id);
        if (!category) {
            throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.NOT_FOUND(FIELDS.PRODUCT_CATEGORY));
        }

        return res
            .status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    category,
                    `${FIELDS.PRODUCT_CATEGORY} fetched successfully`
                )
            );
    } catch (err) {
        const handledError = mongooseErrorHandler(err) || ApiError.fromUnknown(err);
        return next(handledError);
    }
});

/**
 * ------------------------------------------------------------------------
 * ✏️ UPDATE Product Category
 * @route PUT /api/v1/master/product/category/:id
 * @access Protected
 * ------------------------------------------------------------------------
 */
// export const updateProductCategory = asyncHandler(async (req, res, next) => {
//     const { id } = req.params;
//     const { error, value } = productCategoryValidationSchema.validate(req.body, { abortEarly: false });

//     if (error) {
//         logger.warn(`[ProductCategory] Validation failed (Update): ${error.message}`);
//         throw new ApiError(
//             StatusCodes.BAD_REQUEST,
//             MESSAGES.BAD_REQUEST,
//             error.details.map((d) => d.message)
//         );
//     }

//     const { category, categoryCode } = value;

//     try {
//         const existing = await ProductCategory.findOne({
//             category,
//             _id: { $ne: id }, // Prevent self-duplication
//         });

//         if (existing) {
//             throw new ApiError(
//                 StatusCodes.CONFLICT,
//                 MESSAGES.DUPLICATE_VALUE(FIELDS.PRODUCT_CATEGORY)
//             );
//         }

//         const updated = await ProductCategory.findByIdAndUpdate(
//             id,
//             { category, categoryCode },
//             { new: true, runValidators: true }
//         );

//         if (!updated) {
//             throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.NOT_FOUND(FIELDS.PRODUCT_CATEGORY));
//         }

//         logger.info(`[ProductCategory] Updated: ${updated.category} (${updated.categoryCode})`);

//         return res
//             .status(StatusCodes.OK)
//             .json(
//                 new ApiResponse(
//                     StatusCodes.OK,
//                     updated,
//                     `${FIELDS.PRODUCT_CATEGORY} updated successfully`
//                 )
//             );
//     } catch (err) {
//         const handledError = mongooseErrorHandler(err) || ApiError.fromUnknown(err);
//         return next(handledError);
//     }
// });

/**
 * ------------------------------------------------------------------------
 * 🗑️ DELETE Product Category by ID
 * @route DELETE /api/v1/master/product/category/:id
 * @access Protected
 * ------------------------------------------------------------------------
 */
export const deleteProductCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        const deleted = await ProductCategory.findByIdAndDelete(id);
        if (!deleted) {
            throw new ApiError(StatusCodes.NOT_FOUND, MESSAGES.NOT_FOUND(FIELDS.PRODUCT_CATEGORY));
        }

        logger.info(`[ProductCategory] Deleted: ${deleted.category} (${deleted.categoryCode})`);

        return res
            .status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    null,
                    `${FIELDS.PRODUCT_CATEGORY} deleted successfully`
                )
            );
    } catch (err) {
        const handledError = mongooseErrorHandler(err) || ApiError.fromUnknown(err);
        return next(handledError);
    }
});
