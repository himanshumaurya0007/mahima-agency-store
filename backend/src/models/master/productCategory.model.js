// import mongoose, { Schema } from "mongoose";

// import {
//     PRODUCT_CATEGORY_NAMES,
//     PRODUCT_CATEGORY_CODES,
//     ENUMS,
//     FIELDS,
//     MESSAGES
// } from "../../utils/index.js";

// /**
//  * Derive a category→code map from constants for O(1) lookup.
//  * Ensures consistent mapping across app layers.
//  */
// const CATEGORY_CODE_MAP = ENUMS.PRODUCT_CATEGORIES_WITH_CODES.reduce((acc, item) => {
//     acc[item.name.toUpperCase()] = item.code.toUpperCase();
//     return acc;
// }, {});

// const productCategorySchema = new Schema(
//     {
//         category: {
//             type: String,
//             trim: true,
//             uppercase: true,
//             required: [true, MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY)],
//             enum: {
//                 values: PRODUCT_CATEGORY_NAMES.map(name => name.toUpperCase()),
//                 message: MESSAGES.INVALID(FIELDS.PRODUCT_CATEGORY),
//             },
//             unique: true,
//         },

//         categoryCode: {
//             type: String,
//             trim: true,
//             uppercase: true,
//             required: [true, MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY_CODE)],
//             enum: {
//                 values: PRODUCT_CATEGORY_CODES.map(code => code.toUpperCase()),
//                 message: MESSAGES.INVALID(FIELDS.PRODUCT_CATEGORY_CODE),
//             },
//             immutable: true,
//         },
//     },
//     {
//         timestamps: true,
//         versionKey: false,
//     }
// );

// /**
//  * Pre-validate middleware:
//  * Ensures categoryCode is always auto-filled
//  * whenever a category is set or modified.
//  */
// productCategorySchema.pre("validate", function (next) {
//     if (this.category) {
//         const code = CATEGORY_CODE_MAP[this.category.toUpperCase()];
//         if (!code) {
//             return next(new Error(`Invalid category: ${this.category}`));
//         }
//         this.categoryCode = code;
//     }
//     next();
// });

// export const ProductCategory = mongoose.model("ProductCategory", productCategorySchema, "product_categories");  // ✅ explicit collection name

import mongoose, { Schema } from "mongoose";
import {
    PRODUCT_CATEGORY_NAMES,
    PRODUCT_CATEGORY_CODES,
    ENUMS,
    FIELDS,
    MESSAGES
} from "../../utils/index.js";

/**
 * ------------------------------------------------------------------------
 * 📘 CATEGORY → CODE MAP
 * Ensures consistent category-code mapping across all layers.
 * ------------------------------------------------------------------------
 */
const CATEGORY_CODE_MAP = ENUMS.PRODUCT_CATEGORIES_WITH_CODES.reduce((acc, item) => {
    acc[item.name.toUpperCase()] = item.code.toUpperCase();
    return acc;
}, {});

/**
 * ------------------------------------------------------------------------
 * 🧱 PRODUCT CATEGORY SCHEMA
 * ------------------------------------------------------------------------
 */
const productCategorySchema = new Schema(
    {
        category: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY)],
            enum: {
                values: PRODUCT_CATEGORY_NAMES.map((name) => name.toUpperCase()),
                message: MESSAGES.ENUM_BASE(
                    FIELDS.PRODUCT_CATEGORY,
                    PRODUCT_CATEGORY_NAMES
                ),
            },
            unique: true, // Enforce uniqueness at the DB level
        },

        categoryCode: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY_CODE)],
            enum: {
                values: PRODUCT_CATEGORY_CODES.map((code) => code.toUpperCase()),
                message: MESSAGES.ENUM_BASE(
                    FIELDS.PRODUCT_CATEGORY_CODE,
                    PRODUCT_CATEGORY_CODES
                ),
            },
            immutable: true, // Prevent modifications after creation
        },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: "product_categories",
    }
);

/**
 * ------------------------------------------------------------------------
 * 🧩 PRE-VALIDATION HOOK
 * Ensures `categoryCode` auto-populates based on `category`.
 * ------------------------------------------------------------------------
 */
productCategorySchema.pre("validate", function (next) {
    if (this.category) {
        const code = CATEGORY_CODE_MAP[this.category.toUpperCase()];
        if (!code) {
            // Use unified error messaging style
            return next(
                new Error(MESSAGES.INVALID_VALUE(`${FIELDS.PRODUCT_CATEGORY} (${this.category})`))
            );
        }
        this.categoryCode = code;
    }
    next();
});

/**
 * ------------------------------------------------------------------------
 * ✅ MODEL EXPORT
 * Explicit collection name ensures consistent DB naming
 * ------------------------------------------------------------------------
 */
export const ProductCategory = mongoose.model(
    "ProductCategory",
    productCategorySchema,
    "product_categories"
);
