// backend/src/controllers/customer.controller.js
import mongoose from "mongoose";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

import {
    asyncHandler,
    ApiResponse,
    ApiError,
    logger,
    FIELDS,
    ensureAuthenticated,
    mongooseErrorHandler,
    formatCustomer,
    checkCustomerIdClashes
} from "../utils/index.js";

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
        const userId = ensureAuthenticated(req);

        const { customerAddress, ...customerData } = req.body;

        // Check for ID clashes
        await checkCustomerIdClashes(userId, customerData);

        // Standard duplicate check
        const orConditions = [];
        if (customerData.havmorPlatformCustomerId) orConditions.push({ havmorPlatformCustomerId: customerData.havmorPlatformCustomerId });
        if (customerData.temporaryCustomerId) orConditions.push({ temporaryCustomerId: customerData.temporaryCustomerId });

        if (orConditions.length) {
            const existingCustomer = await Customer.findOne({ userId, $or: orConditions }).populate("customerAddress").lean();

            if (existingCustomer) {
                return res.status(StatusCodes.CONFLICT)
                    .json(
                        new ApiResponse(
                            StatusCodes.CONFLICT,
                            { customer: existingCustomer },
                            "Customer already exists for this user"
                        ));
            }
        }

        // Transaction: Create Address & Customer
        session = await mongoose.startSession();
        session.startTransaction();

        const [addressDoc] = await Address.create([customerAddress], { session });
        const [customerDoc] = await Customer.create([{ userId, ...customerData, customerAddress: addressDoc._id }], { session });

        await session.commitTransaction();
        session.endSession();

        logger.info(`New customer added for user ${userId}: ${customerDoc._id}`);

        return res.status(StatusCodes.CREATED)
            .json(
                new ApiResponse(
                    StatusCodes.CREATED,
                    { customer: formatCustomer(customerDoc, addressDoc) },
                    "Customer added successfully"
                ));

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        const processedError = mongooseErrorHandler(error) || error;
        next(processedError);
    }
});

/**
 * @desc Get all customers for the authenticated user
 * @route GET /api/v1/customer
 * @access Private
 */
const getAllCustomers = asyncHandler(async (req, res, next) => {
    try {
        const userId = ensureAuthenticated(req);

        const customers = await Customer.find({ userId }).populate("customerAddress").lean();

        if (!customers || customers.length === 0) {
            return res.status(StatusCodes.OK)
                .json(
                    new ApiResponse(
                        StatusCodes.OK,
                        { customers: [] },
                        "No customers found"
                    ));
        }

        const formattedCustomers = customers.map((c) => formatCustomer(c));
        return res.status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    { customers: formattedCustomers },
                    "Customers fetched successfully"
                ));

    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/**
 * @desc Get a single customer by ID
 * @route GET /api/v1/customer/:id
 * @access Private
 */
const getCustomerById = asyncHandler(async (req, res, next) => {
    try {
        const userId = ensureAuthenticated(req);

        const { id } = req.params;

        if (!id) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                ReasonPhrases.BAD_REQUEST,
                ["Customer ID parameter is required"]
            );
        }

        const customer = await Customer.findOne({ userId, $or: [{ havmorPlatformCustomerId: id }, { temporaryCustomerId: id }] }).populate("customerAddress");
        if (!customer) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                ReasonPhrases.NOT_FOUND,
                ["Customer not found for this user"]
            );
        }

        return res.status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    { customer: formatCustomer(customer) },
                    "Customer fetched successfully"
                ));

    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/**
 * @desc Update a customer by ID
 * @route PUT /api/v1/customer/:id
 * @access Private
 */
const updateCustomer = asyncHandler(async (req, res, next) => {
    let session;
    try {
        const userId = ensureAuthenticated(req);

        const { id } = req.params;

        if (!id) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                ReasonPhrases.BAD_REQUEST,
                ["Customer ID parameter is required"]
            );
        }

        const { customerAddress, ...customerData } = req.body;
        const customer = await Customer.findOne({ userId, $or: [{ havmorPlatformCustomerId: id }, { temporaryCustomerId: id }] }).populate("customerAddress");
        if (!customer) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                ReasonPhrases.NOT_FOUND,
                ["Customer not found for this user"]
            );
        }

        // Check for ID clashes
        await checkCustomerIdClashes(userId, customerData, customer._id);

        // If status changed to PERMANENT, copy temporaryCustomerId → havmorPlatformCustomerId
        if (customerData.customerStatus?.toUpperCase() === "PERMANENT" && !customerData.havmorPlatformCustomerId) {
            customerData.havmorPlatformCustomerId = customer.temporaryCustomerId || customerData.temporaryCustomerId;
        }

        // Transaction: Update Address & Customer
        session = await mongoose.startSession();
        session.startTransaction();

        let updatedAddressDoc;
        if (customerAddress && customer.customerAddress) {
            updatedAddressDoc = await Address.findByIdAndUpdate(customer.customerAddress._id, customerAddress, { new: true, session });
        } else if (customerAddress && !customer.customerAddress) {
            const [addressDoc] = await Address.create([customerAddress], { session });
            customerData.customerAddress = addressDoc._id;
            updatedAddressDoc = addressDoc;
        }

        let updatedCustomer = await Customer.findByIdAndUpdate(customer._id, { $set: customerData }, { new: true, session }).populate("customerAddress");

        // Remove temporaryCustomerId if customer is now PERMANENT
        if (updatedCustomer.customerStatus === "PERMANENT" && updatedCustomer.havmorPlatformCustomerId) {
            updatedCustomer = await Customer.findByIdAndUpdate(updatedCustomer._id, { $unset: { temporaryCustomerId: "" } }, { new: true, session }).populate("customerAddress");
        }

        await session.commitTransaction();
        session.endSession();

        logger.info(`Customer updated for user ${userId}: ${updatedCustomer._id}`);
        return res.status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    { customer: formatCustomer(updatedCustomer, updatedAddressDoc) },
                    "Customer updated successfully"
                ));

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        next(mongooseErrorHandler(error) || error);
    }
});

/**
 * @desc Delete a customer by ID
 * @route DELETE /api/v1/customer/:id
 * @access Private
 */
const deleteCustomer = asyncHandler(async (req, res, next) => {
    let session;
    try {
        const userId = ensureAuthenticated(req);

        const { id } = req.params;

        if (!id) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                ReasonPhrases.BAD_REQUEST,
                ["Customer ID parameter is required"]
            );
        }

        const customer = await Customer.findOne({ userId, $or: [{ havmorPlatformCustomerId: id }, { temporaryCustomerId: id }] });
        if (!customer) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                ReasonPhrases.NOT_FOUND,
                ["Customer not found for this user"]
            );
        }

        session = await mongoose.startSession();
        session.startTransaction();

        await Customer.deleteOne({ _id: customer._id }, { session });
        if (customer.customerAddress) await Address.deleteOne({ _id: customer.customerAddress }, { session });

        await session.commitTransaction();
        session.endSession();

        logger.info(`Customer deleted for user ${userId}: ${customer._id}`);
        return res.status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    { deletedCustomerId: customer._id },
                    "Customer deleted successfully"
                ));

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        next(mongooseErrorHandler(error) || error);
    }
});

export {
    addCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
};