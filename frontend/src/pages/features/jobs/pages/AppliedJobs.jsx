/**
 * @file AppliedJobs.jsx
 * @description Page displaying user's job application history.
 * 
 * Features:
 * - List of all jobs user has applied to
 * - Shows which contact methods were used for each job
 * - Date of each application
 * - Job status (active/expired)
 * - Click to view job details
 * - Sorting options (newest, oldest)
 * - Filter by status (all, active, expired)
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
  Send,
  Briefcase,
  MapPin,
  Calendar,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Clock,
  Filter,
  ChevronDown,
  Search,
  Mail,
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  Globe as GlobeIcon
} from 'lucide-react';
import { IoEyeOutline } from 'react-icons/io5';
import { MdWhatsapp } from 'react-icons/md';

import {
  formatCount,
  formatDate,
  getRelativeTime,
  getDeadlineStatus,
  getJobTypeLabel,
  formatSalaryRange,
  CONTACT_METHODS
} from '../components/jobsUtils';


/* ============================================================================
   CONSTANTS
   ============================================================================ */

const SORT_OPTIONS = [
  { id: 'applied_newest', label_en: 'Recently Applied', label_ko: '최근 지원순' },
  { id: 'applied_oldest', label_en: 'Oldest First', label_ko: '오래된 순' }
];

const FILTER_OPTIONS = [
  { id: 'all', label_en: 'All Applications', label_ko: '전체' },
  { id: 'active', label_en: 'Active Jobs', label_ko: '진행 중' },
  { id: 'expired', label_en: 'Expired Jobs', label_ko: '마감됨' }
];

const LABELS = {
  pageTitle: { en: 'My Applications', ko: '지원 내역' },
  pageSubtitle: { en: 'Track your job applications', ko: '지원한 채용공고를 확인하세요' },
  noApplications: { en: 'No applications yet', ko: '지원 내역이 없습니다' },
  noApplicationsDesc: { en: 'When you apply to a job, it will appear here so you can track your applications.', ko: '채용공고에 지원하면 여기에서 지원 내역을 확인할 수 있습니다.' },
  browseJobs: { en: 'Browse Jobs', ko: '채용공고 보기' },
  viewJob: { en: 'View Job', ko: '채용공고 보기' },
  appliedOn: { en: 'Applied on', ko: '지원일' },
  appliedVia: { en: 'Applied via', ko: '지원 방법' },
  expired: { en: 'Expired', ko: '마감됨' },
  active: { en: 'Active', ko: '진행 중' },
  sortBy: { en: 'Sort', ko: '정렬' },
  filterBy: { en: 'Filter', ko: '필터' },
  applications: { en: 'applications', ko: '건' },
  loginRequired: { en: 'Please sign in to view your applications', ko: '지원 내역을 보려면 로그인하세요' },
  signIn: { en: 'Sign In', ko: '로그인' },
  contactMethods: { en: 'Contact methods used', ko: '사용한 연락 방법' }
};

/**
 * Contact method icons mapping
 */
const CONTACT_ICONS = {
  email: Mail,
  phone: Phone,
  whatsapp: MdWhatsapp,
  instagram: Instagram,
  facebook: Facebook,
  website: GlobeIcon
};

/**
 * Contact method colors
 */
const CONTACT_COLORS = {
  email: 'bg-blue-100 text-blue-600',
  phone: 'bg-green-100 text-green-600',
  whatsapp: 'bg-emerald-100 text-emerald-600',
  instagram: 'bg-pink-100 text-pink-600',
  facebook: 'bg-indigo-100 text-indigo-600',
  website: 'bg-gray-100 text-gray-600'
};


/* ============================================================================
   HELPER COMPONENTS
   ============================================================================ */

/**
 * Application Card Component
 */
