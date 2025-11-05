import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { validateForm } from '../middlewares/validateUser.middleware.js';
import { validateField } from '../utils/validate.js';

/**
 * Custom hook for authentication forms
 * Handles form state, validation, and submission logic
 * @param {Object} initialValues - Initial form data
 * @param {Object} validationSchema - Yup validation schema
 * @param {Function} onSubmit - Submit handler function
 */
export const useAuthForm = (initialValues, validationSchema, onSubmit) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  // Handle input change with real-time validation
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for phone number (numeric only, max 10 digits)
    if (name === 'phone') {
      const numericValue = value.replace(/[^\d]/g, '');
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
        const error = validateField(name, numericValue);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
      return;
    }

    // Update form data and validate
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle input focus
  const handleFocus = (fieldName) => setFocusedField(fieldName);

  // Handle input blur
  const handleBlur = () => setFocusedField('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate entire form
      const validation = await validateForm(validationSchema, formData);
      if (!validation.valid) {
        setErrors(validation.errors);
        toast.error('Please fix form errors');
        return;
      }

      setErrors({});

      // Call provided submit handler
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission failed:', error.message);
      
      // Handle API errors with user-friendly messages
      let errorMsg = 'Submission failed';
      if (error.statusCode === 409) errorMsg = 'User already exists';
      else if (error.statusCode === 400 && error.errors?.length) errorMsg = error.errors[0];
      else if (error.statusCode >= 500) errorMsg = 'Server error';

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Reset form to initial values
  const resetForm = () => {
    setFormData(initialValues);
    setErrors({});
    setFocusedField('');
  };

  return {
    formData,
    setFormData,
    errors,
    loading,
    focusedField,
    handleChange,
    handleFocus,
    handleBlur,
    handleSubmit,
    resetForm,
  };
};
