import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { BotanicalIllustration } from '../../components/dashboard/BotanicalIllustration';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    showToast('Admin password updated successfully', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
          Profile
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted mt-1">
          Manage your personal information and account settings.
        </p>
      </div>

      {/* Grid matching reference Screen 11 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Personal Information Card */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-7 shadow-card">
          <h3 className="font-serif text-base font-bold text-editorial-dark mb-5">
            Personal Information
          </h3>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border/50">
              <span className="text-editorial-muted font-medium">Name</span>
              <span className="col-span-2 font-semibold text-editorial-dark">Admin</span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border/50">
              <span className="text-editorial-muted font-medium">Email</span>
              <span className="col-span-2 font-semibold text-editorial-dark">admin@researchflow.com</span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border/50">
              <span className="text-editorial-muted font-medium">Phone</span>
              <span className="col-span-2 font-semibold text-editorial-dark font-mono">+91 98765 43210</span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border/50">
              <span className="text-editorial-muted font-medium">University / College</span>
              <span className="col-span-2 font-semibold text-editorial-dark">XYZ University</span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border/50">
              <span className="text-editorial-muted font-medium">Department</span>
              <span className="col-span-2 font-semibold text-editorial-dark">Computer Science</span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1.5">
              <span className="text-editorial-muted font-medium">Research Topic</span>
              <span className="col-span-2 font-semibold text-primary">AI-Based Healthcare System</span>
            </div>
          </div>
        </div>

        {/* Change Password Card matching reference Screen 11 */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-7 shadow-card">
          <h3 className="font-serif text-base font-bold text-editorial-dark mb-4">
            Change Password
          </h3>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-editorial-muted mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current Password"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-background/50 focus:bg-white border border-border rounded-xl outline-none focus:border-primary text-editorial-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-editorial-muted mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-background/50 focus:bg-white border border-border rounded-xl outline-none focus:border-primary text-editorial-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-editorial-muted mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-background/50 focus:bg-white border border-border rounded-xl outline-none focus:border-primary text-editorial-dark"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover active:scale-98 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
            >
              Update Password
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

