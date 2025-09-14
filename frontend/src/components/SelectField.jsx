
// Want To Implement But On Hold

// import React from 'react';
// import { AlertCircle } from 'lucide-react';

// const SelectField = ({
//   id,
//   name,
//   label,
//   value,
//   onChange,
//   onFocus,
//   onBlur,
//   required = false,
//   className = '',
//   containerClassName = '',
//   error = '',
//   options = [],
//   placeholder = 'Select one option',
//   ...extraProps
// }) => {
//   return (
//     <div className={`input-container relative ${containerClassName}`}>
//       <select
//         id={id || name}
//         name={name}
//         value={value}
//         onChange={onChange}
//         onFocus={onFocus}
//         onBlur={onBlur}
//         required={required}
//         className={`input h-[55px] w-full cursor-pointer rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-4 text-xl font-medium tracking-wider text-[#0b2447] transition-all duration-[400ms] ease-in outline-none focus:shadow-sm ${className}`}
//         {...extraProps}
//       >
//         <option value="" disabled hidden>{placeholder}</option>
//         {options.map((option, index) => (
//           <option 
//             key={index} 
//             value={option.value || option} 
//             className="py-3 font-medium text-[#0b2447]"
//           >
//             {option.label || option}
//           </option>
//         ))}
//       </select>
      
//       <label 
//         htmlFor={id || name} 
//         className="label pointer-events-none absolute top-[13px] left-4 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out"
//       >
//         {label}
//       </label>
      
//       <div className="topline absolute top-0 right-0 h-[1.5px] w-0 bg-black transition-all duration-[400ms] ease-in-out"></div>
      
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

// export default SelectField;
