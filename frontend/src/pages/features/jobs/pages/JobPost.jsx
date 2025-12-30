/**
 * @file JobPost.jsx
 * @description Job creation form for employers to post new job listings.
 * 
 * Features:
 * - EN/KO interface language toggle (labels change, content stays as typed)
 * - All job fields with validation
 * - Language requirements selector (add multiple languages with levels)
 * - Salary input with type selector (hourly/monthly/yearly/negotiable)
 * - Multiple contact methods
 * - File upload (max 5 files, supports PDF, DOC, DOCX, HWP, images)
 * - Cover image upload
 * - Skills/tags input
 * - Category selection
 * - Deadline date picker
 * - Form validation before submit
 * - Requires verified company
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
import {
  Globe,
  ArrowLeft,
  Save,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  GraduationCap,
  Languages,
  FileText,
  Image,
  X,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Upload,
  Loader2,
  Info
} from 'lucide-react';
import {
  MdOutlineEmail,
  MdOutlinePhone,
  MdWhatsapp
} from 'react-icons/md';
import {
  FaInstagram,
  FaFacebook,
  FaGlobe
} from 'react-icons/fa';

import {
  JOB_TYPES,
  LOCATION_TYPES,
  EXPERIENCE_LEVELS,
  LANGUAGE_LEVELS,
  SALARY_TYPES
} from '../components/jobsUtils';


/* ============================================================================
   CONSTANTS
   ============================================================================ */

/**
 * Maximum number of files allowed per job posting
 */
const MAX_FILES = 5;

/**
 * Maximum file size in bytes (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Allowed file types for attachments
 */
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/x-hwp',
  'application/haansofthwp',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

/**
 * Allowed file extensions
 */
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'hwp', 'jpg', 'jpeg', 'png', 'gif', 'webp'];

/**
 * Labels for form fields in both languages
 */
