// src/pages/job_application_form/utils/securityUtils.js

export const initSecurity = () => {
  disableRightClick();
  disableKeyboardShortcuts();
};

export const disableRightClick = () => {
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };
  
  document.addEventListener('contextmenu', handleContextMenu);
  return () => document.removeEventListener('contextmenu', handleContextMenu);
};

export const disableKeyboardShortcuts = () => {
  const handleKeyDown = (e) => {
    // F12
    if (e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+I / Cmd+Option+I
    if ((e.ctrlKey && e.shiftKey && e.keyCode === 73) || 
        (e.metaKey && e.altKey && e.keyCode === 73)) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+C / Cmd+Option+C
    if ((e.ctrlKey && e.shiftKey && e.keyCode === 67) || 
        (e.metaKey && e.altKey && e.keyCode === 67)) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+S / Cmd+S
    if ((e.ctrlKey && e.keyCode === 83) || 
        (e.metaKey && e.keyCode === 83)) {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+U / Cmd+U
    if ((e.ctrlKey && e.keyCode === 85) || 
        (e.metaKey && e.keyCode === 85)) {
      e.preventDefault();
      return false;
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
};