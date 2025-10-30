import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Loader Component
 * Two modes: spinner and skeleton
 */

// Spinner Loader
export const Spinner = ({ size = 24, className = '' }) => {
  return <Loader2 size={size} className={`animate-spin ${className}`} />;
};

// Full Page Loader
export const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="bg-cream min-h-screen flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <Loader2 size={48} className="animate-spin text-black mx-auto mb-4" />
        <p className="text-lg font-medium text-coffee">{message}</p>
      </div>
    </div>
  );
};

// Skeleton Loader for Cards
export const SkeletonCard = () => {
  return (
    <div className="card p-5 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="flex gap-2">
        <div className="h-10 bg-gray-200 rounded flex-1"></div>
        <div className="h-10 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );
};

// Multiple Skeleton Cards
export const SkeletonCards = ({ count = 9 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

export default Spinner;
