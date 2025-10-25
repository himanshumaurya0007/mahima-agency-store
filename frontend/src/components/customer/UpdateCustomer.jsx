import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Store,
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Building2,
  Hash,
  AlertCircle,
  ArrowLeft,
  Loader2,
  X,
  CheckCircle,
  Search,
  RefreshCw,
  Info,
} from 'lucide-react';

import customerApi from '../../services/customerApi';
import authService from '../../services/authService';
import { validateCustomerField, validateCustomerForm } from '../../utils/validate';
import { customerValidationSchema } from '../../validations/customerValidationSchemas';
import { indianStateOptions, INDIAN_STATES_WITH_ABBREVIATIONS } from '../../utils/indianStates';

const UpdateCustomer = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const stateInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // ===== AUTH PROTECTION =====
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // ===== STATE MANAGEMENT =====
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

  const [originalData, setOriginalData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  // ✅ Typeahead State
  const [stateSearch, setStateSearch] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [filteredStates, setFilteredStates] = useState(indianStateOptions);
  const [selectedStateIndex, setSelectedStateIndex] = useState(0);

  // ✅ Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ===== HELPER FUNCTIONS =====
  const getStateCode = (stateName) => {
    const stateObj = INDIAN_STATES_WITH_ABBREVIATIONS.find((s) => s.name === stateName.toUpperCase());
    return stateObj ? stateObj.code : '';
  };

  // ✅ Clean phone helper
  const cleanPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/^\+?91/, '').trim();
  };

  // ===== FETCH EXISTING CUSTOMER DATA =====
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setFetchingData(true);
        const response = await customerApi.getCustomerById(customerId);

        if (response.success) {
          const customer = response.data.customer; // ✅ Access nested customer object

          // ✅ Pre-fill form with existing data
          const customerData = {
            customerStatus: customer.customerStatus || 'TEMPORARY',
            temporaryCustomerId: customer.temporaryCustomerId || '',
            havmorPlatformCustomerId: customer.havmorPlatformCustomerId || '',
            shopName: customer.shopName || '',
            firstName: customer.firstName || '',
            lastName: customer.lastName || '',
            email: customer.email || '',
            phone: cleanPhone(customer.phone), // ✅ Remove +91 for display
            panCardNumber: customer.panCardNumber || '',
            gstinNumber: customer.gstinNumber || '',
            customerAddress: {
              place: customer.customerAddress?.place || '',
              city: customer.customerAddress?.city || '',
              state: customer.customerAddress?.state || '',
              stateCode: customer.customerAddress?.stateCode || '',
              pinCode: customer.customerAddress?.pinCode || '',
            },
          };

          setFormData(customerData);
          setOriginalData(customerData);

          // ✅ Set state search
          if (customer.customerAddress?.state) {
            setStateSearch(customer.customerAddress.state);
          }
        }
      } catch (error) {
        console.error('Failed to fetch customer:', error);
        toast.error('Failed to load customer data');
        navigate('/customers');
      } finally {
        setFetchingData(false);
      }
    };

    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId, navigate]);

  // ===== FUZZY SEARCH FOR STATES =====
  useEffect(() => {
    if (stateSearch) {
      const searchLower = stateSearch.toLowerCase();

      const filtered = indianStateOptions.filter((state) => {
        const stateLower = state.label.toLowerCase();
        let searchIndex = 0;
        for (let i = 0; i < stateLower.length && searchIndex < searchLower.length; i++) {
          if (stateLower[i] === searchLower[searchIndex]) {
            searchIndex++;
          }
        }
        return searchIndex === searchLower.length || stateLower.includes(searchLower);
      });

      setFilteredStates(filtered);
      setSelectedStateIndex(0);
    } else {
      setFilteredStates(indianStateOptions);
      setSelectedStateIndex(0);
    }
  }, [stateSearch]);

  // ===== CLOSE DROPDOWN =====
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

  // ===== KEYBOARD NAVIGATION =====
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
        setSelectedStateIndex((prev) => (prev < filteredStates.length - 1 ? prev + 1 : prev));
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

  useEffect(() => {
    if (showStateDropdown && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedStateIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedStateIndex, showStateDropdown]);

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
    if (errors['customerAddress.state']) {
      setErrors((prev) => ({ ...prev, 'customerAddress.state': '' }));
    }
  };

  // ===== FORM HANDLERS =====
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

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    }
  };

  // ===== STEP VALIDATION =====
