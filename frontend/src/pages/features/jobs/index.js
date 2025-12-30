/**
 * @file index.js
 * @description Main export file for the Keasy Jobs section.
 * 
 * This file provides a centralized import point for all Jobs-related
 * components, utilities, and routes.
 * 
 * Usage:
 * import { Jobs, JobDetail, jobsRouteConfig } from './features/jobs';
 * 
 * @author Keasy
 * @version 1.0.0
 */

// ============================================================================
// ROUTE EXPORTS
// ============================================================================

export { 
  default as JobsRoutes,
  jobsRouteConfig,
  getPublicRoutes,
  getAuthRoutes,
  getAdminRoutes,
  jobsNavItems
} from './jobsRoutes';


// ============================================================================
// PAGE EXPORTS
// ============================================================================

// Main Pages
export { default as Jobs } from './pages/Jobs';
export { default as JobDetail } from './pages/JobDetail';
export { default as JobPost } from './pages/JobPost';
export { default as JobEdit } from './pages/JobEdit';
export { default as SavedJobs } from './pages/SavedJobs';
export { default as AppliedJobs } from './pages/AppliedJobs';

// Company Pages
export { default as CompanyRegister } from './pages/CompanyRegister';
export { default as CompanyProfile } from './pages/CompanyProfile';

// Admin Pages
export { default as JobApproval } from './pages/admin/JobApproval';
export { default as CompanyApproval } from './pages/admin/CompanyApproval';


// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { default as JobCard } from './components/JobCard';
export { default as CategoryFilter } from './components/CategoryFilter';
export { default as LoadingState } from './components/LoadingState';
export { default as EmptyState } from './components/EmptyState';
export { default as JobDetailPanel } from './components/JobDetailPanel';
export { default as ContactModal } from './components/ContactModal';
export { default as JobFilters } from './components/JobFilters';


// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export {
  // Constants
  JOB_CATEGORIES,
  JOB_TYPES,
  LOCATION_TYPES,
  EXPERIENCE_LEVELS,
  SALARY_TYPES,
  LANGUAGES,
  CONTACT_METHODS,
  
  // Functions
  formatSalaryRange,
  formatCount,
  formatDate,
  getRelativeTime,
  getDeadlineStatus,
  getJobTypeLabel,
  getLocationTypeLabel,
  getCategoryLabel,
  truncateText
} from './components/jobsUtils';
