import React, { useState } from 'react';
import { UserCheck, Eye, EyeOff, AlertCircle, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import userApi from '../../services/userApi';
import { validateField } from '../../utils/validate';
import { validateForm } from '../../middlewares/validateUser.middleware';
import { loginUserValidationSchema } from '../../validations/userValidationSchemas';

const Login = () => {
  const navigate = useNavigate();

  // ===== FORM STATE =====
  const [formData, setFormData] = useState({
    username: '', // Can be username OR email
    password: '',
  });

  // ===== UI STATE =====
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEmail, setIsEmail] = useState(false); // Track if input is email format

  // ===== DETECT EMAIL FORMAT =====
  const detectEmailFormat = (value) => {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return emailRegex.test(value);
  };

  // ===== HANDLE INPUT CHANGE =====
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Detect if input is email format
    if (name === 'username') {
      setIsEmail(detectEmailFormat(value));
    }

    // Real-time validation using validation utility
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    // Clear messages when user starts typing
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
      // Prepare login data based on input type
      const loginData = {};
      
      if (isEmail) {
        loginData.email = formData.username.trim().toLowerCase();
      } else {
        loginData.username = formData.username.trim().toLowerCase();
      }
      
      loginData.password = formData.password;

      // 1. Frontend validation using validation middleware
      const validation = await validateForm(loginUserValidationSchema, loginData);
      
      if (!validation.valid) {
        setErrors(validation.errors);
        setMessage({ 
          type: 'error', 
          text: 'Please fix the validation errors below.' 
        });
        setLoading(false);
        return;
      }

      // 2. Clear any existing errors
      setErrors({});

      // 3. Call backend API using userApi service
      const response = await userApi.loginUser(loginData);

      // 4. Handle successful login
      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;

        // Store authentication data
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userData', JSON.stringify(user));

        setMessage({
          type: 'success',
          text: response.message || 'Login successful! Redirecting to dashboard...',
        });

        // Clear form
        setFormData({ username: '', password: '' });
        setErrors({});

        // Redirect to dashboard after short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }

    } catch (error) {
      // Handle different types of errors using your ApiError structure
      if (error.statusCode === 401) {
        // Invalid credentials
        setMessage({
          type: 'error',
          text: 'Invalid credentials. Please check your username/email and password.',
        });
      } else if (error.statusCode === 404) {
        // User not found
        setMessage({
          type: 'error',
          text: 'Account not found. Please check your credentials or sign up.',
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
            text: error.message || 'Invalid login data. Please check your information.',
          });
        }
      } else if (error.statusCode >= 500) {
        // Server errors
        setMessage({
          type: 'error',
          text: 'Server error. Please try again later.',
        });
      } else if (error.statusCode === 503) {
        // Network errors
        setMessage({
          type: 'error',
          text: 'Cannot connect to server. Please check if backend is running.',
        });
      } else {
        // Other errors
        setMessage({
          type: 'error',
          text: error.message || 'Login failed. Please check your connection and try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== GET FIELD ICON =====
  const getFieldIcon = (fieldName) => {
    const isVisible = focusedField === fieldName || formData[fieldName];
    const iconClass = `absolute right-3 top-4 transition-all duration-500 ease-in-out ${
      isVisible ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-75'
    }`;

    switch (fieldName) {
      case 'username':
        return isEmail ? (
          <Mail className={`${iconClass} text-gray-600`} size={20} />
        ) : (
          <UserCheck className={`${iconClass} text-gray-600`} size={20} />
        );
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
      default:
        return null;
    }
  };

  return (
    <div className="bg-cream flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-[26rem]">
        <div className="card flex flex-col items-center justify-between">
          {/* Header Section */}
          <div className="mb-6 text-center">
            <h2 className="text-card-title mb-2 text-black">Welcome Back</h2>
            <p className="text-caption text-coffee">Sign in to Mahima Agencies</p>
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
            {/* Username/Email Field */}
            <div className="input-container relative">
              <input
                className="input h-[55px] w-full rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 pr-12 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
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
                {isEmail ? 'Email' : 'Username'}
              </label>
              <div className="topline absolute top-0 right-0 h-[2px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
              {getFieldIcon('username')}
              {errors.username && (
                <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
                  <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                  <span>{errors.username}</span>
                </div>
              )}
              {errors.email && (
                <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
                  <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="input-container relative">
              <input
                className="input h-[55px] w-full rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 pr-12 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder=" "
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => handleFocus('password')}
                onBlur={handleBlur}
              />
              <label className="label pointer-events-none absolute top-[13px] left-5 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
                Password
              </label>
              <div className="topline absolute top-0 right-0 h-[2px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
              {getFieldIcon('password')}
              {errors.password && (
                <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
                  <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-black hover:underline focus:outline-none"
                onClick={() => navigate('/reset-password')}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
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
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            {/* Don't have account */}
            <div className="pt-4 text-center">
              <p className="text-coffee text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="font-medium text-black hover:underline focus:outline-none"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
