// src/components/customer/UpdateCustomer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  AlertCircle,
  Lock,
} from 'lucide-react';
import customerApi from '../../services/customerApi';
import authService from '../../services/authService';
import { validateCustomerField, validateCustomerForm } from '../../utils/validate';
import { customerValidationSchema } from '../../validations/customerValidationSchemas';
import { indianStateOptions, INDIAN_STATES_WITH_ABBREVIATIONS } from '../../utils/indianStates';
import Input from '../common/Input';
import Button from '../common/Button';
import Modal from '../common/Modal';

const UpdateCustomer = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();
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

  const [originalData, setOriginalData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isOriginallyPermanent, setIsOriginallyPermanent] = useState(false);

  // STATE TYPEAHEAD
  const [stateSearch, setStateSearch] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [filteredStates, setFilteredStates] = useState(indianStateOptions);
  const [selectedStateIndex, setSelectedStateIndex] = useState(0);

  // FETCH CUSTOMER DATA
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) {
        toast.error('Invalid customer ID');
        navigate('/customers', { replace: true });
        return;
      }

      try {
        console.log('🔍 Fetching customer with ID:', customerId);
        const response = await customerApi.getCustomerById(customerId);
        
        console.log('📦 Full API Response:', response);
        console.log('📊 Response Data:', response.data);
        
        if (response.success && response.data) {
          const customer = response.data.customer || response.data;
          
          console.log('👤 Extracted Customer Object:', customer);
          
          if (!customer || !customer.shopName) {
            console.error('❌ Invalid customer data structure:', response.data);
            throw new Error('Customer data is incomplete or missing');
          }
          
          const loadedData = {
            customerStatus: customer.customerStatus || 'TEMPORARY',
            temporaryCustomerId: customer.temporaryCustomerId || '',
            havmorPlatformCustomerId: customer.havmorPlatformCustomerId || '',
            shopName: customer.shopName || '',
            firstName: customer.firstName || '',
            lastName: customer.lastName || '',
            email: customer.email || '',
            phone: customer.phone || '',
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

          console.log('✅ Loaded Form Data:', loadedData);

          // Track if originally PERMANENT
          setIsOriginallyPermanent(customer.customerStatus === 'PERMANENT');

          setFormData(loadedData);
          setOriginalData(JSON.parse(JSON.stringify(loadedData)));
          setStateSearch(customer.customerAddress?.state || '');
          
          toast.success('Customer data loaded successfully');
        } else {
          throw new Error('Invalid API response structure');
        }
      } catch (error) {
        console.error('❌ Fetch customer failed:', error);
        console.error('Error Details:', {
          message: error.message,
          statusCode: error.statusCode,
          response: error.response
        });
        
        toast.error(error.message || 'Failed to load customer details');
        navigate('/customers', { replace: true });
      } finally {
        setFetchingData(false);
      }
    };

    fetchCustomer();
  }, [customerId, navigate]);

  // AUTO-COPY: Temp ID to Platform ID when switching to PERMANENT
  useEffect(() => {
    if (
      formData.customerStatus === 'PERMANENT' &&
      formData.temporaryCustomerId &&
      !formData.havmorPlatformCustomerId
    ) {
      setFormData((prev) => ({
        ...prev,
        havmorPlatformCustomerId: prev.temporaryCustomerId,
      }));
      
      toast.success('Temporary ID converted to Platform ID');
    }
  }, [formData.customerStatus, formData.temporaryCustomerId, formData.havmorPlatformCustomerId]);

  // DETECT FORM CHANGES
  useEffect(() => {
    if (originalData) {
      const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasChanges(changed);
    }
  }, [formData, originalData]);

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
      const filtered = indianStateOptions.filter((state) =>
        state.label.toLowerCase().includes(searchLower)
      );
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

  // STEP VALIDATION
  const validateCurrentStep = () => {
    const stepErrors = {};
    let isValid = true;

    if (currentStep === 1) {
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
    
    if (!hasChanges) {
      toast.info('No changes detected');
      return;
    }

    if (!validateCurrentStep()) return;
    setShowConfirmModal(true);
  };

  // HELPER: Get changed fields for modal
  const getChangedFields = () => {
    if (!originalData) return {};

    const changes = {};

    // Check each field for changes
    if (formData.customerStatus !== originalData.customerStatus) {
      changes.customerStatus = formData.customerStatus;
    }
    if (formData.shopName !== originalData.shopName) {
      changes.shopName = formData.shopName;
    }
    if (formData.firstName !== originalData.firstName) {
      changes.firstName = formData.firstName;
    }
    if (formData.lastName !== originalData.lastName) {
      changes.lastName = formData.lastName;
    }
    if (formData.email !== originalData.email) {
      changes.email = formData.email;
    }
    if (formData.phone !== originalData.phone) {
      changes.phone = formData.phone;
    }
    if (formData.panCardNumber !== originalData.panCardNumber) {
      changes.panCardNumber = formData.panCardNumber;
    }
    if (formData.gstinNumber !== originalData.gstinNumber) {
      changes.gstinNumber = formData.gstinNumber;
    }

    // Check address changes
    const addressChanges = {};
    if (formData.customerAddress.place !== originalData.customerAddress.place) {
      addressChanges.place = formData.customerAddress.place;
    }
    if (formData.customerAddress.city !== originalData.customerAddress.city) {
      addressChanges.city = formData.customerAddress.city;
    }
    if (formData.customerAddress.state !== originalData.customerAddress.state) {
      addressChanges.state = formData.customerAddress.state;
    }
    if (formData.customerAddress.pinCode !== originalData.customerAddress.pinCode) {
      addressChanges.pinCode = formData.customerAddress.pinCode;
    }

    if (Object.keys(addressChanges).length > 0) {
      changes.customerAddress = addressChanges;
    }

    return changes;
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

      // Prepare update payload
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

      console.log('📤 Submitting update for customer:', customerId);
      console.log('📝 Update payload:', customerData);

      const response = await customerApi.updateCustomer(customerId, customerData);

      if (response.success) {
        toast.success('Customer updated successfully!');
        navigate('/customers', { replace: true });
      }
    } catch (error) {
      console.error('❌ Update customer failed:', error);

      let errorMsg = 'Failed to update customer';
      
      if (error.statusCode === 409) {
        errorMsg = 'Conflict: ID already exists for another customer';
      } else if (error.statusCode === 11000) {
        errorMsg = 'Duplicate entry detected. Phone or ID already in use.';
      } else if (error.statusCode === 404) {
        errorMsg = 'Customer not found';
      } else if (error.statusCode === 400 && error.errors?.length) {
        errorMsg = error.errors[0];
      } else if (error.statusCode === 500) {
        errorMsg = 'Server error. Please try again.';
      } else if (error.message?.includes('WriteConflict')) {
        errorMsg = 'Update conflict detected. Please refresh and retry.';
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

  // LOADING STATE
  if (fetchingData) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-coffee font-medium">Loading customer details...</p>
        </div>
      </div>
    );
  }

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
              Update Customer
            </h1>
            <p className="text-coffee text-base font-medium tracking-wide">
              Modify customer information
            </p>
          </div>

          {hasChanges && (
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-amber-700 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
              <AlertCircle size={16} />
              <span>Unsaved changes detected</span>
            </div>
          )}
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
                        className={`flex-1 rounded-lg border-2 p-4 transition-all ${
                          formData.customerStatus === status
                            ? 'border-black bg-vanilla'
                            : isOriginallyPermanent && status === 'TEMPORARY'
                            ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                            : 'border-gray-300 hover:border-gray-400 cursor-pointer'
                        }`}
                      >
                        <input
                          type="radio"
                          name="customerStatus"
                          value={status}
                          checked={formData.customerStatus === status}
                          onChange={handleChange}
                          disabled={isOriginallyPermanent && status === 'TEMPORARY'}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-base font-semibold">
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </span>
                          {isOriginallyPermanent && status === 'TEMPORARY' && (
                            <Lock size={16} className="text-gray-400" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* TEMPORARY: Show Temp ID only */}
                {formData.customerStatus === 'TEMPORARY' && formData.temporaryCustomerId && (
                  <Input
                    name="temporaryCustomerId"
                    type="text"
                    label="Temporary Customer ID"
                    value={formData.temporaryCustomerId}
                    disabled
                    icon={Hash}
                  />
                )}

                {/* PERMANENT: Show Platform ID (read-only) */}
                {formData.customerStatus === 'PERMANENT' && formData.havmorPlatformCustomerId && (
                  <Input
                    name="havmorPlatformCustomerId"
                    type="text"
                    label="Havmor Platform Customer ID"
                    value={formData.havmorPlatformCustomerId}
                    disabled
                    icon={Hash}
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

                <div className="flex items-center justify-between pt-4">
                  <Button type="button" onClick={prevStep} variant="outline" className="h-12 px-8">
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={CheckCircle}
                    className="h-12 px-8"
                    disabled={!hasChanges}
                  >
                    Review & Update
                  </Button>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Confirmation Modal - ONLY CHANGED FIELDS */}
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Changes"
          size="2xl"
          showCloseButton={false}
        >
          <p className="text-sm text-gray-600 mb-6">
            Review the changes you made before updating
          </p>

          <div className="space-y-4">
            {(() => {
              const changes = getChangedFields();
              const hasChangesToShow = Object.keys(changes).length > 0;

              if (!hasChangesToShow) {
                return (
                  <div className="text-center py-4 text-gray-500">
                    No changes detected
                  </div>
                );
              }

              return (
                <div className="bg-vanilla rounded-lg p-4 space-y-3">
                  {changes.customerStatus && (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-gray-600 font-medium">Customer Type</span>
                      <span className="text-black font-semibold">{changes.customerStatus}</span>
                    </div>
                  )}
                  {changes.shopName && (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-gray-600 font-medium">Shop Name</span>
                      <span className="text-black font-semibold">{changes.shopName}</span>
                    </div>
                  )}
                  {changes.firstName && (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-gray-600 font-medium">First Name</span>
                      <span className="text-black font-semibold">{changes.firstName}</span>
                    </div>
                  )}
                  {changes.lastName && (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-gray-600 font-medium">Last Name</span>
                      <span className="text-black font-semibold">{changes.lastName}</span>
                    </div>
                  )}
                  {changes.phone && (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-gray-600 font-medium">Phone</span>
                      <span className="text-black font-semibold">{changes.phone}</span>
                    </div>
                  )}
                  {changes.email && (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-gray-600 font-medium">Email</span>
                      <span className="text-black font-semibold">{changes.email}</span>
                    </div>
                  )}
                  {changes.panCardNumber && (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-gray-600 font-medium">PAN Card</span>
                      <span className="text-black font-semibold">{changes.panCardNumber}</span>
                    </div>
                  )}
                  {changes.gstinNumber && (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-gray-600 font-medium">GSTIN</span>
                      <span className="text-black font-semibold">{changes.gstinNumber}</span>
                    </div>
                  )}
                  {changes.customerAddress && (
                    <>
                      {changes.customerAddress.place && (
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="text-gray-600 font-medium">Address</span>
                          <span className="text-black font-semibold">{changes.customerAddress.place}</span>
                        </div>
                      )}
                      {changes.customerAddress.city && (
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="text-gray-600 font-medium">City</span>
                          <span className="text-black font-semibold">{changes.customerAddress.city}</span>
                        </div>
                      )}
                      {changes.customerAddress.state && (
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="text-gray-600 font-medium">State</span>
                          <span className="text-black font-semibold">{changes.customerAddress.state}</span>
                        </div>
                      )}
                      {changes.customerAddress.pinCode && (
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="text-gray-600 font-medium">PIN Code</span>
                          <span className="text-black font-semibold">{changes.customerAddress.pinCode}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={loading}
              className="h-12 px-6"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmSubmit}
              loading={loading}
              icon={CheckCircle}
              className="h-12 px-6"
            >
              Confirm Update
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default UpdateCustomer;
