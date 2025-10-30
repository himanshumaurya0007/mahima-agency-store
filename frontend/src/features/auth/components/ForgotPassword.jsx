// import React, { useState, useRef, useEffect } from 'react';
// import {
//   Search,
//   HelpCircle,
//   Eye,
//   EyeOff,
//   AlertCircle,
//   CheckCircle,
//   ArrowRight,
// } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-hot-toast';

// import userApi from '../../services/userApi';
// import authService from '../../services/authService';
// import { fields } from '../../utils/fields';
// import { errorMessages } from '../../utils/errorMessages';
// import { emailRegex } from '../../utils/regex';
// import { validateField } from '../../utils/validate';
// import { validateForm } from '../../middlewares/validateUser.middleware';
// import {
//   securityAnswerValidationSchema,
//   resetPasswordValidationSchema,
// } from '../../validations/userValidationSchemas';

// const ForgotPassword = () => {
//   const navigate = useNavigate();

//   // ===== AUTH PROTECTION =====
//   useEffect(() => {
//     if (authService.isAuthenticated()) {
//       navigate('/dashboard', { replace: true });
//     }
//   }, [navigate]);

//   // ===== STATE MANAGEMENT =====
//   const [formData, setFormData] = useState({
//     username: '',
//     securityAnswer: '',
//     newPassword: '',
//     confirmPassword: '',
//   });

//   const [errors, setErrors] = useState({});
//   const [focusedField, setFocusedField] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showSecurityAnswer, setShowSecurityAnswer] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   // ===== STEP MANAGEMENT =====
//   const [currentStep, setCurrentStep] = useState(1);
//   const [securityQuestion, setSecurityQuestion] = useState('');
//   const [isEmail, setIsEmail] = useState(false);

//   // ===== REFS FOR AUTO-FOCUS =====
//   const securityAnswerRef = useRef(null);
//   const newPasswordRef = useRef(null);

//   // ===== AUTO-FOCUS EFFECT =====
//   useEffect(() => {
//     if (currentStep === 2 && securityAnswerRef.current) {
//       setTimeout(() => securityAnswerRef.current.focus(), 100);
//     } else if (currentStep === 3 && newPasswordRef.current) {
//       setTimeout(() => newPasswordRef.current.focus(), 100);
//     }
//   }, [currentStep]);

//   // ===== FORM HANDLERS =====
//   const detectEmailFormat = (value) => emailRegex.test(value);

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({ ...prev, [name]: value }));

//     if (name === 'username') {
//       setIsEmail(detectEmailFormat(value));
//     }

//     if (name === 'confirmPassword') {
//       const error = !value
//         ? errorMessages.REQUIRED(fields.password)
//         : value !== formData.newPassword
//           ? 'Passwords do not match'
//           : '';
//       setErrors((prev) => ({ ...prev, [name]: error }));
//     } else if (name === 'newPassword') {
//       const error = validateField('password', value);
//       setErrors((prev) => ({ ...prev, [name]: error }));
//       if (formData.confirmPassword) {
//         const confirmError = formData.confirmPassword !== value ? 'Passwords do not match' : '';
//         setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
//       }
//     } else {
//       const error = validateField(name, value);
//       setErrors((prev) => ({ ...prev, [name]: error }));
//     }
//   };

//   const handleFocus = (fieldName) => setFocusedField(fieldName);
//   const handleBlur = () => setFocusedField('');

//   // ===== STEP FUNCTIONS =====
//   const handleUsernameSearch = async () => {
//     const error = validateField(isEmail ? 'email' : 'username', formData.username);
//     if (error) {
//       setErrors({ username: error });
//       return;
//     }

//     setLoading(true);

//     try {
//       const query = {};
//       if (isEmail) {
//         query.email = formData.username.trim().toLowerCase();
//       } else {
//         query.username = formData.username.trim().toLowerCase();
//       }

//       const response = await userApi.fetchSecurityQuestion(query);
//       const securityQuestionText = response?.data?.data?.securityQuestion || '';

