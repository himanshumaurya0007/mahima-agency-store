// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
// import {
//   Store,
//   User,
//   Phone,
//   Mail,
//   CreditCard,
//   MapPin,
//   Building2,
//   Hash,
//   AlertCircle,
//   ArrowLeft,
//   Loader2,
//   X,
//   CheckCircle,
//   Search,
// } from 'lucide-react';

// import customerApi from '../../services/customerApi';
// import authService from '../../services/authService';
// import { validateCustomerField, validateCustomerForm } from '../../utils/validate';
// import { customerValidationSchema } from '../../validations/customerValidationSchemas';
// import { indianStateOptions, INDIAN_STATES_WITH_ABBREVIATIONS } from '../../utils/indianStates';

// const AddCustomer = () => {
//   const navigate = useNavigate();
//   const stateInputRef = useRef(null);
//   const dropdownRef = useRef(null);

//   // ===== AUTH PROTECTION =====
//   useEffect(() => {
//     if (!authService.isAuthenticated()) {
//       navigate('/login', { replace: true });
//     }
//   }, [navigate]);

//   // ===== STATE MANAGEMENT =====
//   const [formData, setFormData] = useState({
//     customerStatus: 'TEMPORARY',
//     temporaryCustomerId: '',
//     havmorPlatformCustomerId: '',
//     shopName: '',
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     panCardNumber: '',
//     gstinNumber: '',
//     customerAddress: {
//       place: '',
//       city: '',
//       state: '',
//       stateCode: '',
//       pinCode: '',
//     },
//   });

//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [currentStep, setCurrentStep] = useState(1);

//   // ✅ Typeahead State
//   const [stateSearch, setStateSearch] = useState('');
//   const [showStateDropdown, setShowStateDropdown] = useState(false);
//   const [filteredStates, setFilteredStates] = useState(indianStateOptions);
//   const [selectedStateIndex, setSelectedStateIndex] = useState(0); // ✅ For keyboard navigation

//   // ✅ Confirmation Modal State
//   const [showConfirmModal, setShowConfirmModal] = useState(false);

//   // ===== HELPER FUNCTION TO GET STATE CODE =====
//   const getStateCode = (stateName) => {
//     const stateObj = INDIAN_STATES_WITH_ABBREVIATIONS.find((s) => s.name === stateName.toUpperCase());
//     return stateObj ? stateObj.code : '';
//   };

//   // ===== FUZZY SEARCH FOR STATES (Enhanced) =====
//   useEffect(() => {
//     if (stateSearch) {
//       const searchLower = stateSearch.toLowerCase();

//       // ✅ Fuzzy matching - checks if search term exists anywhere in state name
//       const filtered = indianStateOptions.filter((state) => {
//         const stateLower = state.label.toLowerCase();
//         // Check if state contains all characters of search in order (fuzzy match)
//         let searchIndex = 0;
//         for (let i = 0; i < stateLower.length && searchIndex < searchLower.length; i++) {
//           if (stateLower[i] === searchLower[searchIndex]) {
//             searchIndex++;
//           }
//         }
//         return searchIndex === searchLower.length || stateLower.includes(searchLower);
//       });

//       setFilteredStates(filtered);
//       setSelectedStateIndex(0); // Reset selection
//     } else {
//       setFilteredStates(indianStateOptions);
//       setSelectedStateIndex(0);
//     }
//   }, [stateSearch]);

//   // ✅ Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target) &&
//         stateInputRef.current &&
//         !stateInputRef.current.contains(event.target)
//       ) {
//         setShowStateDropdown(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // ✅ Keyboard Navigation for State Dropdown
//   const handleStateKeyDown = (e) => {
//     if (!showStateDropdown) {
//       if (e.key === 'Enter' || e.key === 'ArrowDown') {
//         setShowStateDropdown(true);
//         e.preventDefault();
//       }
//       return;
//     }

//     switch (e.key) {
//       case 'ArrowDown':
//         e.preventDefault();
//         setSelectedStateIndex((prev) => (prev < filteredStates.length - 1 ? prev + 1 : prev));
//         break;
//       case 'ArrowUp':
//         e.preventDefault();
//         setSelectedStateIndex((prev) => (prev > 0 ? prev - 1 : 0));
//         break;
//       case 'Enter':
//         e.preventDefault();
//         if (filteredStates.length > 0) {
//           handleStateSelect(filteredStates[selectedStateIndex].value);
//         }
//         break;
//       case 'Escape':
//         setShowStateDropdown(false);
//         break;
//       default:
//         break;
//     }
//   };

//   // ✅ Scroll selected item into view
//   useEffect(() => {
//     if (showStateDropdown && dropdownRef.current) {
//       const selectedElement = dropdownRef.current.children[selectedStateIndex];
//       if (selectedElement) {
//         selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
//       }
//     }
//   }, [selectedStateIndex, showStateDropdown]);

//   const handleStateSelect = (stateName) => {
//     const stateCode = getStateCode(stateName);
//     setFormData((prev) => ({
//       ...prev,
//       customerAddress: {
//         ...prev.customerAddress,
//         state: stateName,
//         stateCode: stateCode,
//       },
//     }));
//     setStateSearch(stateName);
//     setShowStateDropdown(false);
//     if (errors['customerAddress.state']) {
//       setErrors((prev) => ({ ...prev, 'customerAddress.state': '' }));
//     }
//   };

//   // ===== FORM HANDLERS =====
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (name.startsWith('customerAddress.')) {
//       const addressField = name.split('.')[1];

//       if (addressField === 'state') {
//         const stateCode = getStateCode(value);
//         setFormData((prev) => ({
//           ...prev,
//           customerAddress: {
//             ...prev.customerAddress,
//             state: value,
//             stateCode: stateCode,
//           },
//         }));
//       } else {
//         setFormData((prev) => ({
//           ...prev,
//           customerAddress: {
//             ...prev.customerAddress,
//             [addressField]: value,
//           },
//         }));
//       }

//       if (errors[name]) {
//         setErrors((prev) => ({ ...prev, [name]: '' }));
//       }
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));

//       if (errors[name]) {
//         setErrors((prev) => ({ ...prev, [name]: '' }));
//       }
//     }
//   };

//   // ===== STEP VALIDATION =====
//   const validateCurrentStep = () => {
//     const stepErrors = {};
//     let isValid = true;
//     const missingFields = [];

//     if (currentStep === 1) {
//       if (!formData.customerStatus) {
//         stepErrors.customerStatus = 'Customer status is required';
//         missingFields.push('Customer Status');
//         isValid = false;
//       }

