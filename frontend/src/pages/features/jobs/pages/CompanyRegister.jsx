/**
 * @file CompanyRegister.jsx
 * @description Employer registration form for users to register their company.
 * 
 * Features:
 * - Company information (name EN/KO, description, industry, size)
 * - Logo upload (required)
 * - Business registration certificate upload (required)
 * - Employer ID/ARC card upload (required)
 * - Contact information (website, email, address)
 * - Terms acceptance
 * - Submission for admin verification
 * - Redirects if user already has a company
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

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from "../../../../api/supabase-client";
import {
  Globe,
  ArrowLeft,
  Building2,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
  FileText,
  Image,
  Mail,
  MapPin,
  Link as LinkIcon,
  Users,
  Briefcase,
  Shield,
  Check
} from 'lucide-react';


/* ============================================================================
   CONSTANTS
   ============================================================================ */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Industry options
 */
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

/**
 * Company size options
 */
const COMPANY_SIZES = [
  { id: '1-10', label_en: '1-10 employees', label_ko: '1-10명' },
  { id: '11-50', label_en: '11-50 employees', label_ko: '11-50명' },
  { id: '51-200', label_en: '51-200 employees', label_ko: '51-200명' },
  { id: '200+', label_en: '200+ employees', label_ko: '200명 이상' }
];

/**
 * Labels for form fields
 */
const LABELS = {
  pageTitle: { en: 'Register Your Company', ko: '회사 등록' },
  pageSubtitle: { en: 'Register as an employer to post job listings on Keasy', ko: 'Keasy에 채용공고를 등록하려면 회사를 등록하세요' },
  companyInfo: { en: 'Company Information', ko: '회사 정보' },
  companyNameEn: { en: 'Company Name (English)', ko: '회사명 (영문)' },
  companyNameEnPlaceholder: { en: 'e.g., Keasy Inc.', ko: '예: Keasy Inc.' },
  companyNameKo: { en: 'Company Name (Korean) - Optional', ko: '회사명 (한글) - 선택사항' },
  companyNameKoPlaceholder: { en: 'e.g., 키지 주식회사', ko: '예: 키지 주식회사' },
  description: { en: 'Company Description', ko: '회사 소개' },
  descriptionPlaceholder: { en: 'Tell us about your company, what you do, and your mission...', ko: '회사 소개, 사업 내용, 미션 등을 알려주세요...' },
  industry: { en: 'Industry', ko: '산업' },
  selectIndustry: { en: 'Select industry', ko: '산업 선택' },
  companySize: { en: 'Company Size', ko: '회사 규모' },
  selectSize: { en: 'Select size', ko: '규모 선택' },
  contactInfo: { en: 'Contact Information', ko: '연락처 정보' },
  website: { en: 'Website (Optional)', ko: '웹사이트 (선택사항)' },
  websitePlaceholder: { en: 'https://www.example.com', ko: 'https://www.example.com' },
  email: { en: 'Contact Email', ko: '연락 이메일' },
  emailPlaceholder: { en: 'hr@company.com', ko: 'hr@company.com' },
  address: { en: 'Address (Optional)', ko: '주소 (선택사항)' },
  addressPlaceholder: { en: 'e.g., Seoul, Gangnam-gu', ko: '예: 서울시 강남구' },
  logo: { en: 'Company Logo', ko: '회사 로고' },
  logoDesc: { en: 'Upload your company logo (Required)', ko: '회사 로고를 업로드하세요 (필수)' },
  logoHint: { en: 'Square image recommended (PNG, JPG, max 10MB)', ko: '정사각형 이미지 권장 (PNG, JPG, 최대 10MB)' },
  documents: { en: 'Verification Documents', ko: '인증 서류' },
  documentsDesc: { en: 'Upload documents for company verification', ko: '회사 인증을 위한 서류를 업로드하세요' },
  businessReg: { en: 'Business Registration Certificate', ko: '사업자등록증' },
  businessRegDesc: { en: 'Upload your business registration certificate (Required)', ko: '사업자등록증을 업로드하세요 (필수)' },
  employerId: { en: 'Employer ID / ARC Card', ko: '대표자 신분증 / 외국인등록증' },
  employerIdDesc: { en: 'Upload employer ID card or ARC (Required)', ko: '대표자 신분증 또는 외국인등록증을 업로드하세요 (필수)' },
  terms: { en: 'Terms & Agreement', ko: '약관 동의' },
  termsAgree: { en: 'I agree to the following:', ko: '다음 사항에 동의합니다:' },
  termsAccurate: { en: 'All information provided is accurate and up-to-date', ko: '제공한 모든 정보가 정확하고 최신입니다' },
  termsAuthorized: { en: 'I am authorized to register this company', ko: '이 회사를 등록할 권한이 있습니다' },
  termsCompliance: { en: 'I agree to comply with Keasy\'s terms of service', ko: 'Keasy 서비스 약관을 준수하는 데 동의합니다' },
  termsPrivacy: { en: 'I consent to the processing of uploaded documents for verification', ko: '인증을 위한 업로드된 서류의 처리에 동의합니다' },
  submit: { en: 'Submit for Verification', ko: '인증 요청' },
  submitting: { en: 'Submitting...', ko: '제출 중...' },
  cancel: { en: 'Cancel', ko: '취소' },
  required: { en: 'Required', ko: '필수' },
  optional: { en: 'Optional', ko: '선택' },
  verificationNotice: { en: 'Your company will be verified by Keasy within 1-2 business days. You\'ll receive a notification once approved.', ko: '회사 인증은 1-2 영업일 내에 완료됩니다. 승인되면 알림을 받게 됩니다.' },
  alreadyRegistered: { en: 'You already have a registered company', ko: '이미 등록된 회사가 있습니다' },
  pendingVerification: { en: 'Your company is pending verification', ko: '회사 인증 대기 중입니다' },
  verified: { en: 'Your company is verified!', ko: '회사가 인증되었습니다!' },
  viewCompany: { en: 'View Company Profile', ko: '회사 프로필 보기' },
  postJob: { en: 'Post a Job', ko: '채용공고 등록' },
  validationError: { en: 'Please fill in all required fields', ko: '모든 필수 항목을 입력해주세요' },
  loginRequired: { en: 'Please sign in to register a company', ko: '회사를 등록하려면 로그인하세요' }
};


