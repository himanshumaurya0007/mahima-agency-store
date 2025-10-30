import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Reusable Input Component
 * Features: floating label, icon support, error display
 */
const Input = ({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = '',
  required = false,
  disabled = false,
  error = '',
  icon: Icon,
  helperText = '',
  className = '',
  containerClassName = '',
  autoComplete = 'off',
  ...props
}) => {
  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {/* Label */}
      {label && (
        <label className="text-coffee block text-sm font-semibold tracking-wide">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div
            className={`absolute top-1/2 left-4 -translate-y-1/2 ${
              disabled ? 'text-gray-300' : 'text-gray-400'
            }`}
          >
            <Icon size={20} />
          </div>
        )}

        {/* Input Field */}
        <input
          id={id || name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder || `Enter ${label?.toLowerCase() || ''}`}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`h-14 w-full rounded-lg border-2 ${
            error
              ? 'border-red-400 focus:border-red-500'
              : 'focus:border-peach border-gray-300'
          } ${
            disabled
              ? 'bg-gray-50 cursor-not-allowed text-gray-400 italic'
              : 'bg-white text-black'
          } px-4 ${Icon ? 'pl-12' : ''} text-base font-medium tracking-wider transition-all duration-200 ease-in outline-none hover:border-gray-400 focus:shadow-md ${className}`}
          {...props}
        />
      </div>

      {/* Helper Text */}
      {helperText && !error && (
        <div className="ml-1 flex items-center text-xs font-medium text-gray-500">
          <span>{helperText}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-1.5 ml-1 flex items-center text-xs font-medium text-red-600">
          <AlertCircle size={13} className="mr-1.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default Input;