//       if (!formData.shopName || !formData.shopName.trim()) {
//         stepErrors.shopName = 'Shop name is required';
//         missingFields.push('Shop Name');
//         isValid = false;
//       } else {
//         const shopNameError = validateCustomerField(
//           'shopName',
//           formData.shopName,
//           formData,
//           customerValidationSchema
//         );
//         if (shopNameError) {
//           stepErrors.shopName = shopNameError;
//           isValid = false;
//         }
//       }

//       if (formData.customerStatus === 'PERMANENT') {
//         if (!formData.havmorPlatformCustomerId || !formData.havmorPlatformCustomerId.trim()) {
//           stepErrors.havmorPlatformCustomerId = 'Havmor Platform ID is required for permanent customers';
//           missingFields.push('Havmor Platform ID');
//           isValid = false;
//         } else {
//           const havmorIdError = validateCustomerField(
//             'havmorPlatformCustomerId',
//             formData.havmorPlatformCustomerId,
//             formData,
//             customerValidationSchema
//           );
//           if (havmorIdError) {
//             stepErrors.havmorPlatformCustomerId = havmorIdError;
//             isValid = false;
//           }
//         }
//       }
//     } else if (currentStep === 2) {
//       if (!formData.phone || !formData.phone.trim()) {
//         stepErrors.phone = 'Phone number is required';
//         missingFields.push('Phone Number');
//         isValid = false;
//       } else {
//         const phoneError = validateCustomerField('phone', formData.phone, formData, customerValidationSchema);
//         if (phoneError) {
//           stepErrors.phone = phoneError;
//           isValid = false;
//         }
//       }

//       if (formData.email) {
//         const emailError = validateCustomerField('email', formData.email, formData, customerValidationSchema);
//         if (emailError) {
//           stepErrors.email = emailError;
//           isValid = false;
//         }
//       }

//       if (formData.panCardNumber) {
//         const panError = validateCustomerField(
//           'panCardNumber',
//           formData.panCardNumber,
//           formData,
//           customerValidationSchema
//         );
//         if (panError) {
//           stepErrors.panCardNumber = panError;
//           isValid = false;
//         }
//       }

//       if (formData.gstinNumber) {
//         const gstinError = validateCustomerField(
//           'gstinNumber',
//           formData.gstinNumber,
//           formData,
//           customerValidationSchema
//         );
//         if (gstinError) {
//           stepErrors.gstinNumber = gstinError;
//           isValid = false;
//         }
//       }
//     } else if (currentStep === 3) {
//       if (!formData.customerAddress.place || !formData.customerAddress.place.trim()) {
//         stepErrors['customerAddress.place'] = 'Place/Address is required';
//         missingFields.push('Place/Address');
//         isValid = false;
//       }

//       if (!formData.customerAddress.city || !formData.customerAddress.city.trim()) {
//         stepErrors['customerAddress.city'] = 'City is required';
//         missingFields.push('City');
//         isValid = false;
//       }

//       if (!formData.customerAddress.state || !formData.customerAddress.state.trim()) {
//         stepErrors['customerAddress.state'] = 'State is required';
//         missingFields.push('State');
//         isValid = false;
//       }

//       if (!formData.customerAddress.pinCode || !formData.customerAddress.pinCode.trim()) {
//         stepErrors['customerAddress.pinCode'] = 'PIN code is required';
//         missingFields.push('PIN Code');
//         isValid = false;
//       } else {
//         const pinError = validateCustomerField(
//           'customerAddress.pinCode',
//           formData.customerAddress.pinCode,
//           formData,
//           customerValidationSchema
//         );
//         if (pinError) {
//           stepErrors['customerAddress.pinCode'] = pinError;
//           isValid = false;
//         }
//       }
//     }

//     if (!isValid) {
//       setErrors(stepErrors);

//       if (missingFields.length > 1) {
//         toast.error(`Please fill: ${missingFields.join(', ')}`);
//       } else if (missingFields.length === 1) {
//         // Only highlight, no toast
//       } else {
//         toast.error('Please fix the form errors');
//       }
//     }

//     return isValid;
//   };

//   // ===== STEP NAVIGATION =====
//   const nextStep = () => {
//     if (validateCurrentStep()) {
//       if (currentStep < 3) {
//         setCurrentStep(currentStep + 1);
//         setErrors({});
//       }
//     }
//   };

//   const prevStep = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//       setErrors({});
//     }
//   };

//   // ✅ KEYBOARD NAVIGATION - Enter Key Handler
//   const handleFormKeyDown = (e) => {
//     // Only handle Enter key, ignore if inside state dropdown
//     if (e.key === 'Enter' && !showStateDropdown) {
//       e.preventDefault();

//       if (currentStep < 3) {
//         // Move to next step
//         nextStep();
//       } else {
//         // On last step, show confirmation
//         handleShowConfirmation(e);
//       }
//     }
//   };

//   // ===== CONFIRMATION MODAL HANDLERS =====
//   const handleShowConfirmation = (e) => {
//     e.preventDefault();

//     // Final validation
//     if (!validateCurrentStep()) {
//       return;
//     }

//     // Show confirmation modal
//     setShowConfirmModal(true);
//   };

//   const handleConfirmSubmit = async () => {
//     setLoading(true);
//     setShowConfirmModal(false);

//     try {
//       const validation = validateCustomerForm(formData, customerValidationSchema);
//       if (!validation.valid) {
//         setErrors(validation.errors);
//         toast.error('Please fix all form errors');
//         setLoading(false);
//         return;
//       }

//       setErrors({});

//       const customerData = {
//         customerStatus: formData.customerStatus.toUpperCase(),
//         shopName: formData.shopName.trim(),
//         phone: formData.phone.trim(),
//         customerAddress: {
//           place: formData.customerAddress.place.trim(),
//           city: formData.customerAddress.city.trim(),
//           state: formData.customerAddress.state.trim().toUpperCase(),
//           stateCode: formData.customerAddress.stateCode.trim().toUpperCase(),
//           pinCode: formData.customerAddress.pinCode.trim(),
//         },
//       };

//       if (formData.havmorPlatformCustomerId && formData.havmorPlatformCustomerId.trim()) {
//         customerData.havmorPlatformCustomerId = formData.havmorPlatformCustomerId.trim();
//       }

//       if (formData.firstName && formData.firstName.trim()) {
//         customerData.firstName = formData.firstName.trim();
//       }

//       if (formData.lastName && formData.lastName.trim()) {
//         customerData.lastName = formData.lastName.trim();
//       }

//       if (formData.email && formData.email.trim()) {
//         customerData.email = formData.email.trim();
//       }

