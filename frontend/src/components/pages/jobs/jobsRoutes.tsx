// @ts-nocheck
"use client";

/**
 * @file jobsRoutes.jsx
 * @description Route configuration for the Jobs section of Keasy.
 * 
 * This file exports route definitions that can be imported into
 * your main router configuration (App.jsx or similar).
 * 
 * Usage:
 * 1. Import the routes: import { jobsRoutes } from './features/jobs/jobsRoutes';
 * 2. Spread into your routes: <Routes>{...jobsRoutes}</Routes>
 * 
 * Or use the JobsRoutes component directly:
 * import JobsRoutes from './features/jobs/jobsRoutes';
 * <Route path="/jobs/*" element={<JobsRoutes />} />
 * 
 * @requires react
 * @requires react-router-dom (legacy; not used in Next.js)
 * 
 * @author Keasy
 * @version 1.0.0
 */

import React from 'react';

// ============================================================================
// PAGE IMPORTS
// ============================================================================

// Main Pages
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import JobPost from './pages/JobPost';
import JobEdit from './pages/JobEdit';
import SavedJobs from './pages/SavedJobs';
import AppliedJobs from './pages/AppliedJobs';

// Company Pages
import CompanyRegister from './pages/CompanyRegister';
import CompanyProfile from './pages/CompanyProfile';

// Admin Pages
import JobApproval from './pages/admin/JobApproval';
import CompanyApproval from './pages/admin/CompanyApproval';


// ============================================================================
// ROUTE DEFINITIONS
// ============================================================================

/**
 * Array of route objects for the Jobs section.
 * Can be used with React Router's useRoutes hook or mapped to Route components.
 */
export const jobsRouteConfig = [
  // ========================================
  // PUBLIC JOB ROUTES
  // ========================================
  {
    path: '/jobs',
    element: <Jobs />,
    title: 'Jobs',
    description: 'Browse all job listings'
  },
  {
    path: '/jobs/job/:id',
    element: <JobDetail />,
    title: 'Job Details',
    description: 'View job details'
  },

  // ========================================
  // AUTHENTICATED USER ROUTES
  // ========================================
  {
    path: '/jobs/new',
    element: <JobPost />,
    title: 'Post a Job',
    description: 'Create a new job listing',
    requiresAuth: true,
    requiresCompany: true
  },
  {
    path: '/jobs/edit/:id',
    element: <JobEdit />,
    title: 'Edit Job',
    description: 'Edit your job listing',
    requiresAuth: true,
    requiresOwnership: true
  },
  {
    path: '/jobs/saved',
    element: <SavedJobs />,
    title: 'Saved Jobs',
    description: 'View your saved jobs',
    requiresAuth: true
  },
  {
    path: '/jobs/applied',
    element: <AppliedJobs />,
    title: 'My Applications',
    description: 'View your job applications',
    requiresAuth: true
  },

  // ========================================
  // COMPANY ROUTES
  // ========================================
  {
    path: '/company/register',
    element: <CompanyRegister />,
    title: 'Register Company',
    description: 'Register as an employer',
    requiresAuth: true
  },
  {
    path: '/company/profile',
    element: <CompanyProfile />,
    title: 'Company Profile',
    description: 'Manage your company profile',
    requiresAuth: true
  },

  // ========================================
  // ADMIN ROUTES
  // ========================================
  {
    path: '/admin/jobs',
    element: <JobApproval />,
    title: 'Job Approval',
    description: 'Admin: Review and approve jobs',
    requiresAuth: true,
    requiresAdmin: true
  },
  {
    path: '/admin/companies',
    element: <CompanyApproval />,
    title: 'Company Verification',
    description: 'Admin: Verify company registrations',
    requiresAuth: true,
    requiresAdmin: true
  }
];


// ============================================================================
// ROUTE COMPONENTS
// ============================================================================

/**
 * JobsRoutes Component
 * 
 * A self-contained Routes component that can be used as a nested route.
 * 
 * @example
 * // In your App.jsx
 * import JobsRoutes from './features/jobs/jobsRoutes';
 * 
 * function App() {
 *   return (
 *     <BrowserRouter>
 *       <Routes>
 *         <Route path="/*" element={<JobsRoutes />} />
 *       </Routes>
 *     </BrowserRouter>
 *   );
 * }
 */
const JobsRoutes = () => {
  // Legacy React Router entrypoint retained for reference.
  // Next.js uses file-based routing instead.
  return null;
};

export default JobsRoutes;


// ============================================================================
// HELPER EXPORTS
// ============================================================================

/**
 * Get all public routes (no auth required)
 */
export const getPublicRoutes = () => {
  return jobsRouteConfig.filter(route => !route.requiresAuth);
};

/**
 * Get all authenticated routes
 */
export const getAuthRoutes = () => {
  return jobsRouteConfig.filter(route => route.requiresAuth && !route.requiresAdmin);
};

/**
 * Get all admin routes
 */
export const getAdminRoutes = () => {
  return jobsRouteConfig.filter(route => route.requiresAdmin);
};

/**
 * Navigation items for menus
 */
export const jobsNavItems = {
  main: [
    { path: '/jobs', label: { en: 'Browse Jobs', ko: '채용공고' }, icon: 'Briefcase' }
  ],
  user: [
    { path: '/jobs/saved', label: { en: 'Saved Jobs', ko: '저장한 채용공고' }, icon: 'Bookmark' },
    { path: '/jobs/applied', label: { en: 'My Applications', ko: '지원 내역' }, icon: 'Send' }
  ],
  employer: [
    { path: '/jobs/new', label: { en: 'Post a Job', ko: '채용공고 등록' }, icon: 'Plus' },
    { path: '/company/profile', label: { en: 'Company Profile', ko: '회사 프로필' }, icon: 'Building2' }
  ],
  admin: [
    { path: '/admin/jobs', label: { en: 'Job Approval', ko: '채용공고 관리' }, icon: 'Shield' },
    { path: '/admin/companies', label: { en: 'Company Verification', ko: '회사 인증' }, icon: 'Building2' }
  ]
};