const LABELS = {
  pageTitle: { en: 'Post a New Job', ko: '새 채용공고 등록' },
  basicInfo: { en: 'Basic Information', ko: '기본 정보' },
  jobTitle: { en: 'Job Title', ko: '채용 제목' },
  jobTitlePlaceholder: { en: 'e.g., Full Stack Developer', ko: '예: 풀스택 개발자' },
  category: { en: 'Category', ko: '카테고리' },
  selectCategory: { en: 'Select a category', ko: '카테고리 선택' },
  jobType: { en: 'Job Type', ko: '고용 형태' },
  selectJobType: { en: 'Select job type', ko: '고용 형태 선택' },
  locationInfo: { en: 'Location', ko: '위치 정보' },
  locationType: { en: 'Work Type', ko: '근무 형태' },
  selectLocationType: { en: 'Select work type', ko: '근무 형태 선택' },
  location: { en: 'Location / Address', ko: '위치 / 주소' },
  locationPlaceholder: { en: 'e.g., Seoul, Gangnam-gu', ko: '예: 서울시 강남구' },
  mapLink: { en: 'Map Link (Optional)', ko: '지도 링크 (선택사항)' },
  mapLinkPlaceholder: { en: 'Paste Naver/Kakao/Google Maps link', ko: '네이버/카카오/구글 지도 링크 붙여넣기' },
  salaryInfo: { en: 'Salary Information', ko: '급여 정보' },
  salaryType: { en: 'Salary Type', ko: '급여 유형' },
  salaryMin: { en: 'Minimum', ko: '최소' },
  salaryMax: { en: 'Maximum', ko: '최대' },
  experienceLevel: { en: 'Experience Level', ko: '경력' },
  selectExperience: { en: 'Select experience level', ko: '경력 선택' },
  requiredLanguages: { en: 'Required Languages', ko: '필요 언어' },
  addLanguage: { en: 'Add Language', ko: '언어 추가' },
  selectLanguage: { en: 'Select language', ko: '언어 선택' },
  selectLevel: { en: 'Select level', ko: '수준 선택' },
  jobDescription: { en: 'Job Description', ko: '상세 내용' },
  descriptionPlaceholder: { en: 'Describe the role, responsibilities, and requirements...', ko: '역할, 책임, 요구사항 등을 설명해주세요...' },
  skills: { en: 'Required Skills (Optional)', ko: '필요 스킬 (선택사항)' },
  skillsPlaceholder: { en: 'Type a skill and press Enter', ko: '스킬을 입력하고 Enter를 누르세요' },
  contactInfo: { en: 'Contact Information', ko: '연락처 정보' },
  contactInfoDesc: { en: 'Provide at least one contact method', ko: '최소 하나의 연락 방법을 입력해주세요' },
  email: { en: 'Email', ko: '이메일' },
  phone: { en: 'Phone', ko: '전화번호' },
  whatsapp: { en: 'WhatsApp', ko: '왓츠앱' },
  instagram: { en: 'Instagram', ko: '인스타그램' },
  facebook: { en: 'Facebook', ko: '페이스북' },
  website: { en: 'Website', ko: '웹사이트' },
  deadline: { en: 'Application Deadline (Optional)', ko: '마감일 (선택사항)' },
  coverImage: { en: 'Cover Image (Optional)', ko: '커버 이미지 (선택사항)' },
  coverImageDesc: { en: 'Upload an image or poster for your job listing', ko: '채용공고에 사용할 이미지나 포스터를 업로드하세요' },
  attachments: { en: 'Attachments (Optional)', ko: '첨부 파일 (선택사항)' },
  attachmentsDesc: { en: 'Upload up to 5 files (PDF, DOC, DOCX, HWP, images)', ko: '최대 5개 파일 업로드 가능 (PDF, DOC, DOCX, HWP, 이미지)' },
  uploadFiles: { en: 'Upload Files', ko: '파일 업로드' },
  dragDrop: { en: 'or drag and drop', ko: '또는 드래그 앤 드롭' },
  submit: { en: 'Submit for Review', ko: '검토 요청' },
  submitting: { en: 'Submitting...', ko: '제출 중...' },
  cancel: { en: 'Cancel', ko: '취소' },
  required: { en: 'Required', ko: '필수' },
  optional: { en: 'Optional', ko: '선택' },
  reviewNotice: { en: 'Your job posting will be reviewed by Keasy before it goes live.', ko: '채용공고는 Keasy의 검토 후 게시됩니다.' },
  validationError: { en: 'Please fill in all required fields', ko: '모든 필수 항목을 입력해주세요' },
  noCompany: { en: 'You need a verified company to post jobs', ko: '채용공고를 등록하려면 인증된 회사가 필요합니다' },
  registerCompany: { en: 'Register Company', ko: '회사 등록' }
};


/* ============================================================================
   HELPER COMPONENTS
   ============================================================================ */

/**
 * Form section wrapper with title
 */
const FormSection = ({ title, children, icon: Icon }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
      {Icon && <Icon className="w-5 h-5 text-gray-500" />}
      {title}
    </h2>
    {children}
  </div>
);

/**
 * Form field wrapper with label
 */
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


/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */

/**
 * JobPost Component
 * 
 * Form for creating new job postings.
 * Only accessible to users with verified companies.
 * 
 * @component
 * @returns {JSX.Element} The job posting form
 */