//       if (formData.panCardNumber && formData.panCardNumber.trim()) {
//         customerData.panCardNumber = formData.panCardNumber.trim().toUpperCase();
//       }

//       if (formData.gstinNumber && formData.gstinNumber.trim()) {
//         customerData.gstinNumber = formData.gstinNumber.trim().toUpperCase();
//       }

//       const response = await customerApi.addCustomer(customerData);

//       if (response.success) {
//         toast.success('Customer added successfully!');
//         navigate('/customers', { replace: true });
//       }
//     } catch (error) {
//       console.error('Add customer failed:', error.message);
//       let errorMsg = 'Failed to add customer';

//       if (error.statusCode === 409) {
//         errorMsg = 'Customer with this ID already exists';
//       } else if (error.statusCode === 400 && error.errors?.length) {
//         errorMsg = error.errors[0];
//       } else if (error.statusCode >= 500) {
//         errorMsg = 'Server error. Please try again.';
//       }

//       toast.error(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ===== RENDER INPUT FIELD =====
//   const renderInputField = (name, type, label, icon, options = {}) => {
//     const value = name.startsWith('customerAddress.')
//       ? formData.customerAddress[name.split('.')[1]]
//       : formData[name];

//     return (
//       <div className="space-y-2">
//         <label className="text-coffee block text-sm font-semibold tracking-wide">
//           {label}
//           {options.required && <span className="ml-1 text-red-500">*</span>}
//         </label>

//         <div className="relative">
//           <input
//             className={`h-14 w-full rounded-lg border-2 ${
//               errors[name] ? 'border-red-400 focus:border-red-500' : 'focus:border-peach border-gray-300'
//             } ${
//               options.disabled
//                 ? 'bg-gray-50 cursor-not-allowed text-gray-400 italic'
//                 : 'bg-white text-black'
//             } px-4 pl-12 text-base font-medium tracking-wider transition-all duration-200 ease-in outline-none hover:border-gray-400 focus:shadow-md`}
//             name={name}
//             type={type}
//             placeholder={options.placeholder || `Enter ${label.toLowerCase()}`}
//             autoComplete={options.autoComplete || 'off'}
//             value={value}
//             onChange={handleChange}
//             disabled={options.disabled}
//             {...options.inputProps}
//           />

//           <div
//             className={`absolute top-1/2 left-4 -translate-y-1/2 ${
//               options.disabled ? 'text-gray-300' : 'text-gray-400'
//             }`}
//           >
//             {icon}
//           </div>
//         </div>

//         {options.helperText && (
//           <div className="ml-1 flex items-center text-xs font-medium text-gray-500">
//             <span>{options.helperText}</span>
//           </div>
//         )}

//         {errors[name] && (
//           <div className="mt-1.5 ml-1 flex items-center text-xs font-medium text-red-600">
//             <AlertCircle size={13} className="mr-1.5 flex-shrink-0" />
//             <span>{errors[name]}</span>
//           </div>
//         )}
//       </div>
//     );
//   };

//   // ===== RENDER TYPEAHEAD STATE FIELD (ENHANCED) =====
//   const renderStateTypeahead = () => {
//     return (
//       <div className="space-y-2">
//         <label className="text-coffee block text-sm font-semibold tracking-wide">
//           Statey
//           <span className="ml-1 text-red-500">*</span>
//         </label>

//         <div className="relative">
//           <input
//             ref={stateInputRef}
//             type="text"
//             className={`h-14 w-full rounded-lg border-2 ${
//               errors['customerAddress.state']
//                 ? 'border-red-400 focus:border-red-500'
//                 : 'focus:border-peach border-gray-300'
//             } bg-white px-4 pl-12 pr-10 text-base font-medium tracking-wider transition-all duration-200 ease-in outline-none hover:border-gray-400 focus:shadow-md`}
//             placeholder="Search States"
//             value={stateSearch}
//             onChange={(e) => {
//               setStateSearch(e.target.value);
//               setShowStateDropdown(true);
//               // Clear selection if user types
//               setFormData((prev) => ({
//                 ...prev,
//                 customerAddress: {
//                   ...prev.customerAddress,
//                   state: '',
//                   stateCode: '',
//                 },
//               }));
//             }}
//             onFocus={() => setShowStateDropdown(false)}
//             onKeyDown={handleStateKeyDown} // ✅ Keyboard navigation
//           />

//           <div className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">
//             <MapPin size={20} />
//           </div>

//           <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2">
//             <Search size={18} className="text-gray-500" />
//           </div>

//           {/* ✅ Enhanced Typeahead Dropdown with Keyboard Selection */}
//           {showStateDropdown && filteredStates.length > 0 && (
//             <div
//               ref={dropdownRef}
//               className="absolute z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-lg border-2 border-gray-300 bg-white shadow-lg"
//             >
//               {filteredStates.map((state, index) => (
//                 <div
//                   key={state.value}
//                   onClick={() => handleStateSelect(state.value)}
//                   className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
//                     index === selectedStateIndex
//                       ? 'bg-peach text-black font-semibold' // ✅ Highlight selected
//                       : 'hover:bg-vanilla'
//                   }`}
//                 >
//                   <span className="font-medium">{state.label}</span>
//                   <span className="text-xs text-gray-500 font-semibold">{state.code}</span>
//                 </div>
//               ))}
//             </div>
//           )}

//           {showStateDropdown && filteredStates.length === 0 && (
//             <div
//               ref={dropdownRef}
//               className="absolute z-50 mt-2 w-full rounded-lg border-2 border-gray-300 bg-white shadow-lg p-4 text-center text-gray-500"
//             >
//               No states found for "{stateSearch}"
//             </div>
//           )}
//         </div>

//         {/* ✅ Keyboard Hint */}
//         {/* <div className="ml-1 flex items-center text-xs text-gray-500">
//           <span>💡 Use ↑↓ arrow keys and Enter to select</span>
//         </div> */}

//         {errors['customerAddress.state'] && (
//           <div className="mt-1.5 ml-1 flex items-center text-xs font-medium text-red-600">
//             <AlertCircle size={13} className="mr-1.5 flex-shrink-0" />
//             <span>{errors['customerAddress.state']}</span>
//           </div>
//         )}
//       </div>
//     );
//   };

//   // ===== RENDER RADIO GROUP =====
//   const renderRadioGroup = () => {
//     return (
//       <div className="space-y-2">
//         <label className="text-coffee block text-sm font-semibold tracking-wide">
//           Customer Status
//           <span className="ml-1 text-red-500">*</span>
//         </label>

