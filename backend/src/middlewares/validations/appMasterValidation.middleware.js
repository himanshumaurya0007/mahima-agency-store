import { createValidator } from "./index.js";

// Address indian-states
import { addressindianStateValidationSchema } from "../../validations/master/addressIndianState.validation.js";

export const validateAddressindianState = createValidator(
    addressindianStateValidationSchema,
    "Address Indian State"
);

// Product category
import { productCategoryValidationSchema } from "../../validations/master/productCategory.validation.js";

export const validateProductCategory = createValidator(
    productCategoryValidationSchema,
    "Product Category"
);

// Product pack size
import { productPackSizeValidationSchema } from "../../validations/master/productPackSize.validation.js";

export const validateProductPackSize = createValidator(
    productPackSizeValidationSchema,
    "Product Pack Size"
);

// Product volume unit
import { productVolumeUnitValidationSchema } from "../../validations/master/productVolumeUnit.validation.js";

export const validateProductVolumeUnit = createValidator(
    productVolumeUnitValidationSchema,
    "Product Volume Unit"
);
