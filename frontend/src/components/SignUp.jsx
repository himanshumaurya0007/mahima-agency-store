import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  HelpCircle,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
// import { Link } from 'react-router-dom'; // Uncomment when backend ready

const SignUp = () => {
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
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===== SECURITY QUESTIONS =====
  const securityQuestions = [
    'What is your pet name ?',
    'Which is you Fav Car ?',
    'What city were you born in?',
  ];

  // ===== MINIMAL VALIDATION =====
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return !value.trim() ? 'Required' : '';

      case 'email': {
        const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        if (!value.trim()) return 'Required';
        if (!emailRegex.test(value)) return 'Invalid email';
        return '';
      }

      case 'phone':
        if (!value.trim()) return 'Required';
        if (!/^\+?[1-9]\d{9,14}$/.test(value.replace(/\s+/g, ''))) return 'Invalid phone';
        return '';

      case 'username':
        if (!value.trim()) return 'Required';
        if (value.length < 3) return 'Min 3 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Letters, numbers, underscore only';
        return '';

      case 'password':
        if (!value) return 'Required';
        if (value.length < 8) return 'Min 8 characters';
        return '';

      case 'securityQuestion':
        return !value ? 'Required' : '';

      case 'securityAnswer':
        return !value.trim() ? 'Required' : '';

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

    // If no errors, simulate submission
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);

      // ===== BACKEND CONNECTION (COMMENTED) =====
      /*
      try {
        const response = await axios.post('/api/auth/signup', {
          firstName: formData.firstName.toLowerCase().trim(),
          lastName: formData.lastName.toLowerCase().trim(),
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone.trim(),
          username: formData.username.trim(),
          password: formData.password,
          securityQuestion: formData.securityQuestion,
          securityAnswer: formData.securityAnswer.trim()
        });

        console.log('✅ Registration successful:', response.data);
        alert('✅ Account created successfully! Please login to continue.');
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          username: '',
          password: '',
          securityQuestion: '',
          securityAnswer: ''
        });

        // Redirect to login page
        // navigate('/login');

      } catch (error) {
        console.error('❌ Registration failed:', error);
        
        if (error.response?.data?.message) {
          alert(`❌ Registration failed: ${error.response.data.message}`);
        } else if (error.response?.status === 400) {
          alert('❌ Registration failed: Please check your information');
        } else if (error.response?.status === 409) {
          alert('❌ Registration failed: Email or username already exists');
        } else {
          alert('❌ Registration failed: Something went wrong');
        }
      } finally {
        setIsSubmitting(false);
      }
      */

      // ===== TESTING SIMULATION =====
      setTimeout(() => {
        setIsSubmitting(false);
        alert('✅ Form submitted successfully! (Backend not connected)');
        console.log('Form Data:', formData);
      }, 1500);
    } else {
      console.log('❌ Form has errors:', newErrors);
    }
  };

  // ===== GET FIELD ICON =====
  const getFieldIcon = (fieldName) => {
    const isVisible = focusedField === fieldName || formData[fieldName];
    const iconClass = `absolute right-3 top-4 transition-all duration-300 ${
      isVisible ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-75'
    }`;

    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        return <User className={`${iconClass} text-gray-600`} size={20} />;
      case 'email':
        return <Mail className={`${iconClass} text-gray-600`} size={20} />;
      case 'phone':
        return <Phone className={`${iconClass} text-gray-600`} size={20} />;
      case 'username':
        return <UserCheck className={`${iconClass} text-gray-600`} size={20} />;
      case 'password':
        return (
          <button
            type="button"
            className={`${iconClass} cursor-pointer text-gray-600 hover:text-black`}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        );
      case 'securityQuestion':
        return <HelpCircle className={`${iconClass} text-gray-600`} size={20} />;
      case 'securityAnswer':
        return <MessageSquare className={`${iconClass} text-gray-600`} size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-cream flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-[40rem]">
        <div className="card flex flex-col items-center justify-between">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <h2 className="text-card-title mb-2 text-black">Create Account</h2>
            <p className="text-caption text-coffee">Join Mahima Agencies Right Now</p>
          </div>

          {/* Form Section */}
          <form className="w-full space-y-7" onSubmit={handleSubmit}>
            {/* Personal Information Row */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
              {/* First Name */}
              <div className="flex justify-center sm:justify-start">
                <div className="input-container relative">
                  <input
                    className="input h-[55px] w-[280px] rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
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
                  {getFieldIcon('firstName')}
                  {errors.firstName && (
                    <div className="mt-1 ml-2 flex items-center text-xs text-red-500">
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
                    className="input h-[55px] w-[280px] rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
                    name="lastName"
                    type="text"
                    required
                    placeholder=" "
                    autoComplete="family-name "
                    value={formData.lastName}
                    onChange={handleChange}
                    onFocus={() => handleFocus('lastName')}
                    onBlur={handleBlur}
                  />
                  <label className="label pointer-events-none absolute top-[13px] left-5 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
                    Last Name
                  </label>
                  <div className="topline absolute top-0 right-0 h-[1.5px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
                  {getFieldIcon('lastName')}
                  {errors.lastName && (
                    <div className="mt-1 ml-2 flex items-center text-xs text-red-500">
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
                    className="input h-[55px] w-[280px] rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
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
                  {getFieldIcon('email')}
                  {errors.email && (
                    <div className="mt-1 ml-2 flex items-center text-xs text-red-500">
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
                    className="input h-[55px] w-[280px] rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
                    name="phone"
                    type="tel"
                    required
                    placeholder=" "
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => handleFocus('phone')}
                    onBlur={handleBlur}
                  />
                  <label className="label pointer-events-none absolute top-[13px] left-5 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
                    Phone No.
                  </label>
                  <div className="topline absolute top-0 right-0 h-[2px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
                  {getFieldIcon('phone')}
                  {errors.phone && (
                    <div className="mt-1 ml-2 flex items-center text-xs text-red-500">
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
                    className="input h-[55px] w-[280px] rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
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
                    <div className="mt-1 ml-2 flex items-center text-xs text-red-500">
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
                    className="input h-[55px] w-[280px] rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
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
                  <div className="topline absolute top-0 right-0 h-[2px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
                  {getFieldIcon('password')}
                  {errors.password && (
                    <div className="mt-1 ml-2 flex items-center text-xs text-red-500">
                      <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Security Question Section */}
            <div className="mt-10 space-y-8">
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
                  {securityQuestions.map((question, index) => (
                    <option
                      key={index}
                      value={question}
                      className="bg-cream py-3 font-medium text-[#0b2447]"
                    >
                      {question}
                    </option>
                  ))}
                </select>
                <label className="label pointer-events-none absolute top-[13px] left-4 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
                  Security Question
                </label>
                <div className="topline absolute top-0 right-0 h-[1.5px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
                {getFieldIcon('securityQuestion')}
                {errors.securityQuestion && (
                  <div className="mt-1 ml-2 flex items-center text-xs text-red-500">
                    <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                    <span>{errors.securityQuestion}</span>
                  </div>
                )}
              </div>

              {/* Security Answer */}
              <div className="input-container relative">
                <input
                  className="input sec h-[55px] w-full rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-4 text-xl font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
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
                <label className="label pointer-events-none absolute top-[13px] left-4 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
                  Security Answer
                </label>
                <div className="topline absolute top-0 right-0 h-[1.5px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
                {getFieldIcon('securityAnswer')}
                {errors.securityAnswer && (
                  <div className="mt-1 ml-2 flex items-center text-xs text-red-500">
                    <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                    <span>{errors.securityAnswer}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`h-[55px] w-full ${
                  isSubmitting
                    ? 'cursor-not-allowed bg-gray-600'
                    : 'bg-black hover:bg-gray-800 active:bg-gray-900'
                } focus:ring-offset-cream flex items-center justify-center rounded-lg text-xl font-medium text-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-md focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none`}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                    Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>

            {/* Already have account - COMMENTED FOR NOW */}
            <div className="pt-4 text-center">
              <p className="text-coffee text-sm">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-black hover:underline">
                  Sign In
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
