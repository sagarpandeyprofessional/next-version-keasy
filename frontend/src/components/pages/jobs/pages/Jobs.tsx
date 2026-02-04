// @ts-nocheck
"use client";

/**
 * @file Jobs.jsx
 * @description Main Jobs page with Master-Detail layout for browsing and viewing job listings.
 * 
 * This component provides a responsive two-pane layout on desktop/tablet where users
 * can browse a scrollable list of job cards on the left and view detailed content
 * on the right. On mobile, it switches to a full-screen detail view pattern.
 * 
 * Key Features:
 * - Two-pane split layout (35% list / 65% detail) on desktop
 * - Category filter pills for filtering jobs
 * - Advanced filters (job type, location, experience, language, salary)
 * - Search functionality for filtering by title/description
 * - Save/bookmark jobs functionality
 * - Apply tracking with contact modal
 * - Responsive with mobile-first approach
 * - Bilingual support (EN/KO)
 * 
 * @requires react
 * @requires react-router-dom
 * @requires framer-motion
 * @requires supabase-client
 * 
 * @author Keasy
 * @version 1.0.0
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from "@/lib/supabase/client";
import { AnimatePresence, motion } from 'framer-motion';
import {
  IoSearchOutline,
  IoCloseCircle,
  IoArrowBack
} from 'react-icons/io5';
import {
  Briefcase,
  Plus,
  Filter,
  X,
  Globe
} from 'lucide-react';

// Import sub-components
import JobCard from '../components/JobCard';
import JobDetailPanel from '../components/JobDetailPanel';
import CategoryFilter from '../components/CategoryFilter';
import JobFilters, { FilterButton, ActiveFilterTags } from '../components/JobFilters';
import ContactModal from '../components/ContactModal';
import LoadingState, { LoadingSpinner } from '../components/LoadingState';
import EmptyState, { ErrorState } from '../components/EmptyState';

// Import utilities
import {
  mobileDetailVariants,
  getDeadlineStatus
} from '../components/jobsUtils';


/* ============================================================================
   MAIN COMPONENT: Jobs
   ============================================================================ */

/**
 * Jobs Component - Main page for browsing job listings
 * 
 * @component
 * @returns {JSX.Element} The complete Jobs interface
 */
