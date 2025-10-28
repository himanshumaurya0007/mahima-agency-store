// node ./src/data/master/product/productPackSize.seed.js

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config("../../../../.env");

import { ProductPackSize } from "../../../models/master/productPackSize.model.js";
import { FIELDS } from "../../../utils/index.js";

const PACK_SIZES = [
    { name: "[1x1]" },
    { name: "[1x8]" },
    { name: "[1x10]" },
    { name: "[1x12]" },
    { name: "[1x14]" },
    { name: "[1x16]" },
    { name: "[1x18]" },
    { name: "[1x20]" },
    { name: "[1x21]" },
    { name: "[1x30]" },
    { name: "[1x24]" },
    { name: "[1+1]" },
];

const seedProductPackSizes = async () => {
    try {
        if (!process.env.MONGO_URI || !process.env.DB_NAME) {
            throw new Error("Missing MONGO_URI or DB_NAME in .env");
        }

        await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);
        console.log("Connected to MongoDB.");

        // Clear existing
        await ProductPackSize.deleteMany({});
        console.log(`Existing ${FIELDS.PACK_SIZE} cleared.`);

        const result = await ProductPackSize.insertMany(PACK_SIZES);
        console.log(`Seeded ${result.length} ${FIELDS.PACK_SIZE}.`);

        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
}

seedProductPackSizes();