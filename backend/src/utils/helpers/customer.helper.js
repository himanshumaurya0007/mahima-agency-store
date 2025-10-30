import { StatusCodes, ReasonPhrases } from "http-status-codes";

import { ApiError } from "../core/index.js";
import { FIELDS } from "../constants/index.js";

import { Customer } from "../../models/customer.model.js";

/**
 * Format a customer object for API response
 * @param {Object} customer - Customer document
 * @param {Object} address - Optional populated address
 * @returns {Object} Formatted customer
 */
const formatCustomer = (customer, address) => ({
    _id: customer._id,
    customerStatus: customer.customerStatus,
    temporaryCustomerId: customer.temporaryCustomerId,
    havmorPlatformCustomerId: customer.havmorPlatformCustomerId,
    shopName: customer.shopName,
    phone: customer.phone,
    customerAddress: address || customer.customerAddress,
});

/**
 * Check for cross-field clashes for a user
 * @param {String} userId - Authenticated user ID
 * @param {Object} data - Customer data (temporaryCustomerId, havmorPlatformCustomerId)
 * @param {String} excludeId - Optional: Customer _id to exclude (for updates)
 * @throws ApiError if conflicts exist
 */
const checkCustomerIdClashes = async (userId, data, excludeId = null) => {
    const { havmorPlatformCustomerId, temporaryCustomerId } = data;

    // Defensive check: IDs must not match
    if (havmorPlatformCustomerId && temporaryCustomerId && havmorPlatformCustomerId === temporaryCustomerId) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            ReasonPhrases.BAD_REQUEST,
            [`${FIELDS.HAVMOR_PLATFORM_CUSTOMER_ID} and ${FIELDS.TEMPORARY_CUSTOMER_ID} must not be the same value.`]
        );
    }

    // Check if havmorPlatformCustomerId clashes with any existing temporaryCustomerId
    if (havmorPlatformCustomerId) {
        const clashTemp = await Customer.findOne({
            userId,
            _id: { $ne: excludeId },
            temporaryCustomerId: havmorPlatformCustomerId
        }).lean();

        if (clashTemp) {
            throw new ApiError(
                StatusCodes.CONFLICT,
                ReasonPhrases.CONFLICT,
                [`Provided ${FIELDS.HAVMOR_PLATFORM_CUSTOMER_ID} already exists as a ${FIELDS.TEMPORARY_CUSTOMER_ID}.`]
            );
        }
    }

    // Check if temporaryCustomerId clashes with any existing havmorPlatformCustomerId
    if (temporaryCustomerId) {
        const clashHavmor = await Customer.findOne({
            userId,
            _id: { $ne: excludeId },
            havmorPlatformCustomerId: temporaryCustomerId
        }).lean();

        if (clashHavmor) {
            throw new ApiError(
                StatusCodes.CONFLICT,
                ReasonPhrases.CONFLICT,
                [`Provided ${FIELDS.TEMPORARY_CUSTOMER_ID} already exists as a ${FIELDS.HAVMOR_PLATFORM_CUSTOMER_ID}.`]
            );
        }
    }
};

export {
    formatCustomer,
    checkCustomerIdClashes
};
