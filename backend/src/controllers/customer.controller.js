import mongoose from "mongoose";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";
import { fields } from "../utils/fields.js";

import { Customer } from "../models/customer.model.js";
import { Address } from "../models/address.model.js";

/**
 * @desc Add a new customer (idempotent)
 * @route POST /api/v1/customer
 * @access Private
 */
const addCustomer = asyncHandler(async (req, res, next) => {
    let session;
    try {
        const userId = req.user?._id;
        if (!userId) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED, [
                "User not authenticated",
            ]);
        }

        // Extract customerAddress separately
        const { customerAddress, ...customerData } = req.body;

        // 1. Check for existing customer by havmorPlatformCustomerId or phone
        const existingCustomer = await Customer.findOne({
            userId,
            $or: [
                { havmorPlatformCustomerId: customerData.havmorPlatformCustomerId },
                { phone: customerData.phone.startsWith("+91") ? customerData.phone : `+91${customerData.phone}` },
            ],
        }).populate("customerAddress");

        if (existingCustomer) {
            return res.status(StatusCodes.CONFLICT).json(
                new ApiResponse(StatusCodes.CONFLICT, {
                    customer: existingCustomer,
                }, "Customer already exists for this user")
            );
        }

        // 2. Start transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // 3. Create Address doc
        const addressDoc = await Address.create([customerAddress], { session });
        const addressId = addressDoc[0]._id;

        // 4. Create Customer doc
        const customer = await Customer.create(
            [
                {
                    userId,
                    ...customerData,
                    customerAddress: addressId,
                },
            ],
            { session }
        );

        // 5. Commit
        await session.commitTransaction();
        session.endSession();

        logger.info(`New customer added for user ${userId}: ${customer[0]._id}`);

        return res.status(StatusCodes.CREATED).json(
            new ApiResponse(
                StatusCodes.CREATED,
                {
                    customer: {
                        _id: customer[0]._id,
                        havmorPlatformCustomerId: customer[0].havmorPlatformCustomerId,
                        shopName: customer[0].shopName,
                        phone: customer[0].phone,
                        customerAddress: addressDoc[0],
                    },
                },
                "Customer added successfully"
            )
        );
    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        // Handle duplicate key errors from MongoDB
        if (error?.code === 11000) {
            const duplicateField =
                Object.keys(error.keyPattern || {})[1] ||
                Object.keys(error.keyPattern || {})[0];
            let message;
            if (duplicateField === "havmorPlatformCustomerId") {
                message = `Duplicate ${fields.havmorPlatformCustomerId}: This ID already exists for this user.`;
            } else if (duplicateField === "phone") {
                message = `Duplicate ${fields.phone}: This phone already exists for this user.`;
            } else {
                message = "Duplicate key error.";
            }
            logger.warn(`Duplicate customer entry for user: ${req.user?._id} - ${message}`);
            return next(
                new ApiError(StatusCodes.CONFLICT, ReasonPhrases.CONFLICT, [message])
            );
        }

        logger.error(`Add customer failed: ${error.message}`, { stack: error.stack });
        next(
            error instanceof ApiError
                ? error
                : new ApiError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    ReasonPhrases.INTERNAL_SERVER_ERROR,
                    [error.message]
                )
        );
    }
});

/**
 * @desc Get all customers of the authenticated user
 * @route GET /api/v1/customer
 * @access Private
 */
const getAllCustomers = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED, [
                "User not authenticated",
            ]);
        }

        // Fetch all customers of this user, populate address
        const customers = await Customer.find({ userId })
            .populate("customerAddress") // includes address info
            .lean()
            .exec();

        // Optional: sort customers by createdAt descending
        // .sort({ createdAt: -1 })

        return res.status(StatusCodes.OK).json(
            new ApiResponse(StatusCodes.OK, { customers }, "Customers fetched successfully")
        );
    } catch (error) {
        logger.error(`Get all customers failed: ${error.message}`, { stack: error.stack });

        next(
            error instanceof ApiError
                ? error
                : new ApiError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    ReasonPhrases.INTERNAL_SERVER_ERROR,
                    [error.message]
                )
        );
    }
});

/**
 * @desc Get a single customer by ID (only if owned by the authenticated user)
 * @route GET /api/v1/customer/:id
 * @access Private
 */
const getCustomerById = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED, [
                "User not authenticated",
            ]);
        }

        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST, [
                "Invalid customer ID format",
            ]);
        }

        // Find customer belonging to this user
        const customer = await Customer.findOne({ _id: id, userId })
            .populate("customerAddress")
            .lean()
            .exec();

        if (!customer) {
            throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, [
                "Customer not found or not accessible",
            ]);
        }

        return res.status(StatusCodes.OK).json(
            new ApiResponse(StatusCodes.OK, { customer }, "Customer fetched successfully")
        );
    } catch (error) {
        logger.error(`Get customer by ID failed: ${error.message}`, { stack: error.stack });
        next(
            error instanceof ApiError
                ? error
                : new ApiError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    ReasonPhrases.INTERNAL_SERVER_ERROR,
                    [error.message]
                )
        );
    }
});

