/**
 * @file SavedJobs.jsx
 * @description Page displaying user's saved/bookmarked jobs.
 * 
 * Features:
 * - List of all saved jobs
 * - Remove from saved option
 * - Empty state when no saved jobs
 * - Click to view job details
 * - Quick apply button
 * - Sorting options (newest saved, deadline)
 * - Shows job status (active/expired)
 * - Bilingual support (EN/KO)
 * 
 * @requires react
 * @requires react-router-dom
 * @requires supabase-client
 * @requires lucide-react
 * 
 * @author Keasy
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from "../../../../api/supabase-client";
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  ArrowLeft,
  Bookmark,
  BookmarkX,
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  ExternalLink,
  Loader2,
  AlertCircle,
  Search,
  SortAsc,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { IoEyeOutline } from 'react-icons/io5';
import { BsBookmarkFill } from 'react-icons/bs';

import {
  formatCount,
  formatDate,
  getRelativeTime,
  getDeadlineStatus,
  getJobTypeLabel,
  formatSalaryRange
} from '../components/jobsUtils';


/* ============================================================================
   CONSTANTS
   ============================================================================ */

const SORT_OPTIONS = [
  { id: 'saved_newest', label_en: 'Recently Saved', label_ko: '최근 저장순' },
  { id: 'saved_oldest', label_en: 'Oldest Saved', label_ko: '오래된 저장순' },
  { id: 'deadline_soon', label_en: 'Deadline Soon', label_ko: '마감 임박순' },
  { id: 'posted_newest', label_en: 'Recently Posted', label_ko: '최근 게시순' }
];

const LABELS = {
  pageTitle: { en: 'Saved Jobs', ko: '저장한 채용공고' },
  pageSubtitle: { en: 'Jobs you\'ve bookmarked for later', ko: '나중에 보려고 저장한 채용공고' },
  noSavedJobs: { en: 'No saved jobs yet', ko: '저장한 채용공고가 없습니다' },
  noSavedJobsDesc: { en: 'When you find a job you\'re interested in, tap the bookmark icon to save it here.', ko: '관심 있는 채용공고를 발견하면 북마크 아이콘을 눌러 여기에 저장하세요.' },
  browseJobs: { en: 'Browse Jobs', ko: '채용공고 보기' },
  remove: { en: 'Remove', ko: '삭제' },
  removed: { en: 'Removed from saved', ko: '저장 목록에서 삭제됨' },
  viewJob: { en: 'View Job', ko: '채용공고 보기' },
  apply: { en: 'Apply', ko: '지원하기' },
  expired: { en: 'Expired', ko: '마감됨' },
  expiresIn: { en: 'Expires', ko: '마감' },
  savedOn: { en: 'Saved on', ko: '저장일' },
  sortBy: { en: 'Sort by', ko: '정렬' },
  jobs: { en: 'jobs', ko: '개' },
  loginRequired: { en: 'Please sign in to view saved jobs', ko: '저장한 채용공고를 보려면 로그인하세요' },
  signIn: { en: 'Sign In', ko: '로그인' },
  undo: { en: 'Undo', ko: '되돌리기' }
};


/* ============================================================================
   HELPER COMPONENTS
   ============================================================================ */

/**
 * Saved Job Card Component
 */
