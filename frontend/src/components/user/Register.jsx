import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import authService from '../../services/authService';
import { SECURITY_QUESTIONS } from '../../utils/constants';
import { registerUserValidationSchema } from '../../validations/userValidationSchemas';
import { useAuthForm } from '../../hooks/useAuthForm';
import { getInputClasses, getLabelClasses, getToplineClasses } from '../../utils/authHelpers';

const Register = () => {
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const [showPassword, setShowPassword] = useState(false);
  const [showSecurityAnswer, setShowSecurityAnswer] = useState(false);

  // Form state and handlers from custom hook
  const {
    formData,
    errors,
    loading,
    focusedField,
    handleChange,
    handleFocus,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useAuthForm(
    {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      username: '',
      password: '',
      securityQuestion: '',
      securityAnswer: '',
    },
    registerUserValidationSchema,
    async (data) => {
      const result = await authService.register(data);
      if (result && result.success) {
        resetForm();
        navigate('/login', { replace: true });
      }
    }
  );

  // Password/Security Answer toggle icons
  const getFieldIcon = (fieldName) => {
    const isVisible = focusedField === fieldName && formData[fieldName];
    const iconClass = `absolute right-3 top-4 transition-opacity duration-500 z-10 cursor-pointer text-gray-600 hover:text-black ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`;

    if (fieldName === 'password') {
      return (
        <button type="button" className={iconClass} onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      );
    }

    if (fieldName === 'securityAnswer') {
      return (
        <button
          type="button"
          className={iconClass}
          onClick={() => setShowSecurityAnswer(!showSecurityAnswer)}
        >
          {showSecurityAnswer ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      );
    }

    return null;
  };

  // Render input field (285px width)
  const renderInputField = (name, type, label, options = {}) => {
    const hasPasswordIcon = name === 'password';

    return (
      <div className="input-container relative">
        <input
          className={getInputClasses(hasPasswordIcon)}
          name={name}
          type={type}
          required
          placeholder=" "
          autoComplete={options.autoComplete || name}
          value={formData[name]}
          onChange={handleChange}
          onFocus={() => handleFocus(name)}
          onBlur={handleBlur}
          {...options.inputProps}
        />
        <label className={getLabelClasses()}>{label}</label>
        <div className={getToplineClasses()}></div>
        {hasPasswordIcon && getFieldIcon(name)}
        {errors[name] && (
          <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
            <AlertCircle size={12} className="mr-1 flex-shrink-0" />
            <span>{errors[name]}</span>
          </div>
        )}
      </div>
    );
  };

  // Render security question dropdown (full width)
  const renderSecurityQuestionDropdown = () => (
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
          <option key={index} value={question} className="py-3 font-medium text-[#0b2447]">
            {question}
          </option>
        ))}
      </select>
      <label className={getLabelClasses()}>Security Question</label>
      <div className={getToplineClasses()}></div>
      {errors.securityQuestion && (
        <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
          <AlertCircle size={12} className="mr-1 flex-shrink-0" />
          <span>{errors.securityQuestion}</span>
        </div>
      )}
    </div>
  );

  // Render security answer (full width, different styling)
  const renderSecurityAnswer = () => (
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
  );

  return (
    <div className="bg-cream flex min-h-screen items-center justify-center animate-fade-in">
      <div className="register w-full max-w-[41rem]">
        <div className="card flex flex-col items-center justify-between">
          <div className="mb-6 text-center">
            <h2 className="text-card-title mb-2 text-black">Create Account</h2>
            <p className="text-caption text-coffee">Join Mahima Agencies Right Now</p>
          </div>

          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            
            {/* Personal Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
              <div className="flex justify-center sm:justify-start">
                {renderInputField('firstName', 'text', 'First Name', {
                  autoComplete: 'given-name',
                })}
              </div>
              <div className="flex justify-center sm:justify-end">
                {renderInputField('lastName', 'text', 'Last Name', {
                  autoComplete: 'family-name',
                })}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
              <div className="flex justify-center sm:justify-start">
                {renderInputField('email', 'email', 'Email Address')}
              </div>
              <div className="flex justify-center sm:justify-end">
                {renderInputField('phone', 'tel', 'Phone No.', {
                  inputProps: { inputMode: 'numeric', pattern: '[0-9]*' },
                })}
              </div>
            </div>

            {/* Account Credentials */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
              <div className="flex justify-center sm:justify-start">
                {renderInputField('username', 'text', 'Username')}
              </div>
              <div className="flex justify-center sm:justify-end">
                {renderInputField('password', showPassword ? 'text' : 'password', 'Password', {
                  autoComplete: 'new-password',
                })}
              </div>
            </div>

            {/* Security Section */}
            <div className="mt-8 space-y-6">
              {renderSecurityQuestionDropdown()}
              {renderSecurityAnswer()}
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
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="pt-4 text-center">
              <p className="text-coffee text-sm">
                Already have an account?
                <button
                  type="button"
                  onClick={() => navigate('/login', { replace: true })}
                  className="font-medium text-black hover:underline focus:outline-none ml-1.5"
                >
                  Login
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