//       if (securityQuestionText.trim()) {
//         setSecurityQuestion(securityQuestionText);
//         setCurrentStep(2);
//         setErrors({});
//         toast.success('Security question found!');
//       } else {
//         setErrors({ username: 'No security question found for this account.' });
//         toast.error('No security question found');
//       }
//     } catch (error) {
//       console.error('Security question fetch failed:', error.message);
//       let errorMsg = 'Something went wrong';
//       if (error.statusCode === 404) {
//         errorMsg = isEmail ? 'Email not found' : 'Username not found';
//       } else if (error.statusCode === 400) {
//         errorMsg = error.errors?.join(', ') || 'Invalid input';
//       } else if (error.statusCode >= 500) {
//         errorMsg = 'Server error';
//       }

//       setErrors({ username: errorMsg });
//       toast.error(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSecurityVerification = async () => {
//     setLoading(true);

//     try {
//       const validationData = {
//         securityAnswer: formData.securityAnswer.trim(),
//       };

//       if (isEmail) {
//         validationData.email = formData.username.trim().toLowerCase();
//       } else {
//         validationData.username = formData.username.trim().toLowerCase();
//       }

//       const validation = await validateForm(securityAnswerValidationSchema, validationData);

//       if (!validation.valid) {
//         setErrors(validation.errors);
//         toast.error('Please fix validation errors');
//         return;
//       }

//       setErrors({});
//       const response = await userApi.validateSecurityAnswer(validationData);

//       if (response.success) {
//         setCurrentStep(3);
//         toast.success('Security answer verified!');
//       }
//     } catch (error) {
//       console.error('Security verification failed:', error.message);
//       let errorMsg = 'Verification failed';
//       if (error.statusCode === 401) {
//         errorMsg = 'Incorrect security answer';
//       } else if (error.statusCode >= 500) {
//         errorMsg = 'Server error';
//       }

//       setErrors({ securityAnswer: errorMsg });
//       toast.error(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePasswordReset = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const validationData = {
//         newPassword: formData.newPassword,
//       };

//       if (isEmail) {
//         validationData.email = formData.username.trim().toLowerCase();
//       } else {
//         validationData.username = formData.username.trim().toLowerCase();
//       }

//       const validation = await validateForm(resetPasswordValidationSchema, validationData);

//       if (!validation.valid) {
//         setErrors(validation.errors);
//         toast.error('Please fix validation errors');
//         return;
//       }

//       if (formData.newPassword !== formData.confirmPassword) {
//         setErrors({ confirmPassword: 'Passwords do not match' });
//         toast.error('Passwords do not match');
//         return;
//       }

//       setErrors({});
//       const response = await userApi.resetUserPassword(validationData);

//       if (response.success) {
//         toast.success('Password reset successful!');
//         setTimeout(() => navigate('/login', { replace: true }), 2000);
//       }
//     } catch (error) {
//       console.error('Password reset failed:', error.message);
//       let errorMsg = 'Password reset failed';
//       if (error.statusCode === 400) {
//         errorMsg = error.errors?.join(', ') || 'Invalid password data';
//       } else if (error.statusCode >= 500) {
//         errorMsg = 'Server error';
//       }

//       toast.error(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ===== UTILITY FUNCTIONS =====
//   const getPasswordIcon = (fieldName) => {
//     const isVisible = focusedField === fieldName || formData[fieldName];
//     const iconClass = `absolute right-3 top-4 transition-opacity duration-500 z-10 cursor-pointer text-gray-600 hover:text-black ${
//       isVisible ? 'opacity-100' : 'opacity-0'
//     }`;

//     if (fieldName === 'securityAnswer') {
//       return (
//         <button
//           type="button"
//           className={iconClass}
//           onClick={() => setShowSecurityAnswer(!showSecurityAnswer)}
//         >
//           {showSecurityAnswer ? <EyeOff size={20} /> : <Eye size={20} />}
//         </button>
//       );
//     }

