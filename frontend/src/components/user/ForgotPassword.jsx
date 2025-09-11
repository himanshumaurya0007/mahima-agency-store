import React, { useState, useRef, useEffect } from 'react';
import {
  UserCheck,
  Search,
  HelpCircle,
  MessageSquare,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Mail,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import userApi from '../../services/userApi';
import { validateField } from '../../utils/validate';
import { validateForm } from '../../middlewares/validateUser.middleware';
import {
  securityAnswerValidationSchema,
  resetPasswordValidationSchema,
} from '../../validations/userValidationSchemas';

const ForgotPassword = () => {
  const navigate = useNavigate();

  // ===== FORM STATE =====
  const [formData, setFormData] = useState({
    username: '',
    securityAnswer: '',
    newPassword: '',
    confirmPassword: '',
  });

  // ===== UI STATE =====
  const [errors, setErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // ===== STEP MANAGEMENT =====
  const [currentStep, setCurrentStep] = useState(1);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isEmail, setIsEmail] = useState(false);

  // ===== REFS FOR AUTO-FOCUS =====
  const securityAnswerRef = useRef(null);
  const newPasswordRef = useRef(null);

  // ===== AUTO-FOCUS EFFECT =====
  useEffect(() => {
    if (currentStep === 2 && securityAnswerRef.current) {
      setTimeout(() => securityAnswerRef.current.focus(), 100);
    } else if (currentStep === 3 && newPasswordRef.current) {
      setTimeout(() => newPasswordRef.current.focus(), 100);
    }
  }, [currentStep]);

  // ===== DETECT EMAIL FORMAT =====
  const detectEmailFormat = (value) => {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return emailRegex.test(value);
  };

  // ===== ENHANCED VALIDATION =====
  const validatePasswordMatch = (name, value) => {
    if (name === 'confirmPassword') {
      if (!value) return 'Required';
      if (value !== formData.newPassword) return 'Passwords do not match';
      return '';
    }
    return validateField(name, value);
  };

  // ===== HANDLE INPUT CHANGE =====
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Track email format for username field
    if (name === 'username') {
      setIsEmail(detectEmailFormat(value));
    }

    // Validate on change
    const error =
      name === 'confirmPassword' ? validatePasswordMatch(name, value) : validateField(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

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

  // ===== STEP 1: SEARCH USERNAME =====
  const handleUsernameSearch = async () => {
    const error = validateField('username', formData.username);
    if (error) {
      setErrors({ username: error });
      return;
    }

    setIsSearching(true);
    setMessage({ type: '', text: '' });

    try {
      // Prepare query based on input type
      const query = {};
      if (isEmail) {
        query.email = formData.username.trim().toLowerCase();
      } else {
        query.username = formData.username.trim().toLowerCase();
      }

      // API Call
      const response = await userApi.fetchSecurityQuestion(query);

      const securityQuestionText = response?.data?.data?.securityQuestion || '';

      if (securityQuestionText.trim()) {
        setSecurityQuestion(securityQuestionText);
        setCurrentStep(2);
        setErrors({});
        setMessage({
          type: 'success',
          text: 'Security question found! Please answer to continue.',
        });
      } else {
        setErrors({ username: 'No security question found for this account.' });
      }
    } catch (error) {
      console.error('Security question fetch failed:', error.message);

      let errorMessage = 'Something went wrong';
      if (error.statusCode === 404) {
        errorMessage = isEmail ? 'Email not found' : 'Username not found';
      } else if (error.statusCode === 400) {
        errorMessage = error.errors?.join(', ') || error.message || 'Invalid input';
      } else if (error.statusCode >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.message || 'Search failed. Please try again.';
      }

      setErrors({ username: errorMessage });
    } finally {
      setIsSearching(false);
    }
  };

  // ===== STEP 2: VERIFY SECURITY ANSWER =====
  const handleSecurityVerification = async () => {
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Prepare validation data
      const validationData = {
        securityAnswer: formData.securityAnswer.trim(),
      };

      if (isEmail) {
        validationData.email = formData.username.trim().toLowerCase();
      } else {
        validationData.username = formData.username.trim().toLowerCase();
      }

      // Frontend validation
      const validation = await validateForm(securityAnswerValidationSchema, validationData);

      if (!validation.valid) {
        setErrors(validation.errors);
        setMessage({
          type: 'error',
          text: 'Please fix the validation errors below.',
        });
        setIsSubmitting(false);
        return;
      }

      // Clear any existing errors
      setErrors({});

      // Call backend API
      const response = await userApi.validateSecurityAnswer(validationData);

      if (response.success) {
        setCurrentStep(3);
        setMessage({
          type: 'success',
          text: 'Security answer verified successfully!',
        });
      }
    } catch (error) {
      console.error('Security verification failed:', error.message);

      let errorMessage = 'Verification failed';
      if (error.statusCode === 401) {
        errorMessage = 'Incorrect security answer. Please try again.';
      } else if (error.statusCode === 404) {
        errorMessage = 'User not found. Please start over.';
      } else if (error.statusCode === 400) {
        errorMessage = error.errors?.join(', ') || error.message || 'Invalid security answer';
      } else if (error.statusCode >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.message || 'Verification failed. Please try again.';
      }

      setErrors({ securityAnswer: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== STEP 3: RESET PASSWORD =====
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Prepare validation data
      const validationData = {
        newPassword: formData.newPassword,
      };

      if (isEmail) {
        validationData.email = formData.username.trim().toLowerCase();
      } else {
        validationData.username = formData.username.trim().toLowerCase();
      }

      const validation = await validateForm(resetPasswordValidationSchema, validationData);

      if (!validation.valid) {
        setErrors(validation.errors);
        setMessage({
          type: 'error',
          text: 'Please fix the validation errors below.',
        });
        setIsSubmitting(false);
        return;
      }

      // Additional password confirmation check
      if (formData.newPassword !== formData.confirmPassword) {
        setErrors({ confirmPassword: 'Passwords do not match' });
        setIsSubmitting(false);
        return;
      }

      setErrors({});

      // Call backend API
      const response = await userApi.resetUserPassword(validationData);

      if (response.success) {
        setMessage({
          type: 'success',
          text: response.message || 'Password reset successful! Redirecting to login...',
        });

        // Redirect to login after success
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Password reset failed:', error.message);

      let errorMessage = 'Password reset failed. Please try again.';
      if (error.statusCode === 404) {
        errorMessage = 'User not found. Please start over.';
      } else if (error.statusCode === 400) {
        errorMessage = error.errors?.join(', ') || error.message || 'Invalid password data';
      } else if (error.statusCode >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.message || 'Password reset failed';
      }

      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
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
      case 'securityAnswer':
        return <MessageSquare className={`${iconClass} text-gray-600`} size={20} />;
      case 'newPassword':
        return (
          <button
            type="button"
            className={`${iconClass} z-10 cursor-pointer text-gray-600 hover:text-black`}
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        );
      case 'confirmPassword':
        return (
          <button
            type="button"
            className={`${iconClass} z-10 cursor-pointer text-gray-600 hover:text-black`}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="forgot-password bg-cream flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-[28rem]">
        <div className="card flex flex-col items-center justify-between">
          {/* Header Section */}
          <div className="mb-6 text-center">
            <h2 className="text-card-title mb-2 text-black">Reset Password</h2>
            <p className="text-caption text-coffee">
              {currentStep === 1 && 'Enter your username or email to continue'}
              {currentStep === 2 && 'Answer your security question'}
              {currentStep === 3 && 'Create a new password'}
            </p>
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

          {/* Progress Steps */}
          <div className="mb-8 w-full">
            <div className="flex items-center justify-between">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  currentStep >= 1 ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                1
              </div>
              <div
                className={`mx-2 h-1 flex-1 ${currentStep >= 2 ? 'bg-black' : 'bg-gray-300'}`}
              ></div>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  currentStep >= 2 ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                2
              </div>
              <div
                className={`mx-2 h-1 flex-1 ${currentStep >= 3 ? 'bg-black' : 'bg-gray-300'}`}
              ></div>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  currentStep >= 3 ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                3
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="w-full space-y-6">
            {/* STEP 1: USERNAME SEARCH */}
            {currentStep === 1 && (
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
                  {isEmail ? 'Email Address' : 'Username or Email'}
                </label>
                <div className="topline absolute top-0 right-0 h-[2px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>

                {/* Search Button */}
                <button
                  type="button"
                  onClick={handleUsernameSearch}
                  disabled={isSearching}
                  className="absolute top-0.5 right-0.5 h-[51px] rounded-br-lg bg-black px-3 text-white transition-colors hover:bg-gray-800 disabled:bg-gray-600"
                >
                  {isSearching ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                  ) : (
                    <Search size={18} />
                  )}
                </button>

                {errors.username && (
                  <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
                    <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                    <span>{errors.username}</span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: SECURITY QUESTION */}
            {currentStep === 2 && (
              <>
                {/* Security Question Display */}
                <div className="bg-vanilla border-peach rounded-lg border p-4">
                  <div className="mb-2 flex items-center">
                    <HelpCircle className="mr-2 text-gray-600" size={18} />
                    <span className="text-coffee text-sm font-medium">Security Question:</span>
                  </div>

                  {securityQuestion ? (
                    <p className="font-medium text-black">{securityQuestion}</p>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <AlertCircle size={16} className="mr-2" />
                      <span className="font-medium">Loading security question...</span>
                    </div>
                  )}
                </div>

                {/* Security Answer Input with Auto-Focus */}
                <div className="input-container relative">
                  <input
                    ref={securityAnswerRef}
                    className="input h-[55px] w-full rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 pr-12 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
                    name="securityAnswer"
                    type="text"
                    required
                    placeholder=" "
                    autoComplete="off"
                    value={formData.securityAnswer}
                    onChange={handleChange}
                    onFocus={() => handleFocus('securityAnswer')}
                    onBlur={handleBlur}
                  />
                  <label className="label pointer-events-none absolute top-[13px] left-5 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
                    Your Answer
                  </label>
                  <div className="topline absolute top-0 right-0 h-[2px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
                  {getFieldIcon('securityAnswer')}
                  {errors.securityAnswer && (
                    <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
                      <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                      <span>{errors.securityAnswer}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSecurityVerification}
                  disabled={isSubmitting || !securityQuestion}
                  className={`h-[55px] w-full ${
                    isSubmitting || !securityQuestion
                      ? 'cursor-not-allowed bg-gray-600'
                      : 'bg-black hover:bg-gray-800 active:bg-gray-900'
                  } flex items-center justify-center rounded-lg text-xl font-medium text-white transition-all duration-300 ease-in-out`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Answer
                      <ArrowRight className="ml-2" size={18} />
                    </>
                  )}
                </button>
              </>
            )}

            {/* STEP 3: NEW PASSWORD */}
            {currentStep === 3 && (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                {/* Success Message */}
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 text-green-600" size={18} />
                    <span className="text-sm font-medium text-green-700">
                      Security verified! Create your new password.
                    </span>
                  </div>
                </div>

                {/* New Password */}
                <div className="input-container relative">
                  <input
                    ref={newPasswordRef}
                    className="input h-[55px] w-full rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 pr-12 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder=" "
                    autoComplete="new-password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    onFocus={() => handleFocus('newPassword')}
                    onBlur={handleBlur}
                  />
                  <label className="label pointer-events-none absolute top-[13px] left-5 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
                    New Password
                  </label>
                  <div className="topline absolute top-0 right-0 h-[2px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
                  {getFieldIcon('newPassword')}
                  {errors.newPassword && (
                    <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
                      <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                      <span>{errors.newPassword}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="input-container relative">
                  <input
                    className="input h-[55px] w-full rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 pr-12 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder=" "
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => handleFocus('confirmPassword')}
                    onBlur={handleBlur}
                  />
                  <label className="label pointer-events-none absolute top-[13px] left-5 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
                    Confirm Password
                  </label>
                  <div className="topline absolute top-0 right-0 h-[2px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
                  {getFieldIcon('confirmPassword')}
                  {formData.confirmPassword &&
                    formData.newPassword &&
                    formData.confirmPassword === formData.newPassword && (
                      <div className="mt-2 ml-2 flex items-center text-xs font-medium text-green-500">
                        <CheckCircle size={12} className="mr-1 flex-shrink-0" />
                        <span>Passwords match</span>
                      </div>
                    )}
                  {errors.confirmPassword && (
                    <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
                      <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                      <span>{errors.confirmPassword}</span>
                    </div>
                  )}
                </div>

                {/* Reset Password Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`h-[55px] w-full ${
                    isSubmitting
                      ? 'cursor-not-allowed bg-gray-600'
                      : 'bg-black hover:bg-gray-800 active:bg-gray-900'
                  } flex items-center justify-center rounded-lg text-xl font-medium text-white transition-all duration-300 ease-in-out`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}

            {/* Back to SignIn */}
            <div className="pt-4 text-center">
              <p className="text-coffee text-sm">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-medium text-black hover:underline focus:outline-none"
                >
                  Sign In
                </button>
                {' | '}
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="font-medium text-black hover:underline focus:outline-none"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