/* ============================================================================
   HELPER COMPONENTS
   ============================================================================ */

const FormSection = ({ title, description, icon: Icon, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
    <div className="flex items-start gap-3 mb-4">
      {Icon && (
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
      )}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
    {children}
  </div>
);

const FormField = ({ label, required, optional, error, children, hint }) => (
  <div className="mb-4 last:mb-0">
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
      {optional && <span className="text-gray-400 ml-1 font-normal">(optional)</span>}
    </label>
    {children}
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const FileUploadBox = ({ 
  label, 
  description, 
  file, 
  preview, 
  onSelect, 
  onRemove, 
  accept, 
  error,
  isImage = false,
  lang 
}) => (
  <div className="mb-4 last:mb-0">
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} <span className="text-red-500">*</span>
    </label>
    <p className="text-xs text-gray-500 mb-2">{description}</p>
    
    {preview || file ? (
      <div className="relative">
        {isImage && preview ? (
          <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="flex-1 text-sm text-green-700 truncate">{file?.name}</span>
            <button
              type="button"
              onClick={onRemove}
              className="p-1 text-red-500 hover:bg-red-50 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    ) : (
      <label className={`
        block w-full p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
        ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
      `}>
        <Upload className={`w-8 h-8 mx-auto mb-2 ${error ? 'text-red-400' : 'text-gray-400'}`} />
        <p className="text-sm font-medium text-gray-700">
          {lang === 'ko' ? '파일 업로드' : 'Upload File'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {isImage ? 'PNG, JPG (max 10MB)' : 'PDF, JPG, PNG (max 10MB)'}
        </p>
        <input
          type="file"
          accept={accept}
          onChange={onSelect}
          className="hidden"
        />
      </label>
    )}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);


/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */

const CompanyRegister = () => {
  const navigate = useNavigate();

  // ============================================================================
  // STATE
  // ============================================================================

  const [user, setUser] = useState(null);
  const [existingCompany, setExistingCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const [lang, setLang] = useState('en');
  const [formData, setFormData] = useState({
    nameEn: '',
    nameKo: '',
    description: '',
    industry: '',
    companySize: '',
    website: '',
    email: '',
    address: ''
  });

  // File uploads
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [businessReg, setBusinessReg] = useState(null);
  const [employerId, setEmployerId] = useState(null);

  // Terms
  const [termsAccepted, setTermsAccepted] = useState({
    accurate: false,
    authorized: false,
    compliance: false,
    privacy: false
  });

  // UI State
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);


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
    const checkAuth = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          navigate('/signin');
          return;
        }

        setUser(currentUser);

        // Check if user already has a company
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('created_by', currentUser.id)
          .single();

        setExistingCompany(companyData || null);
        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        navigate('/signin');
      }
    };

    checkAuth();
  }, [navigate]);


  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const handleLogoSelect = useCallback((e) => {
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

    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
    if (errors.logo) {
      setErrors(prev => ({ ...prev, logo: null }));
    }
  }, [lang, errors]);

  const handleLogoRemove = useCallback(() => {
    setLogo(null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
  }, [logoPreview]);

  const handleFileSelect = useCallback((setter, errorKey) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert(lang === 'ko' ? '파일 크기는 10MB 이하여야 합니다' : 'File size must be under 10MB');
      return;
    }

    setter(file);
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: null }));
    }
  }, [lang, errors]);

  const handleTermsChange = useCallback((key) => {
    setTermsAccepted(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);


  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.nameEn.trim()) {
      newErrors.nameEn = lang === 'ko' ? '회사명(영문)을 입력해주세요' : 'Company name (English) is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = lang === 'ko' ? '회사 소개를 입력해주세요' : 'Company description is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = lang === 'ko' ? '연락 이메일을 입력해주세요' : 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = lang === 'ko' ? '올바른 이메일 형식이 아닙니다' : 'Invalid email format';
    }

    if (!logo) {
      newErrors.logo = lang === 'ko' ? '로고를 업로드해주세요' : 'Company logo is required';
    }

    if (!businessReg) {
      newErrors.businessReg = lang === 'ko' ? '사업자등록증을 업로드해주세요' : 'Business registration certificate is required';
    }

    if (!employerId) {
      newErrors.employerId = lang === 'ko' ? '신분증을 업로드해주세요' : 'Employer ID is required';
    }

    // Check all terms accepted
    const allTermsAccepted = Object.values(termsAccepted).every(v => v);
    if (!allTermsAccepted) {
      newErrors.terms = lang === 'ko' ? '모든 약관에 동의해주세요' : 'Please agree to all terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, logo, businessReg, employerId, termsAccepted, lang]);


  // ============================================================================
  // SUBMISSION
  // ============================================================================

  const uploadFile = async (file, folder) => {
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileName = `${user.id}/${folder}/${timestamp}_${randomStr}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('jobs')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('jobs')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitError(t('validationError'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Upload files
      const logoUrl = await uploadFile(logo, 'logos');
      const businessRegUrl = await uploadFile(businessReg, 'documents');
      const employerIdUrl = await uploadFile(employerId, 'documents');

      // Create company record
      const companyData = {
        created_by: user.id,
        name_en: formData.nameEn.trim(),
        name_ko: formData.nameKo.trim() || null,
        description: formData.description.trim(),
        industry: formData.industry || null,
        company_size: formData.companySize || null,
        website: formData.website.trim() || null,
        contact_email: formData.email.trim(),
        address: formData.address.trim() || null,
        logo_url: logoUrl,
        business_registration_url: businessRegUrl,
        employer_id_card_url: employerIdUrl,
        verified: false
      };

      const { data: newCompany, error: insertError } = await supabase
        .from('companies')
        .insert(companyData)
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Navigate to company profile or jobs page
      navigate('/company/profile');
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
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
  // RENDER: Existing Company State
  // ============================================================================

  if (existingCompany) {
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
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Globe className="w-4 h-4" />
              {lang === 'ko' ? 'English' : '한국어'}
            </button>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-16">
          <div className="text-center">
            {/* Company Logo */}
            {existingCompany.logo_url && (
              <img
                src={existingCompany.logo_url}
                alt={existingCompany.name_en}
                className="w-24 h-24 rounded-2xl object-cover mx-auto mb-6 border border-gray-200"
              />
            )}

            {/* Status */}
            <div className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4
              ${existingCompany.verified 
                ? 'bg-green-100 text-green-700' 
                : 'bg-amber-100 text-amber-700'
              }
            `}>
              {existingCompany.verified ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {t('verified')}
                </>
              ) : (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('pendingVerification')}
                </>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {existingCompany.name_en}
            </h1>
            {existingCompany.name_ko && (
              <p className="text-gray-500 mb-6">{existingCompany.name_ko}</p>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/company/profile"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                <Building2 className="w-5 h-5" />
                {t('viewCompany')}
              </Link>
              {existingCompany.verified && (
                <Link
                  to="/jobs/new"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Briefcase className="w-5 h-5" />
                  {t('postJob')}
                </Link>
              )}
            </div>

            {!existingCompany.verified && (
              <p className="mt-6 text-sm text-gray-500">
                {t('verificationNotice')}
              </p>
            )}
          </div>
        </main>
      </div>
    );
  }


  // ============================================================================
  // RENDER: Registration Form
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/jobs"
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('pageTitle')}</h1>
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
      </header>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <form onSubmit={handleSubmit}>
          {/* Error Banner */}
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">
                  {lang === 'ko' ? '오류가 발생했습니다' : 'An error occurred'}
                </p>
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            </div>
          )}

          {/* Verification Notice */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">{t('verificationNotice')}</p>
          </div>

          {/* ================================================================
              COMPANY INFORMATION
              ================================================================ */}
          <FormSection 
            title={t('companyInfo')} 
            icon={Building2}
          >
            <FormField label={t('companyNameEn')} required error={errors.nameEn}>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => handleChange('nameEn', e.target.value)}
                placeholder={t('companyNameEnPlaceholder')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.nameEn ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </FormField>

            <FormField label={t('companyNameKo')} optional>
              <input
                type="text"
                value={formData.nameKo}
                onChange={(e) => handleChange('nameKo', e.target.value)}
                placeholder={t('companyNameKoPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </FormField>

            <FormField label={t('description')} required error={errors.description}>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={t('industry')} optional>
                <select
                  value={formData.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('selectIndustry')}</option>
                  {INDUSTRIES.map(ind => (
                    <option key={ind.id} value={ind.id}>
                      {lang === 'ko' ? ind.label_ko : ind.label_en}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label={t('companySize')} optional>
                <select
                  value={formData.companySize}
                  onChange={(e) => handleChange('companySize', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('selectSize')}</option>
                  {COMPANY_SIZES.map(size => (
                    <option key={size.id} value={size.id}>
                      {lang === 'ko' ? size.label_ko : size.label_en}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </FormSection>

          {/* ================================================================
              CONTACT INFORMATION
              ================================================================ */}
          <FormSection 
            title={t('contactInfo')} 
            icon={Mail}
          >
            <FormField label={t('email')} required error={errors.email}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
            </FormField>

            <FormField label={t('website')} optional>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder={t('websitePlaceholder')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </FormField>

            <FormField label={t('address')} optional>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder={t('addressPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </FormField>
          </FormSection>

          {/* ================================================================
              COMPANY LOGO
              ================================================================ */}
          <FormSection 
            title={t('logo')} 
            description={t('logoDesc')}
            icon={Image}
          >
            <FileUploadBox
              label={t('logo')}
              description={t('logoHint')}
              file={logo}
              preview={logoPreview}
              onSelect={handleLogoSelect}
              onRemove={handleLogoRemove}
              accept="image/*"
              error={errors.logo}
              isImage={true}
              lang={lang}
            />
          </FormSection>

          {/* ================================================================
              VERIFICATION DOCUMENTS
              ================================================================ */}
          <FormSection 
            title={t('documents')} 
            description={t('documentsDesc')}
            icon={Shield}
          >
            <FileUploadBox
              label={t('businessReg')}
              description={t('businessRegDesc')}
              file={businessReg}
              onSelect={handleFileSelect(setBusinessReg, 'businessReg')}
              onRemove={() => setBusinessReg(null)}
              accept=".pdf,.jpg,.jpeg,.png"
              error={errors.businessReg}
              lang={lang}
            />

            <FileUploadBox
              label={t('employerId')}
              description={t('employerIdDesc')}
              file={employerId}
              onSelect={handleFileSelect(setEmployerId, 'employerId')}
              onRemove={() => setEmployerId(null)}
              accept=".pdf,.jpg,.jpeg,.png"
              error={errors.employerId}
              lang={lang}
            />
          </FormSection>

          {/* ================================================================
              TERMS & AGREEMENT
              ================================================================ */}
          <FormSection 
            title={t('terms')} 
            icon={FileText}
          >
            <p className="text-sm text-gray-600 mb-4">{t('termsAgree')}</p>
            
            {errors.terms && (
              <p className="text-sm text-red-500 mb-3">{errors.terms}</p>
            )}

            <div className="space-y-3">
              {[
                { key: 'accurate', label: t('termsAccurate') },
                { key: 'authorized', label: t('termsAuthorized') },
                { key: 'compliance', label: t('termsCompliance') },
                { key: 'privacy', label: t('termsPrivacy') }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-start gap-3 cursor-pointer group">
                  <div className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
                    ${termsAccepted[key] 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-gray-300 group-hover:border-gray-400'
                    }
                  `}>
                    {termsAccepted[key] && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={termsAccepted[key]}
                    onChange={() => handleTermsChange(key)}
                    className="sr-only"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </FormSection>

          {/* ================================================================
              SUBMIT BUTTONS
              ================================================================ */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('submitting')}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {t('submit')}
                </>
              )}
            </button>
            <Link
              to="/jobs"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              {t('cancel')}
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CompanyRegister;