//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//           <label
//             className={`flex items-center cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
//               formData.customerStatus === 'TEMPORARY'
//                 ? 'border-black bg-vanilla shadow-md'
//                 : 'border-gray-300 bg-white hover:border-gray-400'
//             }`}
//           >
//             <input
//               type="radio"
//               name="customerStatus"
//               value="TEMPORARY"
//               checked={formData.customerStatus === 'TEMPORARY'}
//               onChange={handleChange}
//               className="h-5 w-5 text-black focus:ring-2 focus:ring-peach cursor-pointer"
//             />
//             <div className="ml-3">
//               <div className="font-semibold text-black">Temporary Customer</div>
//               <div className="text-xs text-gray-600">ID generated automatically</div>
//             </div>
//           </label>

//           <label
//             className={`flex items-center cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
//               formData.customerStatus === 'PERMANENT'
//                 ? 'border-black bg-vanilla shadow-md'
//                 : 'border-gray-300 bg-white hover:border-gray-400'
//             }`}
//           >
//             <input
//               type="radio"
//               name="customerStatus"
//               value="PERMANENT"
//               checked={formData.customerStatus === 'PERMANENT'}
//               onChange={handleChange}
//               className="h-5 w-5 text-black focus:ring-2 focus:ring-peach cursor-pointer"
//             />
//             <div className="ml-3">
//               <div className="font-semibold text-black">Permanent Customer</div>
//               <div className="text-xs text-gray-600">Requires Havmor Platform ID</div>
//             </div>
//           </label>
//         </div>

//         {errors.customerStatus && (
//           <div className="mt-1.5 ml-1 flex items-center text-xs font-medium text-red-600">
//             <AlertCircle size={13} className="mr-1.5 flex-shrink-0" />
//             <span>{errors.customerStatus}</span>
//           </div>
//         )}
//       </div>
//     );
//   };

//   // ===== CONFIRMATION MODAL =====
//   const ConfirmationModal = () => {
//     if (!showConfirmModal) return null;

//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
//         <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//           {/* Header */}
//           <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 flex items-center justify-between">
//             <div>
//               <h3 className="text-2xl font-bold text-black font-alpino">Confirm Customer Details</h3>
//               <p className="text-sm text-gray-600 mt-1">Please verify the information before adding</p>
//             </div>
//             <button
//               onClick={() => setShowConfirmModal(false)}
//               className="text-gray-500 hover:text-black transition-colors"
//             >
//               <X size={24} />
//             </button>
//           </div>

//           {/* Content */}
//           <div className="p-6 space-y-6">
//             {/* Basic Information */}
//             <div>
//               <h4 className="text-lg font-bold text-black mb-3 flex items-center">
//                 <CheckCircle size={20} className="mr-2 text-green-600" />
//                 Basic Information
//               </h4>
//               <div className="bg-vanilla rounded-lg p-4 space-y-2">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600 font-medium">Customer Type:</span>
//                   <span className="text-black font-semibold">{formData.customerStatus}</span>
//                 </div>
//                 {formData.customerStatus === 'PERMANENT' && formData.havmorPlatformCustomerId && (
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 font-medium">Havmor Platform ID:</span>
//                     <span className="text-black font-semibold">{formData.havmorPlatformCustomerId}</span>
//                   </div>
//                 )}
//                 <div className="flex justify-between">
//                   <span className="text-gray-600 font-medium">Shop Name:</span>
//                   <span className="text-black font-semibold">{formData.shopName}</span>
//                 </div>
//               </div>
//             </div>

//             {/* Contact Details */}
//             <div>
//               <h4 className="text-lg font-bold text-black mb-3 flex items-center">
//                 <CheckCircle size={20} className="mr-2 text-green-600" />
//                 Contact Details
//               </h4>
//               <div className="bg-vanilla rounded-lg p-4 space-y-2">
//                 {formData.firstName && (
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 font-medium">Name:</span>
//                     <span className="text-black font-semibold">
//                       {formData.firstName} {formData.lastName}
//                     </span>
//                   </div>
//                 )}
//                 <div className="flex justify-between">
//                   <span className="text-gray-600 font-medium">Phone:</span>
//                   <span className="text-black font-semibold">{formData.phone}</span>
//                 </div>
//                 {formData.email && (
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 font-medium">Email:</span>
//                     <span className="text-black font-semibold">{formData.email}</span>
//                   </div>
//                 )}
//                 {formData.panCardNumber && (
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 font-medium">PAN:</span>
//                     <span className="text-black font-semibold">{formData.panCardNumber.toUpperCase()}</span>
//                   </div>
//                 )}
//                 {formData.gstinNumber && (
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 font-medium">GSTIN:</span>
//                     <span className="text-black font-semibold">{formData.gstinNumber.toUpperCase()}</span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Address */}
//             <div>
//               <h4 className="text-lg font-bold text-black mb-3 flex items-center">
//                 <CheckCircle size={20} className="mr-2 text-green-600" />
//                 Address
//               </h4>
//               <div className="bg-vanilla rounded-lg p-4 space-y-2">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600 font-medium">Place:</span>
//                   <span className="text-black font-semibold">{formData.customerAddress.place}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600 font-medium">City:</span>
//                   <span className="text-black font-semibold">{formData.customerAddress.city}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600 font-medium">State:</span>
//                   <span className="text-black font-semibold">
//                     {formData.customerAddress.state} ({formData.customerAddress.stateCode})
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600 font-medium">PIN Code:</span>
//                   <span className="text-black font-semibold">{formData.customerAddress.pinCode}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-6 flex justify-between gap-4">
//             <button onClick={() => setShowConfirmModal(false)} className="btn-outline flex-1 h-12 text-base">
//               Go Back & Edit
//             </button>
//             <button
//               onClick={handleConfirmSubmit}
//               disabled={loading}
//               className={`btn-primary flex-1 flex items-center justify-center h-12 text-base ${
//                 loading ? 'cursor-not-allowed opacity-70' : ''
//               }`}
//             >
//               {loading ? (
//                 <>
//                   <Loader2 size={20} className="mr-2 animate-spin" />
//                   Adding...
//                 </>
//               ) : (
//                 <>
//                   <CheckCircle size={20} className="mr-2" />
//                   Confirm & Add Customer
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // ===== RENDER =====
//   return (
//     <div className="bg-cream min-h-screen px-4 py-6 sm:py-8">
//       <div className="mx-auto max-w-4xl">
//         <div className="mb-8">
//           <button
//             onClick={() => navigate('/customers')}
//             className="text-coffee hover:bg-vanilla hover:border-peach group mb-6 flex h-10 w-10 items-center justify-center rounded-lg border-2 border-gray-300 bg-white transition-all duration-200"
//             aria-label="Back to customers"
//           >
//             <ArrowLeft size={20} className="transition-colors group-hover:text-black" />
//           </button>

