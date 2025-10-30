import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button Component
 * Supports variants: primary, secondary, outline
 * Built-in loading state and icon support
 */
const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline'
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left', // 'left' | 'right'
  className = '',
  ...props
}) => {
  // Determine button classes based on variant
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
  };

  const baseClass = variantClasses[variant] || variantClasses.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} flex items-center justify-center ${
        loading || disabled ? 'opacity-70 cursor-not-allowed' : ''
      } ${className}`}
      {...props}
    >
      {/* Loading spinner */}
      {loading && <Loader2 size={20} className="mr-2 animate-spin" />}

      {/* Left icon */}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon size={20} className="mr-2" />
      )}

      {/* Button text */}
      <span>{children}</span>

      {/* Right icon */}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon size={20} className="ml-2" />
      )}
    </button>
  );
};

export default Button;
