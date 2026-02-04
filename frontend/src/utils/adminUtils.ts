/**
 * Admin utilities for managing superuser roles and permissions
 */

import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

// Superadmin emails (for backward compatibility and initial setup)
const SUPERADMIN_EMAILS = [
  'admin@keasy.com',
  'admin@example.com',
  'superuser@keasy.com' // Add your email here for testing
];

const SUPERADMIN_ROLE = 'superadmin';
const LEGACY_SUPERUSER_ROLE = 'superuser';

// Check if user is a superadmin
export const isSuperadmin = async (user: User | null) => {
  if (!user) return false;

  // Check hardcoded superadmin emails first (for backward compatibility)
  if (user.email && SUPERADMIN_EMAILS.includes(user.email)) {
    return true;
  }

  try {
    // Check if user has superadmin role in profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking superadmin role:', error);
      return false;
    }

    return profile?.role === SUPERADMIN_ROLE || profile?.role === LEGACY_SUPERUSER_ROLE;
  } catch (err) {
    console.error('Error in isSuperadmin check:', err);
    return false;
  }
};

// Promote user to superadmin
export const promoteToSuperadmin = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: SUPERADMIN_ROLE })
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error promoting to superadmin:', err);
    throw err;
  }
};

// Demote superadmin to regular user
export const demoteSuperadmin = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: null })
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error demoting superadmin:', err);
    throw err;
  }
};

// Get all superadmins
export const getSuperadmins = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, username, role, created_at')
      .eq('role', SUPERADMIN_ROLE);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error getting superadmins:', err);
    return [];
  }
};

// Check if current user can manage superadmins
export const canManageSuperadmins = async (currentUser: User | null) => {
  if (!currentUser) return false;

  // Only superadmins can manage other superadmins
  return await isSuperadmin(currentUser);
};

// Backward-compatible exports
export const isSuperuser = isSuperadmin;
export const promoteToSuperuser = promoteToSuperadmin;
export const demoteSuperuser = demoteSuperadmin;
export const getSuperusers = getSuperadmins;
export const canManageSuperusers = canManageSuperadmins;
