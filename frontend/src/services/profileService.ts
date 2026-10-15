import { supabase, isSupabaseConfigured } from './supabaseClient';
import { mockProfile } from './mockData';
import { UserProfile } from '../types/database.types';

let localProfile = { ...mockProfile };

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile> {
    if (!isSupabaseConfigured || !supabase) {
      return localProfile;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return localProfile;
      }
      return data as UserProfile;
    } catch {
      return localProfile;
    }
  },

  async updatePassword(_currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      if (newPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters.' };
      }
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update password' };
    }
  },
};

