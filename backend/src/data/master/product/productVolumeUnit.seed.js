// node ./src/data/master/product/productVolumeUnit.seed.js

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config("../../../../.env");

import { ProductVolumeUnit } from "../../../models/master/productVolumeUnit.model.js";
import { FIELDS } from "../../../utils/index.js";

const PRODUCT_VOLUME_UNITS = [
    { name: "ML" },
    { name: "L" },
];

const seedProductPackSizes = async () => {
    try {
        if (!process.env.MONGO_URI || !process.env.DB_NAME) {
            throw new Error("Missing MONGO_URI or DB_NAME in .env");
        }

        await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);
        console.log("Connected to MongoDB.");

        // Clear existing
        await ProductVolumeUnit.deleteMany({});
        console.log(`Existing ${FIELDS.PRODUCT_VOLUME_UNIT} cleared.`);

        const result = await ProductVolumeUnit.insertMany(PRODUCT_VOLUME_UNITS);
        console.log(`Seeded ${result.length} ${FIELDS.PRODUCT_VOLUME_UNIT}.`);

        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
}

seedProductPackSizes();