//           <div className="space-y-1">
//             <h1 className="font-alpino text-4xl font-bold tracking-wide text-black sm:text-5xl">
//               Add New Customer
//             </h1>
//             <p className="text-coffee text-base font-medium tracking-wide">
//               Fill in the customer details below
//             </p>
//           </div>
//         </div>

//         {/* Progress Steps */}
//         <div className="card mb-8 p-6">
//           <div className="flex items-center justify-between">
//             {[
//               { number: 1, label: 'Basic Info' },
//               { number: 2, label: 'Contact Details' },
//               { number: 3, label: 'Address' },
//             ].map((step, index) => (
//               <React.Fragment key={step.number}>
//                 <div className="flex items-center">
//                   <div
//                     className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-bold transition-all duration-300 ${
//                       currentStep >= step.number
//                         ? 'text-cream scale-110 bg-black shadow-lg'
//                         : 'scale-100 bg-gray-200 text-gray-500'
//                     }`}
//                   >
//                     {step.number}
//                   </div>
//                   <span
//                     className={`ml-3 hidden text-sm font-semibold tracking-wide transition-colors sm:block ${
//                       currentStep >= step.number ? 'text-black' : 'text-gray-400'
//                     }`}
//                   >
//                     {step.label}
//                   </span>
//                 </div>
//                 {index < 2 && (
//                   <div className="mx-2 h-[3px] flex-1 overflow-hidden rounded-full bg-gray-200 sm:mx-4">
//                     <div
//                       className={`h-full bg-black transition-all duration-500 ease-out ${
//                         currentStep > step.number ? 'w-full' : 'w-0'
//                       }`}
//                     ></div>
//                   </div>
//                 )}
//               </React.Fragment>
//             ))}
//           </div>
//         </div>

//         {/* ✅ Form with Keyboard Navigation */}
//         <form onSubmit={handleShowConfirmation} onKeyDown={handleFormKeyDown}>
//           <div className="card p-6 sm:p-8">
//             {/* STEP 1: Basic Information */}
//             {currentStep === 1 && (
//               <div className="space-y-6">
//                 <h3 className="font-alpino mb-6 text-2xl font-bold tracking-wide text-black">
//                   Basic Information
//                 </h3>

//                 {renderRadioGroup()}

//                 {formData.customerStatus === 'TEMPORARY' && (
//                   <div className="grid grid-cols-1">
//                     {renderInputField('temporaryCustomerId', 'text', 'Temporary Customer ID', <Hash size={20} />, {
//                       disabled: true,
//                       placeholder: 'Will be generated automatically upon submission',
//                     })}
//                   </div>
//                 )}

//                 {formData.customerStatus === 'PERMANENT' && (
//                   <div className="grid grid-cols-1">
//                     {renderInputField(
//                       'havmorPlatformCustomerId',
//                       'text',
//                       'Havmor Platform Customer ID',
//                       <Hash size={20} />,
//                       {
//                         required: true,
//                         placeholder: '8 digits',
//                         inputProps: { maxLength: 8, pattern: '[0-9]*' },
//                       }
//                     )}
//                   </div>
//                 )}

//                 {renderInputField('shopName', 'text', 'Shop Name', <Store size={20} />, {
//                   required: true,
//                 })}

//                 {/* ✅ Better Button Alignment */}
//                 <div className="flex justify-end pt-4">
//                   <button type="button" onClick={nextStep} className="btn-primary h-12 px-8 text-base">
//                     Next Step →
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* STEP 2: Contact Details */}
//             {currentStep === 2 && (
//               <div className="space-y-6">
//                 <h3 className="font-alpino mb-6 text-2xl font-bold tracking-wide text-black">
//                   Contact Details
//                 </h3>

//                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                   {renderInputField('firstName', 'text', 'First Name', <User size={20} />)}
//                   {renderInputField('lastName', 'text', 'Last Name', <User size={20} />)}
//                 </div>

//                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                   {renderInputField('phone', 'tel', 'Phone Number', <Phone size={20} />, {
//                     required: true,
//                     placeholder: '10 digits',
//                     inputProps: { maxLength: 10, pattern: '[0-9]*' },
//                   })}

//                   {renderInputField('email', 'email', 'Email Address', <Mail size={20} />)}
//                 </div>

//                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                   {renderInputField('panCardNumber', 'text', 'PAN Card Number', <CreditCard size={20} />, {
//                     placeholder: 'ABCDE1234F',
//                     inputProps: { maxLength: 10 },
//                   })}

//                   {renderInputField('gstinNumber', 'text', 'GSTIN Number', <CreditCard size={20} />, {
//                     placeholder: '15 characters',
//                     inputProps: { maxLength: 15 },
//                   })}
//                 </div>

//                 {/* ✅ Better Button Alignment */}
//                 <div className="flex items-center justify-between pt-4">
//                   <button type="button" onClick={prevStep} className="btn-outline flex items-center justify-center h-12 pl-6 pr-8 text-base">
//                     ← Previous
//                   </button>
//                   <button type="button" onClick={nextStep} className="btn-primary h-12 px-8 text-base">
//                     Next Step →
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* STEP 3: Address */}
//             {currentStep === 3 && (
//               <div className="space-y-6">
//                 <h3 className="font-alpino mb-6 text-2xl font-bold tracking-wide text-black">Customer Address</h3>

//                 {renderInputField('customerAddress.place', 'text', 'Place / Address Line', <MapPin size={20} />, {
//                   required: true,
//                 })}

//                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                   {renderInputField('customerAddress.city', 'text', 'City', <Building2 size={20} />, {
//                     required: true,
//                   })}

//                   {/* ✅ Enhanced Typeahead State Field */}
//                   {renderStateTypeahead()}
//                 </div>

//                 {renderInputField('customerAddress.pinCode', 'text', 'PIN Code', <Hash size={20} />, {
//                   required: true,
//                   placeholder: '6 digits',
//                   inputProps: { maxLength: 6, pattern: '[0-9]*' },
//                 })}

//                 {/* ✅ Better Button Alignment */}
//                 <div className="flex items-center justify-between pt-4">
//                   <button type="button" onClick={prevStep} className="btn-outline flex items-center justify-center h-12 pl-6 pr-8 text-base">
//                     ← Previous
//                   </button>
//                   <button type="submit" className="btn-primary flex h-12 items-center px-8 text-base">
//                     <CheckCircle size={20} className="mr-2" />
//                     Review & Submit
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </form>
//       </div>

