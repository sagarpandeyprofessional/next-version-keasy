/**
 * @file JobDetailPanel.jsx
 * @description Full job detail panel component for the right side of master-detail layout.
 * 
 * Displays comprehensive job information including:
 * - Cover image with company logo overlay
 * - Job title and company information
 * - Location with optional map link
 * - Job type, experience level, salary
 * - Language requirements
 * - Full job description
 * - Required skills/tags
 * - Uploaded files/attachments
 * - Apply button (triggers contact modal)
 * - Save/bookmark button
 * 
 * @requires react
 * @requires framer-motion
 * @requires lucide-react
 * @requires react-icons
 * 
 * @author Keasy
 * @version 1.0.2
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  Eye,
  Share2,
  AlertCircle,
  CheckCircle2,
  Edit3,
  MapPinned
} from 'lucide-react';
import { IoEyeOutline } from 'react-icons/io5';
import { BsBookmark, BsBookmarkFill, BsFilePdf, BsFileWord, BsFileEarmark } from 'react-icons/bs';
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
  detailPanelVariants
} from './jobsUtils';


/**
 * Gets the appropriate file icon based on file extension
 * 
 * @param {string} filename - The filename or URL
 * @returns {JSX.Element} Icon component
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
 * Gets filename from URL or path
 * 
 * @param {string} url - The file URL
 * @returns {string} Extracted filename
 */
const getFileName = (url) => {
  if (!url) return 'File';
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  // Remove query params and decode
  return decodeURIComponent(filename.split('?')[0]);
};


/**
 * JobDetailPanel Component
 * 
 * Displays full job details in a panel format.
 * Used in the right pane of the master-detail layout on desktop,
 * and as a full-screen view on mobile.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.job - The job data object
 * @param {Object} props.company - The company data object
 * @param {Object} props.category - The category data object
 * @param {Array} props.languages - Array of language data from database
 * @param {boolean} props.isSaved - Whether user has saved this job
 * @param {boolean} props.hasApplied - Whether user has applied to this job
 * @param {Function} props.onSave - Callback when save button is clicked
 * @param {Function} props.onApply - Callback when apply button is clicked
 * @param {Object} props.user - Current user object (null if not logged in)
 * @param {string} props.lang - Language code ('en' or 'ko')
 * @param {boolean} props.isOwner - Whether current user owns this job posting
 * 
 * @returns {JSX.Element} The job detail panel component
 */