//     if (fieldName === 'newPassword') {
//       return (
//         <button
//           type="button"
//           className={iconClass}
//           onClick={() => setShowNewPassword(!showNewPassword)}
//         >
//           {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//         </button>
//       );
//     }

//     if (fieldName === 'confirmPassword') {
//       return (
//         <button
//           type="button"
//           className={iconClass}
//           onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//         >
//           {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//         </button>
//       );
//     }

//     return null;
//   };

//   // ===== RENDER INPUT FIELD =====
//   const renderInputField = (name, type, label, options = {}) => (
//     <div className="input-container relative">
//       <input
//         className={`input h-[55px] w-full rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 ${
//           name.includes('Password') || name === 'securityAnswer' ? 'pr-12' : ''
//         } text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm`}
//         name={name}
//         type={type}
//         required
//         placeholder=" "
//         autoComplete={options.autoComplete || 'off'}
//         value={formData[name]}
//         onChange={handleChange}
//         onFocus={() => handleFocus(name)}
//         onBlur={handleBlur}
//         ref={options.ref}
//       />
//       <label className="label pointer-events-none absolute top-[13px] left-5 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
//         {label}
//       </label>
//       <div className="topline absolute top-0 right-0 h-[2px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
//       {(name.includes('Password') || name === 'securityAnswer') && getPasswordIcon(name)}
//       {errors[name] && (
//         <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
//           <AlertCircle size={12} className="mr-1 flex-shrink-0" />
//           <span>{errors[name]}</span>
//         </div>
//       )}
//       {name === 'confirmPassword' &&
//         formData.confirmPassword &&
//         formData.newPassword &&
//         formData.confirmPassword === formData.newPassword && (
//           <div className="mt-2 ml-2 flex items-center text-xs font-medium text-green-500">
//             <CheckCircle size={12} className="mr-1 flex-shrink-0" />
//             <span>Passwords match</span>
//           </div>
//         )}
//     </div>
//   );

//   // ===== RENDER =====
//   return (
//     <div className="bg-cream flex min-h-screen items-center justify-center px-4 py-8">
//       <div className="forgot-password w-full max-w-[28rem]">
//         <div className="card flex flex-col items-center justify-between">
//           {/* Header */}
//           <div className="mb-6 text-center">
//             <h2 className="text-card-title mb-2 text-black">Reset Password</h2>
//             <p className="text-caption text-coffee">
//               {currentStep === 1 && 'Enter your username or email to continue'}
//               {currentStep === 2 && 'Answer your security question'}
//               {currentStep === 3 && 'Create a new password'}
//             </p>
//           </div>

//           {/* Step Bar */}
//           <div className="mb-8 w-full">
//             <div className="flex items-center justify-between">
//               {[1, 2, 3].map((step) => (
//                 <React.Fragment key={step}>
//                   <div
//                     className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ease-in-out ${
//                       currentStep >= step
//                         ? 'scale-110 transform bg-black text-white'
//                         : 'scale-100 transform bg-gray-300 text-gray-600'
//                     }`}
//                   >
//                     {step}
//                   </div>
//                   {step < 3 && (
//                     <div className="mx-2 h-1 flex-1 overflow-hidden rounded bg-gray-300">
//                       <div
//                         className={`h-full bg-black transition-all duration-500 ease-in-out ${
//                           currentStep > step ? 'w-full' : 'w-0'
//                         }`}
//                       ></div>
//                     </div>
//                   )}
//                 </React.Fragment>
//               ))}
//             </div>
//           </div>

//           {/* Step Content */}
//           <div className="w-full space-y-6">
//             {/* STEP 1: USERNAME SEARCH */}
//             {currentStep === 1 && (
//               <div className="step-1">
//                 <div className="input-container relative">
//                   <input
//                     className="input h-[55px] w-full rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
//                     name="username"
//                     type="text"
//                     required
//                     placeholder=" "
//                     autoComplete="username"
//                     value={formData.username}
//                     onChange={handleChange}
//                     onFocus={() => handleFocus('username')}
//                     onBlur={handleBlur}
//                   />
//                   <label className="label pointer-events-none absolute top-[13px] left-5 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
//                     Username or Email
//                   </label>
//                   <div className="topline absolute top-0 right-0 h-[2px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>

