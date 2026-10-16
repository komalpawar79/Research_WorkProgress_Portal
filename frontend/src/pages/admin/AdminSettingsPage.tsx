import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { BotanicalIllustration } from '../../components/dashboard/BotanicalIllustration';
import { adminService } from '../../services/adminService';
import {
  User,
  Mail,
  Phone,
  Pencil,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();

  // Profile State
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: 'Dr. Arvind Mehra (Lead Guide)',
    username: 'admin',
    email: 'admin@researchflow.com',
    phone: '+91 98111 22233',
    role: 'admin',
  });

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
  });

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await adminService.getProfile();
      if (res) {
        const loaded = {
          fullName: res.full_name || res.fullName || res.name || 'Dr. Arvind Mehra (Lead Guide)',
          username: res.username || 'admin',
          email: res.email || 'admin@researchflow.com',
          phone: res.phone || '+91 98111 22233',
          role: res.role || 'admin',
        };
        setProfileData(loaded);
        setFormData({
          fullName: loaded.fullName,
          username: loaded.username,
          email: loaded.email,
          phone: loaded.phone,
        });
      }
    } catch (err) {
      console.error('Error loading admin profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setFormData({
      fullName: profileData.fullName,
      username: profileData.username,
      email: profileData.email,
      phone: profileData.phone,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      showToast('Full name cannot be empty', 'error');
      return;
    }
    if (!formData.email.trim()) {
      showToast('Email address cannot be empty', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await adminService.updateProfile({
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });

      if (res && (res.success || res.user)) {
        const updatedAdmin = {
          id: res.user?.id || 'usr-admin-01',
          full_name: formData.fullName.trim(),
          name: formData.fullName.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          role: 'admin',
        };

        // Instantly update localStorage & notify AdminHeader across the app
        localStorage.setItem('rf_user', JSON.stringify(updatedAdmin));
        window.dispatchEvent(new CustomEvent('adminProfileUpdated', { detail: updatedAdmin }));

        setProfileData({
          ...profileData,
          fullName: formData.fullName.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        });

        showToast('Admin personal information updated successfully!', 'success');
        setIsEditing(false);
      } else {
        showToast(res?.message || 'Failed to update profile.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating admin profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    try {
      setUpdatingPassword(true);
      const res = await adminService.updatePassword({
        currentPassword,
        newPassword,
      });

      if (res && res.success) {
        showToast('Admin password updated successfully in database!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(res?.error || res?.message || 'Failed to update password', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border/60">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark tracking-tight">
            Admin Profile & Settings
          </h1>
          <p className="text-xs sm:text-sm text-editorial-muted mt-1">
            Manage your personal profile information, administrative username, and account security.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Verified Administrator
          </span>
        </div>
      </div>

      {/* Grid matching reference Screen 11 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Personal Information Card */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-7 shadow-card transition-all">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-border/60">
            <div>
              <h3 className="font-serif text-base font-bold text-editorial-dark">
                Personal Information
              </h3>
              <p className="text-xs text-editorial-muted">
                Admin contact & administrative identity
              </p>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={handleEditClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 active:scale-95 border border-primary/20 rounded-xl transition-all shadow-sm"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-editorial-muted hover:text-editorial-dark bg-background hover:bg-background-alt border border-border rounded-xl transition-all"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-editorial-muted">
              <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
              <p className="text-xs">Loading admin profile...</p>
            </div>
          ) : !isEditing ? (
            /* Read-Only View */
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start justify-between py-2.5 border-b border-border/50">
                <span className="text-editorial-muted font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Full Name
                </span>
                <span className="font-semibold text-editorial-dark text-right">
                  {profileData.fullName}
                </span>
              </div>

              <div className="flex items-start justify-between py-2.5 border-b border-border/50">
                <span className="text-editorial-muted font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Username
                </span>
                <span className="font-mono font-medium text-editorial-dark text-right bg-background px-2.5 py-0.5 rounded border border-border">
                  @{profileData.username}
                </span>
              </div>

              <div className="flex items-start justify-between py-2.5 border-b border-border/50">
                <span className="text-editorial-muted font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email Address
                </span>
                <span className="font-semibold text-editorial-dark text-right">
                  {profileData.email}
                </span>
              </div>

              <div className="flex items-start justify-between py-2.5 border-b border-border/50">
                <span className="text-editorial-muted font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  Phone Number
                </span>
                <span className="font-semibold text-editorial-dark font-mono text-right">
                  {profileData.phone}
                </span>
              </div>

              <div className="flex items-start justify-between py-2.5">
                <span className="text-editorial-muted font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Role / Access
                </span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Super Administrator
                </span>
              </div>
            </div>
          ) : (
            /* Editable Form View */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-editorial-dark mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Dr. Arvind Mehra"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-background focus:bg-white border border-border rounded-xl outline-none focus:border-primary text-editorial-dark transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-editorial-dark mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="admin"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-background focus:bg-white border border-border rounded-xl outline-none focus:border-primary text-editorial-dark transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-editorial-dark mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@researchflow.com"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-background focus:bg-white border border-border rounded-xl outline-none focus:border-primary text-editorial-dark transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-editorial-dark mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98111 22233"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-background focus:bg-white border border-border rounded-xl outline-none focus:border-primary text-editorial-dark transition-all font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-4 py-2 text-xs font-medium text-editorial-muted hover:text-editorial-dark bg-background hover:bg-background-alt border border-border rounded-xl transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover active:scale-98 rounded-xl transition-all shadow-sm disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Change Password Card */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-7 shadow-card">
          <div className="mb-4 pb-3 border-b border-border/60">
            <h3 className="font-serif text-base font-bold text-editorial-dark flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Change Password
            </h3>
            <p className="text-xs text-editorial-muted mt-0.5">
              Ensure your administrative account remains protected with a strong password.
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-editorial-muted mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password (if set)"
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-background/50 focus:bg-white border border-border rounded-xl outline-none focus:border-primary text-editorial-dark transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-editorial-muted hover:text-editorial-dark transition-colors p-0.5"
                  title={showCurrentPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-editorial-muted mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-background/50 focus:bg-white border border-border rounded-xl outline-none focus:border-primary text-editorial-dark transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-editorial-muted hover:text-editorial-dark transition-colors p-0.5"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-editorial-muted mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-background/50 focus:bg-white border border-border rounded-xl outline-none focus:border-primary text-editorial-dark transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-editorial-muted hover:text-editorial-dark transition-colors p-0.5"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover active:scale-98 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {updatingPassword ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Botanical Footer Quote matching reference Screen 11 */}
      <div className="pt-8 flex items-center justify-center gap-4 text-center">
        <BotanicalIllustration className="w-12 h-12 opacity-70" />
        <p className="font-serif text-sm italic text-editorial-muted">
          "Knowledge Builds a Better Tomorrow"
        </p>
        <BotanicalIllustration className="w-12 h-12 opacity-70 transform scale-x-[-1]" />
      </div>
    </div>
  );
};
