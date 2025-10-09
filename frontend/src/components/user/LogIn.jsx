import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { validateField } from '../../utils/validate';
import { validateForm } from '../../middlewares/validateUser.middleware';
import { loginUserValidationSchema } from '../../validations/userValidationSchemas';
import authService from '../../services/authService';
import { emailRegex } from '../../utils/regex';

const Login = () => {
  const navigate = useNavigate();

  // ===== AUTH PROTECTION =====
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // ===== STATE MANAGEMENT =====
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEmail, setIsEmail] = useState(false);

  // Attempt tracking for delayed error display
  const [attemptCount, setAttemptCount] = useState(0);
  const [showUsernameEmailError, setShowUsernameEmailError] = useState(false);

  const MAX_ATTEMPTS = 3;

  // ===== FORM HANDLERS =====
  const detectEmailFormat = (value) => {
    return emailRegex.test(value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'username') {
      setIsEmail(detectEmailFormat(value));
      if (showUsernameEmailError) {
        setShowUsernameEmailError(false);
        setErrors((prev) => ({ ...prev, username: '', email: '' }));
      }
    } else if (name === 'password') {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleFocus = (fieldName) => setFocusedField(fieldName);
  const handleBlur = () => setFocusedField('');

  // ===== FORM SUBMISSION =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginData = {};
      if (isEmail) {
        loginData.email = formData.username.trim().toLowerCase();
      } else {
        loginData.username = formData.username.trim().toLowerCase();
      }
      loginData.password = formData.password;

      const validation = await validateForm(loginUserValidationSchema, loginData);
      
      if (!validation.valid) {
        if (attemptCount >= MAX_ATTEMPTS) {
          setErrors(validation.errors);
          setShowUsernameEmailError(true);
          toast.error('Please fix the highlighted errors');
        } else {
          const passwordError = validation.errors.password;
          setErrors({ password: passwordError });
          if (passwordError) {
            toast.error('Please fix password requirements');
          }
        }
        return;
      }

      setErrors({});

      const result = await authService.login(loginData);
      
      if (result && result.success) {
        setAttemptCount(0);
        setShowUsernameEmailError(false);
        setFormData({ username: '', password: '' });
        
        navigate('/dashboard', { replace: true });
      } else {
        toast.error('Login failed. Please try again.');
      }

    } catch (error) {
      console.error('Login failed:', error.message);
      setAttemptCount(prev => prev + 1);

      let errorMsg = 'Login failed';

      if (error.message?.includes('Invalid response')) {
        errorMsg = 'Server error. Please try again.';
      } else if (error.statusCode === 401) {
        if (attemptCount + 1 >= MAX_ATTEMPTS) {
          errorMsg = 'Please check your username/email and password again.';
          setShowUsernameEmailError(true);
        } else {
          errorMsg = 'Invalid credentials';
        }
      } else if (error.statusCode === 404) {
        if (attemptCount + 1 >= MAX_ATTEMPTS) {
          errorMsg = 'Account not found. Please check your username/email.';
          setShowUsernameEmailError(true);
        } else {
          errorMsg = 'Invalid username or email';
        }
      } else if (error.statusCode === 400 && error.errors?.length) {
        errorMsg = error.errors[0];
      } else if (error.statusCode >= 500) {
        errorMsg = 'Server error. Please try again later.';
      }

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ===== UTILITY FUNCTIONS =====
  const getPasswordIcon = () => {
    const isVisible = focusedField === 'password' || formData.password;
    const iconClass = `absolute right-3 top-4 transition-opacity duration-500 z-10 cursor-pointer text-gray-600 hover:text-black ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`;

    return (
      <button type="button" className={iconClass} onClick={() => setShowPassword(!showPassword)}>
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    );
  };

  // ===== RENDER =====
  return (
    <div className="bg-cream flex min-h-screen items-center justify-center px-4 py-8">
      <div className="login w-full max-w-[26rem]">
        <div className="card flex flex-col items-center justify-between">
          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="text-card-title mb-2 text-black">Welcome Back</h2>
            <p className="text-caption text-coffee">Sign in to Mahima Agencies</p>
          </div>

          {/* Form */}
          <form className="w-full space-y-6" onSubmit={handleSubmit}>
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
                Username/Email
              </label>
              <div className="topline absolute top-0 right-0 h-[2px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>

              {/* Only show username/email errors after MAX_ATTEMPTS */}
              {showUsernameEmailError && errors.username && (
                <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
                  <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                  <span>{errors.username}</span>
                </div>
              )}
              {showUsernameEmailError && errors.email && (
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
              {getPasswordIcon()}

              {/* Always show password validation errors */}
              {errors.password && (
                <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
                  <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Forgot Password Link */}
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
                    Logging In...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="pt-4 text-center">
              <p className="text-coffee text-sm">
                Don't have an account?
                <button
                  type="button"
                  onClick={() => navigate('/register', { replace: true })}
                  className="pl-1.5 font-medium text-black hover:underline focus:outline-none"
                >
                  Register
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