const SavedJobCard = ({ 
  savedJob, 
  job, 
  company, 
  onRemove, 
  lang,
  isRemoving 
}) => {
  const deadlineStatus = getDeadlineStatus(job?.deadline);
  
  if (!job) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`
        bg-white rounded-xl border border-gray-200 overflow-hidden
        hover:border-gray-300 hover:shadow-md transition-all
        ${deadlineStatus.isExpired ? 'opacity-75' : ''}
      `}
    >
      <div className="flex">
        {/* Job Image */}
        <Link 
          to={`/jobs/job/${job.id}`}
          className="flex-shrink-0"
        >
          {job.img_url ? (
            <img
              src={job.img_url}
              alt={job.title}
              className="w-24 h-24 sm:w-32 sm:h-32 object-cover"
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-white/80" />
            </div>
          )}
        </Link>

        {/* Job Content */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {/* Company */}
              <p className="text-sm text-gray-500 truncate">
                {company?.name_en || 'Company'}
              </p>
              
              {/* Title */}
              <Link to={`/jobs/job/${job.id}`}>
                <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
                  {job.title}
                </h3>
              </Link>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemove(savedJob.id, job.id)}
              disabled={isRemoving}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              title={lang === 'ko' ? '삭제' : 'Remove'}
            >
              {isRemoving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <BookmarkX className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-gray-500">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">{job.location}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {getJobTypeLabel(job.job_type, lang)}
            </span>
            {job.salary_type !== 'negotiable' && (job.salary_min || job.salary_max) && (
              <span className="text-green-600 font-medium">
                {formatSalaryRange(job.salary_min, job.salary_max, job.salary_type)}
              </span>
            )}
          </div>

          {/* Bottom Row */}
          <div className="flex items-center justify-between mt-3">
            {/* Deadline / Status */}
            <div className="flex items-center gap-2">
              {deadlineStatus.isExpired ? (
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  {lang === 'ko' ? '마감됨' : 'Expired'}
                </span>
              ) : job.deadline ? (
                <span className={`
                  px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1
                  ${deadlineStatus.urgent 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'bg-blue-50 text-blue-700'
                  }
                `}>
                  <Calendar className="w-3 h-3" />
                  {formatDate(job.deadline)}
                </span>
              ) : null}
              
              {/* Saved Date */}
              <span className="text-xs text-gray-400">
                {lang === 'ko' ? '저장: ' : 'Saved: '}{getRelativeTime(savedJob.created_at)}
              </span>
            </div>

            {/* View Button */}
            <Link
              to={`/jobs/job/${job.id}`}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'ko' ? '보기' : 'View'}</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


/**
 * Sort Dropdown Component
 */
