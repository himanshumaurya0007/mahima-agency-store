// constants.js
export const DB_NAME = "mahima_agency";

export const ENUMS = {
    GENDER: ["MALE", "FEMALE", "OTHER"],

    SECURITY_QUESTIONS: [
        "What was the name of your first pet?",
        "What city were you born in?",
        "What was the name of your first school?",
        "What is the name of your favorite childhood teacher?",
        "What is the title of your favorite book or movie?",
    ],

    INDIAN_STATES_WITH_ABBREVIATIONS: [
        { name: "ANDAMAN AND NICOBAR ISLANDS", code: "AN" },
        { name: "ANDHRA PRADESH", code: "AP" },
        { name: "ARUNACHAL PRADESH", code: "AR" },
        { name: "ASSAM", code: "AS" },
        { name: "BIHAR", code: "BR" },
        { name: "CHANDIGARH", code: "CH" },
        { name: "CHHATTISGARH", code: "CG" },
        { name: "DADRA AND NAGAR HAVELI AND DAMAN AND DIU", code: "DN" },
        { name: "DELHI", code: "DL" },
        { name: "GOA", code: "GA" },
        { name: "GUJARAT", code: "GJ" },
        { name: "HARYANA", code: "HR" },
        { name: "HIMACHAL PRADESH", code: "HP" },
        { name: "JAMMU AND KASHMIR", code: "JK" },
        { name: "JHARKHAND", code: "JH" },
        { name: "KARNATAKA", code: "KA" },
        { name: "KERALA", code: "KL" },
        { name: "LADAKH", code: "LA" },
        { name: "LAKSHADWEEP", code: "LD" },
        { name: "MADHYA PRADESH", code: "MP" },
        { name: "MAHARASHTRA", code: "MH" },
        { name: "MANIPUR", code: "MN" },
        { name: "MEGHALAYA", code: "ML" },
        { name: "MIZORAM", code: "MZ" },
        { name: "NAGALAND", code: "NL" },
        { name: "ODISHA", code: "OD" },
        { name: "PUDUCHERRY", code: "PY" },
        { name: "PUNJAB", code: "PB" },
        { name: "RAJASTHAN", code: "RJ" },
        { name: "SIKKIM", code: "SK" },
        { name: "TAMIL NADU", code: "TN" },
        { name: "TELANGANA", code: "TS" },
        { name: "TRIPURA", code: "TR" },
        { name: "UTTAR PRADESH", code: "UP" },
        { name: "UTTARAKHAND", code: "UK" },
        { name: "WEST BENGAL", code: "WB" },
    ],

    CUSTOMER_STATUS: [
        "TEMPORARY",
        "PERMANENT"
    ],

    PRODUCT_CATEGORIES_WITH_CODES: [
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
    ],
};

// Derived arrays for Mongoose validation:
export const INDIAN_STATE_NAMES = ENUMS.INDIAN_STATES_WITH_ABBREVIATIONS.map(s => s.name);
export const INDIAN_STATE_CODES = ENUMS.INDIAN_STATES_WITH_ABBREVIATIONS.map(s => s.code);

export const PRODUCT_CATEGORY_NAMES = ENUMS.PRODUCT_CATEGORIES_WITH_CODES.map(c => c.name);
export const PRODUCT_CATEGORY_CODES = ENUMS.PRODUCT_CATEGORIES_WITH_CODES.map(c => c.code);