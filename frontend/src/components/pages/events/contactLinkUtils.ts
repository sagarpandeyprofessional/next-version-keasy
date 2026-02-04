// Utility functions for generating contact links based on type and username/number

/**
 * Generates the appropriate contact link based on contact type
 * @param {string} type - The contact type (telegram, whatsapp, instagram, etc.)
 * @param {string} value - The username or phone number
 * @returns {string} - The generated contact link
 */
type ValidationResult = { valid: boolean; message: string };

export function generateContactLink(type: string, value: string) {
  if (!value || !type) return '';
  
  // Remove @ symbol if user included it
  const cleanValue = value.trim().replace(/^@+/, '');
  
  if (!cleanValue) return '';

  const linkGenerators: Record<string, (val: string) => string> = {
    telegram: (val) => `https://t.me/${val}`,
    whatsapp: (val) => {
      // Remove all non-numeric characters
      const phone = val.replace(/\D/g, '');
      return `https://wa.me/${phone}`;
    },
    instagram: (val) => `https://instagram.com/${val}`,
    messenger: (val) => `https://m.me/${val}`,
    'kakao talk': (val) => `https://open.kakao.com/o/${val}`,
    email: (val) => `mailto:${val}`,
    message: (val) => {
      // Remove all non-numeric characters for SMS
      const phone = val.replace(/\D/g, '');
      return `sms:${phone}`;
    },
  };

  const generator = linkGenerators[type.toLowerCase()];
  return generator ? generator(cleanValue) : '';
}

/**
 * Validates the input value based on contact type
 * @param {string} type - The contact type
 * @param {string} value - The username or phone number
 * @returns {object} - { valid: boolean, message: string }
 */
export function validateContactInput(type: string, value: string): ValidationResult {
  if (!value || !type) {
    return { valid: false, message: 'Please enter a value' };
  }

  const cleanValue = value.trim().replace(/^@+/, '');
  
  if (!cleanValue) {
    return { valid: false, message: 'Please enter a valid value' };
  }

  const validators: Record<string, (val: string) => ValidationResult> = {
    telegram: (val) => {
      if (val.length < 5) {
        return { valid: false, message: 'Telegram username must be at least 5 characters' };
      }
      if (!/^[a-zA-Z0-9_]+$/.test(val)) {
        return { valid: false, message: 'Telegram username can only contain letters, numbers, and underscores' };
      }
      return { valid: true, message: '' };
    },
    whatsapp: (val) => {
      const phone = val.replace(/\D/g, '');
      if (phone.length < 10) {
        return { valid: false, message: 'Please enter a valid phone number (at least 10 digits)' };
      }
      return { valid: true, message: '' };
    },
    instagram: (val) => {
      if (val.length < 1) {
        return { valid: false, message: 'Instagram username is required' };
      }
      if (!/^[a-zA-Z0-9._]+$/.test(val)) {
        return { valid: false, message: 'Instagram username can only contain letters, numbers, dots, and underscores' };
      }
      return { valid: true, message: '' };
    },
    messenger: (val) => {
      if (val.length < 1) {
        return { valid: false, message: 'Messenger username is required' };
      }
      return { valid: true, message: '' };
    },
    'kakao talk': (val) => {
      if (val.length < 1) {
        return { valid: false, message: 'KakaoTalk open chat link ID is required' };
      }
      return { valid: true, message: '' };
    },
    email: (val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        return { valid: false, message: 'Please enter a valid email address' };
      }
      return { valid: true, message: '' };
    },
    message: (val) => {
      const phone = val.replace(/\D/g, '');
      if (phone.length < 10) {
        return { valid: false, message: 'Please enter a valid phone number (at least 10 digits)' };
      }
      return { valid: true, message: '' };
    },
  };

  const validator = validators[type.toLowerCase()];
  return validator ? validator(cleanValue) : { valid: true, message: '' };
}

/**
 * Gets placeholder text based on contact type
 * @param {string} type - The contact type
 * @returns {string} - Placeholder text
 */
export function getContactPlaceholder(type: string) {
  const placeholders = {
    telegram: 'Enter username (without @)',
    whatsapp: 'Enter phone number (e.g., 821012345678)',
    instagram: 'Enter username (without @)',
    messenger: 'Enter username or user ID',
    'kakao talk': 'Enter open chat link ID',
    email: 'Enter email address',
    message: 'Enter phone number (e.g., 821012345678)',
  };

  return placeholders[type.toLowerCase()] || 'Enter contact information';
}

/**
 * Gets helper text based on contact type
 * @param {string} type - The contact type
 * @returns {string} - Helper text
 */
export function getContactHelperText(type: string) {
  const helperTexts = {
    telegram: 'No need to include @ symbol',
    whatsapp: 'Include country code (e.g., 82 for Korea)',
    instagram: 'Your Instagram username without @',
    messenger: 'Your Facebook/Messenger username',
    'kakao talk': 'The ID from your KakaoTalk open chat link',
    email: 'Your contact email address',
    message: 'Include country code for international numbers',
  };

  return helperTexts[type.toLowerCase()] || '';
}
