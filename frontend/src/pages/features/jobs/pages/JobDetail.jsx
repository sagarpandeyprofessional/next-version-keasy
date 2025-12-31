/**
 * @file JobDetail.jsx
 * @description Standalone job detail page accessible via direct URL (/jobs/job/:id).
 * 
 * This page displays the full details of a single job posting, including:
 * - Cover image and company info
 * - Job title, description, requirements
 * - Language requirements
 * - Salary and location info
 * - Contact/apply options
 * - File attachments
 * 
 * Features:
 * - Direct URL access (/jobs/job/:id)
 * - SEO-friendly standalone page
 * - Save/bookmark functionality
 * - Apply tracking
 * - Share functionality
 * - Related jobs suggestions
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

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from "../../../../api/supabase-client";
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  Building2,
  Briefcase,
  GraduationCap,
  Languages,
  DollarSign,
  Calendar,
  ExternalLink,
  FileText,
  Download,
  Share2,
  AlertCircle,
  CheckCircle2,
  Edit3,
  MapPinned,
  ArrowLeft,
  Globe,
  ChevronRight
} from 'lucide-react';
import { IoEyeOutline } from 'react-icons/io5';
import { BsBookmark, BsBookmarkFill, BsFilePdf, BsFileWord, BsFileEarmark } from 'react-icons/bs';

// Import components
import ContactModal from '../components/ContactModal';
import { LoadingSpinner } from '../components/LoadingState';
import JobCard from '../components/JobCard';


// Import utilities
import {
  formatCount,
  formatSalaryRange,
  formatDate,
  getRelativeTime,
  getJobTypeLabel,
  getLocationTypeLabel,
  getExperienceLevelLabel,
  getLanguageLevelLabel,
  getDeadlineStatus,
  CONTACT_METHODS
} from '../components/jobsUtils';


/**
 * Gets the appropriate file icon based on file extension
 */
const getFileIcon = (filename) => {
  const ext = filename?.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'pdf':
      return <BsFilePdf className="w-5 h-5 text-red-500" />;
    case 'doc':
    case 'docx':
      return <BsFileWord className="w-5 h-5 text-blue-500" />;
    case 'hwp':
      return <BsFileEarmark className="w-5 h-5 text-blue-600" />;
    default:
      return <FileText className="w-5 h-5 text-gray-500" />;
  }
};


/**
 * Gets filename from URL
 */
const getFileName = (url) => {
  if (!url) return 'File';
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  return decodeURIComponent(filename.split('?')[0]);
};


/**
 * JobDetail Component
 * 
 * Standalone page for viewing a single job's full details.
 * 
 * @component
 * @returns {JSX.Element} The job detail page
 */
