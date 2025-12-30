/**
 * @file CompanyApproval.jsx
 * @description Admin page for reviewing and verifying company registrations.
 * 
 * Features:
 * - List of all companies with verification status
 * - View submitted verification documents
 * - Verify/Reject buttons
 * - Search and filter by status
 * - Company details modal with document preview
 * - Stats overview
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
import { isSuperadmin } from "../../../../../utils/adminUtils";
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
  Loader2,
  Building2,
  Users,
  Mail,
  MapPin,
  Link as LinkIcon,
  Calendar,
  FileText,
  Image,
  ExternalLink,
  X,
  CheckSquare,
  Square,
  RefreshCw,
  Download,
  Briefcase,
  AlertTriangle
} from 'lucide-react';

import { formatDate, getRelativeTime } from '../../components/jobsUtils';

/* ============================================================================
   CONSTANTS
   ============================================================================ */

const STATUS_OPTIONS = [
  { id: 'all', label_en: 'All Companies', label_ko: '전체', color: 'gray' },
  { id: 'pending', label_en: 'Pending', label_ko: '대기 중', color: 'amber' },
  { id: 'verified', label_en: 'Verified', label_ko: '인증됨', color: 'green' },
  { id: 'rejected', label_en: 'Rejected', label_ko: '거부됨', color: 'red' }
];

const INDUSTRIES = {
  technology: { en: 'Technology / IT', ko: '기술 / IT' },
  finance: { en: 'Finance / Banking', ko: '금융 / 은행' },
  healthcare: { en: 'Healthcare', ko: '의료 / 헬스케어' },
  education: { en: 'Education', ko: '교육' },
  manufacturing: { en: 'Manufacturing', ko: '제조업' },
  retail: { en: 'Retail / E-commerce', ko: '소매 / 이커머스' },
  hospitality: { en: 'Hospitality / Tourism', ko: '호텔 / 관광' },
  food: { en: 'Food & Beverage', ko: '식음료' },
  media: { en: 'Media / Entertainment', ko: '미디어 / 엔터테인먼트' },
  construction: { en: 'Construction / Real Estate', ko: '건설 / 부동산' },
  logistics: { en: 'Logistics / Transportation', ko: '물류 / 운송' },
  consulting: { en: 'Consulting / Professional Services', ko: '컨설팅 / 전문 서비스' },
  nonprofit: { en: 'Non-profit / NGO', ko: '비영리 / NGO' },
  government: { en: 'Government', ko: '정부 / 공공기관' },
  other: { en: 'Other', ko: '기타' }
};

const COMPANY_SIZES = {
  '1-10': { en: '1-10 employees', ko: '1-10명' },
  '11-50': { en: '11-50 employees', ko: '11-50명' },
  '51-200': { en: '51-200 employees', ko: '51-200명' },
  '200+': { en: '200+ employees', ko: '200명 이상' }
};

