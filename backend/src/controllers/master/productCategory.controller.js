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

import { ProductCategory } from "../../models/master/productCategory.model.js";

/**
 * ------------------------------------------------------------------------
 * @route   POST /api/v1/masters/products/categories
 * @desc    Create a new product category
 * @access  Protected (JWT)
 * ------------------------------------------------------------------------
 */
const createProductCategory = asyncHandler(async (req, res, next) => {
    try {
        const { name, code } = req.body;

        // ✅ Check for duplicate category
        const existingCategory = await ProductCategory.findOne({
            $or: [{ name }, { code }],
        });

        if (existingCategory) {
            logger.warn(`Duplicate Product Category creation attempt`, { name, code });

            return next(
                new ApiError(
                    StatusCodes.CONFLICT,
                    MESSAGES.DUPLICATE_VALUE(FIELDS.PRODUCT_CATEGORY),
                    [
                        existingCategory.name === name
                            ? `${FIELDS.PRODUCT_CATEGORY} '${name}' already exists`
                            : `${FIELDS.PRODUCT_CATEGORY_CODE} '${code}' already exists`,
                    ]
                )
            );
        }

        // ✅ Create new category
        const newCategory = await ProductCategory.create({
            name,
            code,
            isActive: true,
        });

        logger.info(`Product Category created`, { id: newCategory._id, name, code });

        return res
            .status(StatusCodes.CREATED)
            .json(
                new ApiResponse(
                    StatusCodes.CREATED,
                    newCategory,
                    `${FIELDS.PRODUCT_CATEGORY} created successfully`
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
 * @route   GET /api/v1/masters/products/categories
 * @desc    Retrieve all active product categories
 * @access  Protected (JWT)
 * ------------------------------------------------------------------------
 */
const getAllProductCategories = asyncHandler(async (req, res, next) => {
    try {
        const categories = await ProductCategory.find({ isActive: true }).sort({
            name: 1,
        });

        if (!categories.length) {
            logger.info("No active product categories found.");
            return res
                .status(StatusCodes.OK)
                .json(
                    new ApiResponse(
                        StatusCodes.OK,
                        [],
                        `${FIELDS.PRODUCT_CATEGORY}s not found`
                    )
                );
        }

        logger.info(`Fetched ${categories.length} active product categories`);
        return res
            .status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    categories,
                    `${FIELDS.PRODUCT_CATEGORY}s retrieved successfully`
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
 * @route   GET /api/v1/masters/products/categories/:id
 * @desc    Retrieve a specific product category by ID
 * @access  Protected (JWT)
 * ------------------------------------------------------------------------
 */
const getProductCategoryById = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await ProductCategory.findById(id);
        if (!category) {
            logger.warn(`Product Category not found`, { id });
            return next(
                new ApiError(
                    StatusCodes.NOT_FOUND,
                    MESSAGES.NOT_FOUND(FIELDS.PRODUCT_CATEGORY),
                    [`${FIELDS.PRODUCT_CATEGORY} with ID '${id}' not found`]
                )
            );
        }

        logger.info(`Fetched Product Category`, { id });
        return res
            .status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    category,
                    `${FIELDS.PRODUCT_CATEGORY} retrieved successfully`
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
 * @route   PUT /api/v1/masters/products/categories/:id
 * @desc    Soft delete (disable) or reactivate a product category
 * @access  Protected (JWT)
 * ------------------------------------------------------------------------
 * Allows toggling isActive = false (disable) or true (reactivate)
 * ------------------------------------------------------------------------
 */
const updateProductCategoryStatus = asyncHandler(async (req, res, next) => {
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

        const category = await ProductCategory.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!category) {
            logger.warn(`Attempted to update status of non-existing category`, { id });
            return next(
                new ApiError(
                    StatusCodes.NOT_FOUND,
                    MESSAGES.NOT_FOUND(FIELDS.PRODUCT_CATEGORY),
                    [`${FIELDS.PRODUCT_CATEGORY} with ID '${id}' not found`]
                )
            );
        }

        const action = isActive ? "re-activated" : "disabled";
        logger.info(`Product Category ${action}`, { id, name: category.name });

        return res
            .status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    category,
                    `${FIELDS.PRODUCT_CATEGORY} ${action} successfully`
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
 * @route   DELETE /api/v1/masters/products/categories/:id
 * @desc    Hard delete a product category by ID
 * @access  Protected (JWT)
 * ------------------------------------------------------------------------
 */
const deleteProductCategory = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await ProductCategory.findByIdAndDelete(id);

        if (!category) {
            logger.warn(`Attempted to delete non-existing Product Category`, { id });
            return next(
                new ApiError(
                    StatusCodes.NOT_FOUND,
                    MESSAGES.NOT_FOUND(FIELDS.PRODUCT_CATEGORY),
                    [`${FIELDS.PRODUCT_CATEGORY} with ID '${id}' not found`]
                )
            );
        }

        logger.info(`Hard deleted Product Category`, { id, name: category.name });
        return res
            .status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    category,
                    `${FIELDS.PRODUCT_CATEGORY} permanently deleted successfully`
                )
            );
    } catch (error) {
        const formattedError =
            mongooseErrorHandler(error) || ApiError.fromUnknown(error);
        next(formattedError);
    }
});

export {
    getAllProductCategories,
    createProductCategory,
    getProductCategoryById,
    updateProductCategoryStatus,
    deleteProductCategory,
};