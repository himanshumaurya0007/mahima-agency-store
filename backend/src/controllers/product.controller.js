import { StatusCodes, ReasonPhrases } from "http-status-codes";

import {
    ApiError,
    ApiResponse,
    asyncHandler,
    mongooseErrorHandler,
    ensureAuthenticated,
} from "../utils/index.js";

import { Product } from "../models/product.model.js";

/**
 * @route POST /api/v1/products
 * @desc Add a new product
 * @access Protected (JWT)
 */
const addProduct = asyncHandler(async (req, res, next) => {
    try {
        const userId = ensureAuthenticated(req);

        const product = await Product.create({ ...req.body, userId });

        return res.status(StatusCodes.CREATED)
            .json(
                new ApiResponse(
                    StatusCodes.CREATED,
                    { product },
                    "Product created successfully"
                )
            );
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/**
 * @route GET /api/v1/products
 * @desc Get all products
 * @access Protected (JWT)
 */
const getAllProducts = asyncHandler(async (req, res, next) => {
    try {
        const userId = ensureAuthenticated(req);

        const products = await Product.find({ userId }).sort({ createdAt: -1 }).lean();

        return res.status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    { products },
                    products.length ? "Products retrieved successfully" : "No products found"
                )
            );
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/**
 * @route GET /api/v1/products/:id
 * @desc Get a single product by ID
 * @access Protected (JWT)
 */
const getProductById = asyncHandler(async (req, res, next) => {
    try {
        const userId = ensureAuthenticated(req);

        const { id } = req.params;

        if (!id) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                ReasonPhrases.BAD_REQUEST,
                ["Product ID parameter is required"]
            );
        }

        const product = await Product.findOne({ _id: id, userId }).lean();

        if (!product) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                ReasonPhrases.NOT_FOUND,
                ["Product not found for this user"]
            );
        }

        return res.status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    { product },
                    "Product retrieved successfully"
                )
            );
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/**
 * @route PUT /api/v1/products/:id
 * @desc Update a product by ID
 * @access Protected (JWT)
 */
const updateProduct = asyncHandler(async (req, res, next) => {
    try {
        const userId = ensureAuthenticated(req);

        const { id } = req.params;

        if (!id) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                ReasonPhrases.BAD_REQUEST,
                ["Product ID parameter is required"]
            );
        }

        const product = await Product.findOneAndUpdate(
            { _id: id, userId },
            { ...req.body },
            { new: true, runValidators: true }
        ).lean();

        if (!product) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                ReasonPhrases.NOT_FOUND,
                ["Product not found or not owned by the user"]
            );
        }

        return res.status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    { product },
                    "Product updated successfully"
                )
            );
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/**
 * @route DELETE /api/v1/products/:id
 * @desc Delete a product by ID
 * @access Protected (JWT)
 */
const deleteProduct = asyncHandler(async (req, res, next) => {
    try {
        const userId = ensureAuthenticated(req);

        const { id } = req.params;

        if (!id) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                ReasonPhrases.BAD_REQUEST,
                ["Product ID parameter is required"]
            );
        }

        const product = await Product.findOneAndDelete({ _id: id, userId }).lean();

        if (!product) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                ReasonPhrases.NOT_FOUND,
                ["Product not found or not owned by the user"]
            );
        }

        return res.status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    { deletedProductId: product._id },
                    "Product deleted successfully"
                )
            );
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

export {
    getAllProducts,
    addProduct,
    getProductById,
    updateProduct,
    deleteProduct
};