const LABELS = {
  pageTitle: { en: 'Company Verification', ko: '회사 인증 관리' },
  pageSubtitle: { en: 'Review and verify company registrations', ko: '회사 등록 검토 및 인증' },
  pending: { en: 'Pending', ko: '대기 중' },
  verified: { en: 'Verified', ko: '인증됨' },
  rejected: { en: 'Rejected', ko: '거부됨' },
  verify: { en: 'Verify', ko: '인증' },
  reject: { en: 'Reject', ko: '거부' },
  viewDetails: { en: 'View Details', ko: '상세 보기' },
  searchPlaceholder: { en: 'Search companies...', ko: '회사 검색...' },
  noCompanies: { en: 'No companies found', ko: '회사가 없습니다' },
  documents: { en: 'Verification Documents', ko: '인증 서류' },
  businessReg: { en: 'Business Registration', ko: '사업자등록증' },
  employerId: { en: 'Employer ID / ARC', ko: '대표자 신분증' },
  viewDocument: { en: 'View Document', ko: '서류 보기' },
  companyInfo: { en: 'Company Information', ko: '회사 정보' },
  contactInfo: { en: 'Contact Information', ko: '연락처 정보' },
  registeredOn: { en: 'Registered on', ko: '등록일' },
  jobsPosted: { en: 'Jobs Posted', ko: '등록된 채용공고' },
  refresh: { en: 'Refresh', ko: '새로고침' },
  adminOnly: { en: 'Admin access required', ko: '관리자 권한이 필요합니다' },
  goBack: { en: 'Go Back', ko: '돌아가기' },
  companyVerified: { en: 'Company verified successfully', ko: '회사가 인증되었습니다' },
  companyRejected: { en: 'Company rejected', ko: '회사가 거부되었습니다' },
  selected: { en: 'selected', ko: '개 선택됨' },
  bulkVerify: { en: 'Verify Selected', ko: '선택 항목 인증' },
  bulkReject: { en: 'Reject Selected', ko: '선택 항목 거부' },
  clearSelection: { en: 'Clear', ko: '취소' },
  selectAll: { en: 'Select All', ko: '전체 선택' },
  industry: { en: 'Industry', ko: '산업' },
  size: { en: 'Size', ko: '규모' },
  website: { en: 'Website', ko: '웹사이트' },
  email: { en: 'Email', ko: '이메일' },
  address: { en: 'Address', ko: '주소' },
  notProvided: { en: 'Not provided', ko: '미제공' }
};


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
    verified: {
      icon: CheckCircle,
      label: lang === 'ko' ? '인증됨' : 'Verified',
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
 * Company Row Component
 */
const CompanyRow = ({
  company,
  jobCount,
  isSelected,
  onSelect,
  onVerify,
  onReject,
  onView,
  lang,
  isProcessing
}) => {
  // Determine status: verified true = verified, verified false = rejected, null/undefined = pending
  const status = company.verified === true ? 'verified' : company.verified === false ? 'rejected' : 'pending';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={() => onSelect(company.id)}
          className="mt-1 flex-shrink-0"
        >
          {isSelected ? (
            <CheckSquare className="w-5 h-5 text-blue-600" />
          ) : (
            <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>

        {/* Company Logo */}
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={company.name_en}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-200"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-gray-400" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900">{company.name_en}</h3>
              {company.name_ko && (
                <p className="text-sm text-gray-500">{company.name_ko}</p>
              )}
            </div>
            <StatusBadge status={status} lang={lang} />
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-gray-500">
            {company.industry && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {lang === 'ko' ? INDUSTRIES[company.industry]?.ko : INDUSTRIES[company.industry]?.en}
              </span>
            )}
            {company.company_size && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {lang === 'ko' ? COMPANY_SIZES[company.company_size]?.ko : COMPANY_SIZES[company.company_size]?.en}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {getRelativeTime(company.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {jobCount} {lang === 'ko' ? '개 채용공고' : 'jobs'}
            </span>
          </div>

          {/* Document Indicators */}
          <div className="flex items-center gap-2 mt-2">
            {company.business_registration_url && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                <FileText className="w-3 h-3" />
                {lang === 'ko' ? '사업자등록증' : 'Business Reg'}
              </span>
            )}
            {company.employer_id_card_url && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">
                <FileText className="w-3 h-3" />
                {lang === 'ko' ? '신분증' : 'ID Card'}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => onView(company)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              {lang === 'ko' ? '상세' : 'View'}
            </button>

            {status === 'pending' && (
              <>
                <button
                  onClick={() => onVerify(company.id)}
                  disabled={isProcessing}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {lang === 'ko' ? '인증' : 'Verify'}
                </button>
                <button
                  onClick={() => onReject(company.id)}
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
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Document Preview Component
 */
const DocumentPreview = ({ url, label, lang }) => {
  if (!url) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">
          {lang === 'ko' ? '서류가 제출되지 않았습니다' : 'Document not submitted'}
        </p>
      </div>
    );
  }

  const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPdf = url.match(/\.pdf$/i);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <ExternalLink className="w-4 h-4" />
          {lang === 'ko' ? '새 탭에서 열기' : 'Open'}
        </a>
      </div>
      
      {isImage ? (
        <img
          src={url}
          alt={label}
          className="w-full h-48 object-contain bg-white"
        />
      ) : isPdf ? (
        <div className="p-8 text-center bg-white">
          <FileText className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">PDF Document</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:underline"
          >
            <Download className="w-4 h-4" />
            {lang === 'ko' ? '다운로드' : 'Download'}
          </a>
        </div>
      ) : (
        <div className="p-8 text-center bg-white">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            {lang === 'ko' ? '파일 열기' : 'Open File'}
          </a>
        </div>
      )}
    </div>
  );
};

/**
 * Company Detail Modal
 */
const CompanyDetailModal = ({ 
  company, 
  jobCount,
  onClose, 
  onVerify, 
  onReject, 
  lang, 
  isProcessing 
}) => {
  if (!company) return null;

  const status = company.verified === true ? 'verified' : company.verified === false ? 'rejected' : 'pending';

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
        className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {lang === 'ko' ? '회사 상세 정보' : 'Company Details'}
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
          {/* Company Header */}
          <div className="flex items-start gap-4 mb-6">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.name_en}
                className="w-20 h-20 rounded-2xl object-cover border border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{company.name_en}</h3>
                  {company.name_ko && (
                    <p className="text-gray-500">{company.name_ko}</p>
                  )}
                </div>
                <StatusBadge status={status} lang={lang} />
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                <span>{formatDate(company.created_at)}</span>
                <span>•</span>
                <span>{jobCount} {lang === 'ko' ? '개 채용공고' : 'jobs posted'}</span>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                {lang === 'ko' ? '회사 정보' : 'Company Information'}
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Briefcase className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{lang === 'ko' ? '산업' : 'Industry'}</p>
                    <p className="text-gray-900">
                      {company.industry 
                        ? (lang === 'ko' ? INDUSTRIES[company.industry]?.ko : INDUSTRIES[company.industry]?.en)
                        : (lang === 'ko' ? '미지정' : 'Not specified')
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{lang === 'ko' ? '규모' : 'Size'}</p>
                    <p className="text-gray-900">
                      {company.company_size 
                        ? (lang === 'ko' ? COMPANY_SIZES[company.company_size]?.ko : COMPANY_SIZES[company.company_size]?.en)
                        : (lang === 'ko' ? '미지정' : 'Not specified')
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                {lang === 'ko' ? '연락처 정보' : 'Contact Information'}
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{lang === 'ko' ? '이메일' : 'Email'}</p>
                    <p className="text-gray-900">{company.contact_email || '-'}</p>
                  </div>
                </div>
                {company.website && (
                  <div className="flex items-start gap-3">
                    <LinkIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">{lang === 'ko' ? '웹사이트' : 'Website'}</p>
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  </div>
                )}
                {company.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">{lang === 'ko' ? '주소' : 'Address'}</p>
                      <p className="text-gray-900">{company.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {company.description && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">
                {lang === 'ko' ? '회사 소개' : 'Description'}
              </h4>
              <p className="text-gray-600 whitespace-pre-wrap">{company.description}</p>
            </div>
          )}

          {/* Verification Documents */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              {lang === 'ko' ? '인증 서류' : 'Verification Documents'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DocumentPreview
                url={company.business_registration_url}
                label={lang === 'ko' ? '사업자등록증' : 'Business Registration'}
                lang={lang}
              />
              <DocumentPreview
                url={company.employer_id_card_url}
                label={lang === 'ko' ? '대표자 신분증' : 'Employer ID Card'}
                lang={lang}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {status === 'pending' && (
          <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => onReject(company.id)}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              {lang === 'ko' ? '거부' : 'Reject'}
            </button>
            <button
              onClick={() => onVerify(company.id)}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {lang === 'ko' ? '인증' : 'Verify'}
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

const CompanyApproval = () => {
  const navigate = useNavigate();

  // ============================================================================
  // STATE
  // ============================================================================

  const [user, setUser] = useState(null);
  const [isSuperadminUser, setIsSuperadminUser] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [jobCounts, setJobCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [lang, setLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedIds, setSelectedIds] = useState([]);
  const [processingIds, setProcessingIds] = useState([]);
  const [viewingCompany, setViewingCompany] = useState(null);


  // ============================================================================
  // LABELS HELPER
  // ============================================================================

  const t = useCallback((key) => {
    return LABELS[key]?.[lang] || LABELS[key]?.en || key;
  }, [lang]);


  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchCompanies = useCallback(async () => {
    try {
      // Fetch all companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (companiesError) throw companiesError;

      setCompanies(companiesData || []);

      // Fetch job counts per company
      if (companiesData && companiesData.length > 0) {
        const { data: jobsData } = await supabase
          .from('job')
          .select('company_id');

        const counts = {};
        jobsData?.forEach(job => {
          counts[job.company_id] = (counts[job.company_id] || 0) + 1;
        });
        setJobCounts(counts);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          navigate('/admin/signin');
          return;
        }

        setUser(currentUser);

        // Check if user is superadmin
        const isSuperAdmin = await isSuperadmin(currentUser);
        setIsSuperadminUser(isSuperAdmin);

        if (isSuperAdmin) {
          await fetchCompanies();
        }

        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, fetchCompanies]);


  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const stats = useMemo(() => {
    const pending = companies.filter(c => c.verified === null || c.verified === undefined).length;
    const verified = companies.filter(c => c.verified === true).length;
    const rejected = companies.filter(c => c.verified === false).length;
    return { total: companies.length, pending, verified, rejected };
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    let result = [...companies];

    // Filter by status
    if (statusFilter === 'pending') {
      result = result.filter(c => c.verified === null || c.verified === undefined);
    } else if (statusFilter === 'verified') {
      result = result.filter(c => c.verified === true);
    } else if (statusFilter === 'rejected') {
      result = result.filter(c => c.verified === false);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name_en?.toLowerCase().includes(query) ||
        c.name_ko?.toLowerCase().includes(query) ||
        c.contact_email?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [companies, statusFilter, searchQuery]);


  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleVerify = useCallback(async (companyId) => {
    setProcessingIds(prev => [...prev, companyId]);

    try {
      const { error } = await supabase
        .from('companies')
        .update({ verified: true })
        .eq('id', companyId);

      if (error) throw error;

      setCompanies(prev => prev.map(c => 
        c.id === companyId ? { ...c, verified: true } : c
      ));

      setSelectedIds(prev => prev.filter(id => id !== companyId));
      
      if (viewingCompany?.id === companyId) {
        setViewingCompany(null);
      }
    } catch (err) {
      console.error('Error verifying company:', err);
      alert(lang === 'ko' ? '오류가 발생했습니다' : 'An error occurred');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== companyId));
    }
  }, [viewingCompany, lang]);

  const handleReject = useCallback(async (companyId) => {
    setProcessingIds(prev => [...prev, companyId]);

    try {
      const { error } = await supabase
        .from('companies')
        .update({ verified: false })
        .eq('id', companyId);

      if (error) throw error;

      setCompanies(prev => prev.map(c => 
        c.id === companyId ? { ...c, verified: false } : c
      ));

      setSelectedIds(prev => prev.filter(id => id !== companyId));
      
      if (viewingCompany?.id === companyId) {
        setViewingCompany(null);
      }
    } catch (err) {
      console.error('Error rejecting company:', err);
      alert(lang === 'ko' ? '오류가 발생했습니다' : 'An error occurred');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== companyId));
    }
  }, [viewingCompany, lang]);

  const handleBulkVerify = useCallback(async () => {
    for (const id of selectedIds) {
      await handleVerify(id);
    }
  }, [selectedIds, handleVerify]);

  const handleBulkReject = useCallback(async () => {
    for (const id of selectedIds) {
      await handleReject(id);
    }
  }, [selectedIds, handleReject]);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredCompanies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCompanies.map(c => c.id));
    }
  }, [filteredCompanies, selectedIds]);

  const handleSelect = useCallback((companyId) => {
    setSelectedIds(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
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

  if (!isSuperadminUser) {
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
                  <Building2 className="w-5 h-5 text-blue-600" />
                  {t('pageTitle')}
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">{t('pageSubtitle')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/admin/jobs"
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                {lang === 'ko' ? '채용공고 관리' : 'Manage Jobs'}
              </Link>
              <button
                onClick={fetchCompanies}
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
            icon={Building2}
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
            label={t('verified')}
            value={stats.verified}
            color="green"
            isActive={statusFilter === 'verified'}
            onClick={() => setStatusFilter('verified')}
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
                onClick={handleBulkVerify}
                className="px-3 py-1 text-sm font-medium text-green-600 hover:bg-green-100 rounded"
              >
                {t('bulkVerify')}
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
        {filteredCompanies.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              {selectedIds.length === filteredCompanies.length ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {t('selectAll')} ({filteredCompanies.length})
            </button>
          </div>
        )}

        {/* Companies List */}
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('noCompanies')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCompanies.map(company => (
              <CompanyRow
                key={company.id}
                company={company}
                jobCount={jobCounts[company.id] || 0}
                isSelected={selectedIds.includes(company.id)}
                onSelect={handleSelect}
                onVerify={handleVerify}
                onReject={handleReject}
                onView={setViewingCompany}
                lang={lang}
                isProcessing={processingIds.includes(company.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Company Detail Modal */}
      <AnimatePresence>
        {viewingCompany && (
          <CompanyDetailModal
            company={viewingCompany}
            jobCount={jobCounts[viewingCompany.id] || 0}
            onClose={() => setViewingCompany(null)}
            onVerify={handleVerify}
            onReject={handleReject}
            lang={lang}
            isProcessing={processingIds.includes(viewingCompany.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompanyApproval;
