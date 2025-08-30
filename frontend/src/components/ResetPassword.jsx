import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  HelpCircle,
  MessageSquare,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
// import { Link } from 'react-router-dom'; // Uncomment when backend ready

const ForgotPassword = () => {
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

  // ===== STEP MANAGEMENT =====
  const [currentStep, setCurrentStep] = useState(1); // 1: Username, 2: Security Q&A, 3: New Password
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // ===== MINIMAL VALIDATION =====
  // eslint-disable-next-line no-unused-vars
  const validateField = (name, value, step = currentStep) => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Required';
        if (value.length < 3) return 'Min 3 characters';
        return '';

      case 'securityAnswer':
        if (!value.trim()) return 'Required';
        return '';

      case 'newPassword':
        if (!value) return 'Required';
        if (value.length < 8) return 'Min 8 characters';
        return '';

      case 'confirmPassword':
        if (!value) return 'Required';
        if (value !== formData.newPassword) return 'Passwords do not match';
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

    // Validate on change
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

  // ===== STEP 1: SEARCH USERNAME =====
  const handleUsernameSearch = async () => {
    const error = validateField('username', formData.username);
    if (error) {
      setErrors({ username: error });
      return;
    }

    setIsSearching(true);

    // ===== BACKEND CONNECTION (COMMENTED) =====
    /*
    try {
      const response = await axios.post('/api/auth/get-security-question', {
        username: formData.username.trim()
      });

      setSecurityQuestion(response.data.securityQuestion);
      setCurrentStep(2);
      setErrors({});
      
    } catch (error) {
      if (error.response?.status === 404) {
        setErrors({ username: 'Username not found' });
      } else {
        setErrors({ username: 'Something went wrong' });
      }
    } finally {
      setIsSearching(false);
    }
    */

    // ===== TESTING SIMULATION =====
    setTimeout(() => {
      setIsSearching(false);
      // Simulate found user
      setSecurityQuestion('What is your pet name ?'); // Mock security question
      setCurrentStep(2);
      setErrors({});
    }, 1500);
  };

  // ===== STEP 2: VERIFY SECURITY ANSWER =====
  const handleSecurityVerification = async () => {
    const error = validateField('securityAnswer', formData.securityAnswer);
    if (error) {
      setErrors({ securityAnswer: error });
      return;
    }

    setIsSubmitting(true);

    // ===== BACKEND CONNECTION (COMMENTED) =====
    /*
    try {
      const response = await axios.post('/api/auth/verify-security-answer', {
        username: formData.username.trim(),
        securityAnswer: formData.securityAnswer.trim()
      });

      setCurrentStep(3);
      setErrors({});
      
    } catch (error) {
      if (error.response?.status === 401) {
        setErrors({ securityAnswer: 'Incorrect answer' });
      } else {
        setErrors({ securityAnswer: 'Verification failed' });
      }
    } finally {
      setIsSubmitting(false);
    }
    */

    // ===== TESTING SIMULATION =====
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(3);
      setErrors({});
    }, 1500);
  };

  // ===== STEP 3: RESET PASSWORD =====
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    // Validate password fields
    const newPasswordError = validateField('newPassword', formData.newPassword);
    const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);

    if (newPasswordError || confirmPasswordError) {
      setErrors({
        newPassword: newPasswordError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    setIsSubmitting(true);

    // ===== BACKEND CONNECTION (COMMENTED) =====
    /*
    try {
      const response = await axios.post('/api/auth/reset-password', {
        username: formData.username.trim(),
        newPassword: formData.newPassword
      });

      alert('✅ Password reset successful! You can now login with your new password.');
      // navigate('/signin');
      
    } catch (error) {
      alert('❌ Password reset failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
    */

    // ===== TESTING SIMULATION =====
    setTimeout(() => {
      setIsSubmitting(false);
      alert('✅ Password reset successful! (Backend not connected)');
      console.log('Password Reset Data:', {
        username: formData.username,
        newPassword: formData.newPassword,
      });
    }, 1500);
  };

  // ===== GET FIELD ICON =====
  const getFieldIcon = (fieldName) => {
    const isVisible = focusedField === fieldName || formData[fieldName];
    const iconClass = `absolute right-3 top-4 transition-all duration-300 ${
      isVisible ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-75'
    }`;

    switch (fieldName) {
      case 'username':
        return <UserCheck className={`${iconClass} text-gray-600`} size={20} />;
      case 'securityAnswer':
        return <MessageSquare className={`${iconClass} text-gray-600`} size={20} />;
      case 'newPassword':
        return (
          <button
            type="button"
            className={`${iconClass} cursor-pointer text-gray-600 hover:text-black`}
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        );
      case 'confirmPassword':
        return (
          <button
            type="button"
            className={`${iconClass} cursor-pointer text-gray-600 hover:text-black`}
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
          <div className="mb-8 text-center">
            <h2 className="text-card-title mb-2 text-black">Reset Password</h2>
            <p className="text-caption text-coffee">
              {currentStep === 1 && 'Enter your username to continue'}
              {currentStep === 2 && 'Answer your security question'}
              {currentStep === 3 && 'Create a new password'}
            </p>
          </div>

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
          <div className="w-full space-y-7">
            {/* STEP 1: USERNAME SEARCH */}
            {currentStep === 1 && (
              <>
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
                    Username
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
                    <div className="mt-1 ml-2 flex items-center text-xs text-red-500">
                      <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                      <span>{errors.username}</span>
                    </div>
                  )}
                </div>
              </>
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
                  <p className="font-medium text-black">{securityQuestion}</p>
                </div>

                {/* Security Answer Input */}
                <div className="input-container relative">
                  <input
                    className="input h-[55px] w-full rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
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
                    <div className="mt-1 ml-2 flex items-center text-xs text-red-500">
                      <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                      <span>{errors.securityAnswer}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSecurityVerification}
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
              <form onSubmit={handlePasswordReset} className="space-y-7">
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
                    className="input h-[55px] w-full rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
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
                    <div className="mt-1 ml-2 flex items-center text-xs text-red-500">
                      <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                      <span>{errors.newPassword}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="input-container relative">
                  <input
                    className="input h-[55px] w-full rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
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
                      <div className="mt-1 ml-2 flex items-center text-xs text-green-500">
                        <CheckCircle size={12} className="mr-1 flex-shrink-0" />
                        <span>Passwords match</span>
                      </div>
                    )}
                  {errors.confirmPassword && (
                    <div className="mt-1 ml-2 flex items-center text-xs text-red-500">
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

            {/* Back to SignIn - COMMENTED FOR NOW */}
            {/*
            <div className="text-center pt-4">
              <p className="text-coffee text-sm">
                Remember your password?{' '}
                <Link to="/signin" className="text-black hover:underline font-medium">
                  Sign In
                </Link>
                {' | '}
                <Link to="/signup" className="text-black hover:underline font-medium">
                  Sign Up
                </Link>
              </p>
            </div>
            */}
            <div className="pt-4 text-center">
              <p className="text-coffee text-sm">
                Remember your password?{' '}
                <button className="font-medium text-black hover:underline">Sign In</button>
                {' | '}
                <button className="font-medium text-black hover:underline">Sign Up</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
