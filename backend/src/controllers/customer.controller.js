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


export { addCustomer, getAllCustomers };