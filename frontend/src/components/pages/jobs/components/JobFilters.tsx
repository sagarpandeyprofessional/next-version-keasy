// @ts-nocheck
"use client";

/**
 * @file JobFilters.jsx
 * @description Advanced filter panel component for filtering job listings.
 * 
 * Features:
 * - Job type filter (Full-time, Part-time, Contract, etc.)
 * - Location type filter (Remote, On-site, Hybrid)
 * - Experience level filter
 * - Language requirement filter
 * - Salary range filter
 * - Clear all filters button
 * - Active filters count badge
 * - Collapsible panel on mobile
 * - Bilingual support (EN/KO)
 * 
 * @requires react
 * @requires framer-motion
 * @requires lucide-react
 * 
 * @author Keasy
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
  Briefcase,
  MapPin,
  GraduationCap,
  Languages,
  DollarSign
} from 'lucide-react';
import {
  JOB_TYPES,
  LOCATION_TYPES,
  EXPERIENCE_LEVELS,
  filterDropdownVariants
} from './jobsUtils';


/**
 * FilterSection Component
 * 
 * A collapsible section within the filter panel.
 * 
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {JSX.Element} props.icon - Icon component
 * @param {boolean} props.defaultOpen - Whether section is open by default
 * @param {React.ReactNode} props.children - Section content
 * @param {number} props.activeCount - Number of active filters in this section
 */
