import React, { useState } from 'react';
import { UserCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import userApi from '../../services/userApi';

const SignIn = () => {
  // ===== FORM STATE =====
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // ===== UI STATE =====
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // ===== VALIDATION =====
  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Required';
        if (value.length < 3) return 'Min 3 characters';
        return '';

      case 'password':
        if (!value) return 'Required';
        if (value.length < 8) return 'Min 8 characters';
        return '';

      default:
        return '';
    }
  };

  // ===== HANDLE INPUT CHANGE =====
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // ===== HANDLE FOCUS =====
  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  // ===== FORM SUBMISSION =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);

    // If validation errors exist, don't submit
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('🔄 Attempting login with:', { username: formData.username });

      const res = await userApi.login({
        username: formData.username.trim(),
        password: formData.password,
      });

      console.log('✅ Login response:', res);

      // Store authentication data
      if (res.data && res.data.accessToken) {
        localStorage.setItem('authToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        localStorage.setItem('userData', JSON.stringify(res.data.user));

        console.log('💾 Tokens stored successfully');
      }

      setMessage({
        type: 'success',
        text: 'Login successful! Redirecting to dashboard...',
      });

      // Clear form
      setFormData({ username: '', password: '' });
      setErrors({});

      console.log('🚀 Redirecting to dashboard...');

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err) {
      console.error('❌ Login failed:', err);

      let errorMessage = 'Login failed. Please try again.';

      if (err.response) {
        console.error('Backend error response:', err.response.data);

        if (err.response.status === 401) {
          errorMessage = 'Invalid username or password';
        } else if (err.response.status === 404) {
          errorMessage = 'Account not found. Please sign up first.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data?.errors?.length > 0) {
          errorMessage = err.response.data.errors[0];
        }
      } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        errorMessage =
          'Cannot connect to server. Please check if backend is running on http://localhost:5000';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setMessage({
        type: 'error',
        text: errorMessage,
      });
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
        return <UserCheck className={`${iconClass} text-gray-600`} size={20} />;
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
            {/* Username Field */}
            <div className="input-container relative">
              <input
                className="input h-[55px] w-full rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
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
              <div className="topline absolute top-0 right-0 h-[2px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
              {getFieldIcon('username')}
              {errors.username && (
                <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
                  <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                  <span>{errors.username}</span>
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
                className="text-sm text-black hover:underline"
                onClick={() => (window.location.href = '/reset-password')} // Update this line
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
                <a href="/signup" className="font-medium text-black hover:underline">
                  Sign Up
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
