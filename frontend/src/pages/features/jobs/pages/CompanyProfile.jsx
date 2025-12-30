/**
 * @file CompanyProfile.jsx
 * @description Company profile page for employers to view and edit their company information.
 * 
 * Features:
 * - View company details (name, description, logo, etc.)
 * - Edit mode to update information
 * - Update logo and verification documents
 * - Show verification status
 * - List of jobs posted by the company
 * - Stats (total jobs, total views, total applications)
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
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from "../../../../api/supabase-client";
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  ArrowLeft,
  Building2,
  Edit3,
  Save,
  X,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Briefcase,
  Eye,
  Users,
  Mail,
  MapPin,
  Link as LinkIcon,
  ExternalLink,
  Plus,
  FileText,
  Trash2,
  MoreVertical,
  Calendar
} from 'lucide-react';
import { IoEyeOutline } from 'react-icons/io5';

import { formatCount, formatDate, getRelativeTime } from '../components/jobsUtils';


/* ============================================================================
   CONSTANTS
   ============================================================================ */

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const INDUSTRIES = [
  { id: 'technology', label_en: 'Technology / IT', label_ko: '기술 / IT' },
  { id: 'finance', label_en: 'Finance / Banking', label_ko: '금융 / 은행' },
  { id: 'healthcare', label_en: 'Healthcare', label_ko: '의료 / 헬스케어' },
  { id: 'education', label_en: 'Education', label_ko: '교육' },
  { id: 'manufacturing', label_en: 'Manufacturing', label_ko: '제조업' },
  { id: 'retail', label_en: 'Retail / E-commerce', label_ko: '소매 / 이커머스' },
  { id: 'hospitality', label_en: 'Hospitality / Tourism', label_ko: '호텔 / 관광' },
  { id: 'food', label_en: 'Food & Beverage', label_ko: '식음료' },
  { id: 'media', label_en: 'Media / Entertainment', label_ko: '미디어 / 엔터테인먼트' },
  { id: 'construction', label_en: 'Construction / Real Estate', label_ko: '건설 / 부동산' },
  { id: 'logistics', label_en: 'Logistics / Transportation', label_ko: '물류 / 운송' },
  { id: 'consulting', label_en: 'Consulting / Professional Services', label_ko: '컨설팅 / 전문 서비스' },
  { id: 'nonprofit', label_en: 'Non-profit / NGO', label_ko: '비영리 / NGO' },
  { id: 'government', label_en: 'Government', label_ko: '정부 / 공공기관' },
  { id: 'other', label_en: 'Other', label_ko: '기타' }
];

const COMPANY_SIZES = [
  { id: '1-10', label_en: '1-10 employees', label_ko: '1-10명' },
  { id: '11-50', label_en: '11-50 employees', label_ko: '11-50명' },
  { id: '51-200', label_en: '51-200 employees', label_ko: '51-200명' },
  { id: '200+', label_en: '200+ employees', label_ko: '200명 이상' }
];

