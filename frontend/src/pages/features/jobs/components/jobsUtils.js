/**
 * @file Jobs.jsx - Section 1: Utilities & Constants
 * @description Utility functions, constants, and animation variants for the Jobs page.
 * 
 * This section contains:
 * - File header and imports
 * - Utility functions (formatting, truncation, etc.)
 * - Animation variants for Framer Motion
 * - Constants for job types, experience levels, etc.
 * 
 * @requires react
 * @requires react-router-dom
 * @requires framer-motion
 * @requires react-icons
 * @requires lucide-react
 * @requires supabase-client
 * 
 * @author Keasy
 * @version 1.0.0
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from "../../../../api/supabase-client";
import { Link } from 'react-router-dom';
import { 
  IoSearchOutline, 
  IoCloseCircle, 
  IoArrowBack,
  IoLocationOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoEyeOutline
} from "react-icons/io5";
import { 
  IoIosHeart, 
  IoIosHeartEmpty,
  IoMdBriefcase
} from "react-icons/io";
import { 
  MdOutlineWorkOutline,
  MdOutlineEmail,
  MdOutlinePhone,
  MdWhatsapp
} from "react-icons/md";
import { 
  FaInstagram, 
  FaFacebook,
  FaGlobe,
  FaBuilding,
  FaMapMarkerAlt
} from "react-icons/fa";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign,
  Building2,
  Languages,
  Filter,
  ChevronRight,
  ChevronDown,
  X,
  ExternalLink,
  AlertCircle,
  CheckCircle2
} from "lucide-react";


/* ============================================================================
   CONSTANTS
   These define the static options used throughout the Jobs section
   ============================================================================ */

/**
 * Job type options with English and Korean labels.
 * Used in filters and job display.
 */
export const JOB_TYPES = [
  { id: 'full-time', label_en: 'Full-time', label_ko: '정규직' },
  { id: 'part-time', label_en: 'Part-time', label_ko: '파트타임' },
  { id: 'contract', label_en: 'Contract', label_ko: '계약직' },
  { id: 'internship', label_en: 'Internship', label_ko: '인턴' },
  { id: 'freelance', label_en: 'Freelance', label_ko: '프리랜서' }
];

/**
 * Location type options with English and Korean labels.
 * Indicates whether job is remote, on-site, or hybrid.
 */
export const LOCATION_TYPES = [
  { id: 'remote', label_en: 'Remote', label_ko: '재택근무' },
  { id: 'on-site', label_en: 'On-site', label_ko: '출근' },
  { id: 'hybrid', label_en: 'Hybrid', label_ko: '하이브리드' }
];

/**
 * Experience level options with English and Korean labels.
 */
export const EXPERIENCE_LEVELS = [
  { id: 'entry', label_en: 'Entry Level', label_ko: '신입' },
  { id: '1-3years', label_en: '1-3 Years', label_ko: '1-3년' },
  { id: '3-5years', label_en: '3-5 Years', label_ko: '3-5년' },
  { id: '5+years', label_en: '5+ Years', label_ko: '5년 이상' },
  { id: 'any', label_en: 'Any Level', label_ko: '경력 무관' }
];

/**
 * Language proficiency levels with English and Korean labels.
 * Used when displaying language requirements.
 */
export const LANGUAGE_LEVELS = [
  { id: 'basic', label_en: 'Basic', label_ko: '기초' },
  { id: 'conversational', label_en: 'Conversational', label_ko: '일상회화' },
  { id: 'business', label_en: 'Business', label_ko: '비즈니스' },
  { id: 'fluent', label_en: 'Fluent', label_ko: '유창함' },
  { id: 'native', label_en: 'Native', label_ko: '원어민' }
];

/**
 * Salary type options with English and Korean labels.
 */
export const SALARY_TYPES = [
  { id: 'hourly', label_en: 'Hourly', label_ko: '시급' },
  { id: 'monthly', label_en: 'Monthly', label_ko: '월급' },
  { id: 'yearly', label_en: 'Yearly', label_ko: '연봉' },
  { id: 'negotiable', label_en: 'Negotiable', label_ko: '협의' }
];

/**
 * Contact method configurations.
 * Each method has an icon, label, and URL pattern for opening.
 */