const Jobs = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /* --------------------------------------------------------------------------
     Data States - Stores fetched data from Supabase
     -------------------------------------------------------------------------- */
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [companies, setCompanies] = useState({});
  
  /* --------------------------------------------------------------------------
     User States - Authentication and user-specific data
     -------------------------------------------------------------------------- */
  const [user, setUser] = useState(null);
  const [userCompany, setUserCompany] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState({});
  
  /* --------------------------------------------------------------------------
     UI States - Controls loading, filtering, and selection
     -------------------------------------------------------------------------- */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    jobTypes: [],
    locationTypes: [],
    experienceLevels: [],
    languages: [],
    salaryMin: null,
    salaryMax: null
  });
  const [showContactModal, setShowContactModal] = useState(false);
  const [applyingJob, setApplyingJob] = useState(null);
  const [lang, setLang] = useState('en');


  // ============================================================================
  // DATA FETCHING EFFECTS
  // ============================================================================

  /**
   * Effect: Fetch current authenticated user
   */
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);


  /**
   * Effect: Fetch user's company
   */
  useEffect(() => {
    if (!user) {
      setUserCompany(null);
      return;
    }

    const fetchUserCompany = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('created_by', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user company:', error);
        }
        
        setUserCompany(data || null);
      } catch (err) {
        console.error('Error fetching user company:', err);
      }
    };

    fetchUserCompany();
  }, [user]);


  /**
   * Effect: Fetch job categories
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('job_category')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }

        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);


  /**
   * Effect: Fetch available languages
   */
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const { data, error } = await supabase
          .from('job_language')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) {
          console.error('Error fetching languages:', error);
          return;
        }

        setLanguages(data || []);
      } catch (err) {
        console.error('Error fetching languages:', err);
      }
    };

    fetchLanguages();
  }, []);


  /**
   * Effect: Fetch jobs and their companies
   */
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);

      try {
        const now = new Date().toISOString();
        
        let query = supabase
          .from('job')
          .select('*')
          .eq('approved', true)
          .or(`hidden_at.is.null,hidden_at.gt.${now}`)
          .order('created_at', { ascending: false });

        if (activeCategory !== 'All') {
          query = query.eq('category', activeCategory);
        }

        const { data: jobsData, error: jobsError } = await query;

        if (jobsError) {
          console.error('Error fetching jobs:', jobsError);
          setError(jobsError.message);
          setLoading(false);
          return;
        }

        setJobs(jobsData || []);

        if (jobsData && jobsData.length > 0) {
          const companyIds = [...new Set(jobsData.map(job => job.company_id))];
          
          const { data: companiesData, error: companiesError } = await supabase
            .from('companies')
            .select('*')
            .in('id', companyIds);

          if (companiesError) {
            console.error('Error fetching companies:', companiesError);
          } else {
            const companiesMap = {};
            companiesData?.forEach(company => {
              companiesMap[company.id] = company;
            });
            setCompanies(companiesMap);
          }
        }

        if (jobsData && jobsData.length > 0 && !selectedJob) {
          setSelectedJob(jobsData[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchJobs();
  }, [activeCategory]);


  /**
   * Effect: Fetch user's saved jobs
   */
  useEffect(() => {
    if (!user) {
      setSavedJobs([]);
      return;
    }

    const fetchSavedJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('job_saved')
          .select('job_id')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching saved jobs:', error);
          return;
        }

        setSavedJobs(data?.map(item => item.job_id) || []);
      } catch (err) {
        console.error('Error fetching saved jobs:', err);
      }
    };

    fetchSavedJobs();
  }, [user]);


  /**
   * Effect: Fetch user's job applications
   */
  useEffect(() => {
    if (!user) {
      setAppliedJobs({});
      return;
    }

    const fetchAppliedJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('job_application')
          .select('job_id, contact_method')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching applications:', error);
          return;
        }

        const applicationsMap = {};
        data?.forEach(app => {
          if (!applicationsMap[app.job_id]) {
            applicationsMap[app.job_id] = [];
          }
          applicationsMap[app.job_id].push(app.contact_method);
        });

        setAppliedJobs(applicationsMap);
      } catch (err) {
        console.error('Error fetching applications:', err);
      }
    };

    fetchAppliedJobs();
  }, [user]);


  // ============================================================================
  // MEMOIZED COMPUTED VALUES
  // ============================================================================

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(job => {
        const company = companies[job.company_id];
        return (
          job.title?.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query) ||
          company?.name_en?.toLowerCase().includes(query) ||
          company?.name_ko?.toLowerCase().includes(query)
        );
      });
    }

    if (filters.jobTypes.length > 0) {
      result = result.filter(job => filters.jobTypes.includes(job.job_type));
    }

    if (filters.locationTypes.length > 0) {
      result = result.filter(job => filters.locationTypes.includes(job.location_type));
    }

    if (filters.experienceLevels.length > 0) {
      result = result.filter(job => filters.experienceLevels.includes(job.experience_level));
    }

    if (filters.languages.length > 0) {
      result = result.filter(job => {
        const jobLanguages = job.required_languages || [];
        return filters.languages.some(langId => 
          jobLanguages.some(reqLang => reqLang.language === langId)
        );
      });
    }

    if (filters.salaryMin) {
      result = result.filter(job => {
        if (job.salary_type === 'negotiable') return true;
        if (!job.salary_max && !job.salary_min) return true;
        return (job.salary_max || job.salary_min || 0) >= filters.salaryMin;
      });
    }

    if (filters.salaryMax) {
      result = result.filter(job => {
        if (job.salary_type === 'negotiable') return true;
        if (!job.salary_max && !job.salary_min) return true;
        return (job.salary_min || job.salary_max || 0) <= filters.salaryMax;
      });
    }

    return result;
  }, [jobs, companies, searchQuery, filters]);


  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.jobTypes.length) count += filters.jobTypes.length;
    if (filters.locationTypes.length) count += filters.locationTypes.length;
    if (filters.experienceLevels.length) count += filters.experienceLevels.length;
    if (filters.languages.length) count += filters.languages.length;
    if (filters.salaryMin || filters.salaryMax) count += 1;
    return count;
  }, [filters]);


  const getCategoryById = useCallback((categoryId) => {
    return categories.find(cat => cat.id === categoryId);
  }, [categories]);


  const isVerifiedEmployer = useMemo(() => {
    return userCompany?.verified === true;
  }, [userCompany]);


  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSelectJob = useCallback(async (job) => {
    setSelectedJob(job);

    if (window.innerWidth < 1024) {
      setShowMobileDetail(true);
    }

    try {
      const newViews = (job.view || 0) + 1;
      
      await supabase
        .from('job')
        .update({ view: newViews })
        .eq('id', job.id);

      setJobs(prev => prev.map(j => 
        j.id === job.id ? { ...j, view: newViews } : j
      ));
      
      setSelectedJob(prev => prev?.id === job.id ? { ...prev, view: newViews } : prev);
    } catch (err) {
      console.error('Error updating view count:', err);
    }
  }, []);


  const handleCloseMobileDetail = useCallback(() => {
    setShowMobileDetail(false);
  }, []);


  const handleSaveJob = useCallback(async (jobId) => {
    if (!user) {
      alert(lang === 'ko' ? '로그인이 필요합니다' : 'Please sign in to save jobs');
      return;
    }

    const isSaved = savedJobs.includes(jobId);

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('job_saved')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', jobId);

        if (error) throw error;

        setSavedJobs(prev => prev.filter(id => id !== jobId));
      } else {
        const { error } = await supabase
          .from('job_saved')
          .insert({ user_id: user.id, job_id: jobId });

        if (error) throw error;

        setSavedJobs(prev => [...prev, jobId]);
      }
    } catch (err) {
      console.error('Error saving job:', err);
      alert(lang === 'ko' ? '저장 중 오류가 발생했습니다' : 'Error saving job');
    }
  }, [user, savedJobs, lang]);


  const handleOpenApplyModal = useCallback((job) => {
    if (!user) {
      alert(lang === 'ko' ? '로그인이 필요합니다' : 'Please sign in to apply');
      return;
    }

    const deadlineStatus = getDeadlineStatus(job?.deadline);
    if (deadlineStatus.isExpired) {
      alert(lang === 'ko' ? '이 채용공고는 마감되었습니다' : 'This job has expired');
      return;
    }

    setApplyingJob(job);
    setShowContactModal(true);
  }, [user, lang]);


  const handleApply = useCallback(async (method, value) => {
    if (!user || !applyingJob) return;

    try {
      const existingMethods = appliedJobs[applyingJob.id] || [];
      if (existingMethods.includes(method)) {
        return;
      }

      const { error } = await supabase
        .from('job_application')
        .insert({
          user_id: user.id,
          job_id: applyingJob.id,
          contact_method: method
        });

      if (error) throw error;

      setAppliedJobs(prev => ({
        ...prev,
        [applyingJob.id]: [...(prev[applyingJob.id] || []), method]
      }));
    } catch (err) {
      console.error('Error recording application:', err);
    }
  }, [user, applyingJob, appliedJobs]);


  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);


  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);


  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);


  const handleRemoveFilter = useCallback((filterType, value) => {
    if (filterType === 'salaryMin' || filterType === 'salaryMax') {
      setFilters(prev => ({
        ...prev,
        salaryMin: null,
        salaryMax: null
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [filterType]: prev[filterType].filter(v => v !== value)
      }));
    }
  }, []);


  const handleClearFilters = useCallback(() => {
    setFilters({
      jobTypes: [],
      locationTypes: [],
      experienceLevels: [],
      languages: [],
      salaryMin: null,
      salaryMax: null
    });
  }, []);


  const handleCategoryChange = useCallback((categoryId) => {
    setActiveCategory(categoryId);
    setSelectedJob(null);
  }, []);


  const handleLanguageToggle = useCallback(() => {
    setLang(prev => prev === 'en' ? 'ko' : 'en');
  }, []);


  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    setActiveCategory(prev => prev);
  }, []);


  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getCompanyForJob = useCallback((companyId) => {
    return companies[companyId] || null;
  }, [companies]);

  const isJobSaved = useCallback((jobId) => {
    return savedJobs.includes(jobId);
  }, [savedJobs]);

  const getAppliedMethods = useCallback((jobId) => {
    return appliedJobs[jobId] || [];
  }, [appliedJobs]);

  const isJobOwner = useCallback((job) => {
    return user && job?.created_by === user.id;
  }, [user]);


  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ====================================================================
          HEADER SECTION
          ==================================================================== */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title Row */}
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {lang === 'ko' ? '채용공고' : 'Jobs'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {lang === 'ko' 
                  ? '새로운 기회를 찾아보세요'
                  : 'Discover your next opportunity'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Toggle */}
              <button
                onClick={handleLanguageToggle}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title={lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{lang === 'ko' ? 'EN' : '한국어'}</span>
              </button>

              {/* Post Job Button */}
              {isVerifiedEmployer ? (
                <Link
                  href="/jobs/new"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">
                    {lang === 'ko' ? '채용공고 등록' : 'Post a Job'}
                  </span>
                  <span className="sm:hidden">
                    {lang === 'ko' ? '등록' : 'Post'}
                  </span>
                </Link>
              ) : user ? (
                <Link
                  href="/company/register"
                  className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">
                    {lang === 'ko' ? '기업 등록' : 'Register Company'}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  {lang === 'ko' ? '로그인' : 'Sign In'}
                </Link>
              )}
            </div>
          </div>

          {/* Search and Filter Row */}
          <div className="pb-4 space-y-3">
            {/* Search and Filter Controls */}
            <div className="flex gap-2 sm:gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={lang === 'ko' ? '직무, 회사, 키워드 검색...' : 'Search jobs, companies, keywords...'}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-500"
                  aria-label={lang === 'ko' ? '채용공고 검색' : 'Search jobs'}
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={lang === 'ko' ? '검색어 지우기' : 'Clear search'}
                  >
                    <IoCloseCircle className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Filter Button (Mobile) */}
              <div className="lg:hidden">
                <FilterButton
                  onClick={() => setShowFilters(true)}
                  activeCount={activeFilterCount}
                  lang={lang}
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={handleCategoryChange}
              lang={lang}
            />

            {/* Active Filter Tags */}
            {activeFilterCount > 0 && (
              <ActiveFilterTags
                filters={filters}
                onRemove={handleRemoveFilter}
                onClearAll={handleClearFilters}
                languages={languages}
                lang={lang}
              />
            )}
          </div>
        </div>
      </header>

      {/* ====================================================================
          MAIN CONTENT AREA
          ==================================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error State */}
        {error ? (
          <ErrorState 
            error={error} 
            onRetry={handleRetry}
            lang={lang}
          />
        ) : loading ? (
          /* Loading State */
          <LoadingState cardCount={5} />
        ) : filteredJobs.length === 0 ? (
          /* Empty State */
          <EmptyState
            type={searchQuery ? 'search' : activeCategory !== 'All' ? 'category' : 'all'}
            searchQuery={searchQuery}
            categoryName={getCategoryById(activeCategory)?.name_en}
            isEmployer={isVerifiedEmployer}
            lang={lang}
          />
        ) : (
          /* Main Two-Pane Layout */
          <div className="lg:flex lg:gap-6 lg:h-[calc(100vh-280px)]">
            
            {/* ----------------------------------------------------------------
                LEFT PANE: Job List
                ---------------------------------------------------------------- */}
            <div className="lg:w-[35%] lg:min-w-[320px] lg:max-w-[420px] lg:overflow-y-auto lg:pr-2 custom-scrollbar">
              {/* Results Count */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600">
                  {lang === 'ko' 
                    ? `${filteredJobs.length}개의 채용공고`
                    : `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} found`
                  }
                </p>
              </div>

              {/* Job Cards */}
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredJobs.map((job, index) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      company={getCompanyForJob(job.company_id)}
                      isSelected={selectedJob?.id === job.id}
                      isSaved={isJobSaved(job.id)}
                      isOwner={isJobOwner(job)}
                      onSelect={() => handleSelectJob(job)}
                      onSave={() => handleSaveJob(job.id)}
                      index={index}
                      categoryName={getCategoryById(job.category)?.name_en}
                      user={user}
                      lang={lang}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* ----------------------------------------------------------------
                RIGHT PANE: Job Detail (Desktop Only)
                ---------------------------------------------------------------- */}
            <div className="hidden lg:block lg:flex-1 lg:overflow-y-auto custom-scrollbar">
              <JobDetailPanel
                job={selectedJob}
                company={selectedJob ? getCompanyForJob(selectedJob.company_id) : null}
                category={selectedJob ? getCategoryById(selectedJob.category) : null}
                languages={languages}
                isSaved={selectedJob ? isJobSaved(selectedJob.id) : false}
                hasApplied={selectedJob ? getAppliedMethods(selectedJob.id).length > 0 : false}
                onSave={() => selectedJob && handleSaveJob(selectedJob.id)}
                onApply={() => selectedJob && handleOpenApplyModal(selectedJob)}
                user={user}
                lang={lang}
                isOwner={selectedJob ? isJobOwner(selectedJob) : false}
              />
            </div>
          </div>
        )}
      </main>

      {/* ====================================================================
          MOBILE DETAIL VIEW (Full Screen Overlay)
          ==================================================================== */}
      <AnimatePresence>
        {showMobileDetail && selectedJob && (
          <motion.div
            variants={mobileDetailVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-white lg:hidden overflow-y-auto"
          >
            {/* Mobile Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
              <button
                onClick={handleCloseMobileDetail}
                className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={lang === 'ko' ? '뒤로 가기' : 'Go back'}
              >
                <IoArrowBack className="w-6 h-6" />
              </button>
              <h2 className="font-semibold text-gray-900 truncate flex-1">
                {selectedJob.title}
              </h2>
            </div>

            {/* Mobile Content */}
            <JobDetailPanel
              job={selectedJob}
              company={getCompanyForJob(selectedJob.company_id)}
              category={getCategoryById(selectedJob.category)}
              languages={languages}
              isSaved={isJobSaved(selectedJob.id)}
              hasApplied={getAppliedMethods(selectedJob.id).length > 0}
              onSave={() => handleSaveJob(selectedJob.id)}
              onApply={() => handleOpenApplyModal(selectedJob)}
              user={user}
              lang={lang}
              isOwner={isJobOwner(selectedJob)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          FILTER SIDEBAR (Mobile)
          ==================================================================== */}
      <AnimatePresence>
        {showFilters && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />

            {/* Filter Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-xl lg:hidden overflow-y-auto"
            >
              <JobFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                languages={languages}
                lang={lang}
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ====================================================================
          DESKTOP FILTER SIDEBAR (Fixed on Large Screens)
          - Uncomment below if you want a persistent filter sidebar on desktop
          ==================================================================== */}
      {/* 
      <aside className="hidden lg:block fixed left-0 top-[180px] bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto p-4">
        <JobFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          languages={languages}
          lang={lang}
        />
      </aside>
      */}

      {/* ====================================================================
          CONTACT MODAL
          ==================================================================== */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false);
          setApplyingJob(null);
        }}
        job={applyingJob}
        company={applyingJob ? getCompanyForJob(applyingJob.company_id) : null}
        onApply={handleApply}
        appliedMethods={applyingJob ? getAppliedMethods(applyingJob.id) : []}
        lang={lang}
      />

      {/* ====================================================================
          CUSTOM SCROLLBAR STYLES
          ==================================================================== */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
      `}</style>
    </div>
  );
};

export default Jobs;
