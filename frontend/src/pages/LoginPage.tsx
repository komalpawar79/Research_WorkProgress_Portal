import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Shield, ArrowRight, Layers, GraduationCap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('rahul@gmail.com');
  const [password, setPassword] = useState('research123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      showToast('Welcome back, Rahul!', 'success');
      navigate('/');
    } else {
      showToast(res.error || 'Invalid credentials', 'error');
    }
  };

  const handleDemoScholarLogin = async () => {
    setEmail('rahul@gmail.com');
    setPassword('research123');
    setLoading(true);
    const res = await login('rahul@gmail.com', 'research123');
    setLoading(false);
    if (res.success) {
      showToast('Logged in as Scholar (Rahul Sharma)', 'success');
      navigate('/');
    }
  };

  const handleDemoAdminLogin = async () => {
    setEmail('admin@researchflow.com');
    setPassword('admin123');
    setLoading(true);
    const res = await login('admin@researchflow.com', 'admin123');
    setLoading(false);
    if (res.success) {
      showToast('Welcome to Admin Console (Super Admin)', 'success');
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-4xl bg-surface rounded-3xl shadow-card border border-border overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Academic Imagery & Quote (Matching Reference Screen 1) */}
        <div className="relative bg-[#263A33] text-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden min-h-[420px] md:min-h-[580px]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1000&auto=format&fit=crop&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A2823] via-[#263A33]/80 to-[#263A33]/40" />

          {/* Academic badge on top */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#375248] border border-[#486B5E] flex items-center justify-center text-[#EAF3EC] shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase font-mono tracking-widest text-[#B7C7BF]">
              Academic Portal
            </span>
          </div>

          {/* Center Graphic */}
          <div className="relative z-10 my-auto py-8">
            <div className="w-20 h-20 rounded-2xl bg-[#B78352]/20 border border-[#B78352]/40 backdrop-blur-sm flex items-center justify-center mb-6 shadow-inner">
              <Layers className="w-10 h-10 text-[#E8C5A4]" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
              Guiding Your Research to Completion.
            </h2>
            <p className="text-xs sm:text-sm text-[#B7C7BF] mt-3 leading-relaxed">
              Track your milestones, preview reviewed chapters with verified protection, and align with your supervisor effortlessly.
            </p>
          </div>

          {/* Bottom Quote from reference image */}
          <div className="relative z-10 pt-4 border-t border-[#375248]">
            <p className="font-serif text-sm sm:text-base italic text-[#E5ECE8]">
              "Better Research, Brighter Future"
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-between bg-surface">
          <div>
            {/* Logo and Brand */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#B78352] to-[#8C5F35] flex items-center justify-center text-white shadow-sm">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-serif text-xl font-bold text-editorial-dark leading-none">
                  ResearchFlow
                </h1>
                <p className="text-[10px] text-editorial-muted font-medium mt-1">
                  Research Work Management & Delivery Portal
                </p>
              </div>
            </div>

            {/* Welcome title */}
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-bold text-editorial-dark">
                Welcome Back
              </h2>
              <p className="text-xs text-editorial-muted mt-1">
                Sign in to continue your research journey
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <User className="w-4 h-4 text-editorial-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Username / Email"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-background/50 focus:bg-white border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-editorial-dark transition-all placeholder:text-editorial-muted"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-editorial-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-background/50 focus:bg-white border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-editorial-dark transition-all placeholder:text-editorial-muted"
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

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-editorial-dark">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary accent-primary"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() =>
                    showToast('Please contact your ResearchFlow admin to reset password.', 'info')
                  }
                  className="text-editorial-muted hover:text-editorial-dark hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover active:scale-98 text-white text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Authenticating...' : 'Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Access Options */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleDemoScholarLogin}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-[#B78352] text-[#B78352] hover:bg-[#FBF6F0] text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Scholar Demo (Rahul Sharma)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDemoAdminLogin}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-[#263A33] text-[#263A33] hover:bg-[#EAF3EC] text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#266C44]" />
                  <span>Admin Console Demo (Super Admin)</span>
                </button>
              </div>
            </form>
          </div>

          <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-center gap-2 text-[11px] text-editorial-muted text-center">
            <Shield className="w-3.5 h-3.5 text-[#266C44] flex-shrink-0" />
            <span>
              Your data is secure and confidential. We respect your privacy.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