const LABELS = {
  pageTitle: { en: 'Company Profile', ko: '회사 프로필' },
  edit: { en: 'Edit', ko: '수정' },
  save: { en: 'Save Changes', ko: '변경사항 저장' },
  saving: { en: 'Saving...', ko: '저장 중...' },
  cancel: { en: 'Cancel', ko: '취소' },
  verified: { en: 'Verified', ko: '인증됨' },
  pendingVerification: { en: 'Pending Verification', ko: '인증 대기 중' },
  companyInfo: { en: 'Company Information', ko: '회사 정보' },
  companyNameEn: { en: 'Company Name (English)', ko: '회사명 (영문)' },
  companyNameKo: { en: 'Company Name (Korean)', ko: '회사명 (한글)' },
  description: { en: 'Description', ko: '회사 소개' },
  industry: { en: 'Industry', ko: '산업' },
  companySize: { en: 'Company Size', ko: '회사 규모' },
  contactInfo: { en: 'Contact Information', ko: '연락처 정보' },
  email: { en: 'Email', ko: '이메일' },
  website: { en: 'Website', ko: '웹사이트' },
  address: { en: 'Address', ko: '주소' },
  logo: { en: 'Company Logo', ko: '회사 로고' },
  changeLogo: { en: 'Change Logo', ko: '로고 변경' },
  stats: { en: 'Statistics', ko: '통계' },
  totalJobs: { en: 'Total Jobs', ko: '전체 채용공고' },
  activeJobs: { en: 'Active Jobs', ko: '진행 중' },
  totalViews: { en: 'Total Views', ko: '전체 조회수' },
  totalApplications: { en: 'Applications', ko: '지원자 수' },
  postedJobs: { en: 'Posted Jobs', ko: '등록된 채용공고' },
  noJobs: { en: 'No jobs posted yet', ko: '등록된 채용공고가 없습니다' },
  postFirstJob: { en: 'Post your first job', ko: '첫 채용공고 등록하기' },
  viewAll: { en: 'View All', ko: '전체 보기' },
  postNewJob: { en: 'Post New Job', ko: '새 채용공고' },
  approved: { en: 'Approved', ko: '승인됨' },
  pending: { en: 'Pending', ko: '대기 중' },
  expired: { en: 'Expired', ko: '마감됨' },
  editJob: { en: 'Edit', ko: '수정' },
  viewJob: { en: 'View', ko: '보기' },
  noCompany: { en: 'No company registered', ko: '등록된 회사가 없습니다' },
  registerCompany: { en: 'Register Company', ko: '회사 등록' },
  memberSince: { en: 'Member since', ko: '가입일' },
  notSpecified: { en: 'Not specified', ko: '미지정' }
};


/* ============================================================================
   HELPER COMPONENTS
   ============================================================================ */

/**
 * Stat Card Component
 */