const SortDropdown = ({ value, onChange, lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = SORT_OPTIONS.find(opt => opt.id === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <SortAsc className="w-4 h-4 text-gray-500" />
        <span className="hidden sm:inline">
          {lang === 'ko' ? selectedOption?.label_ko : selectedOption?.label_en}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden"
            >
              {SORT_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-2.5 text-left text-sm transition-colors
                    ${value === option.id 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {lang === 'ko' ? option.label_ko : option.label_en}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};


/**
 * Undo Toast Component
 */
const UndoToast = ({ message, onUndo, onClose, lang }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-xl shadow-lg"
    >
      <span className="text-sm">{message}</span>
      <button
        onClick={onUndo}
        className="px-3 py-1 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
      >
        {lang === 'ko' ? '되돌리기' : 'Undo'}
      </button>
      <button
        onClick={onClose}
        className="p-1 text-gray-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};


/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */

const SavedJobs = () => {
  const navigate = useNavigate();

  // ============================================================================
  // STATE
  // ============================================================================

  const [user, setUser] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [jobs, setJobs] = useState({});
  const [companies, setCompanies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [lang, setLang] = useState('en');
  const [sortBy, setSortBy] = useState('saved_newest');
  const [removingId, setRemovingId] = useState(null);
  
  // Undo state
  const [lastRemoved, setLastRemoved] = useState(null);
  const [showUndoToast, setShowUndoToast] = useState(false);


  // ============================================================================
  // LABELS HELPER
  // ============================================================================

  const t = useCallback((key) => {
    return LABELS[key]?.[lang] || LABELS[key]?.en || key;
  }, [lang]);


  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          setUser(null);
          setLoading(false);
          return;
        }
        setUser(currentUser);

        // Fetch saved jobs
        const { data: savedData, error: savedError } = await supabase
          .from('job_saved')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (savedError) throw savedError;

        setSavedJobs(savedData || []);

        // Fetch job details for saved jobs
        if (savedData && savedData.length > 0) {
          const jobIds = savedData.map(s => s.job_id);
          
          const { data: jobsData, error: jobsError } = await supabase
            .from('job')
            .select('*')
            .in('id', jobIds);

          if (jobsError) throw jobsError;

          // Create jobs map
          const jobsMap = {};
          jobsData?.forEach(job => {
            jobsMap[job.id] = job;
          });
          setJobs(jobsMap);

          // Fetch companies
          const companyIds = [...new Set(jobsData?.map(j => j.company_id) || [])];
          
          if (companyIds.length > 0) {
            const { data: companiesData } = await supabase
              .from('companies')
              .select('*')
              .in('id', companyIds);

            const companiesMap = {};
            companiesData?.forEach(company => {
              companiesMap[company.id] = company;
            });
            setCompanies(companiesMap);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  // ============================================================================
  // SORTED JOBS
  // ============================================================================

  const sortedSavedJobs = useMemo(() => {
    const sorted = [...savedJobs];
    
    switch (sortBy) {
      case 'saved_newest':
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'saved_oldest':
        sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'deadline_soon':
        sorted.sort((a, b) => {
          const jobA = jobs[a.job_id];
          const jobB = jobs[b.job_id];
          if (!jobA?.deadline && !jobB?.deadline) return 0;
          if (!jobA?.deadline) return 1;
          if (!jobB?.deadline) return -1;
          return new Date(jobA.deadline) - new Date(jobB.deadline);
        });
        break;
      case 'posted_newest':
        sorted.sort((a, b) => {
          const jobA = jobs[a.job_id];
          const jobB = jobs[b.job_id];
          if (!jobA || !jobB) return 0;
          return new Date(jobB.created_at) - new Date(jobA.created_at);
        });
        break;
      default:
        break;
    }
    
    return sorted;
  }, [savedJobs, jobs, sortBy]);


  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle removing a saved job
   */
  const handleRemove = useCallback(async (savedId, jobId) => {
    setRemovingId(savedId);

    try {
      const { error } = await supabase
        .from('job_saved')
        .delete()
        .eq('id', savedId);

      if (error) throw error;

      // Store for undo
      const removedItem = savedJobs.find(s => s.id === savedId);
      setLastRemoved({ savedJob: removedItem, job: jobs[jobId] });
      setShowUndoToast(true);

      // Update state
      setSavedJobs(prev => prev.filter(s => s.id !== savedId));
    } catch (err) {
      console.error('Error removing saved job:', err);
      alert(lang === 'ko' ? '오류가 발생했습니다' : 'An error occurred');
    } finally {
      setRemovingId(null);
    }
  }, [savedJobs, jobs, lang]);

  /**
   * Handle undo remove
   */
  const handleUndo = useCallback(async () => {
    if (!lastRemoved) return;

    try {
      const { data, error } = await supabase
        .from('job_saved')
        .insert({
          user_id: user.id,
          job_id: lastRemoved.savedJob.job_id
        })
        .select()
        .single();

      if (error) throw error;

      // Restore to state
      setSavedJobs(prev => [data, ...prev]);
      setShowUndoToast(false);
      setLastRemoved(null);
    } catch (err) {
      console.error('Error undoing remove:', err);
    }
  }, [lastRemoved, user]);


  // ============================================================================
  // RENDER: Loading State
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }


  // ============================================================================
  // RENDER: Not Logged In
  // ============================================================================

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link
              to="/jobs"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">{lang === 'ko' ? '채용공고' : 'Jobs'}</span>
            </Link>
            <button
              onClick={() => setLang(prev => prev === 'en' ? 'ko' : 'en')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Globe className="w-4 h-4" />
              {lang === 'ko' ? 'English' : '한국어'}
            </button>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bookmark className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('pageTitle')}</h1>
            <p className="text-gray-600 mb-6">{t('loginRequired')}</p>
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {t('signIn')}
            </Link>
          </div>
        </main>
      </div>
    );
  }


  // ============================================================================
  // RENDER: Main Content
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/jobs"
                className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BsBookmarkFill className="w-5 h-5 text-blue-600" />
                  {t('pageTitle')}
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">{t('pageSubtitle')}</p>
              </div>
            </div>

            <button
              onClick={() => setLang(prev => prev === 'en' ? 'ko' : 'en')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4" />
              {lang === 'ko' ? 'English' : '한국어'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Empty State */}
        {savedJobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bookmark className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('noSavedJobs')}</h2>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">{t('noSavedJobsDesc')}</p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Search className="w-5 h-5" />
              {t('browseJobs')}
            </Link>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {savedJobs.length} {t('jobs')}
              </p>
              <SortDropdown
                value={sortBy}
                onChange={setSortBy}
                lang={lang}
              />
            </div>

            {/* Saved Jobs List */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {sortedSavedJobs.map(savedJob => (
                  <SavedJobCard
                    key={savedJob.id}
                    savedJob={savedJob}
                    job={jobs[savedJob.job_id]}
                    company={companies[jobs[savedJob.job_id]?.company_id]}
                    onRemove={handleRemove}
                    lang={lang}
                    isRemoving={removingId === savedJob.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </main>

      {/* Undo Toast */}
      <AnimatePresence>
        {showUndoToast && lastRemoved && (
          <UndoToast
            message={t('removed')}
            onUndo={handleUndo}
            onClose={() => {
              setShowUndoToast(false);
              setLastRemoved(null);
            }}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavedJobs;