const FilterSection = ({ 
  title, 
  icon: Icon, 
  defaultOpen = true, 
  children, 
  activeCount = 0 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      {/* Section Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          <span className="font-medium text-gray-900">{title}</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Section Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


/**
 * CheckboxFilter Component
 * 
 * A checkbox item for filter selections.
 * 
 * @param {Object} props
 * @param {string} props.id - Filter ID
 * @param {string} props.label - Display label
 * @param {boolean} props.checked - Whether checkbox is checked
 * @param {Function} props.onChange - Change handler
 */
const CheckboxFilter = ({ id, label, checked, onChange }) => {
  return (
    <label className="flex items-center gap-3 py-1.5 cursor-pointer group">
      <div className={`
        w-5 h-5 rounded border-2 flex items-center justify-center transition-all
        ${checked 
          ? 'bg-blue-600 border-blue-600' 
          : 'border-gray-300 group-hover:border-gray-400'
        }
      `}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(id, e.target.checked)}
        className="sr-only"
      />
      <span className={`text-sm ${checked ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
        {label}
      </span>
    </label>
  );
};


/**
 * SalaryRangeFilter Component
 * 
 * Min/Max salary input fields.
 * 
 * @param {Object} props
 * @param {number} props.min - Minimum salary value
 * @param {number} props.max - Maximum salary value
 * @param {Function} props.onMinChange - Min value change handler
 * @param {Function} props.onMaxChange - Max value change handler
 * @param {string} props.lang - Language code
 */
const SalaryRangeFilter = ({ min, max, onMinChange, onMaxChange, lang }) => {
  // Format number with commas for display
  const formatNumber = (num) => {
    if (!num) return '';
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  // Parse number from formatted string
  const parseNumber = (str) => {
    if (!str) return null;
    return parseInt(str.replace(/[^0-9]/g, ''), 10) || null;
  };

  return (
    <div className="space-y-3">
      {/* Min Salary */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          {lang === 'ko' ? '최소 급여' : 'Min Salary'}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₩</span>
          <input
            type="text"
            value={min ? formatNumber(min) : ''}
            onChange={(e) => onMinChange(parseNumber(e.target.value))}
            placeholder={lang === 'ko' ? '최소' : 'Min'}
            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Max Salary */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          {lang === 'ko' ? '최대 급여' : 'Max Salary'}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₩</span>
          <input
            type="text"
            value={max ? formatNumber(max) : ''}
            onChange={(e) => onMaxChange(parseNumber(e.target.value))}
            placeholder={lang === 'ko' ? '최대' : 'Max'}
            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Quick Select Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: lang === 'ko' ? '시급 1만↑' : '₩10K+/hr', min: 10000, type: 'hourly' },
          { label: lang === 'ko' ? '월급 200만↑' : '₩2M+/mo', min: 2000000, type: 'monthly' },
          { label: lang === 'ko' ? '월급 300만↑' : '₩3M+/mo', min: 3000000, type: 'monthly' }
        ].map((preset) => (
          <button
            key={preset.label}
            onClick={() => onMinChange(preset.min)}
            className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};


/**
 * JobFilters Component
 * 
 * Main filter panel component with all filter options.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter state
 * @param {Function} props.onFilterChange - Callback when filters change
 * @param {Function} props.onClearFilters - Callback to clear all filters
 * @param {Array} props.languages - Available languages from database
 * @param {string} props.lang - Language code ('en' or 'ko')
 * @param {boolean} props.isOpen - Whether filter panel is open (mobile)
 * @param {Function} props.onClose - Callback to close panel (mobile)
 * 
 * @returns {JSX.Element} The job filters component
 * 
 * @example
 * <JobFilters
 *   filters={filters}
 *   onFilterChange={handleFilterChange}
 *   onClearFilters={handleClearFilters}
 *   languages={languages}
 *   lang="en"
 * />
 */
const JobFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  languages = [],
  lang = 'en',
  isOpen = true,
  onClose
}) => {
  /**
   * Handle checkbox filter change
   * @param {string} filterType - Filter category (jobTypes, locationTypes, etc.)
   * @param {string} id - Filter item ID
   * @param {boolean} checked - New checked state
   */
  const handleCheckboxChange = (filterType, id, checked) => {
    const currentValues = filters[filterType] || [];
    let newValues;
    
    if (checked) {
      newValues = [...currentValues, id];
    } else {
      newValues = currentValues.filter(v => v !== id);
    }
    
    onFilterChange({
      ...filters,
      [filterType]: newValues
    });
  };

  /**
   * Handle salary filter change
   */
  const handleSalaryChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  /**
   * Count total active filters
   */
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.jobTypes?.length) count += filters.jobTypes.length;
    if (filters.locationTypes?.length) count += filters.locationTypes.length;
    if (filters.experienceLevels?.length) count += filters.experienceLevels.length;
    if (filters.languages?.length) count += filters.languages.length;
    if (filters.salaryMin || filters.salaryMax) count += 1;
    return count;
  };

  const activeCount = getActiveFilterCount();

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* ================================================================
          HEADER
          ================================================================ */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">
            {lang === 'ko' ? '필터' : 'Filters'}
          </h3>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Clear All Button */}
          {activeCount > 0 && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {lang === 'ko' ? '초기화' : 'Clear'}
            </button>
          )}
          
          {/* Close Button (Mobile) */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ================================================================
          FILTER SECTIONS
          ================================================================ */}
      <div className="max-h-[60vh] overflow-y-auto">
        {/* Job Type Filter */}
        <FilterSection
          title={lang === 'ko' ? '고용 형태' : 'Job Type'}
          icon={Briefcase}
          activeCount={filters.jobTypes?.length || 0}
        >
          <div className="space-y-1">
            {JOB_TYPES.map((type) => (
              <CheckboxFilter
                key={type.id}
                id={type.id}
                label={lang === 'ko' ? type.label_ko : type.label_en}
                checked={filters.jobTypes?.includes(type.id) || false}
                onChange={(id, checked) => handleCheckboxChange('jobTypes', id, checked)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Location Type Filter */}
        <FilterSection
          title={lang === 'ko' ? '근무 형태' : 'Location Type'}
          icon={MapPin}
          activeCount={filters.locationTypes?.length || 0}
        >
          <div className="space-y-1">
            {LOCATION_TYPES.map((type) => (
              <CheckboxFilter
                key={type.id}
                id={type.id}
                label={lang === 'ko' ? type.label_ko : type.label_en}
                checked={filters.locationTypes?.includes(type.id) || false}
                onChange={(id, checked) => handleCheckboxChange('locationTypes', id, checked)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Experience Level Filter */}
        <FilterSection
          title={lang === 'ko' ? '경력' : 'Experience Level'}
          icon={GraduationCap}
          activeCount={filters.experienceLevels?.length || 0}
        >
          <div className="space-y-1">
            {EXPERIENCE_LEVELS.map((level) => (
              <CheckboxFilter
                key={level.id}
                id={level.id}
                label={lang === 'ko' ? level.label_ko : level.label_en}
                checked={filters.experienceLevels?.includes(level.id) || false}
                onChange={(id, checked) => handleCheckboxChange('experienceLevels', id, checked)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Language Filter */}
        {languages.length > 0 && (
          <FilterSection
            title={lang === 'ko' ? '필요 언어' : 'Required Language'}
            icon={Languages}
            activeCount={filters.languages?.length || 0}
            defaultOpen={false}
          >
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {languages.map((language) => (
                <CheckboxFilter
                  key={language.id}
                  id={language.id}
                  label={`${language.flag_emoji || ''} ${lang === 'ko' ? language.name_ko : language.name_en}`}
                  checked={filters.languages?.includes(language.id) || false}
                  onChange={(id, checked) => handleCheckboxChange('languages', id, checked)}
                />
              ))}
            </div>
          </FilterSection>
        )}

        {/* Salary Range Filter */}
        <FilterSection
          title={lang === 'ko' ? '급여' : 'Salary Range'}
          icon={DollarSign}
          activeCount={(filters.salaryMin || filters.salaryMax) ? 1 : 0}
          defaultOpen={false}
        >
          <SalaryRangeFilter
            min={filters.salaryMin}
            max={filters.salaryMax}
            onMinChange={(value) => handleSalaryChange('salaryMin', value)}
            onMaxChange={(value) => handleSalaryChange('salaryMax', value)}
            lang={lang}
          />
        </FilterSection>
      </div>

      {/* ================================================================
          FOOTER (Mobile)
          ================================================================ */}
      {onClose && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 lg:hidden">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            {lang === 'ko' 
              ? `${activeCount > 0 ? `${activeCount}개 필터 ` : ''}적용하기` 
              : `Apply${activeCount > 0 ? ` ${activeCount} Filter${activeCount > 1 ? 's' : ''}` : ''}`
            }
          </button>
        </div>
      )}
    </div>
  );
};


/**
 * FilterButton Component
 * 
 * Button to toggle filter panel visibility (for mobile).
 * Shows active filter count badge.
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onClick - Click handler
 * @param {number} props.activeCount - Number of active filters
 * @param {string} props.lang - Language code
 * 
 * @returns {JSX.Element} Filter toggle button
 */
export const FilterButton = ({ onClick, activeCount = 0, lang = 'en' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
        ${activeCount > 0
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }
      `}
    >
      <Filter className="w-5 h-5" />
      <span>{lang === 'ko' ? '필터' : 'Filters'}</span>
      {activeCount > 0 && (
        <span className={`
          px-2 py-0.5 text-xs font-bold rounded-full
          ${activeCount > 0 ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-600'}
        `}>
          {activeCount}
        </span>
      )}
    </button>
  );
};


/**
 * ActiveFilterTags Component
 * 
 * Displays currently active filters as removable tags.
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.filters - Current filter state
 * @param {Function} props.onRemove - Callback to remove a filter
 * @param {Function} props.onClearAll - Callback to clear all filters
 * @param {Array} props.languages - Language data from database
 * @param {string} props.lang - Language code
 * 
 * @returns {JSX.Element|null} Active filter tags or null if no filters
 */
export const ActiveFilterTags = ({ 
  filters, 
  onRemove, 
  onClearAll, 
  languages = [],
  lang = 'en' 
}) => {
  // Collect all active filters as tags
  const tags = [];

  // Job types
  filters.jobTypes?.forEach(id => {
    const type = JOB_TYPES.find(t => t.id === id);
    if (type) {
      tags.push({
        id: `jobType-${id}`,
        label: lang === 'ko' ? type.label_ko : type.label_en,
        onRemove: () => onRemove('jobTypes', id)
      });
    }
  });

  // Location types
  filters.locationTypes?.forEach(id => {
    const type = LOCATION_TYPES.find(t => t.id === id);
    if (type) {
      tags.push({
        id: `locationType-${id}`,
        label: lang === 'ko' ? type.label_ko : type.label_en,
        onRemove: () => onRemove('locationTypes', id)
      });
    }
  });

  // Experience levels
  filters.experienceLevels?.forEach(id => {
    const level = EXPERIENCE_LEVELS.find(l => l.id === id);
    if (level) {
      tags.push({
        id: `experience-${id}`,
        label: lang === 'ko' ? level.label_ko : level.label_en,
        onRemove: () => onRemove('experienceLevels', id)
      });
    }
  });

  // Languages
  filters.languages?.forEach(id => {
    const language = languages.find(l => l.id === id);
    if (language) {
      tags.push({
        id: `language-${id}`,
        label: `${language.flag_emoji || ''} ${lang === 'ko' ? language.name_ko : language.name_en}`,
        onRemove: () => onRemove('languages', id)
      });
    }
  });

  // Salary range
  if (filters.salaryMin || filters.salaryMax) {
    const min = filters.salaryMin ? `₩${new Intl.NumberFormat('ko-KR').format(filters.salaryMin)}` : '';
    const max = filters.salaryMax ? `₩${new Intl.NumberFormat('ko-KR').format(filters.salaryMax)}` : '';
    const label = min && max ? `${min} - ${max}` : min ? `${min}+` : `~${max}`;
    
    tags.push({
      id: 'salary',
      label: `${lang === 'ko' ? '급여: ' : 'Salary: '}${label}`,
      onRemove: () => {
        onRemove('salaryMin', null);
        onRemove('salaryMax', null);
      }
    });
  }

  if (tags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {tags.map(tag => (
        <motion.span
          key={tag.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
        >
          {tag.label}
          <button
            onClick={tag.onRemove}
            className="p-0.5 hover:bg-blue-100 rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.span>
      ))}
      
      {tags.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-gray-500 hover:text-gray-700 font-medium"
        >
          {lang === 'ko' ? '모두 지우기' : 'Clear all'}
        </button>
      )}
    </div>
  );
};


export default JobFilters;
