import { StatusCodes, ReasonPhrases } from "http-status-codes";

import {
    ApiResponse,
    ApiError,
    asyncHandler,
    logger,
    mongooseErrorHandler,
    FIELDS,
    MESSAGES
} from "../../utils/index.js";

import { ProductCategory } from "../../models/master/productCategory.model.js";

/**
 * ------------------------------------------------------------------------
 * @route   POST /api/v1/master/product/category
 * @desc    Create a new product category
 * @access  Protected (JWT)
 * ------------------------------------------------------------------------
 */
const createProductCategory = asyncHandler(async (req, res, next) => {
    try {
        const { name, code } = req.body;

        // ✅ Check for duplicate category
        const existingCategory = await ProductCategory.findOne({
            $or: [{ name }, { code }]
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
                            : `${FIELDS.PRODUCT_CATEGORY_CODE} '${code}' already exists`
                    ]
                )
            );
        }

        // ✅ Create new category
        const newCategory = await ProductCategory.create({ name, code });

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
        const formattedError = mongooseErrorHandler(error) || ApiError.fromUnknown(error);
        next(formattedError);
    }
});

/**
 * ------------------------------------------------------------------------
 * @route   GET /api/v1/master/product/category
 * @desc    Retrieve all product categories
 * @access  Protected (JWT)
 * ------------------------------------------------------------------------
 */
const getAllProductCategories = asyncHandler(async (req, res, next) => {
    try {
        const categories = await ProductCategory.find().sort({ name: 1 }); // sorted alphabetically

        if (!categories.length) {
            logger.info("No product categories found in the database.");
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

        logger.info(`Fetched ${categories.length} product categories`);
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
        const formattedError = mongooseErrorHandler(error) || ApiError.fromUnknown(error);
        next(formattedError);
    }
});

/**
 * ------------------------------------------------------------------------
 * @route   GET /api/v1/master/product/category/:id
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
        const formattedError = mongooseErrorHandler(error) || ApiError.fromUnknown(error);
        next(formattedError);
    }
});

/**
 * ------------------------------------------------------------------------
 * @route   DELETE /api/v1/master/product/category/:id
 * @desc    Delete a specific product category by ID
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

        logger.info(`Deleted Product Category`, { id, name: category.name });
        return res
            .status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    category,
                    `${FIELDS.PRODUCT_CATEGORY} deleted successfully`
                )
            );
    } catch (error) {
        const formattedError = mongooseErrorHandler(error) || ApiError.fromUnknown(error);
        next(formattedError);
    }
});


export {
    createProductCategory,
    getAllProductCategories,
    getProductCategoryById,
    deleteProductCategory,
}