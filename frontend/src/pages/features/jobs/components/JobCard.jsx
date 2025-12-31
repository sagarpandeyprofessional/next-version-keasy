/**
 * @file JobCard.jsx
 * @description Individual job card component for the jobs list view.
 * 
 * Displays a compact card with:
 * - Company logo
 * - Job title and company name
 * - Location, job type, and salary info
 * - Deadline/expiry badge
 * - Save/bookmark button
 * - View count
 * 
 * @requires react
 * @requires framer-motion
 * @requires lucide-react
 * @requires react-icons
 * 
 * @author Keasy
 * @version 1.0.1
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Building2,
  AlertCircle
} from 'lucide-react';
import { IoEyeOutline } from 'react-icons/io5';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { 
  formatCount, 
  formatSalaryRange, 
  getJobTypeLabel,
  getLocationTypeLabel,
  getRelativeTime,
  getDeadlineStatus,
  truncateText,
  listItemVariants
} from './jobsUtils';


/**
 * JobCard Component
 * 
 * Displays a job listing in a compact card format for the list view.
 * Shows key information at a glance and handles selection/save actions.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.job - The job data object
 * @param {Object} props.company - The company data object
 * @param {boolean} props.isSelected - Whether this card is currently selected
 * @param {boolean} props.isSaved - Whether user has saved this job
 * @param {Function} props.onSelect - Callback when card is clicked
 * @param {Function} props.onSave - Callback when save button is clicked
 * @param {number} props.index - Index for staggered animation
 * @param {string} props.categoryName - Display name of the category
 * @param {Object} props.user - Current user object (null if not logged in)
 * 
 * @returns {JSX.Element} The job card component
 * 
 * @example
 * <JobCard
 *   job={jobData}
 *   company={companyData}
 *   isSelected={selectedJob?.id === jobData.id}
 *   isSaved={savedJobs.includes(jobData.id)}
 *   onSelect={() => handleSelectJob(jobData)}
 *   onSave={() => handleSaveJob(jobData.id)}
 *   index={0}
 *   categoryName="Technology / IT"
 *   user={currentUser}
 * />
 */
const JobCard = ({
  job,
  company,
  isSelected,
  isSaved,
  onSelect,
  onSave,
  index,
  categoryName,
  user,
  lang = 'en'
}) => {
  // Get deadline status for badge display
  const deadlineStatus = getDeadlineStatus(job.deadline);
  
  // Display the company logo (NOT the job cover image)
  const displayImage = company?.logo_url;
  
  // Handle save button click without triggering card selection
  const handleSaveClick = (e) => {
    e.stopPropagation();
    onSave();
  };

  return (
    <motion.div
      custom={index}
      variants={listItemVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      layout
      onClick={onSelect}
      className={`
        relative flex gap-3 p-3 rounded-xl cursor-pointer
        transition-all duration-200 ease-out
        ${isSelected 
          ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
          : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
        ${deadlineStatus.isExpired ? 'opacity-75' : ''}
      `}
    >
      {/* ----------------------------------------------------------------
          LEFT: Company Logo Section
          ---------------------------------------------------------------- */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
        {displayImage ? (
          <img
            src={displayImage}
            alt={company?.name_en || job.title}
            className="w-full h-full object-cover rounded-lg bg-gray-100"
            onError={(e) => {
              // Fallback to placeholder on error
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company?.name_en || 'Job')}&background=6366f1&color=fff&size=96`;
            }}
          />
        ) : (
          // Placeholder with company initial
          <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {(company?.name_en || job.title || 'J').charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Expired Badge Overlay */}
        {deadlineStatus.isExpired && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-semibold px-2 py-1 bg-red-500 rounded">
              Expired
            </span>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------
          RIGHT: Content Section
          ---------------------------------------------------------------- */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Row: Title and Save Button */}
        <div className="flex items-start justify-between gap-2">
          <h3 className={`
            font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base
            ${isSelected ? 'text-blue-900' : ''}
          `}>
            {job.title}
          </h3>
          
          {/* Save/Bookmark Button */}
          <button
            onClick={handleSaveClick}
            disabled={!user}
            className={`
              flex-shrink-0 p-1.5 rounded-full transition-all duration-200
              ${isSaved 
                ? 'text-blue-600 bg-blue-100 hover:bg-blue-200' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }
              ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={!user ? 'Login to save jobs' : isSaved ? 'Unsave' : 'Save job'}
            aria-label={isSaved ? 'Remove from saved' : 'Save job'}
          >
            {isSaved ? (
              <BsBookmarkFill className="w-4 h-4" />
            ) : (
              <BsBookmark className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Company Name */}
        <div className="flex items-center gap-1 mt-1">
          <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-600 truncate">
            {company?.name_en || 'Company'}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-500 truncate">
            {job.location}
            {job.location_type && (
              <span className="text-gray-400"> · {getLocationTypeLabel(job.location_type)}</span>
            )}
          </span>
        </div>

        {/* Bottom Row: Tags and Meta */}
        <div className="flex items-center justify-between mt-auto pt-2">
          {/* Left: Job Type & Salary */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Job Type Badge */}
            <span className={`
              inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
              ${job.job_type === 'full-time' ? 'bg-green-100 text-green-700' :
                job.job_type === 'part-time' ? 'bg-blue-100 text-blue-700' :
                job.job_type === 'contract' ? 'bg-orange-100 text-orange-700' :
                job.job_type === 'internship' ? 'bg-purple-100 text-purple-700' :
                'bg-gray-100 text-gray-700'
              }
            `}>
              {getJobTypeLabel(job.job_type)}
            </span>
            
            {/* Salary (if provided) - NOW WITH LANG PARAMETER */}
            {(job.salary_min || job.salary_max || job.salary_type === 'negotiable') && (
              <span className="text-xs text-gray-500 hidden sm:inline">
                {job.salary_type === 'negotiable' 
                  ? (lang === 'ko' ? '협의' : 'Negotiable')
                  : formatSalaryRange(job.salary_min, job.salary_max, job.salary_type, lang)
                }
              </span>
            )}
          </div>

          {/* Right: Views & Time */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {/* View Count */}
            <span className="flex items-center gap-0.5">
              <IoEyeOutline className="w-3.5 h-3.5" />
              {formatCount(job.view || 0)}
            </span>
            
            {/* Posted Time */}
            <span className="hidden sm:inline">
              {getRelativeTime(job.created_at)}
            </span>
          </div>
        </div>

        {/* Deadline Warning Badge */}
        {deadlineStatus.label && !deadlineStatus.isExpired && deadlineStatus.urgent && (
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
              <AlertCircle className="w-3 h-3" />
              {deadlineStatus.label}
            </span>
          </div>
        )}
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-500 rounded-l-full" />
      )}
    </motion.div>
  );
};

export default JobCard;