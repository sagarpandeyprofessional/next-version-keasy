/**
 * @file JobEdit.jsx
 * @description Job editing form for employers to update their existing job listings.
 * 
 * Features:
 * - Loads existing job data and pre-fills all fields
 * - EN/KO interface language toggle
 * - All job fields with validation
 * - Manage existing files (keep, remove)
 * - Add new files
 * - Owner-only access control
 * - Delete job option
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
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Info,
  AlertTriangle
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

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'hwp', 'jpg', 'jpeg', 'png', 'gif', 'webp'];

/**
 * Labels for form fields in both languages
 */
const LABELS = {
  pageTitle: { en: 'Edit Job', ko: '채용공고 수정' },
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
  existingFiles: { en: 'Existing Files', ko: '기존 파일' },
  newFiles: { en: 'Add New Files', ko: '새 파일 추가' },
  uploadFiles: { en: 'Upload Files', ko: '파일 업로드' },
  saveChanges: { en: 'Save Changes', ko: '변경사항 저장' },
  saving: { en: 'Saving...', ko: '저장 중...' },
  cancel: { en: 'Cancel', ko: '취소' },
  delete: { en: 'Delete Job', ko: '채용공고 삭제' },
  deleteConfirm: { en: 'Are you sure you want to delete this job? This action cannot be undone.', ko: '정말로 이 채용공고를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.' },
  deleting: { en: 'Deleting...', ko: '삭제 중...' },
  required: { en: 'Required', ko: '필수' },
  optional: { en: 'Optional', ko: '선택' },
  pendingReview: { en: 'Changes will require re-approval before going live.', ko: '변경사항은 다시 검토 후 게시됩니다.' },
  validationError: { en: 'Please fill in all required fields', ko: '모든 필수 항목을 입력해주세요' },
  notFound: { en: 'Job not found', ko: '채용공고를 찾을 수 없습니다' },
  notAuthorized: { en: 'You are not authorized to edit this job', ko: '이 채용공고를 수정할 권한이 없습니다' },
  backToJob: { en: 'Back to Job', ko: '채용공고로 돌아가기' }
};


/* ============================================================================
   HELPER COMPONENTS
   ============================================================================ */

