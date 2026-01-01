import React, { useState, useRef, useEffect } from 'react';
import { Download, Printer, RefreshCw, Send } from 'lucide-react';
import SNSCollectionModal from './SNSCollectionModal';
import { 
  saveApplication, 
  saveSNSContacts, 
  updateApplicationStatus,
  getLatestApplication,
  generatePDF,
  sendApplicationEmail
} from './utils/sgpApi';
import { supabase } from '../../api/supabase-client';

// ⭐ PASTE YOUR INTERVIEW PREP LINK HERE ⭐
const SGP_INTERVIEW_PREP_LINK = 'https://koreaeasy.org/guides/guide/95';
// ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐

const SGPApplicationForm = () => {
  const [formData, setFormData] = useState({
    photo: null,
    name: '',
    gender: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    grade: '',
    dayNight: '주',
    studentId: '',
    nationality: '',
    major: '',
    address: '',
    phone: '',
    education: Array(4).fill(null).map(() => ({ date: { year: '', month: '' }, content: '' })),
    experience: Array(4).fill(null).map(() => ({ 
      startDate: { year: '', month: '', day: '' },
      endDate: { year: '', month: '', day: '' },
      content: '' 
    })),
    certifications: Array(4).fill(null).map(() => ({ date: { year: '', month: '' }, content: '' })),
    skills: {
      english: { level: '', note: '' },
      word: { level: '', note: '' },
      excel: { level: '', note: '' },
      powerpoint: { level: '', note: '' },
      other: { level: '', note: '' }
    },
    hobbies: { hobby: '', specialty: '', personality: '', religion: '', other: '' },
    selfIntro: {
      background: '',
      personality: '',
      motivation: '',
      vision: ''
    }
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [textSizes, setTextSizes] = useState({
    name: '11px',
    nationality: '11px',
    major: '11px',
    skillNotes: { english: '11px', word: '11px', excel: '11px', powerpoint: '11px', other: '11px' },
    hobbies: { hobby: '11px', specialty: '11px', personality: '11px', religion: '11px', other: '11px' }
  });

  const [shouldWrap, setShouldWrap] = useState({
    name: false,
    nationality: false,
    major: false,
    skillNotes: { english: false, word: false, excel: false, powerpoint: false, other: false },
    hobbies: { hobby: false, specialty: false, personality: false, religion: false, other: false }
  });

  const [calculatedAge, setCalculatedAge] = useState('');
  const photoInputRef = useRef(null);
  const inputRefs = useRef({});
  const birthYearRef = useRef(null);
  const birthMonthRef = useRef(null);
  const birthDayRef = useRef(null);
  
  // Add refs for other required fields
  const gradeRef = useRef(null);
  const studentIdRef = useRef(null);
  const addressRef = useRef(null);
  const phoneRef = useRef(null);

  // Tooltip state
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Instruction guide for each field
  const instructions = {
    photo: {
      title: "사진 (Photo)",
      content: "Click to upload your photo\n• Passport-style photo\n• White or light background\n• Formal attire"
    },
    name: {
      title: "성명 (Name)",
      content: "Please write your full name in Korean like your ARC card\nEx: STEPHEN ROBERT → 스티븐 로버트"
    },
    gender: {
      title: "성별 (Gender)",
      content: "Select your gender\n남 = Male\n여 = Female"
    },
    birthDate: {
      title: "생년월일 (Birth Date)",
      content: "Enter your birth date\nFormat: YYYY년 MM월 DD일\nEx: 2000년 03월 15일"
    },
    grade: {
      title: "학년 (Grade)",
      content: "Enter your current grade (1-4)\n주 = Day program\n야 = Night program"
    },
    studentId: {
      title: "학번 (Student ID)",
      content: "Enter your 9-digit student ID\nEx: 202510010"
    },
    nationality: {
      title: "국적 (Nationality)",
      content: "Write your nationality in Korean\nEx: American → 미국인, Chinese → 중국인"
    },
    major: {
      title: "전공 (Major)",
      content: "Write your major/department in Korean\nEx: AI and Big Data → AI·빅데이터학과"
    },
    address: {
      title: "주소 (Address)",
      content: "Write your current address in Korea\nEx: 대전광역시 동구 자양동 123번지 12, 102호"
    },
    phone: {
      title: "전화번호 (Phone)",
      content: "Enter your Korean phone number\nEx: 010-1234-5678"
    },
    education: {
      title: "학력사항 (Education)",
      content: "List your education history (high school, previous university)\n• Year Month: Graduation date\n• Content: School name and major\nEx: 2023년 05월 - ABC High School 졸업"
    },
    experience: {
      title: "경력사항 (Experience)",
      content: "List your work experience (part-time jobs, internships, military)\n• Start Date → End Date\n• Content: Company name and position\nEx: 2021.01.01 ~ 2021.12.31 - 스타벅스 바리스타"
    },
    certifications: {
      title: "자격증 (Certifications)",
      content: "List your certificates and qualifications\n• Year Month: When you got it\n• Content: Certificate name\nEx: 2022년 05월 - TOPIK Level 4"
    },
    skillEnglish: {
      title: "영어회화 (English)",
      content: "Rate your English conversation skill\n상 = Advanced\n중 = Intermediate\n하 = Beginner"
    },
    skillWord: {
      title: "워드 (Word)",
      content: "Rate your Microsoft Word skill\n상 = Expert\n중 = Intermediate\n하 = Basic"
    },
    skillExcel: {
      title: "엑셀 (Excel)",
      content: "Rate your Microsoft Excel skill\n상 = Expert\n중 = Intermediate\n하 = Basic"
    },
    skillPowerpoint: {
      title: "파워포인트 (PowerPoint)",
      content: "Rate your PowerPoint skill\n상 = Expert\n중 = Intermediate\n하 = Basic"
    },
    skillOther: {
      title: "기타 PC (Other PC)",
      content: "List other computer skills\nEx: 포토샵, 파이썬 등"
    },
    hobby: {
      title: "취미 (Hobby)",
      content: "Write your hobbies in Korean\nEx: 독서, 운동, 영화감상"
    },
    specialty: {
      title: "특기 (Specialty)",
      content: "Write your special talents\nEx: 노래, 요리, 그림 그리기"
    },
    personality: {
      title: "성격 (Personality)",
      content: "Describe your personality\nEx: 긍정적, 적극적, 책임감 있음"
    },
    religion: {
      title: "종교 (Religion)",
      content: "Write your religion if any\nEx: 기독교, 불교, 무교"
    },
    other: {
      title: "기타 (Other)",
      content: "Any other information"
    },
    background: {
      title: "성장배경 (Background)",
      content: "⚠️ MUST FILL IN KOREAN (한국어로 작성 필수)\n\nWrite about your upbringing and what shaped you:\n• Family values and how they raised you\n• Key life experiences that built your character\n• Cultural background (especially for international students)\n• What prepared you for responsibility\n\nEx: 저는 성실과 정직을 중요시하는 가정에서 자랐습니다.\n한국에 온 후 독립심과 적응력을 배웠습니다..."
    },
    personalityStrengths: {
      title: "성격의 강약점 (Personality)",
      content: "⚠️ MUST FILL IN KOREAN (한국어로 작성 필수)\n\nDescribe your honest strengths and weaknesses:\n\nSTRENGTHS to mention:\n• Reliability, punctuality, responsibility\n• Calmness under pressure\n• Alertness and observation skills\n• Good communication and teamwork\n\nWEAKNESSES (with improvement plan):\n• Be honest but show you're working to improve\n\nEx: 제 강점은 책임감입니다. 약속을 항상 지킵니다.\n약점은 한국어 실력이지만 매일 열심히 공부하고 있습니다."
    },
    motivation: {
      title: "지원동기 (Motivation)",
      content: "⚠️ MUST FILL IN KOREAN (한국어로 작성 필수)\n\nExplain WHY you want to join Sol Green Police:\n• What interests you about campus security work?\n• How does this align with your goals?\n• What do you understand about SGP responsibilities?\n• Why are you a good fit?\n\nFocus on service, growth, and responsibility - not only financial need\n\nEx: 캠퍼스 안전에 기여하고 싶고 리더십을 개발하고 싶습니다.\nSGP의 책임감은 제 가치관과 맞습니다."
    },
    vision: {
      title: "포부 및 비전 (Vision)",
      content: "⚠️ MUST FILL IN KOREAN (한국어로 작성 필수)\n\nDescribe your future goals and how SGP fits:\n\nSHORT-TERM (as SGP member):\n• Become a reliable team member\n• Improve crisis management skills\n• Maintain excellent performance\n\nLONG-TERM (career):\n• How this experience helps your future\n• Skills you'll carry forward (responsibility, discipline)\n• Your career aspirations\n\nEx: SGP 멤버로서 캠퍼스 안전과 청결을 헌신적으로 지키겠습니다.\n장기적으로 보안 관리 분야에서 일하고 싶으며, 이 경험이 제 커리어에\n매우 중요합니다."
    }
  };

  useEffect(() => {
    const checkAndResizeInput = (inputElement, field, subfield = null) => {
      if (!inputElement) return;
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Step 1: Check at 11px
      context.font = '11px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
      const textWidth11 = context.measureText(inputElement.value).width;
      const inputWidth = inputElement.offsetWidth;
      
      if (textWidth11 > inputWidth - 10) {
        // Text hits wall at 11px, reduce to 9px
        if (subfield) {
          setTextSizes(prev => ({
            ...prev,
            [field]: { ...prev[field], [subfield]: '9px' }
          }));
        } else {
          setTextSizes(prev => ({ ...prev, [field]: '9px' }));
        }
        
        // Step 2: Check at 9px
        context.font = '9px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
        const textWidth9 = context.measureText(inputElement.value).width;
        
        if (textWidth9 > inputWidth - 10) {
          // Still hits wall at 9px, enable wrapping
          if (subfield) {
            setShouldWrap(prev => ({
              ...prev,
              [field]: { ...prev[field], [subfield]: true }
            }));
          } else {
            setShouldWrap(prev => ({ ...prev, [field]: true }));
          }
        } else {
          // Fits at 9px, no wrapping needed
          if (subfield) {
            setShouldWrap(prev => ({
              ...prev,
              [field]: { ...prev[field], [subfield]: false }
            }));
          } else {
            setShouldWrap(prev => ({ ...prev, [field]: false }));
          }
        }
      } else {
        // Fits at 11px, reset everything
        if (subfield) {
          setTextSizes(prev => ({
            ...prev,
            [field]: { ...prev[field], [subfield]: '11px' }
          }));
          setShouldWrap(prev => ({
            ...prev,
            [field]: { ...prev[field], [subfield]: false }
          }));
        } else {
          setTextSizes(prev => ({ ...prev, [field]: '11px' }));
          setShouldWrap(prev => ({ ...prev, [field]: false }));
        }
      }
    };

    // Check all registered inputs
    Object.keys(inputRefs.current).forEach(key => {
      const [field, subfield] = key.split('-');
      checkAndResizeInput(inputRefs.current[key], field, subfield);
    });
  }, [formData]);

  useEffect(() => {
    const { birthYear, birthMonth, birthDay } = formData;
    if (birthYear && birthMonth && birthDay && birthYear.length === 4) {
      const today = new Date();
      const birth = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      if (age >= 0 && age < 150) {
        setCalculatedAge(age.toString());
      } else {
        setCalculatedAge('');
      }
    } else {
      setCalculatedAge('');
    }
  }, [formData.birthYear, formData.birthMonth, formData.birthDay]);

  // Auto-fill from previous application
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data } = await getLatestApplication(user.id);
        if (data && data.form_data) {
          setFormData(data.form_data);
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };
    loadSavedData();
  }, []);

  // Security: Disable right-click, Ctrl+S, etc.
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };
    
    const handleKeyDown = (e) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J
      if (e.keyCode === 123 || 
          (e.ctrlKey && e.shiftKey && [73, 67, 74].includes(e.keyCode)) ||
          (e.metaKey && e.shiftKey && [73, 67, 74].includes(e.keyCode)) ||
          // Ctrl+S / Cmd+S
          ((e.ctrlKey || e.metaKey) && e.keyCode === 83) ||
          // Ctrl+U / Cmd+U
          ((e.ctrlKey || e.metaKey) && e.keyCode === 85)) {
        e.preventDefault();
        return false;
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, photo: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBirthYearChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 4) {
      setFormData(prev => ({ ...prev, birthYear: value }));
      if (value.length === 4) {
        birthMonthRef.current?.focus();
      }
    }
  };

  const handleBirthMonthChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 2) {
      setFormData(prev => ({ ...prev, birthMonth: value }));
      if (value.length === 2) {
        birthDayRef.current?.focus();
      }
    }
  };

  const handleBirthDayChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 2) {
      setFormData(prev => ({ ...prev, birthDay: value }));
    }
  };

  const handleArrayInputChange = (arrayName, index, field, value) => {
    setFormData(prev => {
      const newArray = [...prev[arrayName]];
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        newArray[index] = {
          ...newArray[index],
          [parent]: {
            ...newArray[index][parent],
            [child]: value
          }
        };
        
        // Auto-tab logic for date fields
        const cleaned = value.replace(/[^0-9]/g, '');
        if (parent === 'date' || parent === 'startDate' || parent === 'endDate') {
          if (child === 'year' && cleaned.length === 4) {
            // Focus on month field
            const monthInput = document.querySelector(`[data-field="${arrayName}-${index}-${parent}-month"]`);
            monthInput?.focus();
          } else if (child === 'month' && cleaned.length === 2) {
            // Focus on day field if it exists (for experience dates)
            const dayInput = document.querySelector(`[data-field="${arrayName}-${index}-${parent}-day"]`);
            if (dayInput) {
              dayInput.focus();
            } else {
              // No day field, focus on content
              const contentInput = document.querySelector(`[data-field="${arrayName}-${index}-content"]`);
              contentInput?.focus();
            }
          } else if (child === 'day' && cleaned.length === 2) {
            // Check if this is start date, focus on end date year
            if (parent === 'startDate') {
              const endYearInput = document.querySelector(`[data-field="${arrayName}-${index}-endDate-year"]`);
              endYearInput?.focus();
            } else {
              // This is end date, focus on content
              const contentInput = document.querySelector(`[data-field="${arrayName}-${index}-content"]`);
              contentInput?.focus();
            }
          }
        }
      } else {
        newArray[index] = { ...newArray[index], [field]: value };
      }
      return { ...prev, [arrayName]: newArray };
    });
  };

  const handleSkillChange = (skill, field, value) => {
    setFormData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skill]: { ...prev.skills[skill], [field]: value }
      }
    }));
  };

  const handleHobbyChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      hobbies: { ...prev.hobbies, [field]: value }
    }));
  };

  const handleSelfIntroChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      selfIntro: { ...prev.selfIntro, [field]: value }
    }));
  };

  const clearForm = () => {
    if (window.confirm('모든 입력 내용을 지우시겠습니까?\nClear all inputs?')) {
      setFormData({
        photo: null,
        name: '',
        gender: '',
        birthYear: '',
        birthMonth: '',
        birthDay: '',
        grade: '',
        dayNight: '주',
        studentId: '',
        nationality: '',
        major: '',
        address: '',
        phone: '',
        education: Array(4).fill(null).map(() => ({ date: { year: '', month: '' }, content: '' })),
        experience: Array(4).fill(null).map(() => ({ 
          startDate: { year: '', month: '', day: '' },
          endDate: { year: '', month: '', day: '' },
          content: '' 
        })),
        certifications: Array(4).fill(null).map(() => ({ date: { year: '', month: '' }, content: '' })),
        skills: {
          english: { level: '', note: '' },
          word: { level: '', note: '' },
          excel: { level: '', note: '' },
          powerpoint: { level: '', note: '' },
          other: { level: '', note: '' }
        },
        hobbies: { hobby: '', specialty: '', personality: '', religion: '', other: '' },
        selfIntro: {
          background: '',
          personality: '',
          motivation: '',
          vision: ''
        }
      });
      setCalculatedAge('');
    }
  };

  const validateRequiredFields = () => {
    const errors = [];
    
    if (!formData.name || formData.name.trim() === '') {
      errors.push('성명 (Name)');
    }
    
    if (!formData.gender) {
      errors.push('성별 (Gender)');
    }
    
    if (!formData.birthYear || formData.birthYear.length !== 4) {
      errors.push('생년월일 - 년 (Birth Year)');
    }
    
    if (!formData.birthMonth || formData.birthMonth.trim() === '') {
      errors.push('생년월일 - 월 (Birth Month)');
    }
    
    if (!formData.birthDay || formData.birthDay.trim() === '') {
      errors.push('생년월일 - 일 (Birth Day)');
    }
    
    if (!formData.grade || formData.grade.trim() === '') {
      errors.push('학년 (Grade)');
    }
    
    if (!formData.studentId || formData.studentId.trim() === '') {
      errors.push('학번 (Student ID)');
    }
    
    if (!formData.nationality || formData.nationality.trim() === '') {
      errors.push('국적 (Nationality)');
    }
    
    if (!formData.major || formData.major.trim() === '') {
      errors.push('전공/학과 (Major)');
    }
    
    if (!formData.address || formData.address.trim() === '') {
      errors.push('주소 (Address)');
    }
    
    if (!formData.phone || formData.phone.trim() === '') {
      errors.push('연락처 (Phone)');
    }
    
    return errors;
  };

  // Helper function to focus on first missing required field
  const focusFirstMissingField = () => {
    if (!formData.name || formData.name.trim() === '') {
      inputRefs.current['name']?.focus();
    } else if (!formData.gender) {
      document.querySelector('input[name="gender"]')?.focus();
    } else if (!formData.birthYear || formData.birthYear.length !== 4) {
      birthYearRef.current?.focus();
    } else if (!formData.birthMonth || formData.birthMonth.trim() === '') {
      birthMonthRef.current?.focus();
    } else if (!formData.birthDay || formData.birthDay.trim() === '') {
      birthDayRef.current?.focus();
    } else if (!formData.grade || formData.grade.trim() === '') {
      gradeRef.current?.focus();
    } else if (!formData.studentId || formData.studentId.trim() === '') {
      studentIdRef.current?.focus();
    } else if (!formData.nationality || formData.nationality.trim() === '') {
      inputRefs.current['nationality']?.focus();
    } else if (!formData.major || formData.major.trim() === '') {
      inputRefs.current['major']?.focus();
    } else if (!formData.address || formData.address.trim() === '') {
      addressRef.current?.focus();
    } else if (!formData.phone || formData.phone.trim() === '') {
      phoneRef.current?.focus();
    }
  };

  const handlePrint = () => {
    const errors = validateRequiredFields();
    
    if (errors.length > 0) {
      alert('다음 필수 항목을 입력해주세요:\nPlease fill in the following required fields:\n\n' + errors.join('\n'));
      // Auto-focus on first missing field
      setTimeout(() => focusFirstMissingField(), 100);
      return;
    }
    
    setCurrentAction('print');
    setShowModal(true);
  };

  const handleDownloadPDF = () => {
    const errors = validateRequiredFields();
    
    if (errors.length > 0) {
      alert('다음 필수 항목을 입력해주세요:\nPlease fill in the following required fields:\n\n' + errors.join('\n'));
      // Auto-focus on first missing field
      setTimeout(() => focusFirstMissingField(), 100);
      return;
    }
    
    setCurrentAction('download');
    setShowModal(true);
  };

  const handleApplyDirectly = () => {
    const errors = validateRequiredFields();
    
    if (errors.length > 0) {
      alert('다음 필수 항목을 입력해주세요:\nPlease fill in the following required fields:\n\n' + errors.join('\n'));
      // Auto-focus on first missing field
      setTimeout(() => focusFirstMissingField(), 100);
      return;
    }
    
    setCurrentAction('apply');
    setShowModal(true);
  };

  const handleSNSSubmit = async (contacts) => {
    setIsProcessing(true);
    
    // Close modal immediately for better UX
    setShowModal(false);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Save application to database
      const { data: application, error: appError } = await saveApplication(
        formData, 
        contacts, 
        user?.id
      );
      
      if (appError) throw appError;
      
      // 2. Save SNS contacts
      const { error: snsError } = await saveSNSContacts(
        application.id, 
        contacts
      );
      
      if (snsError) throw snsError;
      
      // 3. Execute action based on button clicked
      if (currentAction === 'print') {
        await handlePrintAction(application.id, contacts);
      } else if (currentAction === 'download') {
        await handleDownloadAction(application.id, contacts);
      } else if (currentAction === 'apply') {
        await handleApplyAction(application.id, contacts);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.\n' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintAction = async (applicationId, contacts) => {
    // Save original title and change to custom filename
    const originalTitle = document.title;
    const currentYear = new Date().getFullYear();
    document.title = `${formData.name || 'Name'}-${formData.studentId || 'StudentID'}-SGP Application Form ${currentYear}`;
    
    try {
      // Wait a bit for modal animation to complete
      setTimeout(() => {
        // Get the two page elements
        const pages = document.querySelectorAll('.a4-page');
        
        if (pages.length === 0) {
          alert('Could not find form pages to print');
          document.title = originalTitle; // Restore title
          return;
        }
        
        // Create iframe for printing
        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'absolute';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = 'none';
        document.body.appendChild(printFrame);
        
        // Get iframe document
        const frameDoc = printFrame.contentWindow.document;
        
        // Build the HTML content
        let htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>${formData.name || 'Name'}-${formData.studentId || 'StudentID'}-SGP Application Form ${new Date().getFullYear()}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              body {
                font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
                background: white;
              }
              
              /* Hide required asterisks */
              .required-asterisk {
                display: none !important;
              }
              
              .page {
                width: 210mm;
                min-height: 297mm;
                padding: 15mm;
                background: white;
                page-break-after: always;
              }
              
              .page:last-child {
                page-break-after: auto;
              }
              
              table {
                border-collapse: collapse;
                width: 100%;
              }
              
              @page {
                size: A4;
                margin: 0;
              }
              
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
                
                .page {
                  margin: 0;
                  width: 100%;
                  min-height: 100vh;
                }
              }
            </style>
          </head>
          <body>
        `;
        
        // Add each page
        pages.forEach((page, index) => {
          htmlContent += `<div class="page">${page.innerHTML}</div>`;
        });
        
        htmlContent += `
          </body>
          </html>
        `;
        
        // Write content to iframe
        frameDoc.open();
        frameDoc.write(htmlContent);
        frameDoc.close();
        
        // Wait for iframe to load, then print
        setTimeout(() => {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
          
          // Remove iframe and restore title after printing
          setTimeout(() => {
            document.body.removeChild(printFrame);
            document.title = originalTitle; // Restore original title
          }, 1000);
        }, 500);
      }, 300);
      
      await updateApplicationStatus(applicationId, 'printed');
    } catch (error) {
      console.error('Print error:', error);
      document.title = originalTitle; // Restore title on error
      throw error;
    }
  };

  const handleDownloadAction = async (applicationId, contacts) => {
    // Save original title and change to custom filename
    const originalTitle = document.title;
    const currentYear = new Date().getFullYear();
    document.title = `${formData.name || 'Name'}-${formData.studentId || 'StudentID'}-SGP Application Form ${currentYear}`;
    
    try {
      // Use the same print approach - user can select "Save as PDF" in print dialog
      setTimeout(() => {
        // Get the two page elements
        const pages = document.querySelectorAll('.a4-page');
        
        if (pages.length === 0) {
          alert('Could not find form pages to download');
          document.title = originalTitle; // Restore title
          return;
        }
        
        // Create iframe for printing/PDF
        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'absolute';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = 'none';
        document.body.appendChild(printFrame);
        
        // Get iframe document
        const frameDoc = printFrame.contentWindow.document;
        
        // Build the HTML content
        let htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>${formData.name || 'Name'}-${formData.studentId || 'StudentID'}-SGP Application Form ${new Date().getFullYear()}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              body {
                font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
                background: white;
              }
              
              /* Hide required asterisks */
              .required-asterisk {
                display: none !important;
              }
              
              .page {
                width: 210mm;
                min-height: 297mm;
                padding: 15mm;
                background: white;
                page-break-after: always;
              }
              
              .page:last-child {
                page-break-after: auto;
              }
              
              table {
                border-collapse: collapse;
                width: 100%;
              }
              
              @page {
                size: A4;
                margin: 0;
              }
              
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
                
                .page {
                  margin: 0;
                  width: 100%;
                  min-height: 100vh;
                }
              }
            </style>
          </head>
          <body>
        `;
        
        // Add each page
        pages.forEach((page, index) => {
          htmlContent += `<div class="page">${page.innerHTML}</div>`;
        });
        
        htmlContent += `
          </body>
          </html>
        `;
        
        // Write content to iframe
        frameDoc.open();
        frameDoc.write(htmlContent);
        frameDoc.close();
        
        // Wait for iframe to load, then print (user can save as PDF)
        setTimeout(() => {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
          
          // Remove iframe and restore title after printing
          setTimeout(() => {
            document.body.removeChild(printFrame);
            document.title = originalTitle; // Restore original title
          }, 1000);
        }, 500);
      }, 300);
      
      await updateApplicationStatus(applicationId, 'downloaded');
    } catch (error) {
      console.error('Download error:', error);
      document.title = originalTitle; // Restore title on error
      throw error;
    }
  };

  const handleApplyAction = async (applicationId, contacts) => {
    try {
      // Build email subject
      const subject = `Application for Sol Green Police Position - ${formData.name || 'Applicant'} (${formData.studentId || 'ID'})`;
      
      // Build contact details section - only include filled fields
      let contactDetails = `Primary Email:    ${contacts.email || 'Not provided'}\nMobile Phone:     ${formData.phone || 'Not provided'}`;
      
      if (contacts.whatsapp) contactDetails += `\nWhatsApp:         ${contacts.whatsapp}`;
      if (contacts.instagram) contactDetails += `\nInstagram:        ${contacts.instagram}`;
      if (contacts.facebook) contactDetails += `\nFacebook:         ${contacts.facebook}`;
      if (contacts.tiktok) contactDetails += `\nTikTok:           ${contacts.tiktok}`;
      if (contacts.kakaotalk) contactDetails += `\nKakaoTalk:        ${contacts.kakaotalk}`;
      
      // Build email body
      const emailBody = `Dear Sol Green Police Recruitment Team,

RE: APPLICATION FOR SOL GREEN POLICE POSITION

My name is ${formData.name || '[Your Name]'}, an international student from ${formData.nationality || '[Country]'} currently enrolled in the ${formData.major || '[Major]'} program at Woosong University (Student ID: ${formData.studentId || '[Student ID]'}).

I am writing to formally apply for the Sol Green Police position. I am eager to contribute to maintaining campus safety and cleanliness while developing valuable professional skills through this opportunity.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${contactDetails}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I am available for an interview at your convenience and can be contacted through any of the methods listed above. I am committed to fulfilling the responsibilities of this position with dedication and professionalism.

Thank you for considering my application. I look forward to hearing from you soon.

Sincerely yours,

${formData.name || '[Your Name]'}
Student ID: ${formData.studentId || '[Student ID]'}
${formData.major || '[Major]'}, Woosong University

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ IMPORTANT: Please download your PDF using the "PDF 다운로드" button, then attach it to this email before sending.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      // Create mailto link
      const mailtoLink = `mailto:test.keasy@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      
      // Show instruction modal before opening email
      const userConfirmed = window.confirm(
        '📧 READY TO SEND YOUR APPLICATION?\n\n' +
        'Your email client will open with a pre-written message.\n\n' +
        '⚠️ IMPORTANT STEPS:\n' +
        '1. Download your PDF first using "PDF 다운로드" button (if you haven\'t already)\n' +
        '2. Click OK to open your email client\n' +
        '3. Attach the downloaded PDF to the email\n' +
        '4. Review the email and click Send\n\n' +
        'Click OK to continue, or Cancel to go back.'
      );
      
      if (!userConfirmed) {
        return; // User cancelled
      }
      
      // Open mailto link
      window.location.href = mailtoLink;
      
      // Update status
      await updateApplicationStatus(applicationId, 'submitted');
      
      // Show success message after a delay
      setTimeout(() => {
        alert('✅ Email opened!\n\nPlease remember to:\n1. Attach your downloaded PDF\n2. Review the email\n3. Click Send\n\nYour application will be sent to the SGP recruitment team.');
      }, 1000);
      
    } catch (error) {
      console.error('Apply error:', error);
      alert('Failed to open email. Please try again or contact support.');
      throw error;
    }
  };

  const cellStyle = { border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle' };
  const labelCellStyle = { ...cellStyle, background: '#f9f9f9', textAlign: 'center', fontSize: '10px' };
  const firstColStyle = { width: '35mm', minWidth: '35mm', maxWidth: '35mm' };
  const inputStyle = { 
    width: '100%', 
    border: 'none', 
    outline: 'none', 
    fontSize: '11px', 
    padding: '2px', 
    background: 'transparent',
    wordWrap: 'break-word',
    whiteSpace: 'normal',
    lineHeight: '1.2',
    minHeight: '16px'
  };

  return (
    <div className="print-container" style={{ minHeight: '100vh', background: 'white', padding: '20px', fontFamily: "'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif", position: 'relative' }}>
      <style>{`
        body {
          background: white !important;
        }
        
        .required-asterisk {
          color: red;
        }
        
        @media print {
          .required-asterisk {
            display: none !important;
          }
        }
        
        input:focus, textarea:focus {
          background: #fffde7 !important;
        }
        
        /* LEFT-SIDE TOOLTIP GUIDE BOX */
        .tooltip-guide {
          position: fixed;
          left: 20px;
          top: 150px;
          width: 280px;
          background: white;
          border: 2px solid #4F46E5;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          animation: slideInLeft 0.3s ease-out;
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .tooltip-guide h3 {
          margin: 0 0 12px 0;
          color: #4F46E5;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid #E5E7EB;
          padding-bottom: 8px;
        }
        
        .tooltip-guide p {
          margin: 0;
          color: #374151;
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-line;
        }
        
        .tooltip-example {
          background: #FEF3C7;
          border-left: 3px solid #F59E0B;
          padding: 8px 12px;
          margin-top: 8px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          color: #92400E;
        }
        
        @media print {
          .tooltip-guide {
            display: none !important;
          }
        }
        
        @media (max-width: 1200px) {
          .tooltip-guide {
            display: none;
          }
        }
        
        /* STICKY INTERVIEW PREP BOX - RIGHT SIDE */
        .interview-prep-box {
          position: fixed;
          right: 20px;
          top: 150px;
          width: 300px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          z-index: 999;
          color: white;
        }
        
        .interview-prep-box h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .interview-prep-box ul {
          margin: 12px 0 16px 0;
          padding-left: 20px;
          font-size: 13px;
          line-height: 1.8;
        }
        
        .interview-prep-box ul li {
          margin-bottom: 6px;
        }
        
        .interview-prep-button {
          display: block;
          width: 100%;
          padding: 12px 16px;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .interview-prep-button:hover {
          background: #f0f0f0;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        @media print {
          .interview-prep-box {
            display: none !important;
          }
        }
        
        @media (max-width: 1400px) {
          .interview-prep-box {
            display: none;
          }
        }
      `}</style>

      {/* LEFT-SIDE TOOLTIP GUIDE BOX */}
      {activeTooltip && instructions[activeTooltip] && (
        <div className="tooltip-guide no-print">
          <h3>
            <span style={{ fontSize: '18px' }}>💡</span>
            {instructions[activeTooltip].title}
          </h3>
          {(() => {
            const content = instructions[activeTooltip].content;
            const lines = content.split('\n');
            const mainContent = [];
            const examples = [];
            
            lines.forEach(line => {
              if (line.startsWith('Ex:') || line.startsWith('ex:')) {
                examples.push(line);
              } else {
                mainContent.push(line);
              }
            });
            
            return (
              <>
                <p>{mainContent.join('\n')}</p>
                {examples.length > 0 && (
                  <div className="tooltip-example">
                    {examples.join('\n')}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* STICKY INTERVIEW PREP BOX - RIGHT SIDE */}
      <div className="interview-prep-box no-print">
        <h3>
          <span style={{ fontSize: '20px' }}>📚</span>
          Interview Preparation Guide
        </h3>
        <ul>
          <li>✓ Common interview questions</li>
          <li>✓ How to answer effectively</li>
          <li>✓ What recruiters look for</li>
          <li>✓ Tips for success</li>
        </ul>
        <a 
          href={SGP_INTERVIEW_PREP_LINK} 
          target="_blank" 
          rel="noopener noreferrer"
          className="interview-prep-button"
        >
          Prepare Now →
        </a>
      </div>

      {/* Control Buttons */}
      <div className="no-print" style={{ maxWidth: '210mm', margin: '0 auto 20px auto', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={clearForm}
          style={{ 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '6px', 
            fontSize: '14px', 
            cursor: 'pointer', 
            transition: 'all 0.2s', 
            fontWeight: '500', 
            background: '#6b7280', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
          disabled={isProcessing}
        >
          <RefreshCw size={18} />
          <span>초기화 (Clear)</span>
        </button>
        <button
          onClick={handlePrint}
          style={{ 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '6px', 
            fontSize: '14px', 
            cursor: 'pointer', 
            transition: 'all 0.2s', 
            fontWeight: '500', 
            background: '#4F46E5', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
          disabled={isProcessing}
        >
          <Printer size={18} />
          <span>인쇄 (Print)</span>
        </button>
        <button
          onClick={handleDownloadPDF}
          style={{ 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '6px', 
            fontSize: '14px', 
            cursor: 'pointer', 
            transition: 'all 0.2s', 
            fontWeight: '500', 
            background: '#22c55e', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
          disabled={isProcessing}
        >
          <Download size={18} />
          <span>PDF 다운로드</span>
        </button>
        <button
          onClick={handleApplyDirectly}
          style={{ 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '6px', 
            fontSize: '14px', 
            cursor: 'pointer', 
            transition: 'all 0.2s', 
            fontWeight: '500', 
            background: '#10b981', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
          disabled={isProcessing}
        >
          <Send size={18} />
          <span>Apply for SGP Directly</span>
        </button>
      </div>

      {/* SNS Collection Modal */}
      <SNSCollectionModal
        isOpen={showModal}
        onClose={() => !isProcessing && setShowModal(false)}
        onSubmit={handleSNSSubmit}
        action={currentAction}
        initialData={{
          email: formData.email || '',
          phone: formData.phone || ''
        }}
      />

      {/* PAGE 1: 이력서 */}
      <div className="a4-page" style={{ width: '210mm', minHeight: '297mm', background: 'white', margin: '0 auto 20px auto', padding: '15mm', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: '11px', color: '#333', marginBottom: '10px' }}>&lt;SGP 제출서식 -1&gt;</div>

        {/* Main Info Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <tbody>
            {/* Title Row with Photo */}
            <tr>
              <td
                rowSpan="4"
                onClick={() => photoInputRef.current?.click()}
                style={{ 
                  ...cellStyle,
                  ...firstColStyle,
                  height: '40mm',
                  minHeight: '40mm',
                  maxHeight: '40mm',
                  textAlign: 'center',
                  fontSize: '10px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {formData.photo ? (
                  <img 
                    src={formData.photo} 
                    alt="사진"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '30mm',
                      height: '40mm',
                      maxWidth: '30mm',
                      maxHeight: '40mm',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>사 진</span>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
                />
              </td>
              <td colSpan="6" style={{ ...cellStyle, textAlign: 'center', fontSize: '18px', fontWeight: 'bold', letterSpacing: '3px', padding: '12px' }}>
                이 력 서 (우송대 제출용)
              </td>
            </tr>
            {/* Row 2 */}
            <tr>
              <td style={{ ...labelCellStyle, width: '15%' }}>성명 <span className="required-asterisk">*</span></td>
              <td style={{ ...cellStyle, width: '18%' }}>
                <textarea
                  ref={(el) => inputRefs.current['name'] = el}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onFocus={() => setActiveTooltip('name')}
                  onBlur={() => setActiveTooltip(null)}
                  rows={shouldWrap.name ? 2 : 1}
                  style={{ 
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    resize: 'none',
                    overflow: 'hidden',
                    fontSize: textSizes.name, 
                    padding: '2px',
                    wordWrap: 'break-word',
                    whiteSpace: shouldWrap.name ? 'normal' : 'nowrap',
                    lineHeight: '1.2',
                    fontFamily: 'inherit'
                  }}
                />
              </td>
              <td rowSpan="2" style={{ ...labelCellStyle, width: '8%', lineHeight: '1.2', position: 'relative' }}>
                성<br />별<span className="required-asterisk" style={{ position: 'absolute', right: '2px', top: '2px' }}>*</span>
              </td>
              <td rowSpan="2" style={{ ...cellStyle, width: '10%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', fontSize: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="gender"
                      value="M"
                      checked={formData.gender === 'M'}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      style={{ width: '12px', height: '12px', cursor: 'pointer' }}
                    />
                    남
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="gender"
                      value="F"
                      checked={formData.gender === 'F'}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      style={{ width: '12px', height: '12px', cursor: 'pointer' }}
                    />
                    여
                  </label>
                </div>
              </td>
              <td style={{ ...labelCellStyle, width: '12%' }}>생년월일 <span className="required-asterisk">*</span></td>
              <td style={{ ...cellStyle, width: '22%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', fontSize: '10px' }}>
                  <input
                    ref={birthYearRef}
                    type="text"
                    value={formData.birthYear}
                    onChange={(e) => handleInputChange('birthYear', e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                    onFocus={() => setActiveTooltip('birthDate')}
                    onBlur={() => setActiveTooltip(null)}
                    style={{ width: '35px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent', fontSize: '11px', padding: '2px' }}
                    placeholder="____"
                    maxLength="4"
                  />
                  년
                  <input
                    ref={birthMonthRef}
                    type="text"
                    value={formData.birthMonth}
                    onChange={(e) => handleInputChange('birthMonth', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                    onFocus={() => setActiveTooltip('birthDate')}
                    onBlur={() => setActiveTooltip(null)}
                    style={{ width: '25px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent', fontSize: '11px', padding: '2px' }}
                    placeholder="__"
                    maxLength="2"
                  />
                  월
                  <input
                    ref={birthDayRef}
                    type="text"
                    value={formData.birthDay}
                    onChange={(e) => handleInputChange('birthDay', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                    onFocus={() => setActiveTooltip('birthDate')}
                    onBlur={() => setActiveTooltip(null)}
                    style={{ width: '25px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent', fontSize: '11px', padding: '2px' }}
                    placeholder="__"
                    maxLength="2"
                  />
                  일
                </div>
              </td>
            </tr>
            {/* Row 3 */}
            <tr>
              <td style={labelCellStyle}>학년(주/야) <span className="required-asterisk">*</span></td>
              <td style={cellStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', fontSize: '10px' }}>
                  <input
                    ref={gradeRef}
                    type="text"
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value.slice(0, 1))}
                    onFocus={() => setActiveTooltip('grade')}
                    onBlur={() => setActiveTooltip(null)}
                    style={{ width: '20px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent', fontSize: '11px', padding: '2px' }}
                    maxLength="1"
                  />
                  학년 /
                  <select
                    value={formData.dayNight}
                    onChange={(e) => handleInputChange('dayNight', e.target.value)}
                    onFocus={() => setActiveTooltip('grade')}
                    onBlur={() => setActiveTooltip(null)}
                    style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '11px' }}
                  >
                    <option>주</option>
                    <option>야</option>
                  </select>
                </div>
              </td>
              <td style={{ ...labelCellStyle, lineHeight: '1.2' }}>
                년 월 일<br />(만 세)
              </td>
              <td style={{ ...cellStyle, textAlign: 'center', fontSize: '10px' }}>
                (만 <span style={{ display: 'inline-block', width: '25px', textAlign: 'center' }}>{calculatedAge}</span> 세)
              </td>
            </tr>
            {/* Row 4 */}
            <tr>
              <td style={labelCellStyle}>학번 <span className="required-asterisk">*</span></td>
              <td style={cellStyle}>
                <input 
                  ref={studentIdRef}
                  type="text" 
                  value={formData.studentId} 
                  onChange={(e) => handleInputChange('studentId', e.target.value)}
                  onFocus={() => setActiveTooltip('studentId')}
                  onBlur={() => setActiveTooltip(null)}
                  style={inputStyle} 
                />
              </td>
              <td style={{ ...labelCellStyle, lineHeight: '1.2', position: 'relative' }}>국<br />적<span className="required-asterisk" style={{ position: 'absolute', right: '2px', top: '2px' }}>*</span></td>
              <td style={cellStyle}>
                <textarea
                  ref={(el) => inputRefs.current['nationality'] = el}
                  value={formData.nationality} 
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  onFocus={() => setActiveTooltip('nationality')}
                  onBlur={() => setActiveTooltip(null)}
                  rows={shouldWrap.nationality ? 2 : 1}
                  style={{ 
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    resize: 'none',
                    overflow: 'hidden',
                    fontSize: textSizes.nationality,
                    padding: '2px',
                    wordWrap: 'break-word',
                    whiteSpace: shouldWrap.nationality ? 'normal' : 'nowrap',
                    lineHeight: '1.2',
                    fontFamily: 'inherit'
                  }} 
                />
              </td>
              <td style={{ ...labelCellStyle, lineHeight: '1.2', position: 'relative' }}>전공<br />(학과)<span className="required-asterisk" style={{ position: 'absolute', right: '2px', top: '2px' }}>*</span></td>
              <td style={cellStyle}>
                <textarea
                  ref={(el) => inputRefs.current['major'] = el}
                  value={formData.major} 
                  onChange={(e) => handleInputChange('major', e.target.value)}
                  onFocus={() => setActiveTooltip('major')}
                  onBlur={() => setActiveTooltip(null)}
                  rows={shouldWrap.major ? 2 : 1}
                  style={{ 
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    resize: 'none',
                    overflow: 'hidden',
                    fontSize: textSizes.major,
                    padding: '2px',
                    wordWrap: 'break-word',
                    whiteSpace: shouldWrap.major ? 'normal' : 'nowrap',
                    lineHeight: '1.2',
                    fontFamily: 'inherit'
                  }} 
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Address Section */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginTop: '-1px' }}>
          <tbody>
            <tr>
              <td style={{ ...labelCellStyle, ...firstColStyle, lineHeight: '1.2', verticalAlign: 'middle', position: 'relative' }}>
                현재주소(거주지)<br />및 연락처<span className="required-asterisk" style={{ position: 'absolute', right: '2px', top: '2px' }}>*</span>
              </td>
              <td style={{ ...cellStyle, position: 'relative', verticalAlign: 'middle' }}>
                <input
                  ref={addressRef}
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  onFocus={() => setActiveTooltip('address')}
                  onBlur={() => setActiveTooltip(null)}
                  placeholder="주소 입력"
                  style={{ ...inputStyle, width: '70%' }}
                />
                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', whiteSpace: 'nowrap' }}>
                  (전화번호 (H.P):{' '}
                  <input
                    ref={phoneRef}
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    onFocus={() => setActiveTooltip('phone')}
                    onBlur={() => setActiveTooltip(null)}
                    style={{ width: '80px', border: 'none', borderBottom: '1px solid #ccc', outline: 'none', fontSize: '10px', background: 'transparent', padding: '0' }}
                  />
                  )
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 학력사항 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginTop: '-1px' }}>
          <tbody>
            <tr>
              <td style={{ ...cellStyle, background: '#f5f5f5', textAlign: 'center', ...firstColStyle, fontSize: '10px', verticalAlign: 'middle' }}>년 월</td>
              <td style={{ ...cellStyle, background: '#f5f5f5', textAlign: 'left', paddingLeft: '10px', fontSize: '10px', verticalAlign: 'middle' }}>
                학 력 사 항 (전적교 및 출신학과, 졸업예정 년월 기재)
              </td>
            </tr>
            {formData.education.map((item, index) => (
              <tr key={index}>
                <td style={{ ...cellStyle, textAlign: 'center', ...firstColStyle, height: '10mm', fontSize: '9px', verticalAlign: 'middle' }}>
                  {(index === 0 || formData.education[index - 1]?.content) && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1px' }}>
                      <input
                        type="text"
                        value={item.date.year}
                        onChange={(e) => handleArrayInputChange('education', index, 'date.year', e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                        onFocus={() => setActiveTooltip('education')}
                        onBlur={() => setActiveTooltip(null)}
                        data-field={`education-${index}-date-year`}
                        style={{ width: '32px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent', fontSize: '9px', padding: 0 }}
                        placeholder="____"
                        maxLength="4"
                      />
                      년
                      <input
                        type="text"
                        value={item.date.month}
                        onChange={(e) => handleArrayInputChange('education', index, 'date.month', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                        onFocus={() => setActiveTooltip('education')}
                        onBlur={() => setActiveTooltip(null)}
                        data-field={`education-${index}-date-month`}
                        style={{ width: '18px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent', fontSize: '9px', padding: 0 }}
                        placeholder="__"
                        maxLength="2"
                      />
                      월
                    </div>
                  )}
                </td>
                <td style={{ ...cellStyle, verticalAlign: 'middle' }}>
                  <input
                    type="text"
                    value={item.content}
                    onChange={(e) => handleArrayInputChange('education', index, 'content', e.target.value)}
                    onFocus={() => setActiveTooltip('education')}
                    onBlur={() => setActiveTooltip(null)}
                    data-field={`education-${index}-content`}
                    style={inputStyle}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 경력사항 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginTop: '-1px' }}>
          <tbody>
            <tr>
              <td style={{ ...cellStyle, background: '#f5f5f5', textAlign: 'center', ...firstColStyle, fontSize: '9px', verticalAlign: 'middle' }}>년월일 ~ 년월일</td>
              <td style={{ ...cellStyle, background: '#f5f5f5', textAlign: 'left', paddingLeft: '10px', fontSize: '10px', verticalAlign: 'middle' }}>
                경력사항 (아르바이트 경력 / 군경력의 경우, 근무지 및 주특기 기재)
              </td>
            </tr>
            {formData.experience.map((item, index) => (
              <tr key={index}>
                <td style={{ ...cellStyle, textAlign: 'center', ...firstColStyle, height: '10mm', fontSize: '8px', verticalAlign: 'middle' }}>
                  {(index === 0 || formData.experience[index - 1]?.content) && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}>
                      <input type="text" value={item.startDate.year} onChange={(e) => handleArrayInputChange('experience', index, 'startDate.year', e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} onFocus={() => setActiveTooltip('experience')} onBlur={() => setActiveTooltip(null)} data-field={`experience-${index}-startDate-year`} style={{ width: '28px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent', fontSize: '8px', padding: 0 }} placeholder="__" maxLength="4" />
                      .
                      <input type="text" value={item.startDate.month} onChange={(e) => handleArrayInputChange('experience', index, 'startDate.month', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} onFocus={() => setActiveTooltip('experience')} onBlur={() => setActiveTooltip(null)} data-field={`experience-${index}-startDate-month`} style={{ width: '16px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent', fontSize: '8px', padding: 0 }} placeholder="__" maxLength="2" />
                      .
                      <input type="text" value={item.startDate.day} onChange={(e) => handleArrayInputChange('experience', index, 'startDate.day', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} onFocus={() => setActiveTooltip('experience')} onBlur={() => setActiveTooltip(null)} data-field={`experience-${index}-startDate-day`} style={{ width: '16px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent', fontSize: '8px', padding: 0 }} placeholder="__" maxLength="2" />
                      ~
                      <input type="text" value={item.endDate.year} onChange={(e) => handleArrayInputChange('experience', index, 'endDate.year', e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} onFocus={() => setActiveTooltip('experience')} onBlur={() => setActiveTooltip(null)} data-field={`experience-${index}-endDate-year`} style={{ width: '28px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent', fontSize: '8px', padding: 0 }} placeholder="__" maxLength="4" />
                      .
                      <input type="text" value={item.endDate.month} onChange={(e) => handleArrayInputChange('experience', index, 'endDate.month', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} onFocus={() => setActiveTooltip('experience')} onBlur={() => setActiveTooltip(null)} data-field={`experience-${index}-endDate-month`} style={{ width: '16px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent', fontSize: '8px', padding: 0 }} placeholder="__" maxLength="2" />
                      .
                      <input type="text" value={item.endDate.day} onChange={(e) => handleArrayInputChange('experience', index, 'endDate.day', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} onFocus={() => setActiveTooltip('experience')} onBlur={() => setActiveTooltip(null)} data-field={`experience-${index}-endDate-day`} style={{ width: '16px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent', fontSize: '8px', padding: 0 }} placeholder="__" maxLength="2" />
                    </div>
                  )}
                </td>
                <td style={{ ...cellStyle, verticalAlign: 'middle' }}>
                  <input type="text" value={item.content} onChange={(e) => handleArrayInputChange('experience', index, 'content', e.target.value)} onFocus={() => setActiveTooltip('experience')} onBlur={() => setActiveTooltip(null)} data-field={`experience-${index}-content`} style={inputStyle} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 자격증 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginTop: '-1px' }}>
          <tbody>
            <tr>
              <td style={{ ...cellStyle, background: '#f5f5f5', textAlign: 'center', ...firstColStyle, fontSize: '10px', verticalAlign: 'middle' }}>년 월</td>
              <td style={{ ...cellStyle, background: '#f5f5f5', textAlign: 'left', paddingLeft: '10px', fontSize: '10px', verticalAlign: 'middle' }}>자 격 증</td>
            </tr>
            {formData.certifications.map((item, index) => (
              <tr key={index}>
                <td style={{ ...cellStyle, textAlign: 'center', ...firstColStyle, height: '10mm', fontSize: '9px', verticalAlign: 'middle' }}>
                  {(index === 0 || formData.certifications[index - 1]?.content) && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1px' }}>
                      <input type="text" value={item.date.year} onChange={(e) => handleArrayInputChange('certifications', index, 'date.year', e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} onFocus={() => setActiveTooltip('certifications')} onBlur={() => setActiveTooltip(null)} data-field={`certifications-${index}-date-year`} style={{ width: '32px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent', fontSize: '9px', padding: 0 }} placeholder="____" maxLength="4" />
                      년
                      <input type="text" value={item.date.month} onChange={(e) => handleArrayInputChange('certifications', index, 'date.month', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} onFocus={() => setActiveTooltip('certifications')} onBlur={() => setActiveTooltip(null)} data-field={`certifications-${index}-date-month`} style={{ width: '18px', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent', fontSize: '9px', padding: 0 }} placeholder="__" maxLength="2" />
                      월
                    </div>
                  )}
                </td>
                <td style={{ ...cellStyle, verticalAlign: 'middle' }}>
                  <input type="text" value={item.content} onChange={(e) => handleArrayInputChange('certifications', index, 'content', e.target.value)} onFocus={() => setActiveTooltip('certifications')} onBlur={() => setActiveTooltip(null)} data-field={`certifications-${index}-content`} style={inputStyle} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Skills + Hobbies Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginTop: '-1px' }}>
          <tbody>
            <tr>
              <td style={{ ...labelCellStyle, width: '80px', verticalAlign: 'middle' }}>구 분</td>
              <td style={{ ...cellStyle, textAlign: 'center', width: '35px', fontSize: '10px', verticalAlign: 'middle' }}>상</td>
              <td style={{ ...cellStyle, textAlign: 'center', width: '35px', fontSize: '10px', verticalAlign: 'middle' }}>중</td>
              <td style={{ ...cellStyle, textAlign: 'center', width: '35px', fontSize: '10px', verticalAlign: 'middle' }}>하</td>
              <td style={{ ...cellStyle, width: '120px', fontSize: '10px', verticalAlign: 'middle' }}>비고</td>
              <td colSpan="2" style={{ ...labelCellStyle, textAlign: 'center', verticalAlign: 'middle' }}>취미, 특기, 성격</td>
            </tr>
            {['english', 'word', 'excel', 'powerpoint', 'other'].map((skill, idx) => {
              const labels = ['영어회화', '워드', '엑셀', '파워포인트', '기타 사용\n가능한 PC'];
              const hobbyLabels = ['취미', '특기', '성격', '종교', '기타'];
              const hobbyKeys = ['hobby', 'specialty', 'personality', 'religion', 'other'];
              return (
                <tr key={skill}>
                  <td style={{ ...labelCellStyle, fontSize: '9px', lineHeight: '1.2' }}>
                    {labels[idx].split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < labels[idx].split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={formData.skills[skill].level === '상'}
                      onChange={(e) => handleSkillChange(skill, 'level', e.target.checked ? '상' : '')}
                      onFocus={() => setActiveTooltip(`skill${skill.charAt(0).toUpperCase() + skill.slice(1)}`)}
                      onBlur={() => setActiveTooltip(null)}
                      style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={formData.skills[skill].level === '중'}
                      onChange={(e) => handleSkillChange(skill, 'level', e.target.checked ? '중' : '')}
                      onFocus={() => setActiveTooltip(`skill${skill.charAt(0).toUpperCase() + skill.slice(1)}`)}
                      onBlur={() => setActiveTooltip(null)}
                      style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={formData.skills[skill].level === '하'}
                      onChange={(e) => handleSkillChange(skill, 'level', e.target.checked ? '하' : '')}
                      onFocus={() => setActiveTooltip(`skill${skill.charAt(0).toUpperCase() + skill.slice(1)}`)}
                      onBlur={() => setActiveTooltip(null)}
                      style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={cellStyle}>
                    <textarea
                      ref={(el) => inputRefs.current[`skillNotes-${skill}`] = el}
                      value={formData.skills[skill].note}
                      onChange={(e) => handleSkillChange(skill, 'note', e.target.value)}
                      onFocus={() => setActiveTooltip(`skill${skill.charAt(0).toUpperCase() + skill.slice(1)}`)}
                      onBlur={() => setActiveTooltip(null)}
                      rows={shouldWrap.skillNotes[skill] ? 2 : 1}
                      style={{ 
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        resize: 'none',
                        overflow: 'hidden',
                        fontSize: textSizes.skillNotes[skill],
                        padding: '2px',
                        wordWrap: 'break-word',
                        whiteSpace: shouldWrap.skillNotes[skill] ? 'normal' : 'nowrap',
                        lineHeight: '1.2',
                        fontFamily: 'inherit'
                      }}
                    />
                  </td>
                  <td style={{ ...labelCellStyle, width: '50px' }}>{hobbyLabels[idx]}</td>
                  <td style={cellStyle}>
                    <textarea
                      ref={(el) => inputRefs.current[`hobbies-${hobbyKeys[idx]}`] = el}
                      value={formData.hobbies[hobbyKeys[idx]]}
                      onChange={(e) => handleHobbyChange(hobbyKeys[idx], e.target.value)}
                      onFocus={() => setActiveTooltip(hobbyKeys[idx])}
                      onBlur={() => setActiveTooltip(null)}
                      rows={shouldWrap.hobbies[hobbyKeys[idx]] ? 2 : 1}
                      style={{ 
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        resize: 'none',
                        overflow: 'hidden',
                        fontSize: textSizes.hobbies[hobbyKeys[idx]],
                        padding: '2px',
                        wordWrap: 'break-word',
                        whiteSpace: shouldWrap.hobbies[hobbyKeys[idx]] ? 'normal' : 'nowrap',
                        lineHeight: '1.2',
                        fontFamily: 'inherit'
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGE 2: 자기소개서 */}
      <div className="a4-page" style={{ width: '210mm', minHeight: '297mm', background: 'white', margin: '0 auto 20px auto', padding: '15mm', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: '11px', color: '#333', marginBottom: '10px' }}>&lt;SGP 제출서식 -2&gt;</div>

        <div style={{ textAlign: 'center', fontSize: '16px', padding: '15px 0', borderBottom: '1px solid #000', marginBottom: '0' }}>
          <span>Sol Green Police</span> 자 기 소 개 서(우송대 제출용)
        </div>

        <div style={{ border: '1px solid #000', borderTop: 'none', minHeight: '230mm', padding: '15px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>* 성장배경</div>
            <textarea
              value={formData.selfIntro.background}
              onChange={(e) => handleSelfIntroChange('background', e.target.value)}
              onFocus={() => setActiveTooltip('background')}
              onBlur={() => setActiveTooltip(null)}
              style={{ width: '100%', minHeight: '45mm', border: 'none', outline: 'none', fontSize: '11px', resize: 'none', fontFamily: 'inherit', lineHeight: '1.8' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>* 성격의 강약점(장단점)</div>
            <textarea
              value={formData.selfIntro.personality}
              onChange={(e) => handleSelfIntroChange('personality', e.target.value)}
              onFocus={() => setActiveTooltip('personalityStrengths')}
              onBlur={() => setActiveTooltip(null)}
              style={{ width: '100%', minHeight: '45mm', border: 'none', outline: 'none', fontSize: '11px', resize: 'none', fontFamily: 'inherit', lineHeight: '1.8' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>* 지원동기</div>
            <textarea
              value={formData.selfIntro.motivation}
              onChange={(e) => handleSelfIntroChange('motivation', e.target.value)}
              onFocus={() => setActiveTooltip('motivation')}
              onBlur={() => setActiveTooltip(null)}
              style={{ width: '100%', minHeight: '45mm', border: 'none', outline: 'none', fontSize: '11px', resize: 'none', fontFamily: 'inherit', lineHeight: '1.8' }}
            />
          </div>

          <div style={{ marginBottom: '0' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>* 포부 및 비전</div>
            <textarea
              value={formData.selfIntro.vision}
              onChange={(e) => handleSelfIntroChange('vision', e.target.value)}
              onFocus={() => setActiveTooltip('vision')}
              onBlur={() => setActiveTooltip(null)}
              style={{ width: '100%', minHeight: '45mm', border: 'none', outline: 'none', fontSize: '11px', resize: 'none', fontFamily: 'inherit', lineHeight: '1.8' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SGPApplicationForm;