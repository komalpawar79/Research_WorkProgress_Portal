import { BACKEND_URL } from './apiClient';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { mockProfile } from './mockData';
import { UserProfile } from '../types/database.types';

export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    // 1. Check stored user in localStorage
    const storedUser = localStorage.getItem('rf_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {}
    }

    // 2. Check token with backend
    const token = localStorage.getItem('rf_firebase_token');
    if (token) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.user) {
            const profile: UserProfile = {
              id: data.user.id,
              full_name: data.user.name || data.user.full_name || 'Scholar',
              email: data.user.email,
              phone: '',
              university: data.user.university || 'IIT Delhi',
              department: 'Computer Science & AI',
              role: data.user.role === 'admin' ? 'admin' : 'student',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            localStorage.setItem('rf_user', JSON.stringify(profile));
            return profile;
          }
        }
      } catch {}
    }

    if (localStorage.getItem('rf_auth') === 'true') {
      return mockProfile;
    }

    // 3. Supabase fallback
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) return null;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) return profile as UserProfile;
      } catch {}
    }

    return null;
  },

  async login(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> {
    // 1. Authenticate with PostgreSQL Backend API
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('rf_firebase_token', data.token);
        localStorage.setItem('rf_auth', 'true');

        const user: UserProfile = {
          id: data.user.id,
          full_name: data.user.name || data.user.full_name || 'Scholar',
          email: data.user.email,
          phone: '',
          university: data.user.university || 'IIT Delhi',
          department: 'Computer Science & AI',
          role: data.user.role === 'admin' ? 'admin' : 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        localStorage.setItem('rf_user', JSON.stringify(user));
        return { user, error: null };
      }

      if (!res.ok) {
        return { user: null, error: data.error || 'Invalid credentials' };
      }
    } catch (err: any) {
      console.warn('Backend login connection error, using local fallback:', err);
    }

    // 2. Demo fallback
    if (email.toLowerCase().includes('admin') || password.includes('admin')) {
      const adminUser: UserProfile = {
        ...mockProfile,
        id: 'usr-admin-01',
        full_name: 'Dr. Arvind Mehra (Lead Guide)',
        email: 'admin@researchflow.com',
        role: 'admin',
      };
      localStorage.setItem('rf_firebase_token', 'demo-admin-token');
      localStorage.setItem('rf_auth', 'true');
      localStorage.setItem('rf_user', JSON.stringify(adminUser));
      return { user: adminUser, error: null };
    }

    if (email.toLowerCase().includes('rahul') || password.includes('123')) {
      localStorage.setItem('rf_firebase_token', 'demo-token');
      localStorage.setItem('rf_auth', 'true');
      localStorage.setItem('rf_user', JSON.stringify(mockProfile));
      return { user: mockProfile, error: null };
    }

    return { user: null, error: 'Invalid credentials. Use demo: rahul.sharma / Rahul@123' };
  },

  async logout(): Promise<void> {
    localStorage.removeItem('rf_auth');
    localStorage.removeItem('rf_firebase_token');
    localStorage.removeItem('rf_user');
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
  },
};
