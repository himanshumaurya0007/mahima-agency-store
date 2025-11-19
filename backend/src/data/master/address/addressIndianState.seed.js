// node ./src/data/master/address/addressIndianState.seed.js

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config("../../../../.env");

import { FIELDS } from "../../../utils/index.js";
import { AddressIndianState } from "../../../models/master/addressIndianState.model.js";

const INDIAN_STATES_WITH_CODES = [
    { name: "ANDAMAN AND NICOBAR ISLANDS", code: "AN", isActive: true },
    { name: "ANDHRA PRADESH", code: "AP", isActive: true },
    { name: "ARUNACHAL PRADESH", code: "AR", isActive: true },
    { name: "ASSAM", code: "AS", isActive: true },
    { name: "BIHAR", code: "BR", isActive: true },
    { name: "CHANDIGARH", code: "CH", isActive: true },
    { name: "CHHATTISGARH", code: "CG", isActive: true },
    { name: "DADRA AND NAGAR HAVELI AND DAMAN AND DIU", code: "DN", isActive: true },
    { name: "DELHI", code: "DL", isActive: true },
    { name: "GOA", code: "GA", isActive: true },
    { name: "GUJARAT", code: "GJ", isActive: true },
    { name: "HARYANA", code: "HR", isActive: true },
    { name: "HIMACHAL PRADESH", code: "HP", isActive: true },
    { name: "JAMMU AND KASHMIR", code: "JK", isActive: true },
    { name: "JHARKHAND", code: "JH", isActive: true },
    { name: "KARNATAKA", code: "KA", isActive: true },
    { name: "KERALA", code: "KL", isActive: true },
    { name: "LADAKH", code: "LA", isActive: true },
    { name: "LAKSHADWEEP", code: "LD", isActive: true },
    { name: "MADHYA PRADESH", code: "MP", isActive: true },
    { name: "MAHARASHTRA", code: "MH", isActive: true },
    { name: "MANIPUR", code: "MN", isActive: true },
    { name: "MEGHALAYA", code: "ML", isActive: true },
    { name: "MIZORAM", code: "MZ", isActive: true },
    { name: "NAGALAND", code: "NL", isActive: true },
    { name: "ODISHA", code: "OD", isActive: true },
    { name: "PUDUCHERRY", code: "PY", isActive: true },
    { name: "PUNJAB", code: "PB", isActive: true },
    { name: "RAJASTHAN", code: "RJ", isActive: true },
    { name: "SIKKIM", code: "SK", isActive: true },
    { name: "TAMIL NADU", code: "TN", isActive: true },
    { name: "TELANGANA", code: "TS", isActive: true },
    { name: "TRIPURA", code: "TR", isActive: true },
    { name: "UTTAR PRADESH", code: "UP", isActive: true },
    { name: "UTTARAKHAND", code: "UK", isActive: true },
    { name: "WEST BENGAL", code: "WB", isActive: true },
];

const seedAddressIndianStateWithCodes = async () => {
    try {
        const { MONGO_URI, DB_NAME } = process.env;

        if (!MONGO_URI || !DB_NAME) {
            throw new Error("Missing MONGO_URI or DB_NAME in .env");
        }

        await mongoose.connect(`${MONGO_URI}/${DB_NAME}`);
        console.log("✅ Connected to MongoDB.");

        // 🔄 Clear existing categories
        await AddressIndianState.deleteMany({});
        console.log(`🧹 Existing ${FIELDS.ADDRESS_INDIAN_STATE}s cleared.`);

        // 🌱 Insert seed data
        const result = await AddressIndianState.insertMany(INDIAN_STATES_WITH_CODES);
        console.log(`🌿 Seeded ${result.length} ${FIELDS.ADDRESS_INDIAN_STATE}s successfully.`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding error:", error);
        process.exit(1);
    }
};

// Execute seeding
seedAddressIndianStateWithCodes();
