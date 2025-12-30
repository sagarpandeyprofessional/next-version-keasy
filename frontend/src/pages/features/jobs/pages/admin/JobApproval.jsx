/**
 * @file JobApproval.jsx
 * @description Admin page for reviewing and approving/rejecting job postings.
 * 
 * Features:
 * - List of all jobs with filtering by status
 * - Quick approve/reject buttons
 * - View full job details in modal
 * - Search functionality
 * - Bulk approve/reject actions
 * - Stats overview (pending, approved, rejected)
 * - Admin-only access
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
import { supabase } from "../../../../../api/supabase-client";
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  ChevronDown,
  Loader2,
  AlertCircle,
  Briefcase,
  MapPin,
  Building2,
  Calendar,
  ExternalLink,
  X,
  CheckSquare,
  Square,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { IoEyeOutline } from 'react-icons/io5';

import {
  formatCount,
  formatDate,
  getRelativeTime,
  getJobTypeLabel,
  getLocationTypeLabel,
  formatSalaryRange
} from '../../components/jobsUtils';

/* ============================================================================
   CONSTANTS
   ============================================================================ */

const STATUS_OPTIONS = [
  { id: 'all', label_en: 'All Jobs', label_ko: '전체', color: 'gray' },
  { id: 'pending', label_en: 'Pending', label_ko: '대기 중', color: 'amber' },
  { id: 'approved', label_en: 'Approved', label_ko: '승인됨', color: 'green' },
  { id: 'rejected', label_en: 'Rejected', label_ko: '거부됨', color: 'red' }
];

const LABELS = {
  pageTitle: { en: 'Job Approval', ko: '채용공고 관리' },
  pageSubtitle: { en: 'Review and approve job postings', ko: '채용공고 검토 및 승인' },
  pending: { en: 'Pending', ko: '대기 중' },
  approved: { en: 'Approved', ko: '승인됨' },
  rejected: { en: 'Rejected', ko: '거부됨' },
  approve: { en: 'Approve', ko: '승인' },
  reject: { en: 'Reject', ko: '거부' },
  viewDetails: { en: 'View Details', ko: '상세 보기' },
  searchPlaceholder: { en: 'Search jobs or companies...', ko: '채용공고 또는 회사 검색...' },
  noJobs: { en: 'No jobs found', ko: '채용공고가 없습니다' },
  selectAll: { en: 'Select All', ko: '전체 선택' },
  selected: { en: 'selected', ko: '개 선택됨' },
  bulkApprove: { en: 'Approve Selected', ko: '선택 항목 승인' },
  bulkReject: { en: 'Reject Selected', ko: '선택 항목 거부' },
  clearSelection: { en: 'Clear', ko: '취소' },
  postedBy: { en: 'Posted by', ko: '게시자' },
  company: { en: 'Company', ko: '회사' },
  refresh: { en: 'Refresh', ko: '새로고침' },
  adminOnly: { en: 'Admin access required', ko: '관리자 권한이 필요합니다' },
  goBack: { en: 'Go Back', ko: '돌아가기' },
  confirmApprove: { en: 'Are you sure you want to approve this job?', ko: '이 채용공고를 승인하시겠습니까?' },
  confirmReject: { en: 'Are you sure you want to reject this job?', ko: '이 채용공고를 거부하시겠습니까?' },
  jobApproved: { en: 'Job approved successfully', ko: '채용공고가 승인되었습니다' },
  jobRejected: { en: 'Job rejected successfully', ko: '채용공고가 거부되었습니다' }
};

// Admin user IDs (in production, this would come from a database or auth claims)
const ADMIN_EMAILS = ['admin@keasy.com', 'admin@example.com'];


/* ============================================================================
   HELPER COMPONENTS
   ============================================================================ */

/**
 * Stats Card
 */