export const CONTACT_METHODS = {
  email: {
    id: 'email',
    label_en: 'Email',
    label_ko: '이메일',
    icon: MdOutlineEmail,
    getUrl: (value) => `mailto:${value}`,
    color: 'text-red-500'
  },
  phone: {
    id: 'phone',
    label_en: 'Phone',
    label_ko: '전화',
    icon: MdOutlinePhone,
    getUrl: (value) => `tel:${value}`,
    color: 'text-green-500'
  },
  whatsapp: {
    id: 'whatsapp',
    label_en: 'WhatsApp',
    label_ko: '왓츠앱',
    icon: MdWhatsapp,
    getUrl: (value) => `https://wa.me/${value.replace(/[^0-9]/g, '')}`,
    color: 'text-green-600'
  },
  instagram: {
    id: 'instagram',
    label_en: 'Instagram',
    label_ko: '인스타그램',
    icon: FaInstagram,
    getUrl: (value) => value.startsWith('http') ? value : `https://instagram.com/${value.replace('@', '')}`,
    color: 'text-pink-500'
  },
  facebook: {
    id: 'facebook',
    label_en: 'Facebook',
    label_ko: '페이스북',
    icon: FaFacebook,
    getUrl: (value) => value.startsWith('http') ? value : `https://facebook.com/${value}`,
    color: 'text-blue-600'
  },
  website: {
    id: 'website',
    label_en: 'Website',
    label_ko: '웹사이트',
    icon: FaGlobe,
    getUrl: (value) => value.startsWith('http') ? value : `https://${value}`,
    color: 'text-gray-600'
  }
};


/* ============================================================================
   UTILITY FUNCTIONS
   ============================================================================ */

/**
 * Generates a placeholder image URL using Picsum Photos service.
 * Used as a fallback when a job doesn't have a cover image.
 * 
 * @param {string|number} id - Unique identifier to generate consistent random image
 * @returns {string} URL to a placeholder image
 * 
 * @example
 * const imageUrl = getPlaceholderImage(123);
 * // Returns: "https://picsum.photos/400/300?random=123"
 */
export const getPlaceholderImage = (id) =>
  `https://picsum.photos/400/300?random=${id || Math.floor(Math.random() * 1000)}`;

/**
 * Formats large numbers into human-readable format with K/M suffixes.
 * 
 * @param {number} count - The number to format
 * @returns {string} Formatted string (e.g., "1.2K", "3.5M")
 * 
 * @example
 * formatCount(1500);    // Returns: "1.5K"
 * formatCount(2500000); // Returns: "2.5M"
 * formatCount(500);     // Returns: "500"
 */
export const formatCount = (count) => {
  if (!count && count !== 0) return '0';
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
};

/**
 * Formats salary amount in Korean Won with appropriate suffix.
 * 
 * @param {number} amount - The salary amount
 * @param {string} type - The salary type (hourly, monthly, yearly)
 * @returns {string} Formatted salary string
 * 
 * @example
 * formatSalary(50000, 'hourly');     // Returns: "₩50,000/시간"
 * formatSalary(3000000, 'monthly');  // Returns: "₩3,000,000/월"
 */
export const formatSalary = (amount, type) => {
  if (!amount) return null;
  
  const formatted = new Intl.NumberFormat('ko-KR').format(amount);
  const suffix = {
    hourly: '/시간',
    monthly: '/월',
    yearly: '/년',
    negotiable: ''
  };
  
  return `₩${formatted}${suffix[type] || ''}`;
};

/**
 * Formats a salary range for display.
 * 
 * @param {number} min - Minimum salary
 * @param {number} max - Maximum salary
 * @param {string} type - Salary type
 * @returns {string} Formatted salary range
 * 
 * @example
 * formatSalaryRange(50000, 70000, 'hourly');
 * // Returns: "₩50,000 - ₩70,000/시간"
 */
export const formatSalaryRange = (min, max, type) => {
  if (!min && !max) return null;
  if (type === 'negotiable') return '협의 (Negotiable)';
  
  const suffix = {
    hourly: '/시간',
    monthly: '/월',
    yearly: '/년'
  };
  
  if (min && max) {
    const minFormatted = new Intl.NumberFormat('ko-KR').format(min);
    const maxFormatted = new Intl.NumberFormat('ko-KR').format(max);
    return `₩${minFormatted} - ₩${maxFormatted}${suffix[type] || ''}`;
  }
  
  if (min) {
    const formatted = new Intl.NumberFormat('ko-KR').format(min);
    return `₩${formatted}${suffix[type] || ''} 이상`;
  }
  
  if (max) {
    const formatted = new Intl.NumberFormat('ko-KR').format(max);
    return `₩${formatted}${suffix[type] || ''} 이하`;
  }
  
  return null;
};

/**
 * Truncates text to a specified length with ellipsis.
 * 
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 * 
 * @example
 * truncateText("This is a long description", 10);
 * // Returns: "This is a..."
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  // Find the last space before maxLength to avoid cutting words
  const lastSpace = text.lastIndexOf(' ', maxLength);
  const cutIndex = lastSpace > 0 ? lastSpace : maxLength;
  
  return text.substring(0, cutIndex) + '...';
};

/**
 * Formats a date for display.
 * 
 * @param {string|Date} date - The date to format
 * @param {string} locale - The locale for formatting (default: 'en-GB')
 * @returns {string} Formatted date string
 * 
 * @example
 * formatDate('2024-01-15'); // Returns: "15 Jan 2024"
 */