const StatCard = ({ icon: Icon, label, value, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{formatCount(value)}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
};

/**
 * Job List Item Component
 */
const JobListItem = ({ job, lang, onEdit, onView }) => {
  const isExpired = job.deadline && new Date(job.deadline) < new Date();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
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

      {/* Job Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-gray-900 truncate">{job.title}</h3>
          {/* Status Badge */}
          <span className={`
            px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0
            ${isExpired 
              ? 'bg-gray-100 text-gray-600'
              : job.approved 
                ? 'bg-green-100 text-green-700' 
                : 'bg-amber-100 text-amber-700'
            }
          `}>
            {isExpired 
              ? (lang === 'ko' ? '마감됨' : 'Expired')
              : job.approved 
                ? (lang === 'ko' ? '승인됨' : 'Approved') 
                : (lang === 'ko' ? '대기 중' : 'Pending')
            }
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <IoEyeOutline className="w-4 h-4" />
            {formatCount(job.view || 0)}
          </span>
          <span>•</span>
          <span>{getRelativeTime(job.created_at)}</span>
          {job.deadline && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(job.deadline)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          to={`/jobs/job/${job.id}`}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title={lang === 'ko' ? '보기' : 'View'}
        >
          <ExternalLink className="w-5 h-5" />
        </Link>
        <Link
          to={`/jobs/edit/${job.id}`}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title={lang === 'ko' ? '수정' : 'Edit'}
        >
          <Edit3 className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

/**
 * Info Row Component for view mode
 */
const InfoRow = ({ icon: Icon, label, value, isLink = false }) => {
  if (!value) return null;
  
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0">
      <div className="p-2 bg-gray-50 rounded-lg">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        {isLink ? (
          <a 
            href={value.startsWith('http') ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {value}
          </a>
        ) : (
          <p className="text-gray-900 break-words">{value}</p>
        )}
      </div>
    </div>
  );
};


/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */

const CompanyProfile = () => {
  const navigate = useNavigate();

  // ============================================================================
  // STATE
  // ============================================================================

  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [lang, setLang] = useState('en');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newLogo, setNewLogo] = useState(null);
  const [newLogoPreview, setNewLogoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);


  // ============================================================================
  // LABELS HELPER
  // ============================================================================

  const t = useCallback((key) => {
    return LABELS[key]?.[lang] || LABELS[key]?.en || key;
  }, [lang]);

  const getIndustryLabel = useCallback((id) => {
    const industry = INDUSTRIES.find(i => i.id === id);
    return industry ? (lang === 'ko' ? industry.label_ko : industry.label_en) : id;
  }, [lang]);

  const getSizeLabel = useCallback((id) => {
    const size = COMPANY_SIZES.find(s => s.id === id);
    return size ? (lang === 'ko' ? size.label_ko : size.label_en) : id;
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
          navigate('/signin');
          return;
        }
        setUser(currentUser);

        // Fetch company
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('created_by', currentUser.id)
          .single();

        if (companyError && companyError.code !== 'PGRST116') {
          throw companyError;
        }

        setCompany(companyData || null);

        // Fetch jobs if company exists
        if (companyData) {
          const { data: jobsData } = await supabase
            .from('job')
            .select('*')
            .eq('company_id', companyData.id)
            .order('created_at', { ascending: false });

          setJobs(jobsData || []);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);


  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => {
      const isExpired = j.deadline && new Date(j.deadline) < new Date();
      return j.approved && !isExpired;
    }).length;
    const totalViews = jobs.reduce((sum, j) => sum + (j.view || 0), 0);
    
    return { totalJobs, activeJobs, totalViews };
  }, [jobs]);


  // ============================================================================
  // EDIT HANDLERS
  // ============================================================================

  const handleStartEdit = useCallback(() => {
    setEditData({
      nameEn: company?.name_en || '',
      nameKo: company?.name_ko || '',
      description: company?.description || '',
      industry: company?.industry || '',
      companySize: company?.company_size || '',
      website: company?.website || '',
      email: company?.contact_email || '',
      address: company?.address || ''
    });
    setIsEditing(true);
  }, [company]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditData({});
    setNewLogo(null);
    if (newLogoPreview) {
      URL.revokeObjectURL(newLogoPreview);
    }
    setNewLogoPreview(null);
    setSaveError(null);
  }, [newLogoPreview]);

  const handleEditChange = useCallback((field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleLogoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(lang === 'ko' ? '이미지 파일만 업로드 가능합니다' : 'Only image files are allowed');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert(lang === 'ko' ? '파일 크기는 10MB 이하여야 합니다' : 'File size must be under 10MB');
      return;
    }

    setNewLogo(file);
    setNewLogoPreview(URL.createObjectURL(file));
  }, [lang]);


  // ============================================================================
  // SAVE HANDLER
  // ============================================================================

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      let logoUrl = company?.logo_url;

      // Upload new logo if changed
      if (newLogo) {
        const fileExt = newLogo.name.split('.').pop();
        const timestamp = Date.now();
        const fileName = `${user.id}/logos/${timestamp}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('jobs')
          .upload(fileName, newLogo, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('jobs')
          .getPublicUrl(fileName);

        logoUrl = urlData.publicUrl;
      }

      // Update company
      const updateData = {
        name_en: editData.nameEn.trim(),
        name_ko: editData.nameKo.trim() || null,
        description: editData.description.trim(),
        industry: editData.industry || null,
        company_size: editData.companySize || null,
        website: editData.website.trim() || null,
        contact_email: editData.email.trim(),
        address: editData.address.trim() || null,
        logo_url: logoUrl,
        updated_at: new Date().toISOString()
      };

      const { data: updatedCompany, error: updateError } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', company.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setCompany(updatedCompany);
      setIsEditing(false);
      setNewLogo(null);
      setNewLogoPreview(null);
    } catch (err) {
      console.error('Save error:', err);
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };


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
  // RENDER: No Company State
  // ============================================================================

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link
              to="/jobs"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">{lang === 'ko' ? '채용공고' : 'Jobs'}</span>
            </Link>
            <button
              onClick={() => setLang(prev => prev === 'en' ? 'ko' : 'en')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Globe className="w-4 h-4" />
              {lang === 'ko' ? 'English' : '한국어'}
            </button>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('noCompany')}</h1>
            <p className="text-gray-600 mb-6">
              {lang === 'ko' 
                ? '채용공고를 등록하려면 먼저 회사를 등록하세요.'
                : 'Register your company to start posting jobs.'
              }
            </p>
            <Link
              to="/company/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('registerCompany')}
            </Link>
          </div>
        </main>
      </div>
    );
  }


  // ============================================================================
  // RENDER: Company Profile
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/jobs"
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{t('pageTitle')}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(prev => prev === 'en' ? 'ko' : 'en')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4" />
              {lang === 'ko' ? 'English' : '한국어'}
            </button>

            {!isEditing && (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                {t('edit')}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Error Banner */}
        {saveError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{saveError}</p>
          </div>
        )}

        {/* ================================================================
            COMPANY HEADER
            ================================================================ */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              {isEditing ? (
                <div className="relative">
                  <img
                    src={newLogoPreview || company.logo_url}
                    alt={company.name_en}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover border border-gray-200"
                  />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                    <Upload className="w-6 h-6 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <img
                  src={company.logo_url}
                  alt={company.name_en}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover border border-gray-200"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name_en)}&background=6366f1&color=fff&size=128`;
                  }}
                />
              )}
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editData.nameEn}
                        onChange={(e) => handleEditChange('nameEn', e.target.value)}
                        placeholder={t('companyNameEn')}
                        className="w-full px-3 py-2 text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={editData.nameKo}
                        onChange={(e) => handleEditChange('nameKo', e.target.value)}
                        placeholder={t('companyNameKo')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900">{company.name_en}</h2>
                      {company.name_ko && (
                        <p className="text-gray-500 mt-1">{company.name_ko}</p>
                      )}
                    </>
                  )}
                </div>

                {/* Verification Badge */}
                <div className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium flex-shrink-0
                  ${company.verified 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-amber-100 text-amber-700'
                  }
                `}>
                  {company.verified ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {t('verified')}
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      {t('pendingVerification')}
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  placeholder={t('description')}
                  rows={3}
                  className="w-full mt-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              ) : (
                <p className="text-gray-600 mt-4 line-clamp-3">{company.description}</p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                {company.industry && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {getIndustryLabel(company.industry)}
                  </span>
                )}
                {company.company_size && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {getSizeLabel(company.company_size)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {t('memberSince')} {formatDate(company.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Mode: Additional Fields */}
          {isEditing && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('industry')}
                  </label>
                  <select
                    value={editData.industry}
                    onChange={(e) => handleEditChange('industry', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{lang === 'ko' ? '선택' : 'Select'}</option>
                    {INDUSTRIES.map(ind => (
                      <option key={ind.id} value={ind.id}>
                        {lang === 'ko' ? ind.label_ko : ind.label_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('companySize')}
                  </label>
                  <select
                    value={editData.companySize}
                    onChange={(e) => handleEditChange('companySize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{lang === 'ko' ? '선택' : 'Select'}</option>
                    {COMPANY_SIZES.map(size => (
                      <option key={size.id} value={size.id}>
                        {lang === 'ko' ? size.label_ko : size.label_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => handleEditChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('website')}
                  </label>
                  <input
                    type="url"
                    value={editData.website}
                    onChange={(e) => handleEditChange('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('address')}
                  </label>
                  <input
                    type="text"
                    value={editData.address}
                    onChange={(e) => handleEditChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Save/Cancel Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {t('save')}
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================
            CONTACT INFO (View Mode Only)
            ================================================================ */}
        {!isEditing && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('contactInfo')}</h3>
            <InfoRow icon={Mail} label={t('email')} value={company.contact_email} />
            <InfoRow icon={LinkIcon} label={t('website')} value={company.website} isLink />
            <InfoRow icon={MapPin} label={t('address')} value={company.address} />
          </div>
        )}

        {/* ================================================================
            STATISTICS
            ================================================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard 
            icon={Briefcase} 
            label={t('totalJobs')} 
            value={stats.totalJobs}
            color="blue"
          />
          <StatCard 
            icon={CheckCircle2} 
            label={t('activeJobs')} 
            value={stats.activeJobs}
            color="green"
          />
          <StatCard 
            icon={Eye} 
            label={t('totalViews')} 
            value={stats.totalViews}
            color="purple"
          />
          <StatCard 
            icon={Users} 
            label={t('totalApplications')} 
            value={0} // Would need job_application count
            color="orange"
          />
        </div>

        {/* ================================================================
            POSTED JOBS
            ================================================================ */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('postedJobs')}</h3>
            {company.verified && (
              <Link
                to="/jobs/new"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                {t('postNewJob')}
              </Link>
            )}
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">{t('noJobs')}</p>
              {company.verified && (
                <Link
                  to="/jobs/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('postFirstJob')}
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <JobListItem 
                  key={job.id} 
                  job={job} 
                  lang={lang}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompanyProfile;