//                   <button
//                     type="button"
//                     onClick={handleUsernameSearch}
//                     disabled={loading}
//                     className="absolute top-0.5 right-0.5 h-[51px] rounded-br-lg bg-black px-3 text-white transition-colors hover:bg-gray-800 disabled:bg-gray-600"
//                   >
//                     {loading ? (
//                       <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
//                     ) : (
//                       <Search size={18} />
//                     )}
//                   </button>

//                   {errors.username && (
//                     <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
//                       <AlertCircle size={12} className="mr-1 flex-shrink-0" />
//                       <span>{errors.username}</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* STEP 2: SECURITY QUESTION */}
//             {currentStep === 2 && (
//               <div className='step-2 space-y-6'>
//                 <div className="bg-vanilla border-peach rounded-lg border p-4">
//                   <div className="mb-2 flex items-center">
//                     <HelpCircle className="mr-2 text-gray-600" size={18} />
//                     <span className="text-coffee text-sm font-medium">Security Question:</span>
//                   </div>
//                   <p className="font-medium text-black">{securityQuestion}</p>
//                 </div>

//                 {renderInputField(
//                   'securityAnswer',
//                   showSecurityAnswer ? 'text' : 'password',
//                   'Your Answer',
//                   {
//                     ref: securityAnswerRef,
//                   },
//                 )}

//                 <button
//                   onClick={handleSecurityVerification}
//                   disabled={loading || !securityQuestion}
//                   className={`h-[55px] w-full ${
//                     loading || !securityQuestion
//                       ? 'cursor-not-allowed bg-gray-600'
//                       : 'bg-black hover:bg-gray-800 active:bg-gray-900'
//                     } flex items-center justify-center rounded-lg text-xl font-medium text-white transition-all duration-300 ease-in-out`}
//                 >
//                   {loading ? (
//                     <>
//                       <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
//                       Verifying...
//                     </>
//                   ) : (
//                     <>
//                       Verify Answer
//                       <ArrowRight className="ml-2" size={18} />
//                     </>
//                   )}
//                 </button>
//               </div>
//             )}

//             {/* STEP 3: NEW PASSWORD */}
//             {currentStep === 3 && (
//               <form onSubmit={handlePasswordReset} className="space-y-6 step-3">
//                 {renderInputField(
//                   'newPassword',
//                   showNewPassword ? 'text' : 'password',
//                   'New Password',
//                   {
//                     autoComplete: 'new-password',
//                     ref: newPasswordRef,
//                   },
//                 )}

//                 {renderInputField(
//                   'confirmPassword',
//                   showConfirmPassword ? 'text' : 'password',
//                   'Confirm Password',
//                   {
//                     autoComplete: 'new-password',
//                   },
//                 )}

//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className={`h-[55px] w-full ${
//                     loading
//                       ? 'cursor-not-allowed bg-gray-600'
//                       : 'bg-black hover:bg-gray-800 active:bg-gray-900'
//                   } flex items-center justify-center rounded-lg text-xl font-medium text-white transition-all duration-300 ease-in-out`}
//                 >
//                   {loading ? (
//                     <>
//                       <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
//                       Resetting Password...
//                     </>
//                   ) : (
//                     'Reset Password'
//                   )}
//                 </button>
//               </form>
//             )}

//             {/* Back to Login */}
//             <div className="pt-4 text-center">
//               <p className="text-coffee text-sm">
//                 Remember your password?
//                 <button
//                   type="button"
//                   onClick={() => navigate('/login', { replace: true })}
//                   className="pl-1.5 font-medium text-black hover:underline focus:outline-none"
//                 >
//                   Login
//                 </button>
//                 {' | '}
//                 <button
//                   type="button"
//                   onClick={() => navigate('/register', { replace: true })}
//                   className="font-medium text-black hover:underline focus:outline-none"
//                 >
//                   Register
//                 </button>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;