const JobDetail = () => {
  // Get job ID from URL params
  const { id } = useParams();
  const navigate = useNavigate();

  // ============================================================================
  // STATE
  // ============================================================================
  
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  const [category, setCategory] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [relatedCompanies, setRelatedCompanies] = useState({});
  
  const [user, setUser] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [appliedMethods, setAppliedMethods] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showContactModal, setShowContactModal] = useState(false);
  const [lang, setLang] = useState('en');


  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  /**
   * Fetch current user
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
   * Fetch languages
   */
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const { data, error } = await supabase
          .from('job_language')
          .select('*')
          .order('sort_order', { ascending: true });

        if (!error) {
          setLanguages(data || []);
        }
      } catch (err) {
        console.error('Error fetching languages:', err);
      }
    };

    fetchLanguages();
  }, []);


  /**
   * Fetch job details
   */
  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch job
        const { data: jobData, error: jobError } = await supabase
          .from('job')
          .select('*')
          .eq('id', id)
          .single();

        if (jobError) {
          if (jobError.code === 'PGRST116') {
            setError('Job not found');
          } else {
            setError(jobError.message);
          }
          setLoading(false);
          return;
        }

        setJob(jobData);

        // Increment view count
        const newViews = (jobData.view || 0) + 1;
        await supabase
          .from('job')
          .update({ view: newViews })
          .eq('id', id);
        
        setJob(prev => ({ ...prev, view: newViews }));

        // Fetch company
        if (jobData.company_id) {
          const { data: companyData } = await supabase
            .from('companies')
            .select('*')
            .eq('id', jobData.company_id)
            .single();

          setCompany(companyData || null);
        }

        // Fetch category
        if (jobData.category) {
          const { data: categoryData } = await supabase
            .from('job_category')
            .select('*')
            .eq('id', jobData.category)
            .single();

          setCategory(categoryData || null);
        }

        // Fetch related jobs (same category, excluding current)
        const { data: relatedData } = await supabase
          .from('job')
          .select('*')
          .eq('category', jobData.category)
          .eq('approved', true)
          .neq('id', id)
          .limit(4);

        if (relatedData && relatedData.length > 0) {
          setRelatedJobs(relatedData);

          // Fetch companies for related jobs
          const companyIds = [...new Set(relatedData.map(j => j.company_id))];
          const { data: companiesData } = await supabase
            .from('companies')
            .select('*')
            .in('id', companyIds);

          if (companiesData) {
            const companiesMap = {};
            companiesData.forEach(c => {
              companiesMap[c.id] = c;
            });
            setRelatedCompanies(companiesMap);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching job:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);


  /**
   * Fetch saved status
   */
  useEffect(() => {
    if (!user || !id) {
      setIsSaved(false);
      return;
    }

    const checkSaved = async () => {
      try {
        const { data, error } = await supabase
          .from('job_saved')
          .select('id')
          .eq('user_id', user.id)
          .eq('job_id', id)
          .single();

        setIsSaved(!!data && !error);
      } catch (err) {
        setIsSaved(false);
      }
    };

    checkSaved();
  }, [user, id]);


  /**
   * Fetch applied methods
   */
  useEffect(() => {
    if (!user || !id) {
      setAppliedMethods([]);
      return;
    }

    const fetchApplied = async () => {
      try {
        const { data, error } = await supabase
          .from('job_application')
          .select('contact_method')
          .eq('user_id', user.id)
          .eq('job_id', id);

        if (!error && data) {
          setAppliedMethods(data.map(a => a.contact_method));
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
      }
    };

    fetchApplied();
  }, [user, id]);


  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle save/unsave
   */
  const handleSave = useCallback(async () => {
    if (!user) {
      alert(lang === 'ko' ? '로그인이 필요합니다' : 'Please sign in to save jobs');
      return;
    }

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('job_saved')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', id);

        if (error) throw error;
        setIsSaved(false);
      } else {
        const { error } = await supabase
          .from('job_saved')
          .insert({ user_id: user.id, job_id: id });

        if (error) throw error;
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error saving job:', err);
      alert(lang === 'ko' ? '오류가 발생했습니다' : 'An error occurred');
    }
  }, [user, isSaved, id, lang]);


  /**
   * Handle apply
   */
  const handleApply = useCallback(async (method, value) => {
    if (!user || !job) return;

    try {
      if (appliedMethods.includes(method)) return;

      const { error } = await supabase
        .from('job_application')
        .insert({
          user_id: user.id,
          job_id: job.id,
          contact_method: method
        });

      if (error) throw error;

      setAppliedMethods(prev => [...prev, method]);
    } catch (err) {
      console.error('Error recording application:', err);
    }
  }, [user, job, appliedMethods]);


  /**
   * Handle share
   */
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `${job?.title} at ${company?.name_en}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(lang === 'ko' ? '링크가 복사되었습니다!' : 'Link copied!');
    }
  }, [job, company, lang]);


  /**
   * Toggle language
   */
  const handleLanguageToggle = useCallback(() => {
    setLang(prev => prev === 'en' ? 'ko' : 'en');
  }, []);


  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const deadlineStatus = useMemo(() => {
    return getDeadlineStatus(job?.deadline);
  }, [job?.deadline]);

  const requiredLanguages = useMemo(() => {
    return job?.required_languages || [];
  }, [job?.required_languages]);

  const files = useMemo(() => {
    return job?.files || [];
  }, [job?.files]);

  const isOwner = useMemo(() => {
    return user && job?.created_by === user.id;
  }, [user, job?.created_by]);

  const hasApplied = useMemo(() => {
    return appliedMethods.length > 0;
  }, [appliedMethods]);

  /**
   * Get language name helper
   */
  const getLanguageName = useCallback((langId) => {
    const language = languages.find(l => l.id === langId);
    if (!language) return langId;
    return lang === 'ko' ? language.name_ko : language.name_en;
  }, [languages, lang]);

  /**
   * Get language flag helper
   */
  const getLanguageFlag = useCallback((langId) => {
    const language = languages.find(l => l.id === langId);
    return language?.flag_emoji || '🌐';
  }, [languages]);


  // ============================================================================
  // RENDER: Loading State
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {lang === 'ko' ? '채용공고 불러오는 중...' : 'Loading job...'}
          </p>
        </div>
      </div>
    );
  }


  // ============================================================================
  // RENDER: Error State
  // ============================================================================

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {lang === 'ko' ? '채용공고를 찾을 수 없습니다' : 'Job Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || (lang === 'ko' ? '이 채용공고가 삭제되었거나 존재하지 않습니다.' : 'This job may have been removed or doesn\'t exist.')}
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {lang === 'ko' ? '채용공고 목록으로' : 'Back to Jobs'}
          </Link>
        </div>
      </div>
    );
  }


  // ============================================================================
  // RENDER: Main Content
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ====================================================================
          HEADER
          ==================================================================== */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">
              {lang === 'ko' ? '채용공고' : 'Jobs'}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={handleLanguageToggle}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4" />
              {lang === 'ko' ? 'EN' : '한국어'}
            </button>

            {/* Edit Button (Owner Only) */}
            {isOwner && (
              <Link
                to={`/jobs/edit/${job.id}`}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                {lang === 'ko' ? '수정' : 'Edit'}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ====================================================================
          MAIN CONTENT
          ==================================================================== */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* ----------------------------------------------------------------
              COVER IMAGE
              ---------------------------------------------------------------- */}
          {job.img_url ? (
            <div className="w-full aspect-video sm:aspect-[21/9] overflow-hidden bg-gray-100">
              <img
                src={job.img_url}
                alt={job.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-full h-32 sm:h-48 bg-gradient-to-br from-blue-500 to-indigo-600" />
          )}

          {/* ----------------------------------------------------------------
              HEADER SECTION
              ---------------------------------------------------------------- */}
          <div className="p-6 sm:p-8">
            {/* Company Logo & Name */}
            <div className="flex items-start gap-4 mb-6">
              {company?.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name_en}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-gray-200"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name_en)}&background=6366f1&color=fff&size=80`;
                  }}
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {(company?.name_en || 'C').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                  {job.title}
                </h1>
                <p className="text-gray-600 font-medium">
                  {company?.name_en}
                  {company?.name_ko && company.name_ko !== company.name_en && (
                    <span className="text-gray-400"> ({company.name_ko})</span>
                  )}
                </p>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-6">
              <span className="flex items-center gap-1">
                <IoEyeOutline className="w-4 h-4" />
                {formatCount(job.view || 0)} {lang === 'ko' ? '조회' : 'views'}
              </span>
              <span>•</span>
              <span>
                {lang === 'ko' ? '게시일: ' : 'Posted: '}{getRelativeTime(job.created_at)}
              </span>
              {category && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {lang === 'ko' ? category.name_ko : category.name_en}
                  </span>
                </>
              )}
            </div>

            {/* Expired/Deadline Badge */}
            {deadlineStatus.isExpired ? (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800">
                    {lang === 'ko' ? '마감된 채용공고' : 'This job has expired'}
                  </p>
                  <p className="text-sm text-red-600">
                    {lang === 'ko' ? '마감일: ' : 'Deadline was: '}{formatDate(job.deadline)}
                  </p>
                </div>
              </div>
            ) : job.deadline && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                deadlineStatus.urgent 
                  ? 'bg-orange-50 border border-orange-200' 
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <Calendar className={`w-5 h-5 flex-shrink-0 ${
                  deadlineStatus.urgent ? 'text-orange-500' : 'text-blue-500'
                }`} />
                <div>
                  <p className={`font-medium ${
                    deadlineStatus.urgent ? 'text-orange-800' : 'text-blue-800'
                  }`}>
                    {lang === 'ko' ? '마감일: ' : 'Application Deadline: '}{formatDate(job.deadline)}
                  </p>
                  {deadlineStatus.label && (
                    <p className={`text-sm ${
                      deadlineStatus.urgent ? 'text-orange-600' : 'text-blue-600'
                    }`}>
                      {deadlineStatus.label}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Verification Notice (Owner Only) */}
            {isOwner && !job.approved && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">
                    {lang === 'ko' ? '검토 중' : 'Under Review'}
                  </p>
                  <p className="text-sm text-amber-700">
                    {lang === 'ko'
                      ? '이 채용공고는 Keasy에서 검토 중입니다. 승인되면 공개됩니다.'
                      : 'This job posting is being reviewed by Keasy. It will be visible once approved.'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------
                INFO GRID
                ---------------------------------------------------------------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {/* Location */}
              <div className="flex items-start gap-3 p-4 bg-gray-100 rounded-xl">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <MapPin className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs text-gray-500">
                      {lang === 'ko' ? '위치' : 'Location'}
                    </p>
                    {/* View Location Link */}
                    {job.location_map_link && (
                      <a
                        href={job.location_map_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-1 transition-colors"
                      >
                        {lang === 'ko' ? '지도 보기' : 'View Location'}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">
                      {job.location}
                    </p>
                    {job.location_type && (
                      <p className="text-sm">
                        <span className="text-gray-500">{lang === 'ko' ? '근무형태: ' : 'Work Type: '}</span>
                        <span className="font-medium text-gray-900">{getLocationTypeLabel(job.location_type, lang)}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Type */}
              <div className="flex items-start gap-3 p-4 bg-gray-100 rounded-xl">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Briefcase className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">
                    {lang === 'ko' ? '고용 형태' : 'Job Type'}
                  </p>
                  <p className="font-medium text-gray-900">
                    {getJobTypeLabel(job.job_type, lang)}
                  </p>
                </div>
              </div>

              {/* Salary */}
              <div className="flex items-start gap-3 p-4 bg-gray-100 rounded-xl">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <DollarSign className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">
                    {lang === 'ko' ? '급여' : 'Salary'}
                  </p>
                  <p className="font-medium text-gray-900">
                    {job.salary_type === 'negotiable'
                      ? (lang === 'ko' ? '협의' : 'Negotiable')
                      : formatSalaryRange(job.salary_min, job.salary_max, job.salary_type, lang) || (lang === 'ko' ? '미정' : 'Not specified')
                    }
                  </p>
                </div>
              </div>

              {/* Experience */}
              <div className="flex items-start gap-3 p-4 bg-gray-100 rounded-xl">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <GraduationCap className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">
                    {lang === 'ko' ? '경력' : 'Experience'}
                  </p>
                  <p className="font-medium text-gray-900">
                    {getExperienceLevelLabel(job.experience_level, lang) || (lang === 'ko' ? '무관' : 'Any')}
                  </p>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------------------
                LANGUAGE REQUIREMENTS
                ---------------------------------------------------------------- */}
            {requiredLanguages.length > 0 && (
              <div className="mb-8">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <Languages className="w-5 h-5 text-gray-500" />
                  {lang === 'ko' ? '필요 언어' : 'Required Languages'}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {requiredLanguages.map((reqLang, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl"
                    >
                      <span className="text-xl">{getLanguageFlag(reqLang.language)}</span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {getLanguageName(reqLang.language)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getLanguageLevelLabel(reqLang.level, lang)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------
                JOB DESCRIPTION
                ---------------------------------------------------------------- */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {lang === 'ko' ? '상세 내용' : 'Job Description'}
              </h2>
              <div className="prose prose-gray max-w-none">
                {job.description?.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                    {paragraph || <br />}
                  </p>
                ))}
              </div>
            </div>

            {/* ----------------------------------------------------------------
                SKILLS
                ---------------------------------------------------------------- */}
            {job.skills && job.skills.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {lang === 'ko' ? '필요 스킬' : 'Required Skills'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-full border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------
                FILE ATTACHMENTS
                ---------------------------------------------------------------- */}
            {files.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {lang === 'ko' ? '첨부 파일' : 'Attachments'}
                </h2>
                <div className="space-y-2">
                  {files.map((file, index) => {
                    const fileUrl = typeof file === 'string' ? file : file.url;
                    const fileName = typeof file === 'string' ? getFileName(file) : (file.name || getFileName(file.url));

                    return (
                      <a
                        key={index}
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                      >
                        {getFileIcon(fileName)}
                        <span className="flex-1 text-gray-700 truncate group-hover:text-gray-900">
                          {fileName}
                        </span>
                        <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------
              ACTION BUTTONS (Sticky Footer)
              ---------------------------------------------------------------- */}
          <div className="sticky bottom-0 p-4 sm:p-6 bg-white border-t border-gray-100 shadow-lg">
            <div className="flex items-center gap-3">
              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!user}
                className={`
                  flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all
                  ${isSaved
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                  }
                  ${!user ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isSaved ? <BsBookmarkFill className="w-5 h-5" /> : <BsBookmark className="w-5 h-5" />}
                <span className="hidden sm:inline">
                  {isSaved ? (lang === 'ko' ? '저장됨' : 'Saved') : (lang === 'ko' ? '저장' : 'Save')}
                </span>
              </button>

              {/* Apply Button */}
              <button
                onClick={() => setShowContactModal(true)}
                disabled={!user || deadlineStatus.isExpired}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all
                  ${deadlineStatus.isExpired
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : hasApplied
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  }
                  ${!user && !deadlineStatus.isExpired ? 'opacity-75' : ''}
                `}
              >
                {deadlineStatus.isExpired ? (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    {lang === 'ko' ? '마감됨' : 'Expired'}
                  </>
                ) : hasApplied ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    {lang === 'ko' ? '지원 완료' : 'Applied'}
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5" />
                    {lang === 'ko' ? '지원하기' : 'Apply Now'}
                  </>
                )}
              </button>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="flex items-center justify-center p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                title={lang === 'ko' ? '공유하기' : 'Share'}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Login Prompt */}
            {!user && (
              <p className="mt-3 text-center text-sm text-gray-500">
                <Link to="/signin" className="text-blue-600 hover:underline font-medium">
                  {lang === 'ko' ? '로그인' : 'Sign in'}
                </Link>
                {lang === 'ko' ? '하여 지원하고 저장하세요' : ' to apply and save jobs'}
              </p>
            )}
          </div>
        </article>

        {/* ====================================================================
            RELATED JOBS
            ==================================================================== */}
        {relatedJobs.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {lang === 'ko' ? '관련 채용공고' : 'Related Jobs'}
              </h2>
              <Link
                to="/jobs"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {lang === 'ko' ? '모두 보기' : 'View all'}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedJobs.map((relatedJob, index) => (
                <Link
                  key={relatedJob.id}
                  to={`/jobs/job/${relatedJob.id}`}
                  className="block"
                >
                  <JobCard
                    job={relatedJob}
                    company={relatedCompanies[relatedJob.company_id]}
                    isSelected={false}
                    isSaved={false}
                    onSelect={() => {}}
                    onSave={() => {}}
                    index={index}
                    user={user}
                  />
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ====================================================================
          CONTACT MODAL
          ==================================================================== */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        job={job}
        company={company}
        onApply={handleApply}
        appliedMethods={appliedMethods}
        lang={lang}
      />
    </div>
  );
};

export default JobDetail;