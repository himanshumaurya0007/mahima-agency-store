import React from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

/**
 * Reusable Select Dropdown Component
 */
const Select = ({
  id,
  name,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  options = [], // [{ value: '', label: '' }]
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  error = '',
  helperText = '',
  className = '',
  containerClassName = '',
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

      {/* Select Container */}
      <div className="relative">
        <select
          id={id || name}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          className={`h-14 w-full appearance-none rounded-lg border-2 ${
            error
              ? 'border-red-400 focus:border-red-500'
              : 'focus:border-peach border-gray-300'
          } ${
            disabled
              ? 'bg-gray-50 cursor-not-allowed text-gray-400'
              : 'bg-white text-black cursor-pointer'
          } px-4 pr-10 text-base font-medium tracking-wider transition-all duration-200 ease-in outline-none hover:border-gray-400 focus:shadow-md ${className}`}
          {...props}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown Icon */}
        <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
          <ChevronDown size={20} />
        </div>
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

export default Select;
