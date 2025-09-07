import React from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = " ",
  error,
  icon,
  showPassword,
  togglePassword,
  variant = "signup", // 👈 page-specific variant
  extraClass = "",   // 👈 field-specific control
}) => {
  const isPassword = type === "password";

  return (
    <div className={`input-container relative ${variant} ${extraClass}`}>
      <input
        className="input h-[55px] w-full rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm"
        name={name}
        type={isPassword && !showPassword ? "password" : "text"}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        required
      />
      <label className="label pointer-events-none absolute top-[13px] left-5 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out">
        {label}
      </label>

      {/* Topline */}
      <div className="topline absolute top-0 right-0 h-[1.5px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>

      {/* Icon / Password Toggle */}
      {isPassword ? (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-3 top-4 text-gray-600 hover:text-black"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      ) : (
        icon && <span className="absolute right-3 top-4 text-gray-600">{icon}</span>
      )}

      {/* Error */}
      {error && (
        <div className="mt-1 ml-2 flex items-center text-xs text-red-500">
          <AlertCircle size={12} className="mr-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormInput;