const JobPost = () => {
  const navigate = useNavigate();

  // ============================================================================
  // STATE
  // ============================================================================

  // Auth & Company
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Reference Data
  const [categories, setCategories] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);

  // Form State
  const [lang, setLang] = useState('en'); // Interface language
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    jobType: '',
    locationType: '',
    location: '',
    locationMapLink: '',
    salaryType: 'negotiable',
    salaryMin: '',
    salaryMax: '',
    experienceLevel: '',
    description: '',
    skills: [],
    requiredLanguages: [],
    contactEmail: '',
    contactPhone: '',
    contactWhatsapp: '',
    contactInstagram: '',
    contactFacebook: '',
    contactWebsite: '',
    deadline: ''
  });

  // Skills input
  const [skillInput, setSkillInput] = useState('');

  // File uploads
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [attachments, setAttachments] = useState([]);

  // UI State
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);


  // ============================================================================
  // LABELS HELPER
  // ============================================================================

  /**
   * Get label in current language
   */
  const t = useCallback((key) => {
    return LABELS[key]?.[lang] || LABELS[key]?.en || key;
  }, [lang]);


  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  /**
   * Fetch user and company
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/signin');
          return;
        }

        setUser(user);

        // Fetch user's company
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('created_by', user.id)
          .single();

        if (companyError && companyError.code !== 'PGRST116') {
          console.error('Error fetching company:', companyError);
        }

        setCompany(companyData || null);
        setAuthLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        navigate('/signin');
      }
    };

    checkAuth();
  }, [navigate]);

  /**
   * Fetch categories
   */
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('job_category')
        .select('*')
        .order('sort_order');

      if (!error) {
        setCategories(data || []);
      }
    };

    fetchCategories();
  }, []);

  /**
   * Fetch languages
   */
  useEffect(() => {
    const fetchLanguages = async () => {
      const { data, error } = await supabase
        .from('job_language')
        .select('*')
        .order('sort_order');

      if (!error) {
        setLanguageOptions(data || []);
      }
    };

    fetchLanguages();
  }, []);


  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  /**
   * Handle form field change
   */
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  /**
   * Handle adding a skill
   */
  const handleAddSkill = useCallback((e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      const skill = skillInput.trim();
      if (!formData.skills.includes(skill)) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, skill]
        }));
      }
      setSkillInput('');
    }
  }, [skillInput, formData.skills]);

  /**
   * Handle removing a skill
   */
  const handleRemoveSkill = useCallback((skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  }, []);

  /**
   * Handle adding a language requirement
   */
  const handleAddLanguage = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      requiredLanguages: [
        ...prev.requiredLanguages,
        { language: '', level: '' }
      ]
    }));
  }, []);

  /**
   * Handle updating a language requirement
   */
  const handleUpdateLanguage = useCallback((index, field, value) => {
    setFormData(prev => ({
      ...prev,
      requiredLanguages: prev.requiredLanguages.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  }, []);

  /**
   * Handle removing a language requirement
   */
  const handleRemoveLanguage = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      requiredLanguages: prev.requiredLanguages.filter((_, i) => i !== index)
    }));
  }, []);

  /**
   * Handle cover image selection
   */
  const handleCoverImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(lang === 'ko' ? '이미지 파일만 업로드 가능합니다' : 'Only image files are allowed');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert(lang === 'ko' ? '파일 크기는 10MB 이하여야 합니다' : 'File size must be under 10MB');
      return;
    }

    setCoverImage(file);
    setCoverImagePreview(URL.createObjectURL(file));
  }, [lang]);

  /**
   * Handle removing cover image
   */
  const handleRemoveCoverImage = useCallback(() => {
    setCoverImage(null);
    if (coverImagePreview) {
      URL.revokeObjectURL(coverImagePreview);
    }
    setCoverImagePreview(null);
  }, [coverImagePreview]);

  /**
   * Handle attachment selection
   */
  const handleAttachmentChange = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    
    // Check max files
    if (attachments.length + files.length > MAX_FILES) {
      alert(lang === 'ko' 
        ? `최대 ${MAX_FILES}개의 파일만 업로드 가능합니다` 
        : `Maximum ${MAX_FILES} files allowed`
      );
      return;
    }

    // Validate each file
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        alert(lang === 'ko'
          ? `${file.name}: 지원하지 않는 파일 형식입니다`
          : `${file.name}: File type not supported`
        );
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        alert(lang === 'ko'
          ? `${file.name}: 파일 크기는 10MB 이하여야 합니다`
          : `${file.name}: File size must be under 10MB`
        );
        return false;
      }

      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
  }, [attachments.length, lang]);

  /**
   * Handle removing an attachment
   */
  const handleRemoveAttachment = useCallback((index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);


  // ============================================================================
  // VALIDATION
  // ============================================================================

  /**
   * Validate form before submission
   */
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = lang === 'ko' ? '제목을 입력해주세요' : 'Title is required';
    }

    if (!formData.category) {
      newErrors.category = lang === 'ko' ? '카테고리를 선택해주세요' : 'Category is required';
    }

    if (!formData.jobType) {
      newErrors.jobType = lang === 'ko' ? '고용 형태를 선택해주세요' : 'Job type is required';
    }

    if (!formData.locationType) {
      newErrors.locationType = lang === 'ko' ? '근무 형태를 선택해주세요' : 'Location type is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = lang === 'ko' ? '위치를 입력해주세요' : 'Location is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = lang === 'ko' ? '상세 내용을 입력해주세요' : 'Description is required';
    }

    // Validate required languages
    if (formData.requiredLanguages.length === 0) {
      newErrors.requiredLanguages = lang === 'ko' ? '최소 하나의 언어를 추가해주세요' : 'At least one language is required';
    } else {
      const invalidLang = formData.requiredLanguages.some(l => !l.language || !l.level);
      if (invalidLang) {
        newErrors.requiredLanguages = lang === 'ko' ? '모든 언어 정보를 입력해주세요' : 'Please complete all language requirements';
      }
    }

    // Validate at least one contact method
    const hasContact = formData.contactEmail || formData.contactPhone || 
                       formData.contactWhatsapp || formData.contactInstagram || 
                       formData.contactFacebook || formData.contactWebsite;
    if (!hasContact) {
      newErrors.contact = lang === 'ko' ? '최소 하나의 연락 방법을 입력해주세요' : 'At least one contact method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, lang]);


  // ============================================================================
  // SUBMISSION
  // ============================================================================

  /**
   * Upload a file to Supabase storage
   */
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
      throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('jobs')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  /**
   * Handle form submission
   */
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
      // Upload cover image if provided
      let coverImageUrl = null;
      if (coverImage) {
        coverImageUrl = await uploadFile(coverImage, 'covers');
      }

      // Upload attachments
      const fileUrls = [];
      for (const file of attachments) {
        const url = await uploadFile(file, 'attachments');
        fileUrls.push({
          url,
          name: file.name,
          type: file.type
        });
      }

      // Prepare job data
      const jobData = {
        company_id: company.id,
        created_by: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        job_type: formData.jobType,
        location_type: formData.locationType,
        location: formData.location.trim(),
        location_map_link: formData.locationMapLink.trim() || null,
        salary_type: formData.salaryType,
        salary_min: formData.salaryMin ? parseInt(formData.salaryMin, 10) : null,
        salary_max: formData.salaryMax ? parseInt(formData.salaryMax, 10) : null,
        experience_level: formData.experienceLevel || null,
        skills: formData.skills.length > 0 ? formData.skills : null,
        required_languages: formData.requiredLanguages,
        contact_email: formData.contactEmail.trim() || null,
        contact_phone: formData.contactPhone.trim() || null,
        contact_whatsapp: formData.contactWhatsapp.trim() || null,
        contact_instagram: formData.contactInstagram.trim() || null,
        contact_facebook: formData.contactFacebook.trim() || null,
        contact_website: formData.contactWebsite.trim() || null,
        deadline: formData.deadline || null,
        img_url: coverImageUrl,
        files: fileUrls.length > 0 ? fileUrls : null,
        approved: false,
        view: 0
      };

      // Insert job
      const { data: newJob, error: insertError } = await supabase
        .from('job')
        .insert(jobData)
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Navigate to the job detail page
      navigate(`/jobs/job/${newJob.id}`);
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

  if (authLoading) {
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

  if (!company || !company.verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('noCompany')}
          </h1>
          <p className="text-gray-600 mb-6">
            {lang === 'ko'
              ? '채용공고를 등록하려면 먼저 회사를 등록하고 인증을 받아야 합니다.'
              : 'You need to register and verify your company before posting jobs.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/company/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Briefcase className="w-5 h-5" />
              {t('registerCompany')}
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('cancel')}
            </Link>
          </div>
        </div>
      </div>
    );
  }


  // ============================================================================
  // RENDER: Main Form
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
            <h1 className="text-xl font-bold text-gray-900">
              {t('pageTitle')}
            </h1>
          </div>

          {/* Language Toggle */}
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

          {/* Review Notice */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">{t('reviewNotice')}</p>
          </div>

          {/* ================================================================
              BASIC INFORMATION
              ================================================================ */}
          <FormSection title={t('basicInfo')} icon={Briefcase}>
            {/* Job Title */}
            <FormField label={t('jobTitle')} required error={errors.title}>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder={t('jobTitlePlaceholder')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </FormField>

            {/* Category */}
            <FormField label={t('category')} required error={errors.category}>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">{t('selectCategory')}</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {lang === 'ko' ? cat.name_ko : cat.name_en}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Job Type */}
            <FormField label={t('jobType')} required error={errors.jobType}>
              <select
                value={formData.jobType}
                onChange={(e) => handleChange('jobType', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.jobType ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">{t('selectJobType')}</option>
                {JOB_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {lang === 'ko' ? type.label_ko : type.label_en}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Experience Level */}
            <FormField label={t('experienceLevel')} optional>
              <select
                value={formData.experienceLevel}
                onChange={(e) => handleChange('experienceLevel', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('selectExperience')}</option>
                {EXPERIENCE_LEVELS.map(level => (
                  <option key={level.id} value={level.id}>
                    {lang === 'ko' ? level.label_ko : level.label_en}
                  </option>
                ))}
              </select>
            </FormField>
          </FormSection>

          {/* ================================================================
              LOCATION
              ================================================================ */}
          <FormSection title={t('locationInfo')} icon={MapPin}>
            {/* Location Type */}
            <FormField label={t('locationType')} required error={errors.locationType}>
              <select
                value={formData.locationType}
                onChange={(e) => handleChange('locationType', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.locationType ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">{t('selectLocationType')}</option>
                {LOCATION_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {lang === 'ko' ? type.label_ko : type.label_en}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Location */}
            <FormField label={t('location')} required error={errors.location}>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder={t('locationPlaceholder')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </FormField>

            {/* Map Link */}
            <FormField label={t('mapLink')} optional>
              <input
                type="url"
                value={formData.locationMapLink}
                onChange={(e) => handleChange('locationMapLink', e.target.value)}
                placeholder={t('mapLinkPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </FormField>
          </FormSection>

          {/* ================================================================
              SALARY
              ================================================================ */}
          <FormSection title={t('salaryInfo')} icon={DollarSign}>
            {/* Salary Type */}
            <FormField label={t('salaryType')}>
              <div className="flex flex-wrap gap-2">
                {SALARY_TYPES.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleChange('salaryType', type.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      formData.salaryType === type.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {lang === 'ko' ? type.label_ko : type.label_en}
                  </button>
                ))}
              </div>
            </FormField>

            {/* Salary Range (hidden if negotiable) */}
            {formData.salaryType !== 'negotiable' && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField label={t('salaryMin')} optional>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₩</span>
                    <input
                      type="number"
                      value={formData.salaryMin}
                      onChange={(e) => handleChange('salaryMin', e.target.value)}
                      placeholder="0"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </FormField>
                <FormField label={t('salaryMax')} optional>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₩</span>
                    <input
                      type="number"
                      value={formData.salaryMax}
                      onChange={(e) => handleChange('salaryMax', e.target.value)}
                      placeholder="0"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </FormField>
              </div>
            )}
          </FormSection>

          {/* ================================================================
              REQUIRED LANGUAGES
              ================================================================ */}
          <FormSection title={t('requiredLanguages')} icon={Languages}>
            {errors.requiredLanguages && (
              <p className="text-sm text-red-500 mb-3">{errors.requiredLanguages}</p>
            )}

            {/* Language List */}
            <div className="space-y-3 mb-4">
              {formData.requiredLanguages.map((reqLang, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <select
                    value={reqLang.language}
                    onChange={(e) => handleUpdateLanguage(index, 'language', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('selectLanguage')}</option>
                    {languageOptions.map(langOpt => (
                      <option key={langOpt.id} value={langOpt.id}>
                        {langOpt.flag_emoji} {lang === 'ko' ? langOpt.name_ko : langOpt.name_en}
                      </option>
                    ))}
                  </select>
                  <select
                    value={reqLang.level}
                    onChange={(e) => handleUpdateLanguage(index, 'level', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('selectLevel')}</option>
                    {LANGUAGE_LEVELS.map(level => (
                      <option key={level.id} value={level.id}>
                        {lang === 'ko' ? level.label_ko : level.label_en}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Language Button */}
            <button
              type="button"
              onClick={handleAddLanguage}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('addLanguage')}
            </button>
          </FormSection>

          {/* ================================================================
              JOB DESCRIPTION
              ================================================================ */}
          <FormSection title={t('jobDescription')} icon={FileText}>
            <FormField label={t('jobDescription')} required error={errors.description}>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                rows={8}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </FormField>

            {/* Skills */}
            <FormField label={t('skills')} optional hint={t('skillsPlaceholder')}>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="p-0.5 hover:bg-blue-100 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder={lang === 'ko' ? '스킬 입력...' : 'Enter a skill...'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </FormField>
          </FormSection>

          {/* ================================================================
              CONTACT INFORMATION
              ================================================================ */}
          <FormSection title={t('contactInfo')} icon={MdOutlineEmail}>
            <p className="text-sm text-gray-500 mb-4">{t('contactInfoDesc')}</p>
            {errors.contact && (
              <p className="text-sm text-red-500 mb-3">{errors.contact}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <FormField label={t('email')} optional>
                <div className="relative">
                  <MdOutlineEmail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </FormField>

              {/* Phone */}
              <FormField label={t('phone')} optional>
                <div className="relative">
                  <MdOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                    placeholder="010-1234-5678"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </FormField>

              {/* WhatsApp */}
              <FormField label={t('whatsapp')} optional>
                <div className="relative">
                  <MdWhatsapp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.contactWhatsapp}
                    onChange={(e) => handleChange('contactWhatsapp', e.target.value)}
                    placeholder="+82 10-1234-5678"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </FormField>

              {/* Instagram */}
              <FormField label={t('instagram')} optional>
                <div className="relative">
                  <FaInstagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.contactInstagram}
                    onChange={(e) => handleChange('contactInstagram', e.target.value)}
                    placeholder="@username"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </FormField>

              {/* Facebook */}
              <FormField label={t('facebook')} optional>
                <div className="relative">
                  <FaFacebook className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.contactFacebook}
                    onChange={(e) => handleChange('contactFacebook', e.target.value)}
                    placeholder="facebook.com/page"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </FormField>

              {/* Website */}
              <FormField label={t('website')} optional>
                <div className="relative">
                  <FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.contactWebsite}
                    onChange={(e) => handleChange('contactWebsite', e.target.value)}
                    placeholder="https://example.com/careers"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </FormField>
            </div>
          </FormSection>

          {/* ================================================================
              DEADLINE
              ================================================================ */}
          <FormSection title={t('deadline')} icon={Clock}>
            <FormField label={t('deadline')} optional>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => handleChange('deadline', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </FormField>
          </FormSection>

          {/* ================================================================
              COVER IMAGE
              ================================================================ */}
          <FormSection title={t('coverImage')} icon={Image}>
            <p className="text-sm text-gray-500 mb-4">{t('coverImageDesc')}</p>

            {coverImagePreview ? (
              <div className="relative">
                <img
                  src={coverImagePreview}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveCoverImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">
                  {lang === 'ko' ? '이미지 업로드' : 'Upload Image'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF (max 10MB)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
              </label>
            )}
          </FormSection>

          {/* ================================================================
              ATTACHMENTS
              ================================================================ */}
          <FormSection title={t('attachments')} icon={FileText}>
            <p className="text-sm text-gray-500 mb-4">{t('attachmentsDesc')}</p>

            {/* Attachment List */}
            {attachments.length > 0 && (
              <div className="space-y-2 mb-4">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <span className="flex-1 text-sm text-gray-700 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {attachments.length < MAX_FILES && (
              <label className="block w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">{t('uploadFiles')}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'ko'
                    ? `${MAX_FILES - attachments.length}개 더 업로드 가능`
                    : `${MAX_FILES - attachments.length} more file(s) allowed`
                  }
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.hwp,.jpg,.jpeg,.png,.gif,.webp"
                  multiple
                  onChange={handleAttachmentChange}
                  className="hidden"
                />
              </label>
            )}
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
                  <Save className="w-5 h-5" />
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

export default JobPost;
