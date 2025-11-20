import { StatusCodes, ReasonPhrases } from "http-status-codes";

import {
    asyncHandler,
    ApiResponse,
    ApiError,
    logger,
    ensureAuthenticated,
    mongooseErrorHandler,
    formatCustomer,
    checkCustomerIdClashes
} from "../utils/index.js";

import { Customer } from "../models/customer.model.js";

/**
 * @route POST /api/v1/customers
 * @desc Add a new customer
 * @access Protected (JWT)
 */
const addCustomer = asyncHandler(async (req, res, next) => {
    try {
        const userId = ensureAuthenticated(req);

        const customerData = req.body;

        await checkCustomerIdClashes(userId, customerData);

        // Duplicate ID check
        const orConditions = [];
        if (customerData.havmorPlatformCustomerId)
            orConditions.push({ havmorPlatformCustomerId: customerData.havmorPlatformCustomerId });

        if (customerData.temporaryCustomerId)
            orConditions.push({ temporaryCustomerId: customerData.temporaryCustomerId });

        if (orConditions.length) {
            const existingCustomer = await Customer.findOne({ userId, $or: orConditions }).lean();
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

        const newCustomer = await Customer.create({
            userId,
            ...customerData
        });

        logger.info(`New customer added for user ${userId}: ${newCustomer._id}`);

        return res.status(StatusCodes.CREATED)
            .json(
                new ApiResponse(
                    StatusCodes.CREATED,
                    { customer: formatCustomer(newCustomer) },
                    "Customer added successfully"
                ));
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/**
 * @route GET /api/v1/customers
 * @desc Get all customers
 * @access Protected (JWT)
 */
const getAllCustomers = asyncHandler(async (req, res, next) => {
    try {
        const userId = ensureAuthenticated(req);

        const customers = await Customer.find({ userId }).lean();

        if (!customers.length) {
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
 * @route GET /api/v1/customers/:id
 * @desc Get a single customer by ID
 * @access Protected (JWT)
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
 * @route PUT /api/v1/customers/:id
 * @desc Update a customer by ID
 * @access Protected (JWT)
 */
const updateCustomer = asyncHandler(async (req, res, next) => {
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

        const customerUpdates = req.body;

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

        // Avoid clashes with other customers
        await checkCustomerIdClashes(userId, customerUpdates, customer._id);

        // If status changed to PERMANENT, copy temporaryCustomerId → havmorPlatformCustomerId
        if (
            customerUpdates.customerStatus?.toUpperCase() === "PERMANENT" &&
            !customerUpdates.havmorPlatformCustomerId
        ) {
            customerUpdates.havmorPlatformCustomerId =
                customer.temporaryCustomerId || customerUpdates.temporaryCustomerId;
        }
        let updatedCustomer = await Customer.findByIdAndUpdate(
            customer._id,
            { $set: customerUpdates },
            { new: true }
        );

        // Remove temporaryCustomerId if customer is now PERMANENT
        if (
            updatedCustomer.customerStatus === "PERMANENT" &&
            updatedCustomer.havmorPlatformCustomerId
        ) {
            updatedCustomer = await Customer.findByIdAndUpdate(
                updatedCustomer._id,
                { $unset: { temporaryCustomerId: "" } },
                { new: true }
            );
        }

        logger.info(`Customer updated for user ${userId}: ${updatedCustomer._id}`);

        return res.status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    { customer: formatCustomer(updatedCustomer) },
                    "Customer updated successfully"
                ));
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

/**
 * @route DELETE /api/v1/customers/:id
 * @desc Delete a customer by ID
 * @access Protected (JWT)
 */
const deleteCustomer = asyncHandler(async (req, res, next) => {
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

        await Customer.deleteOne({ _id: customer._id });

        logger.info(`Customer deleted for user ${userId}: ${customer._id}`);

        return res.status(StatusCodes.OK)
            .json(
                new ApiResponse(
                    StatusCodes.OK,
                    { deletedCustomerId: customer._id },
                    "Customer deleted successfully"
                ));
    } catch (error) {
        next(mongooseErrorHandler(error) || error);
    }
});

export {
    getAllCustomers,
    addCustomer,
    getCustomerById,
    updateCustomer,
    deleteCustomer
};