export const formatDate = (date, locale = 'en-GB') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Calculates the relative time from now (e.g., "2 days ago").
 * 
 * @param {string|Date} date - The date to compare
 * @returns {string} Relative time string
 * 
 * @example
 * getRelativeTime('2024-01-13'); // Returns: "2 days ago"
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  
  return `${Math.floor(diffDays / 365)}y ago`;
};

/**
 * Checks if a job is expired based on its deadline.
 * 
 * @param {string|Date} deadline - The job deadline
 * @returns {boolean} True if job is expired
 */
export const isJobExpired = (deadline) => {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
};

/**
 * Calculates days until deadline or days since expiry.
 * 
 * @param {string|Date} deadline - The job deadline
 * @returns {object} { isExpired, days, label }
 */
export const getDeadlineStatus = (deadline) => {
  if (!deadline) return { isExpired: false, days: null, label: null };
  
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return {
      isExpired: true,
      days: Math.abs(diffDays),
      label: `Expired ${Math.abs(diffDays)} days ago`
    };
  }
  
  if (diffDays === 0) {
    return {
      isExpired: false,
      days: 0,
      label: 'Expires today!'
    };
  }
  
  if (diffDays <= 3) {
    return {
      isExpired: false,
      days: diffDays,
      label: `${diffDays} days left`,
      urgent: true
    };
  }
  
  return {
    isExpired: false,
    days: diffDays,
    label: `${diffDays} days left`
  };
};

/**
 * Gets the label for a job type in the specified language.
 * 
 * @param {string} typeId - The job type ID
 * @param {string} lang - Language code ('en' or 'ko')
 * @returns {string} The localized label
 */
export const getJobTypeLabel = (typeId, lang = 'en') => {
  const type = JOB_TYPES.find(t => t.id === typeId);
  return type ? (lang === 'ko' ? type.label_ko : type.label_en) : typeId;
};

/**
 * Gets the label for a location type in the specified language.
 * 
 * @param {string} typeId - The location type ID
 * @param {string} lang - Language code ('en' or 'ko')
 * @returns {string} The localized label
 */
export const getLocationTypeLabel = (typeId, lang = 'en') => {
  const type = LOCATION_TYPES.find(t => t.id === typeId);
  return type ? (lang === 'ko' ? type.label_ko : type.label_en) : typeId;
};

/**
 * Gets the label for an experience level in the specified language.
 * 
 * @param {string} levelId - The experience level ID
 * @param {string} lang - Language code ('en' or 'ko')
 * @returns {string} The localized label
 */
export const getExperienceLevelLabel = (levelId, lang = 'en') => {
  const level = EXPERIENCE_LEVELS.find(l => l.id === levelId);
  return level ? (lang === 'ko' ? level.label_ko : level.label_en) : levelId;
};

/**
 * Gets the label for a language proficiency level.
 * 
 * @param {string} levelId - The proficiency level ID
 * @param {string} lang - Language code ('en' or 'ko')
 * @returns {string} The localized label
 */
export const getLanguageLevelLabel = (levelId, lang = 'en') => {
  const level = LANGUAGE_LEVELS.find(l => l.id === levelId);
  return level ? (lang === 'ko' ? level.label_ko : level.label_en) : levelId;
};


/* ============================================================================
   ANIMATION VARIANTS
   These define the animation configurations for Framer Motion components
   ============================================================================ */

/**
 * Animation variants for the detail panel content.
 * Creates a smooth fade and slide effect when content changes.
 */
export const detailPanelVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.2 }
  }
};

/**
 * Animation variants for list items.
 * Creates a staggered fade-in effect for the job cards.
 */
export const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 }
  })
};

/**
 * Animation variants for the mobile detail view overlay.
 * Creates a slide-up effect when opening detail view on mobile.
 */
export const mobileDetailVariants = {
  hidden: { opacity: 0, y: "100%" },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: { 
    opacity: 0, 
    y: "100%",
    transition: { duration: 0.2 }
  }
};

/**
 * Animation variants for modal overlays.
 */
export const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

/**
 * Animation variants for modal content.
 */
export const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: 0.2 }
  }
};

/**
 * Animation variants for filter dropdown.
 */
export const filterDropdownVariants = {
  hidden: { opacity: 0, y: -10, height: 0 },
  visible: { 
    opacity: 1, 
    y: 0, 
    height: 'auto',
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    height: 0,
    transition: { duration: 0.15 }
  }
};

/**
 * Animation variants for badge/pill elements.
 */
export const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", damping: 15, stiffness: 300 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: 0.15 }
  }
};


/* ============================================================================
   EXPORT NOTE
   ============================================================================
   These utilities and constants will be imported into the main Jobs.jsx
   component and its sub-components. 
   
   Usage example:
   import { 
     formatSalaryRange, 
     getJobTypeLabel, 
     JOB_TYPES,
     detailPanelVariants 
   } from './jobsUtils';
   ============================================================================ */
