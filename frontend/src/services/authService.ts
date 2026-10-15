import { fetchApi } from './apiClient';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { mockProfile } from './mockData';
import { UserProfile } from '../types/database.types';

export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    const token = localStorage.getItem('rf_jwt_token');
    if (token) {
      try {
        const res = await fetchApi<{ user: any }>('/api/auth/me');
        if (res && res.user) {
          localStorage.setItem('rf_user', JSON.stringify(res.user));
          return {
            id: res.user.id,
            full_name: res.user.full_name || res.user.name,
            email: res.user.email,
            phone: res.user.phone || '',
            university: res.user.university || 'University',
            department: res.user.department || 'Research',
            role: res.user.role || 'customer',
            created_at: res.user.created_at || new Date().toISOString(),
            updated_at: res.user.updated_at || new Date().toISOString(),
          } as UserProfile;
        }
      } catch (err) {
        // Fall back to cached user in localStorage if network error
        const cached = localStorage.getItem('rf_user');
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch {}
        }
      }
    }

    if (!isSupabaseConfigured || !supabase) {
      const demoAuth = localStorage.getItem('rf_auth');
      if (demoAuth === 'true') {
        const cached = localStorage.getItem('rf_user');
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch {}
        }
        return mockProfile;
      }
      return null;
    }

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
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

  async login(
    usernameOrEmail: string,
    pass: string
  ): Promise<{ user: UserProfile | null; error: string | null }> {
    const cleanInput = usernameOrEmail.trim();

    // 1. Authenticate with PostgreSQL Backend (Dynamic credentials)
    try {
      const res = await fetchApi<{
        success: boolean;
        token: string;
        user: any;
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: cleanInput,
          password: pass,
        }),
      });

      if (res && res.success && res.token && res.user) {
        localStorage.setItem('rf_jwt_token', res.token);
        localStorage.setItem('rf_user', JSON.stringify(res.user));
        localStorage.setItem('rf_auth', 'true');
        localStorage.setItem('rf_role', res.user.role);

        return {
          user: {
            id: res.user.id,
            full_name: res.user.full_name || res.user.name,
            email: res.user.email,
            phone: res.user.phone || '',
            university: res.user.university || 'University',
            department: res.user.department || 'Research',
            role: res.user.role || 'customer',
            created_at: res.user.created_at || new Date().toISOString(),
            updated_at: res.user.updated_at || new Date().toISOString(),
          } as UserProfile,
          error: null,
        };
      }
    } catch (apiErr: any) {
      console.warn('Backend API login failed:', apiErr.message);

      // If backend gave an explicit invalid credentials error, report it directly
      if (apiErr.message && !apiErr.message.includes('failed to fetch')) {
        return { user: null, error: apiErr.message };
      }
    }

    // 2. Demo fallback if backend is offline
    if (
      cleanInput.toLowerCase().includes('rahul') ||
      cleanInput === 'rahul.sharma' ||
      cleanInput === 'rahul@gmail.com' ||
      pass === 'research123' ||
      pass === 'Rahul@123'
    ) {
      localStorage.setItem('rf_auth', 'true');
      return { user: mockProfile, error: null };
    }

    if (cleanInput.includes('admin') && (pass === 'admin123' || pass === 'Admin@123')) {
      localStorage.setItem('rf_auth', 'true');
      localStorage.setItem('rf_role', 'admin');
      return {
        user: {
          ...mockProfile,
          id: 'usr-admin-01',
          full_name: 'Dr. Arvind Mehra (Lead Guide)',
          email: 'admin@researchflow.com',
          role: 'admin',
        },
        error: null,
      };
    }

    return {
      user: null,
      error: 'Invalid username or password. Please verify the credentials provided by your Administrator.',
    };
  },

  async logout(): Promise<void> {
    localStorage.removeItem('rf_jwt_token');
    localStorage.removeItem('rf_user');
    localStorage.removeItem('rf_auth');
    localStorage.removeItem('rf_role');
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
  },
};
