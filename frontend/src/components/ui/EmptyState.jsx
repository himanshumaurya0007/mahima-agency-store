import React from 'react';
import Button from './Button';

/**
 * Reusable Empty State Component
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="card p-12 text-center animate-fade-in">
      <div className="flex flex-col items-center">
        {/* Icon */}
        {Icon && (
          <div className="bg-vanilla p-6 rounded-full mb-6">
            <Icon size={48} className="text-coffee" />
          </div>
        )}

        {/* Title */}
        {title && <h3 className="text-2xl font-bold text-black mb-2">{title}</h3>}

        {/* Description */}
        {description && (
          <p className="text-gray-600 mb-6 max-w-md">{description}</p>
        )}

        {/* Action Button */}
        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
