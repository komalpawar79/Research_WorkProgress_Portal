import { supabase, isSupabaseConfigured } from './supabaseClient';
import { mockProfile } from './mockData';
import { UserProfile } from '../types/database.types';

export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured || !supabase) {
      // Return demo user if logged in via local storage
      const demoAuth = localStorage.getItem('rf_auth');
      if (demoAuth === 'true') {
        return mockProfile;
      }
      return null;
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !profile) {
        return {
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || 'Research Scholar',
          email: session.user.email || '',
          phone: '',
          university: 'XYZ University',
          department: 'Computer Science',
          role: 'student',
          created_at: session.user.created_at,
          updated_at: session.user.created_at,
        };
      }

      return profile as UserProfile;
    } catch (err) {
      console.warn('Auth check error, falling back to null', err);
      return null;
    }
  },

  async login(email: string, password: string):Promise<{ user: UserProfile | null; error: string | null }> {
    // Demo account shortcut
    if (!isSupabaseConfigured || !supabase) {
      // Allow demo login
      if (email.toLowerCase().includes('rahul') || email === 'rahul@gmail.com' || password === 'research123') {
        localStorage.setItem('rf_auth', 'true');
        return { user: mockProfile, error: null };
      }
      // Or accept any valid email for effortless testing
      if (email.includes('@') && password.length >= 4) {
        localStorage.setItem('rf_auth', 'true');
        return { user: { ...mockProfile, email }, error: null };
      }
      return { user: null, error: 'Invalid credentials. Use demo: rahul@gmail.com / research123' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        return {
          user: (profile as UserProfile) || {
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || 'Scholar',
            email: data.user.email || '',
            phone: '',
            university: 'University',
            department: 'Research',
            role: 'student',
            created_at: data.user.created_at,
            updated_at: data.user.created_at,
          },
          error: null,
        };
      }

      return { user: null, error: 'Authentication failed' };
    } catch (err: any) {
      return { user: null, error: err.message || 'Login failed' };
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('rf_auth');
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
  }
};