const FormSection = ({ title, children, icon: Icon }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
      {Icon && <Icon className="w-5 h-5 text-gray-500" />}
      {title}
    </h2>
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

/**
 * Get filename from URL
 */
const getFileName = (url) => {
  if (!url) return 'File';
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  return decodeURIComponent(filename.split('?')[0]);
};


/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */

const JobEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ============================================================================
  // STATE
  // ============================================================================

  // Auth & Data
  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reference Data
  const [categories, setCategories] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);

  // Form State
  const [lang, setLang] = useState('en');
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

  // File management
  const [existingCoverImage, setExistingCoverImage] = useState(null);
  const [newCoverImage, setNewCoverImage] = useState(null);
  const [newCoverImagePreview, setNewCoverImagePreview] = useState(null);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);
  
  const [existingFiles, setExistingFiles] = useState([]);
  const [filesToRemove, setFilesToRemove] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  // UI State
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);


  // ============================================================================
  // LABELS HELPER
  // ============================================================================

  const t = useCallback((key) => {
    return LABELS[key]?.[lang] || LABELS[key]?.en || key;
  }, [lang]);


  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  /**
   * Fetch user, job, and company data
   */
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

        // Fetch job
        const { data: jobData, error: jobError } = await supabase
          .from('job')
          .select('*')
          .eq('id', id)
          .single();

        if (jobError) {
          setError(t('notFound'));
          setLoading(false);
          return;
        }

        // Check ownership
        if (jobData.created_by !== currentUser.id) {
          setError(t('notAuthorized'));
          setLoading(false);
          return;
        }

        setJob(jobData);

        // Fetch company
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('id', jobData.company_id)
          .single();

        setCompany(companyData);

        // Populate form data
        setFormData({
          title: jobData.title || '',
          category: jobData.category || '',
          jobType: jobData.job_type || '',
          locationType: jobData.location_type || '',
          location: jobData.location || '',
          locationMapLink: jobData.location_map_link || '',
          salaryType: jobData.salary_type || 'negotiable',
          salaryMin: jobData.salary_min?.toString() || '',
          salaryMax: jobData.salary_max?.toString() || '',
          experienceLevel: jobData.experience_level || '',
          description: jobData.description || '',
          skills: jobData.skills || [],
          requiredLanguages: jobData.required_languages || [],
          contactEmail: jobData.contact_email || '',
          contactPhone: jobData.contact_phone || '',
          contactWhatsapp: jobData.contact_whatsapp || '',
          contactInstagram: jobData.contact_instagram || '',
          contactFacebook: jobData.contact_facebook || '',
          contactWebsite: jobData.contact_website || '',
          deadline: jobData.deadline || ''
        });

        // Set existing files
        setExistingCoverImage(jobData.img_url || null);
        setExistingFiles(jobData.files || []);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  /**
   * Fetch categories
   */
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('job_category')
        .select('*')
        .order('sort_order');
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  /**
   * Fetch languages
   */
  useEffect(() => {
    const fetchLanguages = async () => {
      const { data } = await supabase
        .from('job_language')
        .select('*')
        .order('sort_order');
      setLanguageOptions(data || []);
    };
    fetchLanguages();
  }, []);


  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

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

  const handleRemoveSkill = useCallback((skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  }, []);

  const handleAddLanguage = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      requiredLanguages: [...prev.requiredLanguages, { language: '', level: '' }]
    }));
  }, []);

  const handleUpdateLanguage = useCallback((index, field, value) => {
    setFormData(prev => ({
      ...prev,
      requiredLanguages: prev.requiredLanguages.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  }, []);

  const handleRemoveLanguage = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      requiredLanguages: prev.requiredLanguages.filter((_, i) => i !== index)
    }));
  }, []);

  // Cover image handlers
  const handleNewCoverImage = useCallback((e) => {
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

    setNewCoverImage(file);
    setNewCoverImagePreview(URL.createObjectURL(file));
    setRemoveCoverImage(false);
  }, [lang]);

  const handleRemoveExistingCoverImage = useCallback(() => {
    setRemoveCoverImage(true);
    setExistingCoverImage(null);
  }, []);

  const handleRemoveNewCoverImage = useCallback(() => {
    setNewCoverImage(null);
    if (newCoverImagePreview) {
      URL.revokeObjectURL(newCoverImagePreview);
    }
    setNewCoverImagePreview(null);
  }, [newCoverImagePreview]);

  // Attachment handlers
  const handleRemoveExistingFile = useCallback((index) => {
    const fileToRemove = existingFiles[index];
    setFilesToRemove(prev => [...prev, fileToRemove]);
    setExistingFiles(prev => prev.filter((_, i) => i !== index));
  }, [existingFiles]);

  const handleNewFilesChange = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    const totalFiles = existingFiles.length + newFiles.length + files.length;
    
    if (totalFiles > MAX_FILES) {
      alert(lang === 'ko' 
        ? `최대 ${MAX_FILES}개의 파일만 업로드 가능합니다` 
        : `Maximum ${MAX_FILES} files allowed`
      );
      return;
    }

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

    setNewFiles(prev => [...prev, ...validFiles]);
  }, [existingFiles.length, newFiles.length, lang]);

  const handleRemoveNewFile = useCallback((index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  }, []);


  // ============================================================================
  // VALIDATION
  // ============================================================================

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

    if (formData.requiredLanguages.length === 0) {
      newErrors.requiredLanguages = lang === 'ko' ? '최소 하나의 언어를 추가해주세요' : 'At least one language is required';
    } else {
      const invalidLang = formData.requiredLanguages.some(l => !l.language || !l.level);
      if (invalidLang) {
        newErrors.requiredLanguages = lang === 'ko' ? '모든 언어 정보를 입력해주세요' : 'Please complete all language requirements';
      }
    }

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
      // Handle cover image
      let coverImageUrl = existingCoverImage;
      
      if (removeCoverImage && !newCoverImage) {
        coverImageUrl = null;
      }
      
      if (newCoverImage) {
        coverImageUrl = await uploadFile(newCoverImage, 'covers');
      }

      // Handle attachments
      let finalFiles = [...existingFiles];
      
      // Upload new files
      for (const file of newFiles) {
        const url = await uploadFile(file, 'attachments');
        finalFiles.push({
          url,
          name: file.name,
          type: file.type
        });
      }

      // Prepare update data
      const updateData = {
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
        files: finalFiles.length > 0 ? finalFiles : null,
        updated_at: new Date().toISOString()
      };

      // Update job
      const { error: updateError } = await supabase
        .from('job')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Navigate back to job detail
      navigate(`/jobs/job/${id}`);
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle job deletion
   */
  const handleDelete = async () => {
    setDeleting(true);

    try {
      const { error } = await supabase
        .from('job')
        .delete()
        .eq('id', id);

      if (error) throw error;

      navigate('/jobs');
    } catch (err) {
      console.error('Delete error:', err);
      alert(lang === 'ko' ? '삭제 중 오류가 발생했습니다' : 'Error deleting job');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
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
  // RENDER: Error State
  // ============================================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              {lang === 'ko' ? '채용공고 목록' : 'Back to Jobs'}
            </Link>
          </div>
        </div>
      </div>
    );
  }


  // ============================================================================
  // RENDER: Main Form
  // ============================================================================

  const totalFilesCount = existingFiles.length + newFiles.length;
  const canAddMoreFiles = totalFilesCount < MAX_FILES;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={`/jobs/job/${id}`}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{t('pageTitle')}</h1>
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

          {/* Approval Status Notice */}
          {!job?.approved && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                {lang === 'ko' 
                  ? '이 채용공고는 아직 승인 대기 중입니다.'
                  : 'This job is still pending approval.'
                }
              </p>
            </div>
          )}

          {/* ================================================================
              BASIC INFORMATION
              ================================================================ */}
          <FormSection title={t('basicInfo')} icon={Briefcase}>
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

            {formData.salaryType !== 'negotiable' && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField label={t('salaryMin')} optional>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₩</span>
                    <input
                      type="number"
                      value={formData.salaryMin}
                      onChange={(e) => handleChange('salaryMin', e.target.value)}
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

              <FormField label={t('website')} optional>
                <div className="relative">
                  <FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.contactWebsite}
                    onChange={(e) => handleChange('contactWebsite', e.target.value)}
                    placeholder="https://example.com"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </FormField>
          </FormSection>

          {/* ================================================================
              COVER IMAGE
              ================================================================ */}
          <FormSection title={t('coverImage')} icon={Image}>
            <p className="text-sm text-gray-500 mb-4">{t('coverImageDesc')}</p>

            {/* Existing or New Cover Image Preview */}
            {(existingCoverImage || newCoverImagePreview) && !removeCoverImage ? (
              <div className="relative mb-4">
                <img
                  src={newCoverImagePreview || existingCoverImage}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={newCoverImagePreview ? handleRemoveNewCoverImage : handleRemoveExistingCoverImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                {newCoverImagePreview && (
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                    {lang === 'ko' ? '새 이미지' : 'New'}
                  </span>
                )}
              </div>
            ) : (
              <label className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">
                  {lang === 'ko' ? '이미지 업로드' : 'Upload Image'}
                </p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (max 10MB)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleNewCoverImage}
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

            {/* Existing Files */}
            {existingFiles.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">{t('existingFiles')}</p>
                <div className="space-y-2">
                  {existingFiles.map((file, index) => {
                    const fileUrl = typeof file === 'string' ? file : file.url;
                    const fileName = typeof file === 'string' ? getFileName(file) : (file.name || getFileName(file.url));
                    
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-sm text-blue-600 hover:underline truncate"
                        >
                          {fileName}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingFile(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* New Files */}
            {newFiles.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">{t('newFiles')}</p>
                <div className="space-y-2">
                  {newFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <FileText className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="flex-1 text-sm text-gray-700 truncate">{file.name}</span>
                      <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewFile(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            {canAddMoreFiles && (
              <label className="block w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">{t('uploadFiles')}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'ko'
                    ? `${MAX_FILES - totalFilesCount}개 더 업로드 가능`
                    : `${MAX_FILES - totalFilesCount} more file(s) allowed`
                  }
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.hwp,.jpg,.jpeg,.png,.gif,.webp"
                  multiple
                  onChange={handleNewFilesChange}
                  className="hidden"
                />
              </label>
            )}
          </FormSection>

          {/* ================================================================
              SUBMIT & DELETE BUTTONS
              ================================================================ */}
          <div className="space-y-4 pt-4">
            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {t('saveChanges')}
                  </>
                )}
              </button>
              <Link
                to={`/jobs/job/${id}`}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                {t('cancel')}
              </Link>
            </div>

            {/* Delete Button */}
            <div className="border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                {t('delete')}
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* ====================================================================
          DELETE CONFIRMATION MODAL
          ==================================================================== */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('delete')}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">{t('deleteConfirm')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('deleting')}
                  </>
                ) : (
                  t('delete')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobEdit;
