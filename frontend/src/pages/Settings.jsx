// SettingsPage.jsx
import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock auth context (replace with your real auth hook)
const useAuthMock = () => {
  const [user] = useState({ id: 1, username: 'current_user' });
  const [profile] = useState({ username: 'current_user', avatar_url: '' });
  const [isLoading] = useState(false);

  const updateProfile = async (profileData) => {
    // Simulate API call
    await new Promise((r) => setTimeout(r, 500));
    // Example: return { error: null } or { error: { message: 'username already exists' } }
    return { error: null };
  };

  return { user, profile, isLoading, updateProfile };
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, profile, isLoading, updateProfile } = useAuthMock();

  const [formData, setFormData] = useState({
    username: '',
    avatar_url: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth/login');
    }
  }, [user, isLoading, navigate]);

  // Initialize form data
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        username: profile.username || '',
        avatar_url: profile.avatar_url || '',
      }));
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }

    // Clear success message
    if (successMessage) setSuccessMessage(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.username.trim()) {
      if (formData.username.length < 3)
        newErrors.username = 'Username must be at least 3 characters';
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username))
        newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (formData.avatar_url && !isValidURL(formData.avatar_url)) {
      newErrors.avatar_url = 'Please enter a valid URL';
    }

    if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword)
        newErrors.currentPassword = 'Current password is required to change password';
      if (!formData.newPassword)
        newErrors.newPassword = 'New password is required';
      else if (formData.newPassword.length < 8)
        newErrors.newPassword = 'Password must be at least 8 characters';
      if (formData.newPassword !== formData.confirmPassword)
        newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsUpdating(true);
    setSuccessMessage(null);

    try {
      const profileData = {
        username: formData.username || null,
        avatar_url: formData.avatar_url || null,
      };

      const { error } = await updateProfile(profileData);

      if (error) {
        if (error.message.includes('username')) {
          setErrors({ ...errors, username: 'This username is already taken' });
        } else {
          throw error;
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
        setSuccessMessage('Profile updated successfully');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      if (!errors.username && !errors.avatar_url) {
        setErrors({ ...errors, form: 'Failed to update profile. Please try again.' });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading)
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
          <p className="ml-4 text-lg text-gray-600">Loading settings...</p>
        </div>
      </div>
    );

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-black">Account Settings</h1>

        {successMessage && (
          <div className="mb-6 rounded-md bg-green-50 p-4 text-green-700">
            {successMessage}
          </div>
        )}

        {errors.form && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-red-700">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h2 className="mb-4 text-xl font-semibold text-black">Profile Information</h2>

            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-black focus:ring-1 focus:ring-black"
                placeholder="Enter a unique username"
              />
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Usernames must be at least 3 characters and can only contain letters, numbers, and underscores.
              </p>
            </div>

            <div>
              <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700">
                Profile Picture URL
              </label>
              <input
                type="text"
                id="avatar_url"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-black focus:ring-1 focus:ring-black"
                placeholder="https://example.com/avatar.jpg"
              />
              {errors.avatar_url && <p className="mt-1 text-sm text-red-600">{errors.avatar_url}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Enter a URL to an image you want to use as your profile picture. Leave blank to use initials.
              </p>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h2 className="mb-4 text-xl font-semibold text-black">Password</h2>

            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-black focus:ring-1 focus:ring-black"
              />
              {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-black focus:ring-1 focus:ring-black"
              />
              {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
              <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long.</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-black focus:ring-1 focus:ring-black"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <p className="mt-2 text-sm text-yellow-600">
              Note: Password change functionality is coming soon.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="rounded-md border border-black bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-70"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
