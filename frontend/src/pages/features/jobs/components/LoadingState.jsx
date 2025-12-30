/**
 * @file LoadingState.jsx
 * @description Skeleton loading UI displayed while jobs are being fetched.
 * 
 * Mimics the layout of the actual content for a smooth loading experience.
 * Shows animated pulse placeholders for:
 * - Job cards in the list (left pane)
 * - Job detail panel (right pane on desktop)
 * 
 * @requires react
 * 
 * @author Keasy
 * @version 1.0.0
 */

import React from 'react';


/**
 * JobCardSkeleton Component
 * 
 * Individual skeleton placeholder for a job card.
 * Matches the layout of the actual JobCard component.
 * 
 * @component
 * @returns {JSX.Element} Skeleton job card
 */
const JobCardSkeleton = () => (
  <div className="flex gap-3 p-3 rounded-xl bg-white border border-gray-200 animate-pulse">
    {/* Image Placeholder */}
    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg flex-shrink-0" />
    
    {/* Content Placeholder */}
    <div className="flex-1 space-y-2 py-1">
      {/* Title */}
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      
      {/* Company */}
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      
      {/* Location */}
      <div className="h-3 bg-gray-200 rounded w-2/3" />
      
      {/* Tags Row */}
      <div className="flex gap-2 mt-auto pt-2">
        <div className="h-5 bg-gray-200 rounded-full w-16" />
        <div className="h-5 bg-gray-200 rounded-full w-20" />
      </div>
    </div>
  </div>
);


/**
 * DetailPanelSkeleton Component
 * 
 * Skeleton placeholder for the job detail panel.
 * Shown on desktop while content is loading.
 * 
 * @component
 * @returns {JSX.Element} Skeleton detail panel
 */
const DetailPanelSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
    {/* Cover Image Placeholder */}
    <div className="w-full h-48 sm:h-64 bg-gray-200" />
    
    {/* Content Area */}
    <div className="p-6 space-y-4">
      {/* Title */}
      <div className="h-7 bg-gray-200 rounded w-3/4" />
      
      {/* Company & Location */}
      <div className="flex gap-4">
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
      
      {/* Tags */}
      <div className="flex gap-2 pt-2">
        <div className="h-8 bg-gray-200 rounded-full w-24" />
        <div className="h-8 bg-gray-200 rounded-full w-20" />
        <div className="h-8 bg-gray-200 rounded-full w-28" />
      </div>
      
      {/* Divider */}
      <div className="h-px bg-gray-200 my-4" />
      
      {/* Description Lines */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
      
      {/* Requirements Section */}
      <div className="pt-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-40" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-6 bg-gray-200 rounded-full w-24" />
          <div className="h-6 bg-gray-200 rounded-full w-16" />
        </div>
      </div>
      
      {/* Apply Button Placeholder */}
      <div className="pt-6">
        <div className="h-12 bg-gray-200 rounded-xl w-full" />
      </div>
    </div>
  </div>
);


/**
 * FilterSkeleton Component
 * 
 * Skeleton for the filter/category section.
 * 
 * @component
 * @returns {JSX.Element} Skeleton filter pills
 */
const FilterSkeleton = () => (
  <div className="flex gap-2 overflow-hidden">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div 
        key={i} 
        className="h-9 bg-gray-200 rounded-full animate-pulse flex-shrink-0"
        style={{ width: `${60 + Math.random() * 40}px` }}
      />
    ))}
  </div>
);


/**
 * LoadingState Component
 * 
 * Main loading state component that displays skeleton placeholders
 * for both the job list and detail panel.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.showFilters - Whether to show filter skeletons
 * @param {number} props.cardCount - Number of card skeletons to show (default: 5)
 * 
 * @returns {JSX.Element} The loading state component
 * 
 * @example
 * <LoadingState showFilters={true} cardCount={5} />
 */
const LoadingState = ({ showFilters = false, cardCount = 5 }) => {
  return (
    <div className="lg:flex lg:gap-6">
      {/* ----------------------------------------------------------------
          Left Pane: Job Cards Skeletons
          ---------------------------------------------------------------- */}
      <div className="lg:w-[35%] lg:min-w-[320px] lg:max-w-[420px] space-y-3">
        {/* Filter Skeleton (optional) */}
        {showFilters && (
          <div className="mb-4">
            <FilterSkeleton />
          </div>
        )}
        
        {/* Job Card Skeletons */}
        {Array.from({ length: cardCount }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>

      {/* ----------------------------------------------------------------
          Right Pane: Detail Panel Skeleton (Desktop only)
          ---------------------------------------------------------------- */}
      <div className="hidden lg:block lg:flex-1">
        <DetailPanelSkeleton />
      </div>
    </div>
  );
};


/**
 * LoadingSpinner Component
 * 
 * Simple centered loading spinner for inline loading states.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.size - Size of spinner: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} props.text - Optional loading text
 * 
 * @returns {JSX.Element} Loading spinner
 */
export const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-14 w-14 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div 
        className={`
          ${sizeClasses[size]} 
          border-gray-200 border-t-blue-600 
          rounded-full animate-spin
        `}
      />
      {text && (
        <p className="mt-4 text-gray-600 text-sm">{text}</p>
      )}
    </div>
  );
};


/**
 * PageLoadingState Component
 * 
 * Full page loading state with centered spinner.
 * Used when the entire page is loading.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.text - Loading message to display
 * 
 * @returns {JSX.Element} Full page loading state
 */
export const PageLoadingState = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
};


export default LoadingState;