//       {/* ✅ Confirmation Modal */}
//       <ConfirmationModal />
//     </div>
//   );
// };

// export default AddCustomer;


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Store,
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Building2,
  Hash,
  CheckCircle,
  ChevronDown,
} from 'lucide-react';
import customerApi from '../../services/customerApi';
import authService from '../../services/authService';
import { validateCustomerField, validateCustomerForm } from '../../utils/validate';
import { customerValidationSchema } from '../../validations/customerValidationSchemas';
import { indianStateOptions, INDIAN_STATES_WITH_ABBREVIATIONS } from '../../utils/indianStates';
import Input from '../common/Input';
import Button from '../common/Button';
import Modal from '../common/Modal';

const AddCustomer = () => {
  const navigate = useNavigate();
  const stateInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // AUTH PROTECTION
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // FORM STATE
  const [formData, setFormData] = useState({
    customerStatus: 'TEMPORARY',
    temporaryCustomerId: '',
    havmorPlatformCustomerId: '',
    shopName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    panCardNumber: '',
    gstinNumber: '',
    customerAddress: {
      place: '',
      city: '',
      state: '',
      stateCode: '',
      pinCode: '',
    },
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // STATE TYPEAHEAD
  const [stateSearch, setStateSearch] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [filteredStates, setFilteredStates] = useState(indianStateOptions);
  const [selectedStateIndex, setSelectedStateIndex] = useState(0);

  // HELPER: GET STATE CODE
  const getStateCode = (stateName) => {
    const stateObj = INDIAN_STATES_WITH_ABBREVIATIONS.find(
      (s) => s.name === stateName.toUpperCase()
    );
    return stateObj ? stateObj.code : '';
  };

  // FUZZY SEARCH FOR STATES
  useEffect(() => {
    if (stateSearch) {
      const searchLower = stateSearch.toLowerCase();
      const filtered = indianStateOptions.filter((state) => {
        const stateLower = state.label.toLowerCase();
        return stateLower.includes(searchLower);
      });
      setFilteredStates(filtered);
      setSelectedStateIndex(0);
    } else {
      setFilteredStates(indianStateOptions);
      setSelectedStateIndex(0);
    }
  }, [stateSearch]);

  // CLOSE DROPDOWN ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        stateInputRef.current &&
        !stateInputRef.current.contains(event.target)
      ) {
        setShowStateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // KEYBOARD NAVIGATION FOR STATE DROPDOWN
  const handleStateKeyDown = (e) => {
    if (!showStateDropdown) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setShowStateDropdown(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedStateIndex((prev) =>
          prev < filteredStates.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedStateIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredStates.length > 0) {
          handleStateSelect(filteredStates[selectedStateIndex].value);
        }
        break;
      case 'Escape':
        setShowStateDropdown(false);
        break;
      default:
        break;
    }
  };

  // SCROLL SELECTED ITEM INTO VIEW
  useEffect(() => {
    if (showStateDropdown && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedStateIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedStateIndex, showStateDropdown]);

  // SELECT STATE HANDLER
  const handleStateSelect = (stateName) => {
    const stateCode = getStateCode(stateName);
    setFormData((prev) => ({
      ...prev,
      customerAddress: {
        ...prev.customerAddress,
        state: stateName,
        stateCode: stateCode,
      },
    }));
    setStateSearch(stateName);
    setShowStateDropdown(false);

    // Clear error if exists
    if (errors['customerAddress.state']) {
      setErrors((prev) => ({ ...prev, 'customerAddress.state': '' }));
    }
  };

  // FORM CHANGE HANDLER
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('customerAddress.')) {
      const addressField = name.split('.')[1];
      if (addressField === 'state') {
        const stateCode = getStateCode(value);
        setFormData((prev) => ({
          ...prev,
          customerAddress: {
            ...prev.customerAddress,
            state: value,
            stateCode: stateCode,
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          customerAddress: {
            ...prev.customerAddress,
            [addressField]: value,
          },
        }));
      }

      // Clear error
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    }
  };

  // STEP VALIDATION
  const validateCurrentStep = () => {
    const stepErrors = {};
    let isValid = true;

    if (currentStep === 1) {
      // Basic info validation
      if (!formData.shopName?.trim()) {
        stepErrors.shopName = 'Shop name is required';
        isValid = false;
      } else {
        const shopNameError = validateCustomerField(
          'shopName',
          formData.shopName,
          formData,
          customerValidationSchema
        );
        if (shopNameError) {
          stepErrors.shopName = shopNameError;
          isValid = false;
        }
      }

      if (formData.customerStatus === 'PERMANENT') {
        if (!formData.havmorPlatformCustomerId?.trim()) {
          stepErrors.havmorPlatformCustomerId = 'Havmor Platform ID is required';
          isValid = false;
        } else {
          const havmorIdError = validateCustomerField(
            'havmorPlatformCustomerId',
            formData.havmorPlatformCustomerId,
            formData,
            customerValidationSchema
          );
          if (havmorIdError) {
            stepErrors.havmorPlatformCustomerId = havmorIdError;
            isValid = false;
          }
        }
      }
    } else if (currentStep === 2) {
      // Contact validation
      if (!formData.phone?.trim()) {
        stepErrors.phone = 'Phone number is required';
        isValid = false;
      } else {
        const phoneError = validateCustomerField(
          'phone',
          formData.phone,
          formData,
          customerValidationSchema
        );
        if (phoneError) {
          stepErrors.phone = phoneError;
          isValid = false;
        }
      }

      // Optional fields validation
      if (formData.email) {
        const emailError = validateCustomerField(
          'email',
          formData.email,
          formData,
          customerValidationSchema
        );
        if (emailError) {
          stepErrors.email = emailError;
          isValid = false;
        }
      }

      if (formData.panCardNumber) {
        const panError = validateCustomerField(
          'panCardNumber',
          formData.panCardNumber,
          formData,
          customerValidationSchema
        );
        if (panError) {
          stepErrors.panCardNumber = panError;
          isValid = false;
        }
      }

      if (formData.gstinNumber) {
        const gstinError = validateCustomerField(
          'gstinNumber',
          formData.gstinNumber,
          formData,
          customerValidationSchema
        );
        if (gstinError) {
          stepErrors.gstinNumber = gstinError;
          isValid = false;
        }
      }
    } else if (currentStep === 3) {
      // Address validation
      if (!formData.customerAddress.place?.trim()) {
        stepErrors['customerAddress.place'] = 'Place/Address is required';
        isValid = false;
      }

      if (!formData.customerAddress.city?.trim()) {
        stepErrors['customerAddress.city'] = 'City is required';
        isValid = false;
      }

      if (!formData.customerAddress.state?.trim()) {
        stepErrors['customerAddress.state'] = 'State is required';
        isValid = false;
      }

      if (!formData.customerAddress.pinCode?.trim()) {
        stepErrors['customerAddress.pinCode'] = 'PIN code is required';
        isValid = false;
      } else {
        const pinError = validateCustomerField(
          'customerAddress.pinCode',
          formData.customerAddress.pinCode,
          formData,
          customerValidationSchema
        );
        if (pinError) {
          stepErrors['customerAddress.pinCode'] = pinError;
          isValid = false;
        }
      }
    }

    if (!isValid) {
      setErrors(stepErrors);
      toast.error('Please fix the form errors');
    }

    return isValid;
  };

  // STEP NAVIGATION
  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
        setErrors({});
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  // SHOW CONFIRMATION MODAL
  const handleShowConfirmation = (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;
    setShowConfirmModal(true);
  };

  // SUBMIT HANDLER
  const handleConfirmSubmit = async () => {
    setLoading(true);
    setShowConfirmModal(false);

    try {
      const validation = validateCustomerForm(formData, customerValidationSchema);
      if (!validation.valid) {
        setErrors(validation.errors);
        toast.error('Please fix all form errors');
        setLoading(false);
        return;
      }

      setErrors({});

      // Prepare customer data
      const customerData = {
        customerStatus: formData.customerStatus.toUpperCase(),
        shopName: formData.shopName.trim(),
        phone: formData.phone.trim(),
        customerAddress: {
          place: formData.customerAddress.place.trim(),
          city: formData.customerAddress.city.trim(),
          state: formData.customerAddress.state.trim().toUpperCase(),
          stateCode: formData.customerAddress.stateCode.trim().toUpperCase(),
          pinCode: formData.customerAddress.pinCode.trim(),
        },
      };

      if (formData.havmorPlatformCustomerId?.trim()) {
        customerData.havmorPlatformCustomerId = formData.havmorPlatformCustomerId.trim();
      }
      if (formData.firstName?.trim()) {
        customerData.firstName = formData.firstName.trim();
      }
      if (formData.lastName?.trim()) {
        customerData.lastName = formData.lastName.trim();
      }
      if (formData.email?.trim()) {
        customerData.email = formData.email.trim();
      }
      if (formData.panCardNumber?.trim()) {
        customerData.panCardNumber = formData.panCardNumber.trim().toUpperCase();
      }
      if (formData.gstinNumber?.trim()) {
        customerData.gstinNumber = formData.gstinNumber.trim().toUpperCase();
      }

      const response = await customerApi.addCustomer(customerData);

      if (response.success) {
        toast.success('Customer added successfully!');
        navigate('/customers', { replace: true });
      }
    } catch (error) {
      console.error('Add customer failed:', error.message);

      let errorMsg = 'Failed to add customer';
      if (error.statusCode === 409) {
        errorMsg = 'Customer with this ID already exists';
      } else if (error.statusCode === 400 && error.errors?.length) {
        errorMsg = error.errors[0];
      } else if (error.statusCode === 500) {
        errorMsg = 'Server error. Please try again.';
      }
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // RENDER STATE TYPEAHEAD
  const renderStateTypeahead = () => (
    <div className="space-y-2">
      <label className="text-coffee block text-sm font-semibold tracking-wide">
        State <span className="ml-1 text-red-500">*</span>
      </label>

      <div className="relative">
        <input
          ref={stateInputRef}
          type="text"
          value={stateSearch}
          onChange={(e) => setStateSearch(e.target.value)}
          onFocus={() => setShowStateDropdown(true)}
          onKeyDown={handleStateKeyDown}
          placeholder="Search for a state"
          className={`h-14 w-full rounded-lg border-2 ${
            errors['customerAddress.state']
              ? 'border-red-400 focus:border-red-500'
              : 'focus:border-peach border-gray-300'
          } bg-white text-black px-4 pr-10 text-base font-medium tracking-wider transition-all duration-200 ease-in outline-none hover:border-gray-400 focus:shadow-md`}
        />
        <ChevronDown
          size={20}
          className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform ${
            showStateDropdown ? 'rotate-180' : ''
          }`}
        />

        {/* Dropdown */}
        {showStateDropdown && filteredStates.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border-2 border-gray-300 bg-white shadow-lg animate-slide-up"
          >
            {filteredStates.map((state, index) => (
              <div
                key={state.value}
                onClick={() => handleStateSelect(state.value)}
                className={`cursor-pointer px-4 py-3 text-base font-medium transition-colors ${
                  index === selectedStateIndex
                    ? 'bg-peach text-black'
                    : 'hover:bg-vanilla text-gray-700'
                }`}
              >
                {state.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {errors['customerAddress.state'] && (
        <div className="mt-1.5 ml-1 flex items-center text-xs font-medium text-red-600">
          <span>{errors['customerAddress.state']}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-cream min-h-screen px-4 py-6 sm:py-8 animate-fade-in">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/customers')}
            className="text-coffee hover:bg-vanilla hover:border-peach group mb-6 flex h-10 w-10 items-center justify-center rounded-lg border-2 border-gray-300 bg-white transition-all duration-200"
            aria-label="Back to customers"
          >
            <ArrowLeft size={20} className="transition-colors group-hover:text-black" />
          </button>

          <div className="space-y-1">
            <h1 className="font-alpino text-4xl font-bold tracking-wide text-black sm:text-5xl">
              Add New Customer
            </h1>
            <p className="text-coffee text-base font-medium tracking-wide">
              Fill in the customer details below
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="card mb-8 p-6">
          <div className="flex items-center justify-between">
            {[
              { number: 1, label: 'Basic Info' },
              { number: 2, label: 'Contact Details' },
              { number: 3, label: 'Address' },
            ].map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-bold transition-all duration-300 ${
                      currentStep >= step.number
                        ? 'text-cream scale-110 bg-black shadow-lg'
                        : 'scale-100 bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`ml-3 hidden text-sm font-semibold tracking-wide transition-colors sm:block ${
                      currentStep >= step.number ? 'text-black' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {index !== 2 && (
                  <div className="mx-2 h-[3px] flex-1 overflow-hidden rounded-full bg-gray-200 sm:mx-4">
                    <div
                      className={`h-full bg-black transition-all duration-500 ease-out ${
                        currentStep > step.number ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleShowConfirmation}>
          <div className="card p-6 sm:p-8">
            {/* STEP 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="font-alpino mb-6 text-2xl font-bold tracking-wide text-black">
                  Basic Information
                </h3>

                {/* Customer Status */}
                <div className="space-y-2">
                  <label className="text-coffee block text-sm font-semibold tracking-wide">
                    Customer Type <span className="ml-1 text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    {['TEMPORARY', 'PERMANENT'].map((status) => (
                      <label
                        key={status}
                        className={`flex-1 cursor-pointer rounded-lg border-2 p-4 transition-all ${
                          formData.customerStatus === status
                            ? 'border-black bg-vanilla'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="customerStatus"
                          value={status}
                          checked={formData.customerStatus === status}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="text-base font-semibold">
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.customerStatus && (
                    <div className="ml-1 flex items-center text-xs font-medium text-red-600">
                      <span>{errors.customerStatus}</span>
                    </div>
                  )}
                </div>

                {/* Temporary Customer ID (Disabled) */}
                {formData.customerStatus === 'TEMPORARY' && (
                  <Input
                    name="temporaryCustomerId"
                    type="text"
                    label="Temporary Customer ID"
                    value={formData.temporaryCustomerId}
                    onChange={handleChange}
                    disabled
                    placeholder="Will be generated automatically"
                    icon={Hash}
                  />
                )}

                {/* Havmor Platform ID */}
                {formData.customerStatus === 'PERMANENT' && (
                  <Input
                    name="havmorPlatformCustomerId"
                    type="text"
                    label="Havmor Platform Customer ID"
                    value={formData.havmorPlatformCustomerId}
                    onChange={handleChange}
                    error={errors.havmorPlatformCustomerId}
                    placeholder="8 digits"
                    required
                    icon={Hash}
                    maxLength="8"
                  />
                )}

                {/* Shop Name */}
                <Input
                  name="shopName"
                  type="text"
                  label="Shop Name"
                  value={formData.shopName}
                  onChange={handleChange}
                  error={errors.shopName}
                  required
                  icon={Store}
                />

                {/* Navigation */}
                <div className="flex justify-end pt-4">
                  <Button type="button" onClick={nextStep} variant="primary" className="h-12 px-8">
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Contact Details */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="font-alpino mb-6 text-2xl font-bold tracking-wide text-black">
                  Contact Details
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Input
                    name="firstName"
                    type="text"
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    icon={User}
                  />
                  <Input
                    name="lastName"
                    type="text"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                    icon={User}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Input
                    name="phone"
                    type="tel"
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    placeholder="10 digits"
                    required
                    icon={Phone}
                    maxLength="10"
                  />
                  <Input
                    name="email"
                    type="email"
                    label="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    icon={Mail}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Input
                    name="panCardNumber"
                    type="text"
                    label="PAN Card Number"
                    value={formData.panCardNumber}
                    onChange={handleChange}
                    error={errors.panCardNumber}
                    placeholder="ABCDE1234F"
                    icon={CreditCard}
                    maxLength="10"
                  />
                  <Input
                    name="gstinNumber"
                    type="text"
                    label="GSTIN Number"
                    value={formData.gstinNumber}
                    onChange={handleChange}
                    error={errors.gstinNumber}
                    placeholder="15 characters"
                    icon={CreditCard}
                    maxLength="15"
                  />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4">
                  <Button type="button" onClick={prevStep} variant="outline" className="h-12 px-8">
                    Previous
                  </Button>
                  <Button type="button" onClick={nextStep} variant="primary" className="h-12 px-8">
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Address */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="font-alpino mb-6 text-2xl font-bold tracking-wide text-black">
                  Customer Address
                </h3>

                <Input
                  name="customerAddress.place"
                  type="text"
                  label="Place / Address Line"
                  value={formData.customerAddress.place}
                  onChange={handleChange}
                  error={errors['customerAddress.place']}
                  required
                  icon={MapPin}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Input
                    name="customerAddress.city"
                    type="text"
                    label="City"
                    value={formData.customerAddress.city}
                    onChange={handleChange}
                    error={errors['customerAddress.city']}
                    required
                    icon={Building2}
                  />

                  {/* State Typeahead */}
                  {renderStateTypeahead()}
                </div>

                <Input
                  name="customerAddress.pinCode"
                  type="text"
                  label="PIN Code"
                  value={formData.customerAddress.pinCode}
                  onChange={handleChange}
                  error={errors['customerAddress.pinCode']}
                  placeholder="6 digits"
                  required
                  icon={Hash}
                  maxLength="6"
                />

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4">
                  <Button type="button" onClick={prevStep} variant="outline" className="h-12 px-8">
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={CheckCircle}
                    className="h-12 px-8"
                  >
                    Review & Submit
                  </Button>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Confirmation Modal */}
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Customer Details"
          size="2xl"
          showCloseButton={false}
        >
          <p className="text-sm text-gray-600 mb-6">
            Please verify the information before adding
          </p>

          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-bold text-black mb-3 flex items-center">
                <CheckCircle size={20} className="mr-2 text-green-600" />
                Basic Information
              </h4>
              <div className="bg-vanilla rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Customer Type</span>
                  <span className="text-black font-semibold">{formData.customerStatus}</span>
                </div>
                {formData.customerStatus === 'PERMANENT' && formData.havmorPlatformCustomerId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Havmor Platform ID</span>
                    <span className="text-black font-semibold">
                      {formData.havmorPlatformCustomerId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Shop Name</span>
                  <span className="text-black font-semibold">{formData.shopName}</span>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <h4 className="text-lg font-bold text-black mb-3 flex items-center">
                <CheckCircle size={20} className="mr-2 text-green-600" />
                Contact Details
              </h4>
              <div className="bg-vanilla rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Phone</span>
                  <span className="text-black font-semibold">{formData.phone}</span>
                </div>
                {formData.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Email</span>
                    <span className="text-black font-semibold">{formData.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <h4 className="text-lg font-bold text-black mb-3 flex items-center">
                <CheckCircle size={20} className="mr-2 text-green-600" />
                Address
              </h4>
              <div className="bg-vanilla rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Place</span>
                  <span className="text-black font-semibold">
                    {formData.customerAddress.place}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">City</span>
                  <span className="text-black font-semibold">{formData.customerAddress.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">State</span>
                  <span className="text-black font-semibold">
                    {formData.customerAddress.state}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">PIN Code</span>
                  <span className="text-black font-semibold">
                    {formData.customerAddress.pinCode}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={loading}
              className="h-12 px-6"
            >
              Go Back & Edit
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmSubmit}
              loading={loading}
              icon={CheckCircle}
              className="h-12 px-6"
            >
              Confirm & Add Customer
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AddCustomer;
