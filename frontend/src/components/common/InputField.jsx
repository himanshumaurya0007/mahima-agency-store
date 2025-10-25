
// Want To Implement But On Hold

// import React from 'react';
// import { AlertCircle } from 'lucide-react';

// const InputField = ({
//   id,
//   name,
//   type = 'text',
//   label,
//   value,
//   onChange,
//   onFocus,
//   onBlur,
//   required = false,
//   className = '',
//   containerClassName = '',
//   error = '',
//   icon = null,
//   autoComplete,
//   placeholder = ' ',
//   ...extraProps
// }) => {
//   return (
//     <div className={`input-container relative ${containerClassName}`}>
//       <input
//         id={id || name}
//         name={name}
//         type={type}
//         value={value}
//         onChange={onChange}
//         onFocus={onFocus}
//         onBlur={onBlur}
//         required={required}
//         placeholder={placeholder}
//         autoComplete={autoComplete || name}
//         className={`input h-[55px] w-[285px] rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm ${className} ${icon ? 'pr-12' : ''}`}
//         {...extraProps}
//       />
      
//       <label 
//         htmlFor={id || name} 
//         className="label pointer-events-none absolute top-[13px] left-5 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out"
//       >
//         {label}
//       </label>
      
//       <div className="topline absolute top-0 right-0 h-[1.5px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
      
//       {/* Icon Container */}
//       {icon && (
//         <div className="absolute right-3 top-4 transition-all duration-500 ease-in-out z-10">
//           {icon}
//         </div>
//       )}
      
//       {/* Error Display */}
//       {error && (
//         <div className="mt-2 ml-2 flex items-center text-xs font-medium text-red-600">
//           <AlertCircle size={12} className="mr-1 flex-shrink-0" />
//           <span>{error}</span>
//         </div>
//       )}
//     </div>
//   );
// };

// export default InputField;
