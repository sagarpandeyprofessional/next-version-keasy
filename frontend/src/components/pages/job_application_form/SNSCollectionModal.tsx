// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, Instagram } from 'lucide-react';

const SNSCollectionModal = ({ isOpen, onClose, onSubmit, action, initialData = {} }) => {
  const [contacts, setContacts] = useState({
    email: initialData.email || '',
    phone: initialData.phone || '',
    whatsapp: initialData.whatsapp || '',
    instagram: initialData.instagram || '',
    facebook: initialData.facebook || '',
    tiktok: initialData.tiktok || '',
    kakaotalk: initialData.kakaotalk || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^[\d\s\-\+\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const handleSubmit = async () => {
    const newErrors = {};
    
    if (!contacts.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(contacts.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!contacts.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(contacts.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(contacts);
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setContacts({ ...contacts, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  if (!isOpen) return null;

  const actionText = {
    print: 'print your application',
    download: 'download your PDF',
    apply: 'submit your application'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Connect Your Social Media</h2>
          <p className="text-sm text-gray-600 mt-2">
            Please provide your contact information to {actionText[action] || 'proceed'}
          </p>
        </div>

        <div className="p-6 space-y-3">
          <ContactField
            icon={<Mail className="w-5 h-5 text-red-500" />}
            label="Email"
            placeholder="keasy.contact@gmail.com"
            value={contacts.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            error={errors.email}
            applied={!!contacts.email && !errors.email}
          />

          <ContactField
            icon={<Phone className="w-5 h-5 text-green-500" />}
            label="Phone"
            placeholder="010-9695-9805"
            value={contacts.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
            error={errors.phone}
            applied={!!contacts.phone && !errors.phone}
          />

          <ContactField
            icon={<MessageCircle className="w-5 h-5 text-green-600" />}
            label="WhatsApp"
            placeholder="+82 10-9695-9805"
            value={contacts.whatsapp}
            onChange={(e) => handleChange('whatsapp', e.target.value)}
            applied={!!contacts.whatsapp}
          />

          <ContactField
            icon={<Instagram className="w-5 h-5 text-pink-500" />}
            label="Instagram"
            placeholder="@keasy___"
            value={contacts.instagram}
            onChange={(e) => handleChange('instagram', e.target.value)}
            applied={!!contacts.instagram}
          />

          <ContactField
            icon={<svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
            label="Facebook"
            placeholder="facebook.com/username"
            value={contacts.facebook}
            onChange={(e) => handleChange('facebook', e.target.value)}
            applied={!!contacts.facebook}
          />

          <ContactField
            icon={<span className="text-xl">🎵</span>}
            label="TikTok"
            placeholder="@username"
            value={contacts.tiktok}
            onChange={(e) => handleChange('tiktok', e.target.value)}
            applied={!!contacts.tiktok}
          />

          <ContactField
            icon={<span className="text-xl">💬</span>}
            label="KakaoTalk"
            placeholder="Kakao ID"
            value={contacts.kakaotalk}
            onChange={(e) => handleChange('kakaotalk', e.target.value)}
            applied={!!contacts.kakaotalk}
          />
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !contacts.email || !contacts.phone}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ContactField = ({ icon, label, placeholder, value, onChange, required, error, applied }) => (
  <div>
    <div className={`bg-green-50 border-2 ${error ? 'border-red-300' : 'border-green-200'} rounded-xl p-4 flex items-center gap-4 transition-colors`}>
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-gray-600 text-sm mt-1 placeholder-gray-400"
        />
      </div>
      {applied && !error && (
        <div className="flex items-center gap-1 text-green-600 text-sm font-medium flex-shrink-0">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="hidden sm:inline">Applied</span>
        </div>
      )}
    </div>
    {error && (
      <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>
    )}
  </div>
);

export default SNSCollectionModal;
