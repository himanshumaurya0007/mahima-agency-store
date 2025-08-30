import React, { useState } from 'react';
import { UserCheck, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
// import { Link } from 'react-router-dom'; // Uncomment when backend ready

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===== MINIMAL VALIDATION =====
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
        const response = await axios.post('/api/auth/signin', {
          username: formData.username.trim(),
          password: formData.password
        });

        console.log('✅ Login successful:', response.data);
        
        // Store auth token
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        
        alert('✅ Login successful! Welcome back!');
        
        // Redirect to dashboard
        // navigate('/dashboard');

      } catch (error) {
        console.error('❌ Login failed:', error);
        
        if (error.response?.status === 401) {
          alert('❌ Invalid username or password');
        } else if (error.response?.status === 404) {
          alert('❌ Account not found. Please sign up first.');
        } else if (error.response?.data?.message) {
          alert(`❌ Login failed: ${error.response.data.message}`);
        } else {
          alert('❌ Login failed: Something went wrong');
        }
      } finally {
        setIsSubmitting(false);
      }
      */

      // ===== TESTING SIMULATION =====
      setTimeout(() => {
        setIsSubmitting(false);
        alert('✅ Login successful! (Backend not connected)');
        console.log('Login Data:', formData);
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
      default:
        return null;
    }
  };

  return (
    <div className="bg-cream flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-[26rem]">
        <div className="card flex flex-col items-center justify-between">
          {/* Header Section - No Icon */}
          <div className="mb-8 text-center">
            <h2 className="text-card-title mb-2 text-black">Welcome Back</h2>
            <p className="text-caption text-coffee">Sign in to Mahima Agencies</p>
          </div>

          {/* Form Section */}
          <form className="w-full space-y-4" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="input-container relative mb-6">
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
                <div className="mt-1 ml-2 flex items-center text-xs text-red-500">
                  <AlertCircle size={12} className="mr-1 flex-shrink-0" />
                  <span>{errors.username}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="input-container relative">
              <input
                className="input h-[55px] w-full rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
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
                <div className="mt-1 ml-2 flex items-center text-xs text-red-500">
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
                onClick={() => alert('Forgot password feature coming soon!')}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <div className="">
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
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            {/* Don't have account - COMMENTED FOR NOW */}
            {/*
            <div className="text-center pt-4">
              <p className="text-coffee text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="text-black hover:underline font-medium">
                  Sign Up
                </Link>
              </p>
            </div>
            */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
