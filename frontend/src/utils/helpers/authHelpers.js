/**
 * Helper functions for authentication forms
 * Centralized CSS classes and utility functions
 */

// Get input CSS classes
export const getInputClasses = (hasPasswordIcon = false, width = 'w-[285px]') => {
  return `input h-[55px] ${width} rounded-br-[10px] border-r-2 border-b-2 border-l-2 border-black border-t-transparent bg-transparent px-5 ${
    hasPasswordIcon ? 'pr-12' : ''
  } text-lg font-medium tracking-wider transition-all duration-[400ms] ease-in outline-none focus:shadow-sm`;
};

// Get label CSS classes
export const getLabelClasses = () => {
  return 'label pointer-events-none absolute top-[13px] left-5 text-xl font-medium text-[#0b2447] transition-all duration-500 ease-in-out';
};

// Get topline CSS classes
export const getToplineClasses = () => {
  return 'topline absolute top-0 right-0 h-[1.5px] w-0 bg-black transition-all duration-[400ms] ease-in-out';
};

// Check if field icon should be visible
export const shouldShowFieldIcon = (focusedField, fieldName, fieldValue) => {
  return focusedField === fieldName && fieldValue;
};

// Get icon button CSS classes
export const getFieldIconClasses = (isVisible) => {
  return `absolute right-3 top-4 transition-opacity duration-500 z-10 cursor-pointer text-gray-600 hover:text-black ${
    isVisible ? 'opacity-100' : 'opacity-0'
  }`;
};