const JobDetailPanel = ({
  job,
  company,
  category,
  languages = [],
  isSaved,
  hasApplied,
  onSave,
  onApply,
  user,
  lang = 'en',
  isOwner = false
}) => {
  // Return null if no job selected
  if (!job) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <div className="text-center p-8">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            {lang === 'ko' ? '채용공고를 선택하세요' : 'Select a job'}
          </h3>
          <p className="text-sm text-gray-400">
            {lang === 'ko' 
              ? '왼쪽 목록에서 채용공고를 클릭하여 상세 정보를 확인하세요'
              : 'Click on a job from the list to view details'
            }
          </p>
        </div>
      </div>
    );
  }

  // Get deadline status
  const deadlineStatus = getDeadlineStatus(job.deadline);
  
  // Get display image - cover image is the job's main image
  const coverImage = job.img_url;
  
  // Get company logo - MUST be from company.logo_url, NOT job.img_url
  const companyLogo = company?.logo_url;
  
  // Generate fallback logo URL if no logo exists
  const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(company?.name_en || 'C')}&background=6366f1&color=fff&size=80`;
  
  // Parse required languages from JSONB
  const requiredLanguages = job.required_languages || [];
  
  // Parse files from JSONB
  const files = job.files || [];
  
  // Get language name helper
  const getLanguageName = (langId) => {
    const language = languages.find(l => l.id === langId);
    if (!language) return langId;
    return lang === 'ko' ? language.name_ko : language.name_en;
  };

  // Get language flag helper
  const getLanguageFlag = (langId) => {
    const language = languages.find(l => l.id === langId);
    return language?.flag_emoji || '🌐';
  };

  return (
    <motion.div
      key={job.id}
      variants={detailPanelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col"
    >
      {/* ================================================================
          COVER IMAGE SECTION
          ================================================================ */}
      <div className="relative">
        {/* Cover Image */}
        {coverImage ? (
          <div className="w-full h-48 sm:h-56 lg:h-64 overflow-hidden bg-gray-100">
            <img
              src={coverImage}
              alt={job.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.classList.add('bg-gradient-to-br', 'from-blue-500', 'to-indigo-600');
              }}
            />
          </div>
        ) : (
          // Gradient placeholder when no cover image
          <div className="w-full h-32 sm:h-40 bg-gradient-to-br from-blue-500 to-indigo-600" />
        )}

        {/* Company Logo Overlay - ALWAYS show (with fallback) */}
        <div className="absolute -bottom-8 left-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white shadow-lg p-1 border border-gray-100">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={company?.name_en}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = fallbackLogo;
                }}
              />
            ) : (
              // Fallback: Show initial letter when no logo
              <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {(company?.name_en || 'C').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Expired Badge */}
        {deadlineStatus.isExpired && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-500 text-white shadow-lg">
              <AlertCircle className="w-4 h-4" />
              {lang === 'ko' ? '마감됨' : 'Expired'}
            </span>
          </div>
        )}

        {/* Deadline Warning Badge */}
        {!deadlineStatus.isExpired && deadlineStatus.urgent && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-orange-500 text-white shadow-lg">
              <Clock className="w-4 h-4" />
              {deadlineStatus.label}
            </span>
          </div>
        )}

        {/* Owner Edit Button */}
        {isOwner && (
          <Link
            to={`/jobs/edit/${job.id}`}
            className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white/90 backdrop-blur-sm text-gray-700 shadow-lg hover:bg-white transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            {lang === 'ko' ? '수정' : 'Edit'}
          </Link>
        )}
      </div>

      {/* ================================================================
          CONTENT SECTION (Scrollable)
          ================================================================ */}
      <div className="flex-1 p-6 pt-12 sm:pt-14">
        {/* ----------------------------------------------------------------
            HEADER: Title, Company, Meta
            ---------------------------------------------------------------- */}
        <div className="mb-6">
          {/* Job Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">
            {job.title}
          </h1>

          {/* Company Name */}
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 font-medium">
              {company?.name_en || 'Company'}
            </span>
            {company?.name_ko && company.name_ko !== company.name_en && (
              <span className="text-gray-500 text-sm">
                ({company.name_ko})
              </span>
            )}
          </div>

          {/* Meta Row: Views, Posted Date */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <IoEyeOutline className="w-4 h-4" />
              {formatCount(job.view || 0)} {lang === 'ko' ? '조회' : 'views'}
            </span>
            <span>•</span>
            <span>
              {lang === 'ko' ? '게시일: ' : 'Posted: '}
              {getRelativeTime(job.created_at)}
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------------------
            INFO GRID: Location, Type, Salary, Experience
            ---------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
                <p className="text-sm font-medium text-gray-900">
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
              <p className="text-sm font-medium text-gray-900">
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
              <p className="text-sm font-medium text-gray-900">
                {job.salary_type === 'negotiable' 
                  ? (lang === 'ko' ? '협의' : 'Negotiable')
                  : formatSalaryRange(job.salary_min, job.salary_max, job.salary_type, lang) || (lang === 'ko' ? '미정' : 'Not specified')
                }
              </p>
            </div>
          </div>

          {/* Experience Level */}
          <div className="flex items-start gap-3 p-4 bg-gray-100 rounded-xl">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <GraduationCap className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">
                {lang === 'ko' ? '경력' : 'Experience'}
              </p>
              <p className="text-sm font-medium text-gray-900">
                {getExperienceLevelLabel(job.experience_level, lang) || (lang === 'ko' ? '무관' : 'Any')}
              </p>
            </div>
          </div>
        </div>

        {/* Deadline */}
        {job.deadline && (
          <div className={`
            flex items-center gap-3 p-3 rounded-xl mb-6
            ${deadlineStatus.isExpired 
              ? 'bg-red-50 border border-red-200' 
              : deadlineStatus.urgent 
                ? 'bg-orange-50 border border-orange-200'
                : 'bg-blue-50 border border-blue-200'
            }
          `}>
            <Calendar className={`w-5 h-5 ${
              deadlineStatus.isExpired 
                ? 'text-red-500' 
                : deadlineStatus.urgent 
                  ? 'text-orange-500'
                  : 'text-blue-500'
            }`} />
            <div>
              <p className="text-xs text-gray-500">
                {lang === 'ko' ? '마감일' : 'Application Deadline'}
              </p>
              <p className={`text-sm font-medium ${
                deadlineStatus.isExpired 
                  ? 'text-red-700' 
                  : deadlineStatus.urgent 
                    ? 'text-orange-700'
                    : 'text-blue-700'
              }`}>
                {formatDate(job.deadline)} 
                {deadlineStatus.label && ` (${deadlineStatus.label})`}
              </p>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------
            LANGUAGE REQUIREMENTS
            ---------------------------------------------------------------- */}
        {requiredLanguages.length > 0 && (
          <div className="mb-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <Languages className="w-4 h-4 text-gray-500" />
              {lang === 'ko' ? '필요 언어' : 'Required Languages'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {requiredLanguages.map((reqLang, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg"
                >
                  <span className="text-lg">{getLanguageFlag(reqLang.language)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
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
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {lang === 'ko' ? '상세 내용' : 'Job Description'}
          </h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            {/* Render description with line breaks preserved */}
            {job.description?.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-2 last:mb-0">
                {paragraph || <br />}
              </p>
            ))}
          </div>
        </div>

        {/* ----------------------------------------------------------------
            SKILLS / TAGS
            ---------------------------------------------------------------- */}
        {job.skills && job.skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {lang === 'ko' ? '필요 스킬' : 'Required Skills'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-full border border-blue-200"
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
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {lang === 'ko' ? '첨부 파일' : 'Attachments'}
            </h3>
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
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    {getFileIcon(fileName)}
                    <span className="flex-1 text-sm text-gray-700 truncate group-hover:text-gray-900">
                      {fileName}
                    </span>
                    <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------
            CATEGORY BADGE
            ---------------------------------------------------------------- */}
        {category && (
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
              <Briefcase className="w-3.5 h-3.5" />
              {lang === 'ko' ? category.name_ko : category.name_en}
            </span>
          </div>
        )}

        {/* Verification Notice for Unapproved Jobs (Owner Only) */}
        {isOwner && !job.approved && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-800 mb-1">
                  {lang === 'ko' ? '검토 중' : 'Under Review'}
                </h4>
                <p className="text-sm text-amber-700">
                  {lang === 'ko'
                    ? '이 채용공고는 Keasy에서 검토 중입니다. 승인되면 공개됩니다.'
                    : 'This job posting is being reviewed by Keasy. It will be visible once approved.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================
          FOOTER: Action Buttons
          ================================================================ */}
      <div className="p-4 bg-white border-t border-gray-100 shadow-lg">
        <div className="flex items-center gap-3">
          {/* Save Button */}
          <button
            onClick={onSave}
            disabled={!user}
            className={`
              flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200
              ${isSaved
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }
              ${!user ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={!user ? (lang === 'ko' ? '로그인이 필요합니다' : 'Login required') : ''}
          >
            {isSaved ? (
              <BsBookmarkFill className="w-5 h-5" />
            ) : (
              <BsBookmark className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">
              {isSaved 
                ? (lang === 'ko' ? '저장됨' : 'Saved') 
                : (lang === 'ko' ? '저장' : 'Save')
              }
            </span>
          </button>

          {/* Apply Button */}
          <button
            onClick={onApply}
            disabled={!user || deadlineStatus.isExpired}
            className={`
              flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200
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
            onClick={() => {
              const jobUrl = `${window.location.origin}/jobs/job/${job.id}`;
              if (navigator.share) {
                navigator.share({
                  title: job.title,
                  text: `Check out this job: ${job.title} at ${company?.name_en || 'Company'}`,
                  url: jobUrl
                }).catch((err) => {
                  // User cancelled or error - fallback to copy
                  if (err.name !== 'AbortError') {
                    navigator.clipboard.writeText(jobUrl);
                    alert(lang === 'ko' ? '링크가 복사되었습니다!' : 'Link copied!');
                  }
                });
              } else {
                navigator.clipboard.writeText(jobUrl);
                alert(lang === 'ko' ? '링크가 복사되었습니다!' : 'Link copied!');
              }
            }}
            className="flex items-center justify-center p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            title={lang === 'ko' ? '공유하기' : 'Share'}
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Login Prompt for Non-authenticated Users */}
        {!user && (
          <p className="mt-3 text-center text-sm text-gray-500">
            <Link to="/signin" className="text-blue-600 hover:underline font-medium">
              {lang === 'ko' ? '로그인' : 'Sign in'}
            </Link>
            {lang === 'ko' ? '하여 지원하고 저장하세요' : ' to apply and save jobs'}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default JobDetailPanel;