// src/components/user/Register.jsx
import React, { useState } from 'react';
import { Eye, EyeOff, MessageSquare, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// ✅ Centralized imports - Using your existing system
import userApi from '../../services/userApi';
import { SECURITY_QUESTIONS } from '../../utils/constants';
import { validateField } from '../../utils/validate';
import { validateForm } from '../../middlewares/validateUser.middleware';
import { registerUserValidationSchema } from '../../validations/userValidationSchemas';

const Register = () => {
  const navigate = useNavigate();

  // ===== STATE MANAGEMENT =====
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    securityQuestion: '',
    securityAnswer: '',
  });

  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSecurityAnswer, setShowSecurityAnswer] = useState(false);

  // ===== FORM HANDLERS =====
  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Phone validation using centralized regex
    if (name === 'phone') {
      const numericValue = value.replace(/[^\d]/g, '');
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
        // Use centralized validation
        const error = validateField(name, numericValue);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
      return;
    }

    // All other fields using centralized validation
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleFocus = (fieldName) => setFocusedField(fieldName);
  const handleBlur = () => setFocusedField('');

  // ===== FORM SUBMISSION =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Use centralized form validation
      const validation = await validateForm(registerUserValidationSchema, formData);
      if (!validation.valid) {
        setErrors(validation.errors);
        toast.error('Please fix form errors');
        return;
      }

      setErrors({});

      // Submit registration
      const response = await userApi.registerUser(formData);

      if (response.success) {
        toast.success(response.message || 'Account created successfully!');

        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          username: '',
          password: '',
          securityQuestion: '',
          securityAnswer: '',
        });

        // Redirect to login
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (error) {
      // ✅ Concise error messages using centralized approach
      let errorMsg = 'Registration failed';

      if (error.statusCode === 409) errorMsg = 'User already exists';
      else if (error.statusCode === 400 && error.errors?.length) errorMsg = error.errors[0];
      else if (error.statusCode >= 500) errorMsg = 'Server error';

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ===== UTILITY FUNCTIONS =====
  const getFieldIcon = (fieldName) => {
    const isVisible = focusedField === fieldName || formData[fieldName];
    const iconClass = `absolute right-3 top-4 transition-opacity duration-500 z-10 cursor-pointer text-gray-600 hover:text-black ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`;

    switch (fieldName) {
      case 'password':
        return (
          <button
            type="button"
            className={iconClass}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        );
      case 'securityAnswer':
        return (
          <button
            type="button"
            className={iconClass}
            onClick={() => setShowSecurityAnswer(!showSecurityAnswer)}
          >
            <MessageSquare size={20} />
          </button>
        );
      default:
        return null;
    }
  };

  const renderInputField = (name, type, label, options = {}) => (
    <div className="input-container relative">
      <input
        className={`input h-[55px] w-[285px] rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 ${
          name === 'password' || name === 'securityAnswer' ? 'pr-12' : ''
        } text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm`}
        name={name}
        type={type}
        required
        placeholder=" "
        autoComplete={options.autoComplete || name}
        value={formData[name]}
        onChange={handleChange}
        onFocus={() => handleFocus(name)}
        onBlur={handleBlur}
        {...options.inputProps}
      />
      <label className="label pointer-events-none absolute top-[13px] left-5 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
        {label}
      </label>
      <div className="topline absolute top-0 right-0 h-[1.5px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
      {getFieldIcon(name)}
      {errors[name] && (
        <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
          <AlertCircle size={12} className="mr-1 flex-shrink-0" />
          <span>{errors[name]}</span>
        </div>
      )}
    </div>
  );

  // ===== RENDER =====
  return (
    <div className="bg-cream flex min-h-screen items-center justify-center">
      <div className="w-full max-w-[41rem]">
        <div className="card flex flex-col items-center justify-between">
          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="text-card-title mb-2 text-black">Create Account</h2>
            <p className="text-caption text-coffee">Join Mahima Agencies Right Now</p>
          </div>

          {/* Form */}
          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
              <div className="flex justify-center sm:justify-start">
                {renderInputField('firstName', 'text', 'First Name', {
                  autoComplete: 'given-name',
                })}
              </div>
              <div className="flex justify-center sm:justify-end">
                {renderInputField('lastName', 'text', 'Last Name', { autoComplete: 'family-name' })}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
              <div className="flex justify-center sm:justify-start">
                {renderInputField('email', 'email', 'Email Address')}
              </div>
              <div className="flex justify-center sm:justify-end">
                {renderInputField('phone', 'tel', 'Phone No.', {
                  inputProps: { inputMode: 'numeric', pattern: '[0-9]*' },
                })}
              </div>
            </div>

            {/* Account Credentials */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
              <div className="flex justify-center sm:justify-start">
                {renderInputField('username', 'text', 'Username')}
              </div>
              <div className="flex justify-center sm:justify-end">
                {renderInputField('password', showPassword ? 'text' : 'password', 'Password', {
                  autoComplete: 'new-password',
                })}
              </div>
            </div>

            {/* Security Section */}
            <div className="mt-8 space-y-6">
              {/* Security Question */}
              <div className="input-container relative">
                <select
                  className="input h-[55px] w-full cursor-pointer rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-4 text-xl font-medium tracking-wider text-[#0b2447] transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
                  name="securityQuestion"
                  required
                  value={formData.securityQuestion}
                  onChange={handleChange}
                  onFocus={() => handleFocus('securityQuestion')}
                  onBlur={handleBlur}
                >
                  <option value="" disabled hidden>
                    Select one option
                  </option>
                  {SECURITY_QUESTIONS.map((question, index) => (
                    <option
                      key={index}
                      value={question}
                      className="py-3 font-medium text-[#0b2447]"
                    >
                      {question}
                    </option>
                  ))}
                </select>
                <label className="label pointer-events-none absolute top-[13px] left-4 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
                  Security Question
                </label>
                <div className="topline absolute top-0 right-0 h-[1.5px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
                {errors.securityQuestion && (
                  <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
                    <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                    <span>{errors.securityQuestion}</span>
                  </div>
                )}
              </div>

              {/* Security Answer */}
              <div className="input-container relative">
                <input
                  className="input sec h-[55px] w-full rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-4 pr-12 text-xl font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
                  name="securityAnswer"
                  type={showSecurityAnswer ? 'text' : 'password'}
                  required
                  placeholder=" "
                  autoComplete="off"
                  value={formData.securityAnswer}
                  onChange={handleChange}
                  onFocus={() => handleFocus('securityAnswer')}
                  onBlur={handleBlur}
                />
                <label className="label pointer-events-none absolute top-[13px] left-4 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
                  Security Answer
                </label>
                <div className="topline absolute top-0 right-0 h-[1.5px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
                {getFieldIcon('securityAnswer')}
                {errors.securityAnswer && (
                  <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
                    <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                    <span>{errors.securityAnswer}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`h-[55px] w-full ${
                  loading
                    ? 'cursor-not-allowed bg-gray-600'
                    : 'bg-black hover:bg-gray-800 active:bg-gray-900'
                } focus:ring-offset-cream flex items-center justify-center rounded-lg text-xl font-medium text-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-md focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none`}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="pt-4 text-center">
              <p className="text-coffee text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-medium text-black hover:underline focus:outline-none"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
