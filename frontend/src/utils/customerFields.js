// src/utils/customerFields.js

export const customerFields = {
  // Customer Fields
  customerStatus: 'Customer Status',
  temporaryCustomerId: 'Temporary Customer ID',
  havmorPlatformCustomerId: 'Havmor Platform Customer ID',
  shopName: 'Shop Name',
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email',
  phone: 'Phone Number',
  panCardNumber: 'PAN Card Number',
  gstinNumber: 'GSTIN Number',
  
  place: 'Place',
  city: 'City',
  state: 'State',
  stateCode: 'State Code',
  pinCode: 'PIN Code',
};

export const customerStatus = {
  TEMPORARY: 'TEMPORARY',
  PERMANENT: 'PERMANENT',
};

export const customerStatusOptions = [
  { value: 'TEMPORARY', label: 'Temporary Customer' },
  { value: 'PERMANENT', label: 'Permanent Customer' },
];