import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  HelpCircle,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import userApi from '../services/userApi';
import authService from '../services/authService';
// import { fields } from '../../utils/fields';
// import { errorMessages } from '../../utils/errorMessages';
// import { emailRegex } from '../../utils/regex';
import { FIELDS, MESSAGES, REGEX } from '../../../utils/index'
import { validateField } from '../../utils/validate';
import {
  securityAnswerValidationSchema,
  resetPasswordValidationSchema,
} from '../validations/userValidationSchemas';

const ForgotPassword = () => {
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
    securityAnswer: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSecurityAnswer, setShowSecurityAnswer] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [isEmail, setIsEmail] = useState(false);

  // Refs for auto-focus
  const securityAnswerRef = useRef(null);
  const newPasswordRef = useRef(null);

  // Auto-focus on step change
  useEffect(() => {
    if (currentStep === 2 && securityAnswerRef.current) {
      setTimeout(() => securityAnswerRef.current.focus(), 100);
    } else if (currentStep === 3 && newPasswordRef.current) {
      setTimeout(() => newPasswordRef.current.focus(), 100);
    }
  }, [currentStep]);

  // Detect email format
  const detectEmailFormat = (value) => emailRegex.test(value);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'username') {
      setIsEmail(detectEmailFormat(value));
    }

    // Password match validation
    if (name === 'confirmPassword') {
      const error = !value
        ? errorMessages.REQUIRED(fields.password)
        : value !== formData.newPassword
          ? 'Passwords do not match'
          : '';
      setErrors((prev) => ({ ...prev, [name]: error }));
    } else if (name === 'newPassword') {
      const error = validateField('password', value);
      setErrors((prev) => ({ ...prev, [name]: error }));
      if (formData.confirmPassword) {
        const confirmError = formData.confirmPassword !== value ? 'Passwords do not match' : '';
        setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
      }
    } else {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleFocus = (fieldName) => setFocusedField(fieldName);
  const handleBlur = () => setFocusedField('');

  // Step 1: Search username/email
  const handleUsernameSearch = async () => {
    const error = validateField(isEmail ? 'email' : 'username', formData.username);
    if (error) {
      setErrors({ username: error });
      return;
    }

    setLoading(true);

    try {
      const query = isEmail
        ? { email: formData.username.trim().toLowerCase() }
        : { username: formData.username.trim().toLowerCase() };

      const response = await userApi.fetchSecurityQuestion(query);
      const securityQuestionText = response?.data?.data?.securityQuestion || '';

      if (securityQuestionText.trim()) {
        setSecurityQuestion(securityQuestionText);
        setCurrentStep(2);
        setErrors({});
        toast.success('Security question found!');
      } else {
        setErrors({ username: 'No security question found for this account.' });
        toast.error('No security question found');
      }
    } catch (error) {
      console.error('Security question fetch failed:', error.message);

      let errorMsg = 'Something went wrong';
      if (error.statusCode === 404) {
        errorMsg = isEmail ? 'Email not found' : 'Username not found';
      } else if (error.statusCode === 400) {
        errorMsg = error.errors?.join(', ') || 'Invalid input';
      } else if (error.statusCode >= 500) {
        errorMsg = 'Server error';
      }

      setErrors({ username: errorMsg });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify security answer (using Yup directly)
  const handleSecurityVerification = async () => {
    setLoading(true);

    try {
      const validationData = {
        securityAnswer: formData.securityAnswer.trim(),
        ...(isEmail
          ? { email: formData.username.trim().toLowerCase() }
          : { username: formData.username.trim().toLowerCase() }),
      };

      // Direct Yup validation
      try {
        await securityAnswerValidationSchema.validate(validationData, { abortEarly: false });
      } catch (validationError) {
        const validationErrors = {};
        validationError.inner.forEach((err) => {
          if (err.path) validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
        toast.error('Please fix validation errors');
        setLoading(false);
        return;
      }

      setErrors({});
      const response = await userApi.validateSecurityAnswer(validationData);

      if (response.success) {
        setCurrentStep(3);
        toast.success('Security answer verified!');
      }
    } catch (error) {
      console.error('Security verification failed:', error.message);

      let errorMsg = 'Verification failed';
      if (error.statusCode === 401) {
        errorMsg = 'Incorrect security answer';
      } else if (error.statusCode >= 500) {
        errorMsg = 'Server error';
      }

      setErrors({ securityAnswer: errorMsg });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password (using Yup directly)
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validationData = {
        newPassword: formData.newPassword,
        ...(isEmail
          ? { email: formData.username.trim().toLowerCase() }
          : { username: formData.username.trim().toLowerCase() }),
      };

      // Direct Yup validation
      try {
        await resetPasswordValidationSchema.validate(validationData, { abortEarly: false });
      } catch (validationError) {
        const validationErrors = {};
        validationError.inner.forEach((err) => {
          if (err.path) validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
        toast.error('Please fix validation errors');
        setLoading(false);
        return;
      }

      // Check password match
      if (formData.newPassword !== formData.confirmPassword) {
        setErrors({ confirmPassword: 'Passwords do not match' });
        toast.error('Passwords do not match');
        setLoading(false);
        return;
      }

      setErrors({});
      const response = await userApi.resetUserPassword(validationData);

      if (response.success) {
        toast.success('Password reset successful!');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    } catch (error) {
      console.error('Password reset failed:', error.message);

      let errorMsg = 'Password reset failed';
      if (error.statusCode === 400) {
        errorMsg = error.errors?.join(', ') || 'Invalid password data';
      } else if (error.statusCode >= 500) {
        errorMsg = 'Server error';
      }

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Password toggle icons
  const getPasswordIcon = (fieldName) => {
    const isVisible = focusedField === fieldName || formData[fieldName];
    const iconClass = `absolute right-3 top-4 transition-opacity duration-500 z-10 cursor-pointer text-gray-600 hover:text-black ${isVisible ? 'opacity-100' : 'opacity-0'
      }`;

    const toggleStates = {
      securityAnswer: [showSecurityAnswer, setShowSecurityAnswer],
      newPassword: [showNewPassword, setShowNewPassword],
      confirmPassword: [showConfirmPassword, setShowConfirmPassword],
    };

    const [showState, setShowState] = toggleStates[fieldName];
    if (!setShowState) return null;

    return (
      <button type="button" className={iconClass} onClick={() => setShowState(!showState)}>
        {showState ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    );
  };

  // Render input field
  const renderInputField = (name, type, label, options = {}) => {
    const hasPasswordIcon = name.includes('Password') || name === 'securityAnswer';
    const showMatchIndicator =
      name === 'confirmPassword' &&
      formData.confirmPassword &&
      formData.newPassword &&
      formData.confirmPassword === formData.newPassword;

    return (
      <div className="input-container relative">
        <input
          className={`input h-[55px] w-full rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 ${hasPasswordIcon ? 'pr-12' : ''
            } text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm`}
          name={name}
          type={type}
          required
          placeholder=" "
          autoComplete={options.autoComplete || 'off'}
          value={formData[name]}
          onChange={handleChange}
          onFocus={() => handleFocus(name)}
          onBlur={handleBlur}
          ref={options.ref}
        />
        <label className="label pointer-events-none absolute top-[13px] left-5 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
          {label}
        </label>
        <div className="topline absolute top-0 right-0 h-[2px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
        {hasPasswordIcon && getPasswordIcon(name)}
        {errors[name] && (
          <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
            <AlertCircle size={12} className="mr-1 flex-shrink-0" />
            <span>{errors[name]}</span>
          </div>
        )}
        {showMatchIndicator && (
          <div className="mt-2 ml-2 flex items-center text-xs font-medium text-green-500">
            <CheckCircle size={12} className="mr-1 flex-shrink-0" />
            <span>Passwords match</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-cream flex min-h-screen items-center justify-center px-4 py-8">
      <div className="forgot-password w-full max-w-[28rem]">
        <div className="card flex flex-col items-center justify-between">
          <div className="mb-6 text-center">
            <h2 className="text-card-title mb-2 text-black">Reset Password</h2>
            <p className="text-caption text-coffee">
              {currentStep === 1 && 'Enter your username or email to continue'}
              {currentStep === 2 && 'Answer your security question'}
              {currentStep === 3 && 'Create a new password'}
            </p>
          </div>

          {/* Step Progress Bar */}
          <div className="mb-8 w-full">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ease-in-out ${currentStep >= step
                        ? 'scale-110 transform bg-black text-white'
                        : 'scale-100 transform bg-gray-300 text-gray-600'
                      }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div className="mx-2 h-1 flex-1 overflow-hidden rounded bg-gray-300">
                      <div
                        className={`h-full bg-black transition-all duration-500 ease-in-out ${currentStep > step ? 'w-full' : 'w-0'
                          }`}
                      ></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="w-full space-y-6">
            {/* Step 1: Username Search */}
            {currentStep === 1 && (
              <div className="step-1">
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
                    Username or Email
                  </label>
                  <div className="topline absolute top-0 right-0 h-[2px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>

                  <button
                    type="button"
                    onClick={handleUsernameSearch}
                    disabled={loading}
                    className="absolute top-0.5 right-0.5 h-[51px] rounded-br-lg bg-black px-3 text-white transition-colors hover:bg-gray-800 disabled:bg-gray-600"
                  >
                    {loading ? (
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
              </div>
            )}

            {/* Step 2: Security Question */}
            {currentStep === 2 && (
              <div className="step-2 space-y-6">
                <div className="bg-vanilla border-peach rounded-lg border p-4">
                  <div className="mb-2 flex items-center">
                    <HelpCircle className="mr-2 text-gray-600" size={18} />
                    <span className="text-coffee text-sm font-medium">Security Question:</span>
                  </div>
                  <p className="font-medium text-black">{securityQuestion}</p>
                </div>

                {renderInputField(
                  'securityAnswer',
                  showSecurityAnswer ? 'text' : 'password',
                  'Your Answer',
                  { ref: securityAnswerRef }
                )}

                <button
                  onClick={handleSecurityVerification}
                  disabled={loading || !securityQuestion}
                  className={`h-[55px] w-full ${loading || !securityQuestion
                      ? 'cursor-not-allowed bg-gray-600'
                      : 'bg-black hover:bg-gray-800 active:bg-gray-900'
                    } flex items-center justify-center rounded-lg text-xl font-medium text-white transition-all duration-300 ease-in-out`}
                >
                  {loading ? (
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
              </div>
            )}

            {/* Step 3: New Password */}
            {currentStep === 3 && (
              <form onSubmit={handlePasswordReset} className="space-y-6 step-3">
                {renderInputField(
                  'newPassword',
                  showNewPassword ? 'text' : 'password',
                  'New Password',
                  { autoComplete: 'new-password', ref: newPasswordRef }
                )}

                {renderInputField(
                  'confirmPassword',
                  showConfirmPassword ? 'text' : 'password',
                  'Confirm Password',
                  { autoComplete: 'new-password' }
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`h-[55px] w-full ${loading
                      ? 'cursor-not-allowed bg-gray-600'
                      : 'bg-black hover:bg-gray-800 active:bg-gray-900'
                    } flex items-center justify-center rounded-lg text-xl font-medium text-white transition-all duration-300 ease-in-out`}
                >
                  {loading ? (
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

            {/* Footer Links */}
            <div className="pt-4 text-center">
              <p className="text-coffee text-sm">
                Remember your password?
                <button
                  type="button"
                  onClick={() => navigate('/login', { replace: true })}
                  className="pl-1.5 font-medium text-black hover:underline focus:outline-none"
                >
                  Login
                </button>
                {' | '}
                <button
                  type="button"
                  onClick={() => navigate('/register', { replace: true })}
                  className="font-medium text-black hover:underline focus:outline-none"
                >
                  Register
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
