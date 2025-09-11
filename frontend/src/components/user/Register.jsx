import React, { useState } from 'react';
import { Eye, EyeOff, MessageSquare, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import userApi from '../../services/userApi';
import { SECURITY_QUESTIONS } from '../../utils/constants';
import { validateField } from '../../utils/validate';
import { validateForm } from '../../middlewares/validateUser.middleware';
import { registerUserValidationSchema } from '../../validations/userValidationSchemas';

const Register = () => {
  const navigate = useNavigate();

  // ===== FORM STATE =====
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

  // ===== UI STATE =====
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showSecurityAnswer, setShowSecurityAnswer] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  // ===== REAL-TIME VALIDATION =====
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for phone number - only digits
    if (name === 'phone') {
      const numericValue = value.replace(/[^\d]/g, '');
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));

        const error = validateField(name, numericValue);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
      return;
    }

    // Update form data
    setFormData((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  // ===== FOCUS HANDLERS =====
  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  // ===== FORM SUBMISSION WITH BACKEND INTEGRATION =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Frontend validation using validation middleware
      const validation = await validateForm(registerUserValidationSchema, formData);

      if (!validation.valid) {
        setErrors(validation.errors);
        setMessage({
          type: 'error',
          text: 'Please fix the validation errors below.',
        });
        setLoading(false);
        return;
      }

      // 2. Clear any existing errors
      setErrors({});

      // 3. Call backend API using userApi service
      const response = await userApi.registerUser(formData);

      // 4. Handle successful registration
      if (response.success) {
        setMessage({
          type: 'success',
          text: response.message || 'Registration successful! Please login to continue.',
        });

        // 5. Reset form
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

        // 6. Redirect to login after 1.5 seconds
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (error) {
      console.error('Registration error:', error);

      // Handle different types of errors using your ApiError structure
      if (error.statusCode === 409) {
        // User already exists
        setMessage({
          type: 'error',
          text: 'User with this email or username already exists. Please try different credentials.',
        });
      } else if (error.statusCode === 400) {
        // Validation errors from backend
        if (error.errors && error.errors.length > 0) {
          setMessage({
            type: 'error',
            text: 'Validation failed: ' + error.errors.join(', '),
          });
        } else {
          setMessage({
            type: 'error',
            text: error.message || 'Invalid input data. Please check your information.',
          });
        }
      } else if (error.statusCode >= 500) {
        // Server errors
        setMessage({
          type: 'error',
          text: 'Server error. Please try again later.',
        });
      } else {
        // Network or other errors
        setMessage({
          type: 'error',
          text: error.message || 'Registration failed. Please check your connection and try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== ENHANCED SLASHED MESSAGE SQUARE ICON =====
  const SlashedMessageSquare = ({ size = 20, className = '' }) => (
    <div className="relative">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <div
        className="absolute flex items-center justify-center"
        style={{
          background: `linear-gradient(45deg, transparent 46%, currentColor 46%, currentColor 54%, transparent 54%)`,
          width: `${size}px`,
          height: `${size}px`,
          top: '-1.5px',
        }}
      />
    </div>
  );

  // ===== GET FIELD ICON =====
  const getFieldIcon = (fieldName) => {
    const isVisible = focusedField === fieldName || formData[fieldName];
    const iconClass = `absolute right-3 top-4 transition-all duration-500 ease-in-out ${
      isVisible ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-75'
    }`;

    switch (fieldName) {
      case 'password':
        return (
          <button
            type="button"
            className={`${iconClass} z-10 cursor-pointer text-gray-600 hover:text-black`}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        );
      case 'securityAnswer':
        return (
          <button
            type="button"
            className={`${iconClass} z-10 cursor-pointer text-gray-600 hover:text-black`}
            onClick={() => setShowSecurityAnswer(!showSecurityAnswer)}
          >
            <div className="transform transition-all duration-300 ease-in-out">
              {showSecurityAnswer ? (
                <SlashedMessageSquare size={22} className="scale-100 transform" />
              ) : (
                <MessageSquare size={20} className="scale-100 transform" />
              )}
            </div>
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-cream flex min-h-screen items-center justify-center">
      <div className="w-full max-w-[41rem]">
        <div className="card flex flex-col items-center justify-between">
          {/* Header Section */}
          <div className="mb-6 text-center">
            <h2 className="text-card-title mb-2 text-black">Create Account</h2>
            <p className="text-caption text-coffee">Join Mahima Agencies Right Now</p>
          </div>

          {/* Message Display */}
          {message.text && (
            <div
              className={`mb-4 w-full rounded-lg border p-3 text-sm font-medium ${
                message.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}
            >
              <div className="flex items-center">
                <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                {message.text}
              </div>
            </div>
          )}

          {/* Form Section */}
          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            {/* Personal Information Row */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
              {/* First Name */}
              <div className="flex justify-center sm:justify-start">
                <div className="input-container relative">
                  <input
                    className="input h-[55px] w-[285px] rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
                    name="firstName"
                    type="text"
                    required
                    placeholder=" "
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    onFocus={() => handleFocus('firstName')}
                    onBlur={handleBlur}
                  />
                  <label className="label pointer-events-none absolute top-[13px] left-5 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
                    First Name
                  </label>
                  <div className="topline absolute top-0 right-0 h-[1.5px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
                  {errors.firstName && (
                    <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
                      <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                      <span>{errors.firstName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Last Name */}
              <div className="flex justify-center sm:justify-end">
                <div className="input-container relative">
                  <input
                    className="input h-[55px] w-[285px] rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
                    name="lastName"
                    type="text"
                    required
                    placeholder=" "
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    onFocus={() => handleFocus('lastName')}
                    onBlur={handleBlur}
                  />
                  <label className="label pointer-events-none absolute top-[13px] left-5 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
                    Last Name
                  </label>
                  <div className="topline absolute top-0 right-0 h-[1.5px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
                  {errors.lastName && (
                    <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
                      <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                      <span>{errors.lastName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Row */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
              {/* Email */}
              <div className="flex justify-center sm:justify-start">
                <div className="input-container relative">
                  <input
                    className="input h-[55px] w-[285px] rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 text-[17px] font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
                    name="email"
                    type="email"
                    required
                    placeholder=" "
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={handleBlur}
                  />
                  <label className="label pointer-events-none absolute top-[13px] left-5 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
                    Email Address
                  </label>
                  <div className="topline absolute top-0 right-0 h-[2px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
                  {errors.email && (
                    <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
                      <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex justify-center sm:justify-end">
                <div className="input-container relative">
                  <input
                    className="input h-[55px] w-[285px] rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
                    name="phone"
                    type="tel"
                    required
                    placeholder=" "
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => handleFocus('phone')}
                    onBlur={handleBlur}
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                  <label className="label pointer-events-none absolute top-[13px] left-5 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
                    Phone No.
                  </label>
                  <div className="topline absolute top-0 right-0 h-[2px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
                  {errors.phone && (
                    <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
                      <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                      <span>{errors.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Credentials Row */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
              {/* Username */}
              <div className="flex justify-center sm:justify-start">
                <div className="input-container relative">
                  <input
                    className="input h-[55px] w-[285px] rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
                    name="username"
                    type="text"
                    required
                    placeholder=" "
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange}
                    onFocus={() => handleFocus('username')}
                    onBlur={handleBlur}
                  />
                  <label className="label pointer-events-none absolute top-[13px] left-5 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
                    Username
                  </label>
                  <div className="topline absolute top-0 right-0 h-[1.5px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
                  {errors.username && (
                    <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
                      <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                      <span>{errors.username}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="flex justify-center sm:justify-end">
                <div className="input-container relative">
                  <input
                    className="input h-[55px] w-[285px] rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 pr-12 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder=" "
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={handleBlur}
                  />
                  <label className="label pointer-events-none absolute top-[13px] left-5 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
                    Password
                  </label>
                  <div className="topline absolute top-0 right-0 h-[1.5px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
                  {getFieldIcon('password')}
                  {errors.password && (
                    <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
                      <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Security Question Section */}
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
                    Registering...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            {/* Already have account */}
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
