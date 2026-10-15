import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { profileService } from '../../services/profileService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';

export const ChangePasswordCard: React.FC = () => {
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setLoading(true);
    const res = await profileService.updatePassword(currentPassword, newPassword);
    setLoading(false);

    if (res.success) {
      showToast('Password updated successfully!', 'success');
      setModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      showToast(res.error || 'Failed to update password', 'error');
    }
  };

  return (
    <>
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-7 shadow-card w-full lg:w-80 flex flex-col justify-between">
        <div>
          <div className="w-10 h-10 rounded-xl bg-[#F0EFEA] text-editorial-dark flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-editorial-muted" />
          </div>

          <h3 className="font-serif text-base font-bold text-editorial-dark mb-1">
            Change Password
          </h3>
          <p className="text-xs text-editorial-muted leading-relaxed mb-6">
            Keep your account secure by using a strong, unique password.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="w-full py-2.5 px-4 rounded-xl border border-border text-xs font-semibold text-editorial-dark hover:bg-background transition-colors active:scale-98"
        >
          Update Password
        </button>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Update Account Password"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-editorial-muted mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="••••••••"
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
              className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-editorial-muted mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-editorial-muted hover:text-editorial-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Save Password'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

