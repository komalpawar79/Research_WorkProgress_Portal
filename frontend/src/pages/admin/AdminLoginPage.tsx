import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, User, Eye, EyeOff, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('admin@researchflow.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const res = await login(usernameOrEmail, password);
    setLoading(false);

    if (res.success) {
      const storedRole = localStorage.getItem('rf_role');
      if (storedRole && storedRole !== 'admin') {
        setErrorMessage('Access Denied: This is the Administrator Portal. Scholar / Student accounts must sign in through the Scholar Portal.');
        showToast('Scholar accounts must use the Scholar Login page', 'error');
        return;
      }

      showToast('Welcome to ResearchFlow Admin Console', 'success');
      navigate('/admin/dashboard');
    } else {
      setErrorMessage(res.error || 'Invalid administrator username or password.');
      showToast(res.error || 'Admin login failed', 'error');
    }
  };

  const handleQuickDemoAdmin = async () => {
    setUsernameOrEmail('admin@researchflow.com');
    setPassword('admin123');
    setLoading(true);
    setErrorMessage(null);
    const res = await login('admin@researchflow.com', 'admin123');
    setLoading(false);

    if (res.success) {
      showToast('Signed in as Super Admin', 'success');
      navigate('/admin/dashboard');
    } else {
      showToast(res.error || 'Quick login failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#182620] flex items-center justify-center p-4 sm:p-6 lg:p-10 text-editorial-dark">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Security & Administrative Visual */}
        <div className="relative bg-[#1A2E26] text-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden min-h-[420px] md:min-h-[560px]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E1A15] via-[#1A2E26]/90 to-[#1A2E26]/50" />

          {/* Top Badge */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#284439] border border-[#3C6454] flex items-center justify-center text-[#EAF3EC] shadow-sm">
              <ShieldCheck className="w-5 h-5 text-[#88D49E]" />
            </div>
            <span className="text-xs uppercase font-mono tracking-widest text-[#B0C7BD]">
              Administrative Console
            </span>
          </div>

          {/* Center Graphic */}
          <div className="relative z-10 my-auto py-6">
            <div className="w-16 h-16 rounded-2xl bg-[#C59B6D]/20 border border-[#C59B6D]/40 backdrop-blur-sm flex items-center justify-center mb-5 shadow-inner">
              <KeyRound className="w-8 h-8 text-[#E8BA85]" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
              ResearchFlow Control Center
            </h2>
            <p className="text-xs sm:text-sm text-[#A8BEB4] mt-3 leading-relaxed">
              Supervise active dissertations, approve chapter progress updates, verify documents, and manage client milestone releases.
            </p>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#A8BEB4]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Secure 256-Bit SSL Enforced
            </span>
            <span>Version 2.4.0</span>
          </div>
        </div>

        {/* Right Side: Admin Login Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-between bg-surface">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-2xl font-bold text-editorial-dark">
                  Admin Sign In
                </h3>
                <p className="text-xs text-editorial-muted mt-1">
                  Enter your administrative credentials to continue.
                </p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 rounded-full">
                Admin Only
              </span>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{errorMessage}</span>
                  {errorMessage.includes('Scholar') && (
                    <div className="mt-1.5">
                      <Link to="/login" className="font-semibold underline hover:text-red-900">
                        Switch to Scholar Login Page &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              {/* Username or Email */}
              <div>
                <label className="block text-xs font-semibold text-editorial-dark mb-1.5">
                  Admin Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-editorial-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="admin or admin@researchflow.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-background focus:bg-white border border-border rounded-xl outline-none focus:border-primary text-editorial-dark transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-editorial-dark mb-1.5">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-editorial-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-background focus:bg-white border border-border rounded-xl outline-none focus:border-primary text-editorial-dark transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-editorial-muted hover:text-editorial-dark"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-0"
                  />
                  <span className="text-editorial-muted">Remember this workstation</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-primary hover:bg-primary-hover active:scale-98 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating Admin...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo 1-Click Button */}
              <button
                type="button"
                onClick={handleQuickDemoAdmin}
                disabled={loading}
                className="w-full py-2.5 px-3 bg-background hover:bg-background-alt text-editorial-dark text-xs font-semibold rounded-xl border border-border transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#C59B6D]" />
                <span>Quick Demo Admin Access</span>
              </button>
            </form>
          </div>

          {/* Switch to Scholar Portal */}
          <div className="pt-6 mt-6 border-t border-border/60 text-center">
            <p className="text-xs text-editorial-muted">
              Are you a Research Scholar / Student?{' '}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                Go to Scholar Portal &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
