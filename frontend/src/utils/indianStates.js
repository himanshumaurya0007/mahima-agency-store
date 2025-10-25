// src/utils/indianStates.js

// All 28 States + 8 UTs with state codes
export const INDIAN_STATES_WITH_ABBREVIATIONS = [
  { name: 'ANDAMAN AND NICOBAR ISLANDS', code: 'AN' },
  { name: 'ANDHRA PRADESH', code: 'AP' },
  { name: 'ARUNACHAL PRADESH', code: 'AR' },
  { name: 'ASSAM', code: 'AS' },
  { name: 'BIHAR', code: 'BR' },
  { name: 'CHANDIGARH', code: 'CH' },
  { name: 'CHHATTISGARH', code: 'CG' },
  { name: 'DADRA AND NAGAR HAVELI AND DAMAN AND DIU', code: 'DN' },
  { name: 'DELHI', code: 'DL' },
  { name: 'GOA', code: 'GA' },
  { name: 'GUJARAT', code: 'GJ' },
  { name: 'HARYANA', code: 'HR' },
  { name: 'HIMACHAL PRADESH', code: 'HP' },
  { name: 'JAMMU AND KASHMIR', code: 'JK' },
  { name: 'JHARKHAND', code: 'JH' },
  { name: 'KARNATAKA', code: 'KA' },
  { name: 'KERALA', code: 'KL' },
  { name: 'LADAKH', code: 'LA' },
  { name: 'LAKSHADWEEP', code: 'LD' },
  { name: 'MADHYA PRADESH', code: 'MP' },
  { name: 'MAHARASHTRA', code: 'MH' },
  { name: 'MANIPUR', code: 'MN' },
  { name: 'MEGHALAYA', code: 'ML' },
  { name: 'MIZORAM', code: 'MZ' },
  { name: 'NAGALAND', code: 'NL' },
  { name: 'ODISHA', code: 'OD' },
  { name: 'PUDUCHERRY', code: 'PY' },
  { name: 'PUNJAB', code: 'PB' },
  { name: 'RAJASTHAN', code: 'RJ' },
  { name: 'SIKKIM', code: 'SK' },
  { name: 'TAMIL NADU', code: 'TN' },
  { name: 'TELANGANA', code: 'TS' },
  { name: 'TRIPURA', code: 'TR' },
  { name: 'UTTAR PRADESH', code: 'UP' },
  { name: 'UTTARAKHAND', code: 'UK' },
  { name: 'WEST BENGAL', code: 'WB' },
];

// Derived arrays for dropdowns
export const INDIAN_STATE_NAMES = INDIAN_STATES_WITH_ABBREVIATIONS.map((s) => s.name);
export const INDIAN_STATE_CODES = INDIAN_STATES_WITH_ABBREVIATIONS.map((s) => s.code);

// For dropdown options (label-value pairs)
export const indianStateOptions = INDIAN_STATES_WITH_ABBREVIATIONS.map((state) => ({
  value: state.name,
  label: state.name,
  code: state.code,
}));
