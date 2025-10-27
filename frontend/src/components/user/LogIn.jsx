import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { validateField } from '../../utils/validate';
import { validateForm } from '../../middlewares/validateUser.middleware';
import { loginUserValidationSchema } from '../../validations/userValidationSchemas';
import authService from '../../services/authService';
import { emailRegex } from '../../utils/regex';
import { getInputClasses, getLabelClasses, getToplineClasses } from '../../utils/authHelpers';

const Login = () => {
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEmail, setIsEmail] = useState(false);

  // Show detailed errors only after 3 failed attempts
  const [attemptCount, setAttemptCount] = useState(0);
  const [showUsernameEmailError, setShowUsernameEmailError] = useState(false);
  const MAX_ATTEMPTS = 3;

  // Detect if user entered email or username
  const detectEmailFormat = (value) => emailRegex.test(value);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'username') {
      setIsEmail(detectEmailFormat(value));
      // Clear username/email errors when user types again
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build login data based on email/username
      const loginData = {
        ...(isEmail
          ? { email: formData.username.trim().toLowerCase() }
          : { username: formData.username.trim().toLowerCase() }),
        password: formData.password,
      };

      // Validate form
      const validation = await validateForm(loginUserValidationSchema, loginData);

      if (!validation.valid) {
        // Show all errors only after MAX_ATTEMPTS
        if (attemptCount >= MAX_ATTEMPTS) {
          setErrors(validation.errors);
          setShowUsernameEmailError(true);
          toast.error('Please fix the highlighted errors');
        } else {
          // Show only password errors before MAX_ATTEMPTS
          const passwordError = validation.errors.password;
          setErrors({ password: passwordError });
          if (passwordError) {
            toast.error('Please fix password requirements');
          }
        }
        return;
      }

      setErrors({});

      // Attempt login
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
      setAttemptCount((prev) => prev + 1);

      // User-friendly error messages based on status code
      let errorMsg = 'Login failed';

      if (error.message?.includes('Invalid response')) {
        errorMsg = 'Server error. Please try again.';
      } else if (error.statusCode === 401) {
        errorMsg =
          attemptCount + 1 >= MAX_ATTEMPTS
            ? 'Please check your username/email and password again.'
            : 'Invalid credentials';
        if (attemptCount + 1 >= MAX_ATTEMPTS) setShowUsernameEmailError(true);
      } else if (error.statusCode === 404) {
        errorMsg =
          attemptCount + 1 >= MAX_ATTEMPTS
            ? 'Account not found. Please check your username/email.'
            : 'Invalid username or email';
        if (attemptCount + 1 >= MAX_ATTEMPTS) setShowUsernameEmailError(true);
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

  // Password toggle icon (shows only when focused or has value)
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

  // Render input field
  const renderInputField = (name, type, label) => {
    const hasPasswordIcon = name === 'password';
    const showError =
      name === 'username'
        ? showUsernameEmailError && (errors.username || errors.email)
        : errors[name];

    return (
      <div className="input-container relative">
        <input
          className={getInputClasses(hasPasswordIcon, 'w-full')}
          name={name}
          type={type}
          required
          placeholder=" "
          autoComplete={name === 'username' ? 'username' : 'current-password'}
          value={formData[name]}
          onChange={handleChange}
          onFocus={() => handleFocus(name)}
          onBlur={handleBlur}
        />
        <label className={getLabelClasses()}>{label}</label>
        <div className={getToplineClasses()}></div>
        {hasPasswordIcon && getPasswordIcon()}
        {showError && (
          <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
            <AlertCircle size={12} className="mr-1 flex-shrink-0" />
            <span>{showError}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-cream flex min-h-screen items-center justify-center px-4 py-8">
      <div className="login w-full max-w-[26rem]">
        <div className="card flex flex-col items-center justify-between">
          <div className="mb-6 text-center">
            <h2 className="text-card-title mb-2 text-black">Welcome Back</h2>
            <p className="text-caption text-coffee">Sign in to Mahima Agencies</p>
          </div>

          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            {renderInputField('username', 'text', 'Username/Email')}
            {renderInputField('password', showPassword ? 'text' : 'password', 'Password')}

            <div className="text-right">
              <button
                type="button"
                className="text-sm text-black hover:underline focus:outline-none"
                onClick={() => navigate('/reset-password')}
              >
                Forgot password?
              </button>
            </div>

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