const StatsCard = ({ icon: Icon, label, value, color, isActive, onClick }) => {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  const activeClasses = {
    gray: 'ring-2 ring-gray-400',
    amber: 'ring-2 ring-amber-400',
    green: 'ring-2 ring-green-400',
    red: 'ring-2 ring-red-400'
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex-1 p-4 rounded-xl border transition-all text-left
        ${colorClasses[color]}
        ${isActive ? activeClasses[color] : 'hover:shadow-md'}
      `}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm opacity-80">{label}</p>
        </div>
      </div>
    </button>
  );
};

/**
 * Status Badge
 */
const StatusBadge = ({ status, lang }) => {
  const config = {
    pending: {
      icon: Clock,
      label: lang === 'ko' ? '대기 중' : 'Pending',
      className: 'bg-amber-100 text-amber-700'
    },
    approved: {
      icon: CheckCircle,
      label: lang === 'ko' ? '승인됨' : 'Approved',
      className: 'bg-green-100 text-green-700'
    },
    rejected: {
      icon: XCircle,
      label: lang === 'ko' ? '거부됨' : 'Rejected',
      className: 'bg-red-100 text-red-700'
    }
  };

  const { icon: Icon, label, className } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
};

/**
 * Job Row Component
 */
const JobRow = ({
  job,
  company,
  isSelected,
  onSelect,
  onApprove,
  onReject,
  onView,
  lang,
  isProcessing
}) => {
  const status = job.approved === true ? 'approved' : job.approved === false ? 'rejected' : 'pending';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={() => onSelect(job.id)}
          className="mt-1 flex-shrink-0"
        >
          {isSelected ? (
            <CheckSquare className="w-5 h-5 text-blue-600" />
          ) : (
            <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>

        {/* Job Image */}
        {job.img_url ? (
          <img
            src={job.img_url}
            alt={job.title}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6 text-gray-400" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {company?.name_en || 'Unknown Company'}
              </p>
            </div>
            <StatusBadge status={status} lang={lang} />
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.location || 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {getJobTypeLabel(job.job_type, lang)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {getRelativeTime(job.created_at)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => onView(job)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              {lang === 'ko' ? '상세' : 'View'}
            </button>

            {status === 'pending' && (
              <>
                <button
                  onClick={() => onApprove(job.id)}
                  disabled={isProcessing}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {lang === 'ko' ? '승인' : 'Approve'}
                </button>
                <button
                  onClick={() => onReject(job.id)}
                  disabled={isProcessing}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {lang === 'ko' ? '거부' : 'Reject'}
                </button>
              </>
            )}

            <Link
              to={`/jobs/job/${job.id}`}
              target="_blank"
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors ml-auto"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Job Detail Modal
 */
const JobDetailModal = ({ job, company, onClose, onApprove, onReject, lang, isProcessing }) => {
  if (!job) return null;

  const status = job.approved === true ? 'approved' : job.approved === false ? 'rejected' : 'pending';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {lang === 'ko' ? '채용공고 상세' : 'Job Details'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Cover Image */}
          {job.img_url && (
            <img
              src={job.img_url}
              alt={job.title}
              className="w-full h-48 object-cover rounded-xl mb-6"
            />
          )}

          {/* Title & Company */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
              <p className="text-gray-600">{company?.name_en}</p>
            </div>
            <StatusBadge status={status} lang={lang} />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">{lang === 'ko' ? '위치' : 'Location'}</p>
              <p className="font-medium text-gray-900">{job.location}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">{lang === 'ko' ? '고용 형태' : 'Job Type'}</p>
              <p className="font-medium text-gray-900">{getJobTypeLabel(job.job_type, lang)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">{lang === 'ko' ? '근무 형태' : 'Work Type'}</p>
              <p className="font-medium text-gray-900">{getLocationTypeLabel(job.location_type, lang)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">{lang === 'ko' ? '급여' : 'Salary'}</p>
              <p className="font-medium text-gray-900">
                {job.salary_type === 'negotiable' 
                  ? (lang === 'ko' ? '협의' : 'Negotiable')
                  : formatSalaryRange(job.salary_min, job.salary_max, job.salary_type) || 'N/A'
                }
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">
              {lang === 'ko' ? '상세 내용' : 'Description'}
            </h4>
            <div className="prose prose-sm max-w-none text-gray-600">
              {job.description?.split('\n').map((p, i) => (
                <p key={i}>{p || <br />}</p>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">
              {lang === 'ko' ? '연락처' : 'Contact Info'}
            </h4>
            <div className="space-y-1 text-sm text-gray-600">
              {job.contact_email && <p>Email: {job.contact_email}</p>}
              {job.contact_phone && <p>Phone: {job.contact_phone}</p>}
              {job.contact_whatsapp && <p>WhatsApp: {job.contact_whatsapp}</p>}
              {job.contact_instagram && <p>Instagram: {job.contact_instagram}</p>}
              {job.contact_facebook && <p>Facebook: {job.contact_facebook}</p>}
              {job.contact_website && <p>Website: {job.contact_website}</p>}
            </div>
          </div>

          {/* Meta Info */}
          <div className="text-sm text-gray-500 space-y-1">
            <p>{lang === 'ko' ? '게시일' : 'Posted'}: {formatDate(job.created_at)}</p>
            {job.deadline && <p>{lang === 'ko' ? '마감일' : 'Deadline'}: {formatDate(job.deadline)}</p>}
          </div>
        </div>

        {/* Footer Actions */}
        {status === 'pending' && (
          <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => onReject(job.id)}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              {lang === 'ko' ? '거부' : 'Reject'}
            </button>
            <button
              onClick={() => onApprove(job.id)}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {lang === 'ko' ? '승인' : 'Approve'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};


/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */

const JobApproval = () => {
  const navigate = useNavigate();

  // ============================================================================
  // STATE
  // ============================================================================

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [lang, setLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedIds, setSelectedIds] = useState([]);
  const [processingIds, setProcessingIds] = useState([]);
  const [viewingJob, setViewingJob] = useState(null);


  // ============================================================================
  // LABELS HELPER
  // ============================================================================

  const t = useCallback((key) => {
    return LABELS[key]?.[lang] || LABELS[key]?.en || key;
  }, [lang]);


  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchJobs = useCallback(async () => {
    try {
      // Fetch all jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('job')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      setJobs(jobsData || []);

      // Fetch companies
      if (jobsData && jobsData.length > 0) {
        const companyIds = [...new Set(jobsData.map(j => j.company_id))];
        
        const { data: companiesData } = await supabase
          .from('companies')
          .select('*')
          .in('id', companyIds);

        const companiesMap = {};
        companiesData?.forEach(c => {
          companiesMap[c.id] = c;
        });
        setCompanies(companiesMap);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          navigate('/signin');
          return;
        }

        setUser(currentUser);

        // Check if user is admin (in production, use proper role checking)
        const isAdminUser = ADMIN_EMAILS.includes(currentUser.email);
        setIsAdmin(isAdminUser);

        if (isAdminUser) {
          await fetchJobs();
        }

        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, fetchJobs]);


  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const stats = useMemo(() => {
    const pending = jobs.filter(j => j.approved === null || j.approved === undefined).length;
    const approved = jobs.filter(j => j.approved === true).length;
    const rejected = jobs.filter(j => j.approved === false).length;
    return { total: jobs.length, pending, approved, rejected };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Filter by status
    if (statusFilter === 'pending') {
      result = result.filter(j => j.approved === null || j.approved === undefined);
    } else if (statusFilter === 'approved') {
      result = result.filter(j => j.approved === true);
    } else if (statusFilter === 'rejected') {
      result = result.filter(j => j.approved === false);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(j => {
        const company = companies[j.company_id];
        return (
          j.title?.toLowerCase().includes(query) ||
          j.location?.toLowerCase().includes(query) ||
          company?.name_en?.toLowerCase().includes(query) ||
          company?.name_ko?.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [jobs, companies, statusFilter, searchQuery]);


  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleApprove = useCallback(async (jobId) => {
    setProcessingIds(prev => [...prev, jobId]);

    try {
      const { error } = await supabase
        .from('job')
        .update({ approved: true })
        .eq('id', jobId);

      if (error) throw error;

      setJobs(prev => prev.map(j => 
        j.id === jobId ? { ...j, approved: true } : j
      ));

      setSelectedIds(prev => prev.filter(id => id !== jobId));
      
      if (viewingJob?.id === jobId) {
        setViewingJob(null);
      }
    } catch (err) {
      console.error('Error approving job:', err);
      alert(lang === 'ko' ? '오류가 발생했습니다' : 'An error occurred');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== jobId));
    }
  }, [viewingJob, lang]);

  const handleReject = useCallback(async (jobId) => {
    setProcessingIds(prev => [...prev, jobId]);

    try {
      const { error } = await supabase
        .from('job')
        .update({ approved: false })
        .eq('id', jobId);

      if (error) throw error;

      setJobs(prev => prev.map(j => 
        j.id === jobId ? { ...j, approved: false } : j
      ));

      setSelectedIds(prev => prev.filter(id => id !== jobId));
      
      if (viewingJob?.id === jobId) {
        setViewingJob(null);
      }
    } catch (err) {
      console.error('Error rejecting job:', err);
      alert(lang === 'ko' ? '오류가 발생했습니다' : 'An error occurred');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== jobId));
    }
  }, [viewingJob, lang]);

  const handleBulkApprove = useCallback(async () => {
    for (const id of selectedIds) {
      await handleApprove(id);
    }
  }, [selectedIds, handleApprove]);

  const handleBulkReject = useCallback(async () => {
    for (const id of selectedIds) {
      await handleReject(id);
    }
  }, [selectedIds, handleReject]);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredJobs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredJobs.map(j => j.id));
    }
  }, [filteredJobs, selectedIds]);

  const handleSelect = useCallback((jobId) => {
    setSelectedIds(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  }, []);


  // ============================================================================
  // RENDER: Loading
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }


  // ============================================================================
  // RENDER: Not Admin
  // ============================================================================

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('adminOnly')}</h1>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('goBack')}
          </Link>
        </div>
      </div>
    );
  }


  // ============================================================================
  // RENDER: Main
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/jobs"
                className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  {t('pageTitle')}
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">{t('pageSubtitle')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchJobs}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title={t('refresh')}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setLang(prev => prev === 'en' ? 'ko' : 'en')}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Globe className="w-4 h-4" />
                {lang === 'ko' ? 'EN' : '한국어'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatsCard
            icon={Briefcase}
            label={lang === 'ko' ? '전체' : 'Total'}
            value={stats.total}
            color="gray"
            isActive={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          />
          <StatsCard
            icon={Clock}
            label={t('pending')}
            value={stats.pending}
            color="amber"
            isActive={statusFilter === 'pending'}
            onClick={() => setStatusFilter('pending')}
          />
          <StatsCard
            icon={CheckCircle}
            label={t('approved')}
            value={stats.approved}
            color="green"
            isActive={statusFilter === 'approved'}
            onClick={() => setStatusFilter('approved')}
          />
          <StatsCard
            icon={XCircle}
            label={t('rejected')}
            value={stats.rejected}
            color="red"
            isActive={statusFilter === 'rejected'}
            onClick={() => setStatusFilter('rejected')}
          />
        </div>

        {/* Search & Bulk Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-blue-700">
                {selectedIds.length} {t('selected')}
              </span>
              <button
                onClick={handleBulkApprove}
                className="px-3 py-1 text-sm font-medium text-green-600 hover:bg-green-100 rounded"
              >
                {t('bulkApprove')}
              </button>
              <button
                onClick={handleBulkReject}
                className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100 rounded"
              >
                {t('bulkReject')}
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded"
              >
                {t('clearSelection')}
              </button>
            </div>
          )}
        </div>

        {/* Select All */}
        {filteredJobs.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              {selectedIds.length === filteredJobs.length ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {t('selectAll')} ({filteredJobs.length})
            </button>
          </div>
        )}

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('noJobs')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map(job => (
              <JobRow
                key={job.id}
                job={job}
                company={companies[job.company_id]}
                isSelected={selectedIds.includes(job.id)}
                onSelect={handleSelect}
                onApprove={handleApprove}
                onReject={handleReject}
                onView={setViewingJob}
                lang={lang}
                isProcessing={processingIds.includes(job.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Job Detail Modal */}
      <AnimatePresence>
        {viewingJob && (
          <JobDetailModal
            job={viewingJob}
            company={companies[viewingJob.company_id]}
            onClose={() => setViewingJob(null)}
            onApprove={handleApprove}
            onReject={handleReject}
            lang={lang}
            isProcessing={processingIds.includes(viewingJob.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobApproval;
