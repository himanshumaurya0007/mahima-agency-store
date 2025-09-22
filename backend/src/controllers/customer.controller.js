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
        // 1. Ensure authenticated user
        const userId = req.user?._id;
        if (!userId) {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                ReasonPhrases.UNAUTHORIZED,
                ["User not authenticated"]
            );
        }

        // 2. Extract validated request body
        const { customerAddress, ...customerData } = req.body;

        // 3. Normalize and defensive checks - Prevent same value for havmorPlatformCustomerId & temporaryCustomerId
        if (
            customerData.havmorPlatformCustomerId &&
            customerData.temporaryCustomerId &&
            customerData.havmorPlatformCustomerId === customerData.temporaryCustomerId
        ) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                ReasonPhrases.BAD_REQUEST,
                [
                    `${fields.havmorPlatformCustomerId} and ${fields.temporaryCustomerId} must not be the same value.`
                ]
            );
        }

        // 4. Cross-field database checks
        // 4.1 - Ensure new havmorPlatformCustomerId does not clash with any existing temporaryCustomerId for this user.
        if (customerData.havmorPlatformCustomerId) {
            const clashTemp = await Customer.findOne({
                userId,
                temporaryCustomerId: customerData.havmorPlatformCustomerId
            }).lean();
            if (clashTemp) {
                throw new ApiError(
                    StatusCodes.CONFLICT,
                    ReasonPhrases.CONFLICT,
                    [`Provided ${fields.havmorPlatformCustomerId} already exists as a ${fields.temporaryCustomerId}.`]
                );
            }
        }

        // 4.2 - Ensure new temporaryCustomerId does not clash with any existing havmorPlatformCustomerId for this user.
        if (customerData.temporaryCustomerId) {
            const clashHavmor = await Customer.findOne({
                userId,
                havmorPlatformCustomerId: customerData.temporaryCustomerId
            }).lean();
            if (clashHavmor) {
                throw new ApiError(
                    StatusCodes.CONFLICT,
                    ReasonPhrases.CONFLICT,
                    [`Provided ${fields.temporaryCustomerId} already exists as a ${fields.havmorPlatformCustomerId}.`]
                );
            }
        }

        // 5. Standard duplicate check (same-field uniqueness)
        const orConditions = [];
        if (customerData.havmorPlatformCustomerId) {
            orConditions.push({
                havmorPlatformCustomerId: customerData.havmorPlatformCustomerId
            });
        }
        if (customerData.temporaryCustomerId) {
            orConditions.push({
                temporaryCustomerId: customerData.temporaryCustomerId
            });
        }

        if (orConditions.length) {
            const existingCustomer = await Customer.findOne({
                userId,
                $or: orConditions
            }).populate("customerAddress");

            if (existingCustomer) {
                return res.status(StatusCodes.CONFLICT).json(
                    new ApiResponse(
                        StatusCodes.CONFLICT,
                        { customer: existingCustomer },
                        "Customer already exists for this user"
                    )
                );
            }
        }

        // 6. Create Address & Customer inside a transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // 6.1 Create Address
        const [addressDoc] = await Address.create([customerAddress], { session });

        // 6.2 Create Customer
        const [customerDoc] = await Customer.create(
            [
                {
                    userId,
                    ...customerData,
                    customerAddress: addressDoc._id
                }
            ],
            { session }
        );

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        logger.info(`New customer added for user ${userId}: ${customerDoc._id}`);

        // 7. Send Response
        return res.status(StatusCodes.CREATED).json(
            new ApiResponse(
                StatusCodes.CREATED,
                {
                    customer: {
                        _id: customerDoc._id,
                        customerStatus: customerDoc.customerStatus,
                        temporaryCustomerId: customerDoc.temporaryCustomerId,
                        havmorPlatformCustomerId: customerDoc.havmorPlatformCustomerId,
                        shopName: customerDoc.shopName,
                        phone: customerDoc.phone,
                        customerAddress: addressDoc
                    }
                },
                "Customer added successfully"
            )
        );
    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        // MongoDB duplicate key errors
        if (error?.code === 11000) {
            const duplicateField =
                Object.keys(error.keyPattern || {})[1] ||
                Object.keys(error.keyPattern || {})[0];

            let message;
            if (duplicateField === "temporaryCustomerId") {
                message = `Duplicate ${fields.temporaryCustomerId}: This temporary ID already exists.`;
            } else if (duplicateField === "havmorPlatformCustomerId") {
                message = `Duplicate ${fields.havmorPlatformCustomerId}: This ID already exists.`;
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
 * @desc Get all customers for the authenticated user
 * @route GET /api/v1/customer
 * @access Private
 */
const getAllCustomers = asyncHandler(async (req, res, next) => {
    try {
        // 1. Ensure authenticated user
        const userId = req.user?._id;
        if (!userId) {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                ReasonPhrases.UNAUTHORIZED,
                ["User not authenticated"]
            );
        }

        // 2. Fetch all customers for this user with addresses populated
        const customers = await Customer.find({ userId })
            .populate("customerAddress") // Populate address details
            .lean();

        // 3. Handle no customers found
        if (!customers || customers.length === 0) {
            return res.status(StatusCodes.OK).json(
                new ApiResponse(StatusCodes.OK, { customers: [] }, "No customers found")
            );
        }

        // 4. Build clean response payload
        const formattedCustomers = customers.map((customer) => ({
            _id: customer._id,
            customerStatus: customer.customerStatus,
            temporaryCustomerId: customer.temporaryCustomerId,
            havmorPlatformCustomerId: customer.havmorPlatformCustomerId,
            shopName: customer.shopName,
            phone: customer.phone,
        }));

        // 5. Send response
        return res.status(StatusCodes.OK).json(
            new ApiResponse(
                StatusCodes.OK,
                { customers: formattedCustomers },
                "Customers fetched successfully"
            )
        );
    } catch (error) {
        logger.error(`Get all customers failed: ${error.message}`, {
            stack: error.stack,
        });
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
 * @desc Get a single customer by ID (temporaryCustomerId or havmorPlatformCustomerId)
 * @route GET /api/v1/customer/:id
 * @access Private
 */
const getCustomerById = asyncHandler(async (req, res, next) => {
    try {
        // 1. Ensure authenticated user
        const userId = req.user?._id;
        if (!userId) {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                ReasonPhrases.UNAUTHORIZED,
                ["User not authenticated"]
            );
        }

        // 2. Extract ID from params (this can be havmorPlatformCustomerId or temporaryCustomerId)
        const { id } = req.params;
        if (!id) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                ReasonPhrases.BAD_REQUEST,
                ["Customer ID parameter is required"]
            );
        }

        // 3. Attempt to find customer by either havmorPlatformCustomerId or temporaryCustomerId for this user
        const customer = await Customer.findOne({
            userId,
            $or: [
                { havmorPlatformCustomerId: id },
                { temporaryCustomerId: id }
            ]
        }).populate("customerAddress");

        // 4. Handle customer not found
        if (!customer) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                ReasonPhrases.NOT_FOUND,
                ["Customer not found for this user"]
            );
        }

        // 5. Build clean response payload
        const formattedCustomer = {
            _id: customer._id,
            customerStatus: customer.customerStatus,
            temporaryCustomerId: customer.temporaryCustomerId,
            havmorPlatformCustomerId: customer.havmorPlatformCustomerId,
            shopName: customer.shopName,
            phone: customer.phone,
            customerAddress: customer.customerAddress,
        };

        // 6. Send response
        return res.status(StatusCodes.OK).json(
            new ApiResponse(
                StatusCodes.OK,
                { customer: formattedCustomer },
                "Customer fetched successfully"
            )
        );
    } catch (error) {
        logger.error(`Get customer by ID failed: ${error.message}`, {
            stack: error.stack
        });
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
 * @desc Update a customer (by havmorPlatformCustomerId or temporaryCustomerId)
 * @route PUT /api/v1/customer/:id
 * @access Private
 */
const updateCustomer = asyncHandler(async (req, res, next) => {
    let session;

    try {
        // 1. Ensure authenticated user
        const userId = req.user?._id;
        if (!userId) {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                ReasonPhrases.UNAUTHORIZED,
                ["User not authenticated"]
            );
        }

        // 2. Extract ID from params
        const { id } = req.params;
        if (!id) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                ReasonPhrases.BAD_REQUEST,
                ["Customer ID parameter is required"]
            );
        }

        // 3. Extract validated request body
        const { customerAddress, ...customerData } = req.body;

        // 4. Find existing customer
        const customer = await Customer.findOne({
            userId,
            $or: [
                { havmorPlatformCustomerId: id },
                { temporaryCustomerId: id }
            ]
        }).populate("customerAddress");

        if (!customer) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                ReasonPhrases.NOT_FOUND,
                ["Customer not found for this user"]
            );
        }

        // 5. Defensive checks
        // 5.1 Prevent same havmorPlatformCustomerId & temporaryCustomerId
        if (
            customerData.havmorPlatformCustomerId &&
            customerData.temporaryCustomerId &&
            customerData.havmorPlatformCustomerId === customerData.temporaryCustomerId
        ) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                ReasonPhrases.BAD_REQUEST,
                [
                    `${fields.havmorPlatformCustomerId} and ${fields.temporaryCustomerId} must not be the same value.`
                ]
            );
        }

        // 5.2 Check cross-field clashes across other customers for this user
        // Ensure new havmorPlatformCustomerId does not clash with any existing temporaryCustomerId
        if (customerData.havmorPlatformCustomerId) {
            const clashTemp = await Customer.findOne({
                userId,
                _id: { $ne: customer._id },
                temporaryCustomerId: customerData.havmorPlatformCustomerId
            }).lean();
            if (clashTemp) {
                throw new ApiError(
                    StatusCodes.CONFLICT,
                    ReasonPhrases.CONFLICT,
                    [`Provided ${fields.havmorPlatformCustomerId} already exists as a ${fields.temporaryCustomerId}.`]
                );
            }
        }

        // Ensure new temporaryCustomerId does not clash with any existing havmorPlatformCustomerId
        if (customerData.temporaryCustomerId) {
            const clashHavmor = await Customer.findOne({
                userId,
                _id: { $ne: customer._id },
                havmorPlatformCustomerId: customerData.temporaryCustomerId
            }).lean();
            if (clashHavmor) {
                throw new ApiError(
                    StatusCodes.CONFLICT,
                    ReasonPhrases.CONFLICT,
                    [`Provided ${fields.temporaryCustomerId} already exists as a ${fields.havmorPlatformCustomerId}.`]
                );
            }
        }

        // 5.3 If status changed to PERMANENT then copy temporaryCustomerId → havmorPlatformCustomerId
        if (
            customerData.customerStatus &&
            customerData.customerStatus.toUpperCase() === "PERMANENT" &&
            !customerData.havmorPlatformCustomerId
        ) {
            customerData.havmorPlatformCustomerId =
                customer.temporaryCustomerId || customerData.temporaryCustomerId;
        }

        // 6. Begin transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // 6.1 Update Address if provided
        let updatedAddressDoc;
        if (customerAddress && customer.customerAddress) {
            updatedAddressDoc = await Address.findByIdAndUpdate(
                customer.customerAddress._id,
                customerAddress,
                { new: true, session }
            );
        } else if (customerAddress && !customer.customerAddress) {
            // if no address previously, create a new one
            const [addressDoc] = await Address.create([customerAddress], { session });
            customerData.customerAddress = addressDoc._id;
            updatedAddressDoc = addressDoc;
        }

        // 6.2 Update Customer record
        let updatedCustomer = await Customer.findByIdAndUpdate(
            customer._id,
            { $set: customerData },
            { new: true, session }
        ).populate("customerAddress");

        // NEW LOGIC: If customer is now PERMANENT and has a havmorPlatformCustomerId, remove the temporaryCustomerId inside the same transaction.
        if (
            updatedCustomer.customerStatus === "PERMANENT" &&
            updatedCustomer.havmorPlatformCustomerId
        ) {
            updatedCustomer = await Customer.findByIdAndUpdate(
                updatedCustomer._id,
                { $unset: { temporaryCustomerId: "" } },
                { new: true, session }
            ).populate("customerAddress");
        }

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        logger.info(`Customer updated for user ${userId}: ${updatedCustomer._id}`);

        // 7. Send Response
        return res.status(StatusCodes.OK).json(
            new ApiResponse(
                StatusCodes.OK,
                {
                    customer: {
                        _id: updatedCustomer._id,
                        customerStatus: updatedCustomer.customerStatus,
                        temporaryCustomerId: updatedCustomer.temporaryCustomerId,  // temporaryCustomerId will be undefined if removed
                        havmorPlatformCustomerId: updatedCustomer.havmorPlatformCustomerId,
                        shopName: updatedCustomer.shopName,
                        phone: updatedCustomer.phone,
                        customerAddress: updatedAddressDoc || updatedCustomer.customerAddress
                    }
                },
                "Customer updated successfully"
            )
        );
    } catch (error) {
        // Rollback on error
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        // MongoDB duplicate key errors
        if (error?.code === 11000) {
            const duplicateField =
                Object.keys(error.keyPattern || {})[1] ||
                Object.keys(error.keyPattern || {})[0];

            let message;
            if (duplicateField === "temporaryCustomerId") {
                message = `Duplicate ${fields.temporaryCustomerId}: This temporary ID already exists.`;
            } else if (duplicateField === "havmorPlatformCustomerId") {
                message = `Duplicate ${fields.havmorPlatformCustomerId}: This ID already exists.`;
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

        logger.error(`Update customer failed: ${error.message}`, {
            stack: error.stack
        });
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
 * @desc Delete a customer (by havmorPlatformCustomerId or temporaryCustomerId)
 * @route DELETE /api/v1/customer/:id
 * @access Private
 */
const deleteCustomer = asyncHandler(async (req, res, next) => {
    let session;

    try {
        // 1. Ensure authenticated user
        const userId = req.user?._id;
        if (!userId) {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                ReasonPhrases.UNAUTHORIZED,
                ["User not authenticated"]
            );
        }

        // 2. Extract ID from params (this can be havmorPlatformCustomerId or temporaryCustomerId)
        const { id } = req.params;
        if (!id) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                ReasonPhrases.BAD_REQUEST,
                ["Customer ID parameter is required"]
            );
        }

        // 3. Find the customer by either ID for this user
        const customer = await Customer.findOne({
            userId,
            $or: [
                { havmorPlatformCustomerId: id },
                { temporaryCustomerId: id }
            ]
        });

        if (!customer) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                ReasonPhrases.NOT_FOUND,
                ["Customer not found for this user"]
            );
        }

        // 4. Begin a transaction to delete address + customer
        session = await mongoose.startSession();
        session.startTransaction();

        // 4.1 Delete customer record
        await Customer.deleteOne({ _id: customer._id }, { session });

        // 4.2 Delete associated address (if any)
        if (customer.customerAddress) {
            await Address.deleteOne({ _id: customer.customerAddress }, { session });
        }

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        logger.info(`Customer deleted for user ${userId}: ${customer._id}`);

        // 5. Send response
        return res.status(StatusCodes.OK).json(
            new ApiResponse(
                StatusCodes.OK,
                { deletedCustomerId: customer._id },
                "Customer deleted successfully"
            )
        );
    } catch (error) {
        // Rollback on error
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        logger.error(`Delete customer failed: ${error.message}`, {
            stack: error.stack,
        });
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