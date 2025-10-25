// frontend/src/utils/constants.js

export const SECURITY_QUESTIONS = [
  'What was the name of your first pet?',
  'What city were you born in?',
  'What was the name of your first school?',
  'What is the name of your favorite childhood teacher?',
  'What is the title of your favorite book or movie?',
];

// Customer Status Constants
export const CUSTOMER_STATUS = {
  TEMPORARY: 'TEMPORARY',
  PERMANENT: 'PERMANENT',
};

// Customer Field Limits
export const CUSTOMER_LIMITS = {
  SHOP_NAME_MIN: 2,
  SHOP_NAME_MAX: 100,
  FIRST_NAME_MIN: 2,
  FIRST_NAME_MAX: 50,
  LAST_NAME_MIN: 2,
  LAST_NAME_MAX: 50,
  PLACE_MIN: 3,
  PLACE_MAX: 50,
  CITY_MIN: 2,
  CITY_MAX: 50,
  CUSTOMER_ID_LENGTH: 8,
  PIN_CODE_LENGTH: 6,
};
