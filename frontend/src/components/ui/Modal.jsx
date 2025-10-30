import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Modal Component with smooth animations
 * Animations: Backdrop fade-in, Modal slide-up
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  closeOnBackdrop = true,
  showCloseButton = true,
}) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex backdrop-blur-xs items-center justify-center bg-opacity-50 px-4 animate-fade-in"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      {/* Modal Container with slide-up animation */}
      <div
        className={`bg-white border-gray-500 border rounded-lg shadow-2xl ${sizeClasses[size]} w-full max-h-90vh overflow-y-auto animate-slide-up`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-2xl font-bold text-black font-alpino">
                  {title}
                </h3>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-black transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