const ApplicationCard = ({ 
  application,
  job, 
  company,
  allApplicationsForJob,
  lang 
}) => {
  const deadlineStatus = getDeadlineStatus(job?.deadline);
  
  if (!job) return null;

  // Get unique contact methods used for this job
  const contactMethodsUsed = [...new Set(allApplicationsForJob.map(a => a.contact_method))];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-white rounded-xl border border-gray-200 overflow-hidden
        hover:border-gray-300 hover:shadow-md transition-all
        ${deadlineStatus.isExpired ? 'opacity-80' : ''}
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
              className="w-24 h-full sm:w-32 object-cover"
            />
          ) : (
            <div className="w-24 sm:w-32 h-full min-h-[120px] bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Send className="w-8 h-8 text-white/80" />
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 p-4 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
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

            {/* Status Badge */}
            <span className={`
              px-2.5 py-1 text-xs font-medium rounded-full flex-shrink-0 flex items-center gap-1
              ${deadlineStatus.isExpired 
                ? 'bg-gray-100 text-gray-600' 
                : 'bg-green-100 text-green-700'
              }
            `}>
              {deadlineStatus.isExpired ? (
                <>
                  <Clock className="w-3 h-3" />
                  {lang === 'ko' ? '마감됨' : 'Expired'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  {lang === 'ko' ? '진행 중' : 'Active'}
                </>
              )}
            </span>
          </div>

          {/* Job Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mb-3">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[100px]">{job.location}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {getJobTypeLabel(job.job_type, lang)}
            </span>
          </div>

          {/* Applied Info */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Applied Date */}
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {lang === 'ko' ? '지원일: ' : 'Applied: '}
              {formatDate(application.created_at)}
            </span>

            {/* Divider */}
            <span className="text-gray-300">|</span>

            {/* Contact Methods Used */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">
                {lang === 'ko' ? '연락 방법:' : 'Via:'}
              </span>
              <div className="flex items-center gap-1">
                {contactMethodsUsed.map(method => {
                  const Icon = CONTACT_ICONS[method] || Mail;
                  const colorClass = CONTACT_COLORS[method] || CONTACT_COLORS.email;
                  const methodLabel = CONTACT_METHODS[method]?.label || method;
                  
                  return (
                    <span
                      key={method}
                      className={`p-1.5 rounded-full ${colorClass}`}
                      title={methodLabel}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* View Button - Mobile */}
          <div className="mt-3 sm:hidden">
            <Link
              to={`/jobs/job/${job.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {lang === 'ko' ? '보기' : 'View'}
            </Link>
          </div>
        </div>

        {/* View Button - Desktop */}
        <div className="hidden sm:flex items-center px-4">
          <Link
            to={`/jobs/job/${job.id}`}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {lang === 'ko' ? '보기' : 'View'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};


/**
 * Dropdown Component
 */
const Dropdown = ({ 
  options, 
  value, 
  onChange, 
  icon: Icon, 
  label,
  lang 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.id === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        <span className="hidden sm:inline">
          {lang === 'ko' ? selectedOption?.label_ko : selectedOption?.label_en}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden"
            >
              {options.map(option => (
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
 * Stats Card Component
 */
const StatsCard = ({ icon: Icon, value, label, color }) => (
  <div className={`flex items-center gap-3 p-4 rounded-xl ${color}`}>
    <div className="p-2 bg-white/50 rounded-lg">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  </div>
);


/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */

const AppliedJobs = () => {
  const navigate = useNavigate();

  // ============================================================================
  // STATE
  // ============================================================================

  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState({});
  const [companies, setCompanies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [lang, setLang] = useState('en');
  const [sortBy, setSortBy] = useState('applied_newest');
  const [filterBy, setFilterBy] = useState('all');


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

        // Fetch applications
        const { data: appsData, error: appsError } = await supabase
          .from('job_application')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (appsError) throw appsError;

        setApplications(appsData || []);

        // Fetch job details
        if (appsData && appsData.length > 0) {
          const jobIds = [...new Set(appsData.map(a => a.job_id))];
          
          const { data: jobsData, error: jobsError } = await supabase
            .from('job')
            .select('*')
            .in('id', jobIds);

          if (jobsError) throw jobsError;

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
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Group applications by job and get unique jobs
   */
  const applicationsByJob = useMemo(() => {
    const grouped = {};
    applications.forEach(app => {
      if (!grouped[app.job_id]) {
        grouped[app.job_id] = [];
      }
      grouped[app.job_id].push(app);
    });
    return grouped;
  }, [applications]);

  /**
   * Get unique job IDs (for display purposes, we show one card per job)
   */
  const uniqueJobApplications = useMemo(() => {
    const seen = new Set();
    return applications.filter(app => {
      if (seen.has(app.job_id)) return false;
      seen.add(app.job_id);
      return true;
    });
  }, [applications]);

  /**
   * Filtered and sorted applications
   */
  const filteredApplications = useMemo(() => {
    let result = [...uniqueJobApplications];

    // Apply filter
    if (filterBy === 'active') {
      result = result.filter(app => {
        const job = jobs[app.job_id];
        if (!job) return false;
        const deadlineStatus = getDeadlineStatus(job.deadline);
        return !deadlineStatus.isExpired;
      });
    } else if (filterBy === 'expired') {
      result = result.filter(app => {
        const job = jobs[app.job_id];
        if (!job) return false;
        const deadlineStatus = getDeadlineStatus(job.deadline);
        return deadlineStatus.isExpired;
      });
    }

    // Apply sort
    if (sortBy === 'applied_newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'applied_oldest') {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    return result;
  }, [uniqueJobApplications, jobs, filterBy, sortBy]);

  /**
   * Stats
   */
  const stats = useMemo(() => {
    const totalJobs = uniqueJobApplications.length;
    const activeJobs = uniqueJobApplications.filter(app => {
      const job = jobs[app.job_id];
      if (!job) return false;
      return !getDeadlineStatus(job.deadline).isExpired;
    }).length;
    const expiredJobs = totalJobs - activeJobs;
    const totalMethods = applications.length;

    return { totalJobs, activeJobs, expiredJobs, totalMethods };
  }, [uniqueJobApplications, applications, jobs]);


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
              <Send className="w-10 h-10 text-gray-400" />
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
                  <Send className="w-5 h-5 text-green-600" />
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
        {uniqueJobApplications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('noApplications')}</h2>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">{t('noApplicationsDesc')}</p>
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
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatsCard
                icon={Send}
                value={stats.totalJobs}
                label={lang === 'ko' ? '총 지원' : 'Total Applied'}
                color="bg-blue-100 text-blue-700"
              />
              <StatsCard
                icon={CheckCircle2}
                value={stats.activeJobs}
                label={lang === 'ko' ? '진행 중' : 'Active'}
                color="bg-green-100 text-green-700"
              />
              <StatsCard
                icon={Clock}
                value={stats.expiredJobs}
                label={lang === 'ko' ? '마감됨' : 'Expired'}
                color="bg-gray-100 text-gray-700"
              />
              <StatsCard
                icon={MessageCircle}
                value={stats.totalMethods}
                label={lang === 'ko' ? '연락 횟수' : 'Contacts'}
                color="bg-purple-100 text-purple-700"
              />
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {filteredApplications.length} {t('applications')}
              </p>
              <div className="flex items-center gap-2">
                <Dropdown
                  options={FILTER_OPTIONS}
                  value={filterBy}
                  onChange={setFilterBy}
                  icon={Filter}
                  label={t('filterBy')}
                  lang={lang}
                />
                <Dropdown
                  options={SORT_OPTIONS}
                  value={sortBy}
                  onChange={setSortBy}
                  icon={Clock}
                  label={t('sortBy')}
                  lang={lang}
                />
              </div>
            </div>

            {/* Applications List */}
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">
                  {lang === 'ko' 
                    ? '해당하는 지원 내역이 없습니다' 
                    : 'No applications match this filter'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredApplications.map(application => (
                    <ApplicationCard
                      key={`${application.job_id}-${application.id}`}
                      application={application}
                      job={jobs[application.job_id]}
                      company={companies[jobs[application.job_id]?.company_id]}
                      allApplicationsForJob={applicationsByJob[application.job_id] || []}
                      lang={lang}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AppliedJobs;
