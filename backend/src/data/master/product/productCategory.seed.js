// node ./src/data/master/product/productCategory.seed.js

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config("../../../../.env");

import { FIELDS } from "../../../utils/index.js";
import { ProductCategory } from "../../../models/master/productCategory.model.js";

const PRODUCT_CATEGORIES_WITH_CODES = [
    { name: "BLOCKBUSTERS", code: "BB", isActive: true },
    { name: "BULKS", code: "BP", isActive: true },
    { name: "CANDIES", code: "CANDY", isActive: true },
    { name: "KULFIES", code: "KULFY", isActive: true },
    { name: "CONES", code: "CONE", isActive: true },
    { name: "BIG CUP", code: "B/C", isActive: true },
    { name: "JUMBO CUP", code: "J/C", isActive: true },
    { name: "CUPS", code: "CUP", isActive: true },
    { name: "NOVELTIES", code: "NOVELTY", isActive: true },
    { name: "COMBOS", code: "COMBO", isActive: true },
    { name: "TUBS", code: "TUB", isActive: true },
    { name: "CAKES", code: "CAKE", isActive: true },
];

const seedProductCategoryWithCodes = async () => {
    try {
        const { MONGO_URI, DB_NAME } = process.env;

        if (!MONGO_URI || !DB_NAME) {
            throw new Error("Missing MONGO_URI or DB_NAME in .env");
        }

        await mongoose.connect(`${MONGO_URI}/${DB_NAME}`);
        console.log("✅ Connected to MongoDB.");

        // 🔄 Clear existing categories
        await ProductCategory.deleteMany({});
        console.log(`🧹 Existing ${FIELDS.PRODUCT_CATEGORY}s cleared.`);

        // 🌱 Insert seed data
        const result = await ProductCategory.insertMany(PRODUCT_CATEGORIES_WITH_CODES);
        console.log(`🌿 Seeded ${result.length} ${FIELDS.PRODUCT_CATEGORY}s successfully.`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding error:", error);
        process.exit(1);
    }
};

// Execute seeding
seedProductCategoryWithCodes();