/**
 * @desc Update an existing customer (and its address) owned by the authenticated user
 * @route PUT /api/v1/customer/:id
 * @access Private
 */
const updateCustomer = asyncHandler(async (req, res, next) => {
    let session;
    try {
        const userId = req.user?._id;
        if (!userId) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED, [
                "User not authenticated",
            ]);
        }

        const { id } = req.params;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST, [
                "Invalid customer ID format",
            ]);
        }

        // Extract address separately
        const { customerAddress, ...customerData } = req.body;

        // Start transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // Find the customer owned by this user
        const customer = await Customer.findOne({ _id: id, userId }).session(session);
        if (!customer) {
            throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, [
                "Customer not found or not accessible",
            ]);
        }

        // Check for duplicates (other than the current customer)
        if (
            customerData.havmorPlatformCustomerId ||
            customerData.phone
        ) {
            const phoneToCheck = customerData.phone
                ? customerData.phone.startsWith("+91")
                    ? customerData.phone
                    : `+91${customerData.phone}`
                : undefined;

            const duplicate = await Customer.findOne({
                userId,
                _id: { $ne: id },
                $or: [
                    customerData.havmorPlatformCustomerId
                        ? { havmorPlatformCustomerId: customerData.havmorPlatformCustomerId }
                        : {},
                    phoneToCheck ? { phone: phoneToCheck } : {},
                ],
            }).session(session);

            if (duplicate) {
                await session.abortTransaction();
                session.endSession();

                return res.status(StatusCodes.CONFLICT).json(
                    new ApiResponse(StatusCodes.CONFLICT, {
                        duplicateCustomer: duplicate,
                    }, "Another customer with same havmorPlatformCustomerId or phone already exists")
                );
            }

            if (phoneToCheck) customerData.phone = phoneToCheck;
        }

        // Update address if provided
        if (customerAddress && customer.customerAddress) {
            await Address.updateOne(
                { _id: customer.customerAddress },
                { $set: customerAddress },
                { session }
            );
        }

        // Update customer data
        await Customer.updateOne(
            { _id: id, userId },
            { $set: customerData },
            { session }
        );

        // Fetch the updated customer with populated address
        const updatedCustomer = await Customer.findOne({ _id: id, userId })
            .populate("customerAddress")
            .session(session);

        await session.commitTransaction();
        session.endSession();

        logger.info(`Customer updated for user ${userId}: ${id}`);

        return res.status(StatusCodes.OK).json(
            new ApiResponse(StatusCodes.OK, { customer: updatedCustomer }, "Customer updated successfully")
        );
    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        // Handle duplicate key errors from MongoDB
        if (error?.code === 11000) {
            const duplicateField =
                Object.keys(error.keyPattern || {})[1] ||
                Object.keys(error.keyPattern || {})[0];
            let message;
            if (duplicateField === "havmorPlatformCustomerId") {
                message = `Duplicate ${fields.havmorPlatformCustomerId}: This ID already exists for this user.`;
            } else if (duplicateField === "phone") {
                message = `Duplicate ${fields.phone}: This phone already exists for this user.`;
            } else {
                message = "Duplicate key error.";
            }
            logger.warn(`Duplicate customer update for user: ${req.user?._id} - ${message}`);
            return next(
                new ApiError(StatusCodes.CONFLICT, ReasonPhrases.CONFLICT, [message])
            );
        }

        logger.error(`Update customer failed: ${error.message}`, { stack: error.stack });
        next(
            error instanceof ApiError
                ? error
                : new ApiError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    ReasonPhrases.INTERNAL_SERVER_ERROR,
                    [error.message]
                )
        );
    }
});

/**
 * @desc Delete a customer (and its associated address) owned by the authenticated user
 * @route DELETE /api/v1/customer/:id
 * @access Private
 */
const deleteCustomer = asyncHandler(async (req, res, next) => {
    let session;
    try {
        const userId = req.user?._id;
        if (!userId) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED, [
                "User not authenticated",
            ]);
        }

        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST, [
                "Invalid customer ID format",
            ]);
        }

        // Start transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // Find the customer belonging to this user
        const customer = await Customer.findOne({ _id: id, userId }).session(session);
        if (!customer) {
            throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, [
                "Customer not found or not accessible",
            ]);
        }

        // Delete address if present
        if (customer.customerAddress) {
            await Address.deleteOne({ _id: customer.customerAddress }).session(session);
        }

        // Delete customer
        await Customer.deleteOne({ _id: id, userId }).session(session);

        await session.commitTransaction();
        session.endSession();

        logger.info(`Customer deleted for user ${userId}: ${id}`);

        return res.status(StatusCodes.OK).json(
            new ApiResponse(StatusCodes.OK, null, "Customer deleted successfully")
        );
    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        logger.error(`Delete customer failed: ${error.message}`, { stack: error.stack });
        next(
            error instanceof ApiError
                ? error
                : new ApiError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    ReasonPhrases.INTERNAL_SERVER_ERROR,
                    [error.message]
                )
        );
    }
});

export { addCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer };