import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80';

const PRESET_AVATARS = [
  { label: 'Executive Male', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80' },
  { label: 'Director Female', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80' },
  { label: 'Academic Mentor', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { label: 'Senior Guide', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
];

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile State
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: 'Dr. Arvind Mehra (Lead Guide)',
    username: 'admin',
    email: 'admin@researchflow.com',
    phone: '+91 98111 22233',
    avatarUrl: DEFAULT_AVATAR,
    role: 'admin',
  });

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    avatarUrl: DEFAULT_AVATAR,
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
          avatarUrl: res.avatar_url || res.avatarUrl || DEFAULT_AVATAR,
          role: res.role || 'admin',
        };
        setProfileData(loaded);
        setFormData({
          fullName: loaded.fullName,
          username: loaded.username,
          email: loaded.email,
          phone: loaded.phone,
          avatarUrl: loaded.avatarUrl,
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
      avatarUrl: profileData.avatarUrl,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Compress image to max 256x256 JPEG (~15-25 KB) so it never exceeds browser localStorage quota
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressed);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Local file upload handler with automatic client-side compression & size validation
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP)', 'error');
      return;
    }

    // Check maximum hard limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast(
        `Image is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB)! Maximum allowed size is 5MB. Please choose an image under 2MB.`,
        'error'
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast(
        `Image is ${(file.size / (1024 * 1024)).toFixed(1)}MB (larger than 2MB). Auto-compressing to 256×256 px...`,
        'info'
      );
    }

    try {
      const compressedBase64 = await compressImage(file);
      setFormData((prev) => ({ ...prev, avatarUrl: compressedBase64 }));
      showToast('Profile photo optimized! Click "Save Changes" to apply.', 'success');
    } catch {
      showToast('Could not process image file. Please choose a standard JPG or PNG.', 'error');
    }
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
        avatarUrl: formData.avatarUrl,
      });

      if (res && (res.success || res.user)) {
        const updatedAdmin = {
          id: res.user?.id || 'usr-admin-01',
          full_name: formData.fullName.trim(),
          name: formData.fullName.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          avatar_url: formData.avatarUrl,
          avatarUrl: formData.avatarUrl,
          role: 'admin',
        };

        // Safely update localStorage without exceeding browser storage quota
        try {
          localStorage.setItem('rf_user', JSON.stringify(updatedAdmin));
        } catch (storageErr) {
          console.warn('LocalStorage quota warning. Storing core details:', storageErr);
          try {
            const pruned = { ...updatedAdmin, avatar_url: DEFAULT_AVATAR, avatarUrl: DEFAULT_AVATAR };
            localStorage.setItem('rf_user', JSON.stringify(pruned));
          } catch {}
        }

        // Instantly notify AdminHeader & all app listeners
        window.dispatchEvent(new CustomEvent('adminProfileUpdated', { detail: updatedAdmin }));

        setProfileData({
          ...profileData,
          fullName: formData.fullName.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          avatarUrl: formData.avatarUrl,
        });

        showToast('Admin personal information & photo updated successfully!', 'success');
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
            Manage your personal profile photo, identity credentials, and administrative account security.
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
            <div className="space-y-5 text-xs sm:text-sm">
              {/* Profile Photo Display */}
              <div className="flex items-center gap-4 pb-4 border-b border-border/60">
                <div className="relative">
                  <img
                    src={profileData.avatarUrl || DEFAULT_AVATAR}
                    alt={profileData.fullName}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/20 shadow-md bg-background"
                  />
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" title="Active Administrator" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-editorial-dark leading-tight">
                    {profileData.fullName}
                  </h4>
                  <span className="inline-block mt-1 font-mono text-xs text-editorial-muted bg-background px-2.5 py-0.5 rounded border border-border">
                    @{profileData.username}
                  </span>
                  <div className="mt-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Lead Research Director
                    </span>
                  </div>
                </div>
              </div>

              {/* Information Rows */}
              <div className="space-y-4">
                <div className="flex items-start justify-between py-2 border-b border-border/50">
                  <span className="text-editorial-muted font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Full Name
                  </span>
                  <span className="font-semibold text-editorial-dark text-right">
                    {profileData.fullName}
                  </span>
                </div>

                <div className="flex items-start justify-between py-2 border-b border-border/50">
                  <span className="text-editorial-muted font-medium flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Username
                  </span>
                  <span className="font-mono font-medium text-editorial-dark text-right bg-background px-2 py-0.5 rounded border border-border">
                    @{profileData.username}
                  </span>
                </div>

                <div className="flex items-start justify-between py-2 border-b border-border/50">
                  <span className="text-editorial-muted font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Email Address
                  </span>
                  <span className="font-semibold text-editorial-dark text-right">
                    {profileData.email}
                  </span>
                </div>

                <div className="flex items-start justify-between py-2 border-b border-border/50">
                  <span className="text-editorial-muted font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    Phone Number
                  </span>
                  <span className="font-semibold text-editorial-dark font-mono text-right">
                    {profileData.phone}
                  </span>
                </div>

                <div className="flex items-start justify-between py-2">
                  <span className="text-editorial-muted font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Role / Access
                  </span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Super Administrator
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Editable Form View */
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Profile Photo Upload / Edit Section */}
              <div className="p-4 bg-background/60 rounded-2xl border border-border/80 space-y-3">
                <label className="block text-xs font-semibold text-editorial-dark">
                  Profile Photo / Avatar
                </label>

                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <img
                      src={formData.avatarUrl || DEFAULT_AVATAR}
                      alt="Preview"
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-primary/30 shadow-sm bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                      title="Upload from computer"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-xl border border-primary/20 transition-all shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload from Device
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, avatarUrl: DEFAULT_AVATAR })}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-background text-editorial-muted hover:text-editorial-dark text-xs rounded-xl border border-border transition-all"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reset
                      </button>
                    </div>

                    <p className="text-[11px] text-editorial-muted">
                      Recommended: <strong>Square 1:1 (256×256 px)</strong>, JPG, PNG or WEBP under 2MB (Max 5MB). Auto-compressed for instant loading.
                    </p>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="pt-2 border-t border-border/60">
                  <span className="block text-[11px] font-medium text-editorial-muted mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#C59B6D]" />
                    Or Choose a Quick Professional Portrait:
                  </span>
                  <div className="flex items-center gap-3">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatarUrl: preset.url })}
                        className={`relative rounded-full p-0.5 transition-all ${
                          formData.avatarUrl === preset.url
                            ? 'ring-2 ring-primary scale-105'
                            : 'opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                        title={preset.label}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
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
