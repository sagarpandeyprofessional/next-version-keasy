/**
 * @file ContactModal.jsx
 * @description Modal component for applying to jobs via various contact methods.
 * 
 * Features:
 * - Displays all available contact methods provided by employer
 * - Opens appropriate app/link when contact method is clicked
 * - Tracks the application in database
 * - Shows confirmation after applying
 * - Bilingual support (EN/KO)
 * - Animated entrance/exit
 * 
 * @requires react
 * @requires framer-motion
 * @requires lucide-react
 * @requires react-icons
 * 
 * @author Keasy
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import {
  MdOutlineEmail,
  MdOutlinePhone,
  MdWhatsapp,
  MdContentCopy
} from 'react-icons/md';
import {
  FaInstagram,
  FaFacebook,
  FaGlobe
} from 'react-icons/fa';
import {
  modalOverlayVariants,
  modalContentVariants,
  CONTACT_METHODS
} from './jobsUtils';


/**
 * Contact method button component
 * 
 * @param {Object} props
 * @param {string} props.method - Contact method ID
 * @param {string} props.value - Contact value (email, phone, etc.)
 * @param {Function} props.onClick - Click handler
 * @param {string} props.lang - Language code
 * @param {boolean} props.applied - Whether already applied via this method
 */
const ContactMethodButton = ({ method, value, onClick, lang, applied }) => {
  const [copied, setCopied] = useState(false);
  
  // Get method configuration
  const config = CONTACT_METHODS[method];
  if (!config || !value) return null;
  
  const IconComponent = config.icon;
  
  // Handle copy to clipboard
  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  // Get display value (truncate if too long)
  const displayValue = value.length > 30 ? value.substring(0, 30) + '...' : value;
  
  return (
    <div className="relative">
      <button
        onClick={() => onClick(method, value)}
        className={`
          w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200
          ${applied
            ? 'bg-green-50 border-green-300 hover:bg-green-100'
            : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
          }
        `}
      >
        {/* Icon */}
        <div className={`
          p-3 rounded-full
          ${applied ? 'bg-green-100' : 'bg-gray-100'}
        `}>
          <IconComponent className={`w-6 h-6 ${config.color}`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 text-left">
          <p className="font-medium text-gray-900">
            {lang === 'ko' ? config.label_ko : config.label_en}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {displayValue}
          </p>
        </div>
        
        {/* Applied Badge or Arrow */}
        {applied ? (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">
              {lang === 'ko' ? '지원함' : 'Applied'}
            </span>
          </div>
        ) : (
          <ExternalLink className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute right-14 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title={lang === 'ko' ? '복사' : 'Copy'}
      >
        {copied ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
          <MdContentCopy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};


/**
 * ContactModal Component
 * 
 * Modal that displays all available contact methods for a job.
 * When a user clicks a contact method, it opens the appropriate app/link
 * and tracks the application in the database.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {Object} props.job - The job data object
 * @param {Object} props.company - The company data object
 * @param {Function} props.onApply - Callback when user applies (method, value) => void
 * @param {Array} props.appliedMethods - Array of methods user has already used to apply
 * @param {string} props.lang - Language code ('en' or 'ko')
 * @param {boolean} props.isLoading - Whether application is being processed
 * 
 * @returns {JSX.Element|null} The contact modal component
 * 
 * @example
 * <ContactModal
 *   isOpen={showContactModal}
 *   onClose={() => setShowContactModal(false)}
 *   job={selectedJob}
 *   company={selectedCompany}
 *   onApply={handleApply}
 *   appliedMethods={['email']}
 *   lang="en"
 * />
 */
const ContactModal = ({
  isOpen,
  onClose,
  job,
  company,
  onApply,
  appliedMethods = [],
  lang = 'en',
  isLoading = false
}) => {
  // State for showing success message
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAppliedMethod, setLastAppliedMethod] = useState(null);
  
  // Don't render if not open or no job
  if (!isOpen || !job) return null;
  
  // Get available contact methods from job
  const availableContacts = [
    { method: 'email', value: job.contact_email },
    { method: 'phone', value: job.contact_phone },
    { method: 'whatsapp', value: job.contact_whatsapp },
    { method: 'instagram', value: job.contact_instagram },
    { method: 'facebook', value: job.contact_facebook },
    { method: 'website', value: job.contact_website }
  ].filter(c => c.value); // Only show methods that have values
  
  /**
   * Handle contact method click
   * Opens the appropriate link and tracks the application
   */
  const handleContactClick = async (method, value) => {
    const config = CONTACT_METHODS[method];
    if (!config) return;
    
    // Get the URL to open
    const url = config.getUrl(value);
    
    // Track the application
    if (onApply && !appliedMethods.includes(method)) {
      await onApply(method, value);
      setLastAppliedMethod(method);
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setLastAppliedMethod(null);
      }, 3000);
    }
    
    // Open the link in new tab/app
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  /**
   * Handle backdrop click to close
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Check if user has applied via any method
  const hasAppliedAny = appliedMethods.length > 0;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalOverlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ============================================================
                HEADER
                ============================================================ */}
            <div className="relative p-6 pb-4 border-b border-gray-100">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900 pr-10">
                {lang === 'ko' ? '지원하기' : 'Apply for this Job'}
              </h2>
              
              {/* Job Info */}
              <p className="mt-1 text-sm text-gray-500">
                {job.title}
                {company?.name_en && (
                  <span> • {company.name_en}</span>
                )}
              </p>
            </div>
            
            {/* ============================================================
                CONTENT
                ============================================================ */}
            <div className="p-6">
              {/* Success Message */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-green-800">
                          {lang === 'ko' ? '지원 기록됨!' : 'Application tracked!'}
                        </p>
                        <p className="text-sm text-green-600">
                          {lang === 'ko' 
                            ? '지원 내역에서 확인할 수 있습니다.'
                            : 'You can view this in your applied jobs.'
                          }
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Info Notice */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    {lang === 'ko'
                      ? '연락 방법을 선택하면 지원 내역에 기록됩니다.'
                      : 'Selecting a contact method will be recorded in your application history.'
                    }
                  </p>
                </div>
              </div>
              
              {/* Contact Methods List */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  {lang === 'ko' ? '연락 방법 선택:' : 'Choose a contact method:'}
                </p>
                
                {availableContacts.length > 0 ? (
                  availableContacts.map(({ method, value }) => (
                    <ContactMethodButton
                      key={method}
                      method={method}
                      value={value}
                      onClick={handleContactClick}
                      lang={lang}
                      applied={appliedMethods.includes(method)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {lang === 'ko'
                        ? '연락처 정보가 없습니다.'
                        : 'No contact information available.'
                      }
                    </p>
                  </div>
                )}
              </div>
              
              {/* Already Applied Notice */}
              {hasAppliedAny && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                      {lang === 'ko'
                        ? `${appliedMethods.length}개의 방법으로 이미 지원했습니다.`
                        : `You've already applied via ${appliedMethods.length} method${appliedMethods.length > 1 ? 's' : ''}.`
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* ============================================================
                FOOTER
                ============================================================ */}
            <div className="p-6 pt-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                {lang === 'ko' ? '닫기' : 'Close'}
              </button>
            </div>
            
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


/**
 * QuickContactButtons Component
 * 
 * Smaller inline contact buttons for use in job cards or compact views.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.job - The job data object
 * @param {Function} props.onContactClick - Click handler (method, value) => void
 * @param {string} props.lang - Language code
 * 
 * @returns {JSX.Element} Quick contact buttons
 */
export const QuickContactButtons = ({ job, onContactClick, lang = 'en' }) => {
  if (!job) return null;
  
  const contacts = [
    { method: 'email', value: job.contact_email },
    { method: 'phone', value: job.contact_phone },
    { method: 'whatsapp', value: job.contact_whatsapp },
    { method: 'instagram', value: job.contact_instagram }
  ].filter(c => c.value).slice(0, 3); // Show max 3
  
  if (contacts.length === 0) return null;
  
  return (
    <div className="flex items-center gap-2">
      {contacts.map(({ method, value }) => {
        const config = CONTACT_METHODS[method];
        if (!config) return null;
        
        const IconComponent = config.icon;
        
        return (
          <button
            key={method}
            onClick={(e) => {
              e.stopPropagation();
              onContactClick?.(method, value);
            }}
            className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ${config.color}`}
            title={lang === 'ko' ? config.label_ko : config.label_en}
          >
            <IconComponent className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
};


export default ContactModal;
