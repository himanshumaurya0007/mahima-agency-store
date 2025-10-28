// node ./src/data/master/product/productCategory.seed.js

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config("../../../../.env");

import { FIELDS } from "../../../utils/index.js";

import { ProductCategory } from "../../../models/master/productCategory.model.js";

const PRODUCT_CATEGORIES_WITH_CODES = [
    { name: "BLOCKBUSTERS", code: "BB" },
    { name: "BULKS", code: "BP" },
    { name: "CANDIES", code: "CANDY" },
    { name: "KULFIES", code: "KULFY" },
    { name: "CONES", code: "CONE" },
    { name: "BIG CUP", code: "B/C" },
    { name: "JUMBO CUP", code: "J/C" },
    { name: "CUPS", code: "CUP" },
    { name: "NOVELTIES", code: "NOVELTY" },
    { name: "COMBOS", code: "COMBO" },
    { name: "TUBS", code: "TUB" },
    { name: "CAKES", code: "CAKE" },
];

const seedProductCategoryWithCodes = async () => {
    try {
        if (!process.env.MONGO_URI || !process.env.DB_NAME) {
            throw new Error("Missing MONGO_URI or DB_NAME in .env");
        }

        await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);
        console.log("Connected to MongoDB.");

        // Clear existing
        await ProductCategory.deleteMany({});
        console.log(`Existing ${FIELDS.PRODUCT_CATEGORY} cleared.`);

        const result = await ProductCategory.insertMany(PRODUCT_CATEGORIES_WITH_CODES);
        console.log(`Seeded ${result.length} ${FIELDS.PRODUCT_CATEGORY}.`);

        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
}

seedProductCategoryWithCodes();