// ===== STEP VALIDATION =====
const validateCurrentStep = () => {
  const stepErrors = {};
  let isValid = true;
  const missingFields = [];

  if (currentStep === 1) {
    if (!formData.customerStatus) {
      stepErrors.customerStatus = 'Customer status is required';
      missingFields.push('Customer Status');
      isValid = false;
    }

    if (!formData.shopName || !formData.shopName.trim()) {
      stepErrors.shopName = 'Shop name is required';
      missingFields.push('Shop Name');
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

    // ✅ FIXED: Only validate Havmor ID if customer is already PERMANENT
    if (
      formData.customerStatus === 'PERMANENT' &&
      originalData?.customerStatus === 'PERMANENT' // Already was permanent
    ) {
      if (!formData.havmorPlatformCustomerId || !formData.havmorPlatformCustomerId.trim()) {
        stepErrors.havmorPlatformCustomerId = 'Havmor Platform ID is required for permanent customers';
        missingFields.push('Havmor Platform ID');
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

      // ✅ Validate Havmor ID only if changing to PERMANENT
      if (formData.customerStatus === 'PERMANENT' && originalData.customerStatus === 'TEMPORARY') {
        // Backend will auto-convert tempId → havmorId, so no manual input needed
      }
    } else if (currentStep === 2) {
      if (!formData.phone || !formData.phone.trim()) {
        stepErrors.phone = 'Phone number is required';
        missingFields.push('Phone Number');
        isValid = false;
      } else {
        const phoneError = validateCustomerField('phone', formData.phone, formData, customerValidationSchema);
        if (phoneError) {
          stepErrors.phone = phoneError;
          isValid = false;
        }
      }

      if (formData.email) {
        const emailError = validateCustomerField('email', formData.email, formData, customerValidationSchema);
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
      if (!formData.customerAddress.place || !formData.customerAddress.place.trim()) {
        stepErrors['customerAddress.place'] = 'Place/Address is required';
        missingFields.push('Place/Address');
        isValid = false;
      }

      if (!formData.customerAddress.city || !formData.customerAddress.city.trim()) {
        stepErrors['customerAddress.city'] = 'City is required';
        missingFields.push('City');
        isValid = false;
      }

      if (!formData.customerAddress.state || !formData.customerAddress.state.trim()) {
        stepErrors['customerAddress.state'] = 'State is required';
        missingFields.push('State');
        isValid = false;
      }

      if (!formData.customerAddress.pinCode || !formData.customerAddress.pinCode.trim()) {
        stepErrors['customerAddress.pinCode'] = 'PIN code is required';
        missingFields.push('PIN Code');
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

      if (missingFields.length > 1) {
        toast.error(`Please fill: ${missingFields.join(', ')}`);
      } else if (missingFields.length === 1) {
        // Only highlight, no toast
      } else {
        toast.error('Please fix the form errors');
      }
    }

    return isValid;
  };

  // ===== STEP NAVIGATION =====
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

  // ===== KEYBOARD NAVIGATION =====
  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter' && !showStateDropdown) {
      e.preventDefault();

      if (currentStep < 3) {
        nextStep();
      } else {
        handleShowConfirmation(e);
      }
    }
  };

  // ===== GET CHANGED FIELDS =====
  const getChangedFields = () => {
    if (!originalData) return {};

    const changes = {};

    Object.keys(formData).forEach((key) => {
      if (key === 'customerAddress') {
        Object.keys(formData.customerAddress).forEach((addressKey) => {
          if (formData.customerAddress[addressKey] !== originalData.customerAddress[addressKey]) {
            if (!changes.customerAddress) changes.customerAddress = {};
            changes.customerAddress[addressKey] = {
              old: originalData.customerAddress[addressKey],
              new: formData.customerAddress[addressKey],
            };
          }
        });
      } else if (formData[key] !== originalData[key]) {
        changes[key] = {
          old: originalData[key],
          new: formData[key],
        };
      }
    });

    return changes;
  };

  // ===== CONFIRMATION MODAL HANDLERS =====
  const handleShowConfirmation = (e) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    const changes = getChangedFields();
    if (Object.keys(changes).length === 0 && !changes.customerAddress) {
      toast.error('No changes detected');
      return;
    }

    setShowConfirmModal(true);
  };

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

      // ✅ Prepare data for API
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

      if (formData.firstName && formData.firstName.trim()) {
        customerData.firstName = formData.firstName.trim();
      }

      if (formData.lastName && formData.lastName.trim()) {
        customerData.lastName = formData.lastName.trim();
      }

      if (formData.email && formData.email.trim()) {
        customerData.email = formData.email.trim();
      }

      if (formData.panCardNumber && formData.panCardNumber.trim()) {
        customerData.panCardNumber = formData.panCardNumber.trim().toUpperCase();
      }

      if (formData.gstinNumber && formData.gstinNumber.trim()) {
        customerData.gstinNumber = formData.gstinNumber.trim().toUpperCase();
      }

      // ✅ Backend handles TEMP→PERM conversion automatically
      const response = await customerApi.updateCustomer(customerId, customerData);

      if (response.success) {
        toast.success('Customer updated successfully!');
        navigate('/customers', { replace: true });
      }
    } catch (error) {
      console.error('Update customer failed:', error.message);
      let errorMsg = 'Failed to update customer';

      if (error.statusCode === 404) {
        errorMsg = 'Customer not found';
      } else if (error.statusCode === 400 && error.errors?.length) {
        errorMsg = error.errors[0];
      } else if (error.statusCode >= 500) {
        errorMsg = 'Server error. Please try again.';
      }

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ===== RENDER INPUT FIELD =====
  const renderInputField = (name, type, label, icon, options = {}) => {
    const value = name.startsWith('customerAddress.')
      ? formData.customerAddress[name.split('.')[1]]
      : formData[name];

    return (
      <div className="space-y-2">
        <label className="text-coffee block text-sm font-semibold tracking-wide">
          {label}
          {options.required && <span className="ml-1 text-red-500">*</span>}
        </label>

        <div className="relative">
          <input
            className={`h-14 w-full rounded-lg border-2 ${
              errors[name] ? 'border-red-400 focus:border-red-500' : 'focus:border-peach border-gray-300'
            } ${
              options.disabled
                ? 'bg-gray-50 cursor-not-allowed text-gray-400 italic'
                : 'bg-white text-black'
            } px-4 pl-12 text-base font-medium tracking-wider transition-all duration-200 ease-in outline-none hover:border-gray-400 focus:shadow-md`}
            name={name}
            type={type}
            placeholder={options.placeholder || `Enter ${label.toLowerCase()}`}
            autoComplete={options.autoComplete || 'off'}
            value={value}
            onChange={handleChange}
            disabled={options.disabled}
            {...options.inputProps}
          />

          <div
            className={`absolute top-1/2 left-4 -translate-y-1/2 ${
              options.disabled ? 'text-gray-300' : 'text-gray-400'
            }`}
          >
            {icon}
          </div>
        </div>

        {options.helperText && (
          <div className="ml-1 flex items-center text-xs font-medium text-gray-500">
            <span>{options.helperText}</span>
          </div>
        )}

        {errors[name] && (
          <div className="mt-1.5 ml-1 flex items-center text-xs font-medium text-red-600">
            <AlertCircle size={13} className="mr-1.5 flex-shrink-0" />
            <span>{errors[name]}</span>
          </div>
        )}
      </div>
    );
  };

  // ===== RENDER TYPEAHEAD STATE FIELD =====
  const renderStateTypeahead = () => {
    return (
      <div className="space-y-2">
        <label className="text-coffee block text-sm font-semibold tracking-wide">
          State
          <span className="ml-1 text-red-500">*</span>
        </label>

        <div className="relative">
          <input
            ref={stateInputRef}
            type="text"
            className={`h-14 w-full rounded-lg border-2 ${
              errors['customerAddress.state']
                ? 'border-red-400 focus:border-red-500'
                : 'focus:border-peach border-gray-300'
            } bg-white px-4 pl-12 pr-10 text-base font-medium tracking-wider transition-all duration-200 ease-in outline-none hover:border-gray-400 focus:shadow-md`}
            placeholder="Type to search state... (e.g., maha, guj, kar)"
            value={stateSearch}
            onChange={(e) => {
              setStateSearch(e.target.value);
              setShowStateDropdown(true);
              setFormData((prev) => ({
                ...prev,
                customerAddress: {
                  ...prev.customerAddress,
                  state: '',
                  stateCode: '',
                },
              }));
            }}
            onFocus={() => setShowStateDropdown(true)}
            onKeyDown={handleStateKeyDown}
          />

          <div className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">
            <MapPin size={20} />
          </div>

          <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2">
            <Search size={18} className="text-gray-500" />
          </div>

          {showStateDropdown && filteredStates.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-lg border-2 border-gray-300 bg-white shadow-lg"
            >
              {filteredStates.map((state, index) => (
                <div
                  key={state.value}
                  onClick={() => handleStateSelect(state.value)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                    index === selectedStateIndex ? 'bg-peach text-black font-semibold' : 'hover:bg-vanilla'
                  }`}
                >
                  <span className="font-medium">{state.label}</span>
                  <span className="text-xs text-gray-500 font-semibold">{state.code}</span>
                </div>
              ))}
            </div>
          )}

          {showStateDropdown && filteredStates.length === 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-50 mt-2 w-full rounded-lg border-2 border-gray-300 bg-white shadow-lg p-4 text-center text-gray-500"
            >
              No states found for "{stateSearch}"
            </div>
          )}
        </div>

        <div className="ml-1 flex items-center text-xs text-gray-500">
          <span>💡 Use ↑↓ arrow keys and Enter to select</span>
        </div>

        {errors['customerAddress.state'] && (
          <div className="mt-1.5 ml-1 flex items-center text-xs font-medium text-red-600">
            <AlertCircle size={13} className="mr-1.5 flex-shrink-0" />
            <span>{errors['customerAddress.state']}</span>
          </div>
        )}
      </div>
    );
  };

  // ===== RENDER RADIO GROUP (EDITABLE STATUS) =====
  const renderCustomerStatusRadio = () => {
    const isChangingToPermanent =
      originalData?.customerStatus === 'TEMPORARY' && formData.customerStatus === 'PERMANENT';

    return (
      <div className="space-y-2">
        <label className="text-coffee block text-sm font-semibold tracking-wide">
          Customer Status
          <span className="ml-1 text-red-500">*</span>
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label
            className={`flex items-center cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
              formData.customerStatus === 'TEMPORARY'
                ? 'border-black bg-vanilla shadow-md'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              name="customerStatus"
              value="TEMPORARY"
              checked={formData.customerStatus === 'TEMPORARY'}
              onChange={handleChange}
              className="h-5 w-5 text-black focus:ring-2 focus:ring-peach cursor-pointer"
            />
            <div className="ml-3">
              <div className="font-semibold text-black">Temporary Customer</div>
              <div className="text-xs text-gray-600">Auto-generated ID</div>
            </div>
          </label>

          <label
            className={`flex items-center cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
              formData.customerStatus === 'PERMANENT'
                ? 'border-black bg-vanilla shadow-md'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              name="customerStatus"
              value="PERMANENT"
              checked={formData.customerStatus === 'PERMANENT'}
              onChange={handleChange}
              className="h-5 w-5 text-black focus:ring-2 focus:ring-peach cursor-pointer"
            />
            <div className="ml-3">
              <div className="font-semibold text-black">Permanent Customer</div>
              <div className="text-xs text-gray-600">Havmor Partner</div>
            </div>
          </label>
        </div>

        {/* ✅ Info message for TEMP→PERM conversion */}
        {isChangingToPermanent && (
          <div className="mt-3 ml-1 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800">
              <span className="font-semibold">Status Change:</span> Converting to PERMANENT will
              automatically use the Temporary ID ({originalData?.temporaryCustomerId}) as the Havmor
              Platform ID.
            </div>
          </div>
        )}

        {errors.customerStatus && (
          <div className="mt-1.5 ml-1 flex items-center text-xs font-medium text-red-600">
            <AlertCircle size={13} className="mr-1.5 flex-shrink-0" />
            <span>{errors.customerStatus}</span>
          </div>
        )}
      </div>
    );
  };

  // ===== CONFIRMATION MODAL =====
  const ConfirmationModal = () => {
    if (!showConfirmModal) return null;

    const changes = getChangedFields();
    const isStatusChanging = changes.customerStatus;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-black font-alpino">Confirm Updates</h3>
              <p className="text-sm text-gray-600 mt-1">Review the changes before updating</p>
            </div>
            <button onClick={() => setShowConfirmModal(false)} className="text-gray-500 hover:text-black transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Change Warning */}
            {isStatusChanging && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info size={24} className="text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-blue-900 text-lg mb-2">Status Change Detected</div>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>
                        <span className="font-semibold">Current:</span> {changes.customerStatus.old}
                      </p>
                      <p>
                        <span className="font-semibold">New:</span> {changes.customerStatus.new}
                      </p>
                      {changes.customerStatus.old === 'TEMPORARY' &&
                        changes.customerStatus.new === 'PERMANENT' && (
                          <p className="mt-2 font-semibold text-blue-900">
                            ✓ Temporary ID ({originalData.temporaryCustomerId}) will become Havmor Platform ID
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Changes Summary */}
            <div>
              <h4 className="text-lg font-bold text-black mb-3 flex items-center">
                <RefreshCw size={20} className="mr-2 text-green-600" />
                Changes Made (
                {Object.keys(changes).length +
                  (changes.customerAddress ? Object.keys(changes.customerAddress).length - 1 : 0)}
                )
              </h4>

              {/* Basic Information Changes */}
              {(changes.shopName || changes.customerStatus) && (
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-600 mb-2">Basic Information:</div>
                  <div className="bg-vanilla rounded-lg p-4 space-y-3">
                    {changes.customerStatus && (
                      <div className="border-l-4 border-blue-500 pl-3">
                        <div className="text-xs text-gray-500 font-medium">Customer Status</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400 line-through">
                            {changes.customerStatus.old}
                          </span>
                          <span className="text-sm">→</span>
                          <span className="text-sm text-black font-semibold">
                            {changes.customerStatus.new}
                          </span>
                        </div>
                      </div>
                    )}
                    {changes.shopName && (
                      <div className="border-l-4 border-blue-500 pl-3">
                        <div className="text-xs text-gray-500 font-medium">Shop Name</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400 line-through">{changes.shopName.old}</span>
                          <span className="text-sm">→</span>
                          <span className="text-sm text-black font-semibold">{changes.shopName.new}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Details Changes */}
              {(changes.firstName ||
                changes.lastName ||
                changes.phone ||
                changes.email ||
                changes.panCardNumber ||
                changes.gstinNumber) && (
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-600 mb-2">Contact Details:</div>
                  <div className="bg-vanilla rounded-lg p-4 space-y-3">
                    {changes.firstName && (
                      <div className="border-l-4 border-green-500 pl-3">
                        <div className="text-xs text-gray-500 font-medium">First Name</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400 line-through">{changes.firstName.old}</span>
                          <span className="text-sm">→</span>
                          <span className="text-sm text-black font-semibold">{changes.firstName.new}</span>
                        </div>
                      </div>
                    )}
                    {changes.lastName && (
                      <div className="border-l-4 border-green-500 pl-3">
                        <div className="text-xs text-gray-500 font-medium">Last Name</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400 line-through">{changes.lastName.old}</span>
                          <span className="text-sm">→</span>
                          <span className="text-sm text-black font-semibold">{changes.lastName.new}</span>
                        </div>
                      </div>
                    )}
                    {changes.phone && (
                      <div className="border-l-4 border-green-500 pl-3">
                        <div className="text-xs text-gray-500 font-medium">Phone</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400 line-through">{changes.phone.old}</span>
                          <span className="text-sm">→</span>
                          <span className="text-sm text-black font-semibold">{changes.phone.new}</span>
                        </div>
                      </div>
                    )}
                    {changes.email && (
                      <div className="border-l-4 border-green-500 pl-3">
                        <div className="text-xs text-gray-500 font-medium">Email</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400 line-through">{changes.email.old}</span>
                          <span className="text-sm">→</span>
                          <span className="text-sm text-black font-semibold">{changes.email.new}</span>
                        </div>
                      </div>
                    )}
                    {changes.panCardNumber && (
                      <div className="border-l-4 border-green-500 pl-3">
                        <div className="text-xs text-gray-500 font-medium">PAN Card</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400 line-through">
                            {changes.panCardNumber.old.toUpperCase()}
                          </span>
                          <span className="text-sm">→</span>
                          <span className="text-sm text-black font-semibold">
                            {changes.panCardNumber.new.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}
                    {changes.gstinNumber && (
                      <div className="border-l-4 border-green-500 pl-3">
                        <div className="text-xs text-gray-500 font-medium">GSTIN</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400 line-through">
                            {changes.gstinNumber.old.toUpperCase()}
                          </span>
                          <span className="text-sm">→</span>
                          <span className="text-sm text-black font-semibold">
                            {changes.gstinNumber.new.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Address Changes */}
              {changes.customerAddress && (
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-600 mb-2">Address:</div>
                  <div className="bg-vanilla rounded-lg p-4 space-y-3">
                    {changes.customerAddress.place && (
                      <div className="border-l-4 border-orange-500 pl-3">
                        <div className="text-xs text-gray-500 font-medium">Place</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400 line-through">
                            {changes.customerAddress.place.old}
                          </span>
                          <span className="text-sm">→</span>
                          <span className="text-sm text-black font-semibold">
                            {changes.customerAddress.place.new}
                          </span>
                        </div>
                      </div>
                    )}
                    {changes.customerAddress.city && (
                      <div className="border-l-4 border-orange-500 pl-3">
                        <div className="text-xs text-gray-500 font-medium">City</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400 line-through">
                            {changes.customerAddress.city.old}
                          </span>
                          <span className="text-sm">→</span>
                          <span className="text-sm text-black font-semibold">
                            {changes.customerAddress.city.new}
                          </span>
                        </div>
                      </div>
                    )}
                    {changes.customerAddress.state && (
                      <div className="border-l-4 border-orange-500 pl-3">
                        <div className="text-xs text-gray-500 font-medium">State</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400 line-through">
                            {changes.customerAddress.state.old}
                          </span>
                          <span className="text-sm">→</span>
                          <span className="text-sm text-black font-semibold">
                            {changes.customerAddress.state.new}
                          </span>
                        </div>
                      </div>
                    )}
                    {changes.customerAddress.pinCode && (
                      <div className="border-l-4 border-orange-500 pl-3">
                        <div className="text-xs text-gray-500 font-medium">PIN Code</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400 line-through">
                            {changes.customerAddress.pinCode.old}
                          </span>
                          <span className="text-sm">→</span>
                          <span className="text-sm text-black font-semibold">
                            {changes.customerAddress.pinCode.new}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-6 flex justify-between gap-4">
            <button onClick={() => setShowConfirmModal(false)} className="btn-outline flex-1 h-12 text-base">
              Cancel
            </button>
            <button
              onClick={handleConfirmSubmit}
              disabled={loading}
              className={`btn-primary flex-1 flex items-center justify-center h-12 text-base ${
                loading ? 'cursor-not-allowed opacity-70' : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle size={20} className="mr-2" />
                  Confirm & Update
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ===== LOADING STATE =====
  if (fetchingData) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-black mx-auto mb-4" />
          <p className="text-lg text-coffee font-medium">Loading customer data...</p>
        </div>
      </div>
    );
  }

  // ===== RENDER =====
  return (
    <div className="bg-cream min-h-screen px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <button
            onClick={() => navigate('/customers')}
            className="text-coffee hover:bg-vanilla hover:border-peach group mb-6 flex h-10 w-10 items-center justify-center rounded-lg border-2 border-gray-300 bg-white transition-all duration-200"
            aria-label="Back to customers"
          >
            <ArrowLeft size={20} className="transition-colors group-hover:text-black" />
          </button>

          <div className="space-y-1">
            <h1 className="font-alpino text-4xl font-bold tracking-wide text-black sm:text-5xl">Update Customer</h1>
            <p className="text-coffee text-base font-medium tracking-wide">Modify customer details below</p>
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
                {index < 2 && (
                  <div className="mx-2 h-[3px] flex-1 overflow-hidden rounded-full bg-gray-200 sm:mx-4">
                    <div
                      className={`h-full bg-black transition-all duration-500 ease-out ${
                        currentStep > step.number ? 'w-full' : 'w-0'
                      }`}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleShowConfirmation} onKeyDown={handleFormKeyDown}>
          <div className="card p-6 sm:p-8">
            {/* STEP 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="font-alpino mb-6 text-2xl font-bold tracking-wide text-black">Basic Information</h3>

                {/* ✅ Editable Customer Status */}
                {renderCustomerStatusRadio()}

                {/* ✅ Show Current ID (Read-Only) */}
                {formData.customerStatus === 'TEMPORARY' && formData.temporaryCustomerId && (
                  <div className="grid grid-cols-1">
                    {renderInputField('temporaryCustomerId', 'text', 'Temporary Customer ID', <Hash size={20} />, {
                      disabled: true,
                      helperText: '✓ ID cannot be changed',
                    })}
                  </div>
                )}

                {formData.customerStatus === 'PERMANENT' && formData.havmorPlatformCustomerId && (
                  <div className="grid grid-cols-1">
                    {renderInputField(
                      'havmorPlatformCustomerId',
                      'text',
                      'Havmor Platform Customer ID',
                      <Hash size={20} />,
                      {
                        disabled: true,
                        helperText: '✓ ID cannot be changed',
                      }
                    )}
                  </div>
                )}

                {renderInputField('shopName', 'text', 'Shop Name', <Store size={20} />, {
                  required: true,
                })}

                <div className="flex justify-end pt-4">
                  <button type="button" onClick={nextStep} className="btn-primary h-12 px-8 text-base">
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Contact Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="font-alpino mb-6 text-2xl font-bold tracking-wide text-black">Contact Details</h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {renderInputField('firstName', 'text', 'First Name', <User size={20} />)}
                  {renderInputField('lastName', 'text', 'Last Name', <User size={20} />)}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {renderInputField('phone', 'tel', 'Phone Number', <Phone size={20} />, {
                    required: true,
                    placeholder: '10 digits',
                    inputProps: { maxLength: 10, pattern: '[0-9]*' },
                  })}

                  {renderInputField('email', 'email', 'Email Address', <Mail size={20} />)}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {renderInputField('panCardNumber', 'text', 'PAN Card Number', <CreditCard size={20} />, {
                    placeholder: 'ABCDE1234F',
                    inputProps: { maxLength: 10 },
                  })}

                  {renderInputField('gstinNumber', 'text', 'GSTIN Number', <CreditCard size={20} />, {
                    placeholder: '15 characters',
                    inputProps: { maxLength: 15 },
                  })}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button type="button" onClick={prevStep} className="btn-outline h-12 px-8 text-base">
                    ← Previous
                  </button>
                  <button type="button" onClick={nextStep} className="btn-primary h-12 px-8 text-base">
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Address */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="font-alpino mb-6 text-2xl font-bold tracking-wide text-black">Customer Address</h3>

                {renderInputField('customerAddress.place', 'text', 'Place / Address Line', <MapPin size={20} />, {
                  required: true,
                })}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {renderInputField('customerAddress.city', 'text', 'City', <Building2 size={20} />, {
                    required: true,
                  })}

                  {renderStateTypeahead()}
                </div>

                {renderInputField('customerAddress.pinCode', 'text', 'PIN Code', <Hash size={20} />, {
                  required: true,
                  placeholder: '6 digits',
                  inputProps: { maxLength: 6, pattern: '[0-9]*' },
                })}

                <div className="flex items-center justify-between pt-4">
                  <button type="button" onClick={prevStep} className="btn-outline h-12 px-8 text-base">
                    ← Previous
                  </button>
                  <button type="submit" className="btn-primary flex h-12 items-center px-8 text-base">
                    <CheckCircle size={20} className="mr-2" />
                    Review & Update
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      <ConfirmationModal />
    </div>
  );
};

export default UpdateCustomer;
