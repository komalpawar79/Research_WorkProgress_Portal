import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, CreditCard, AlertTriangle, FileText, Bell, Send } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { customerService } from '../../services/customerService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';

export const AdminNotificationsPage: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  // Form states for broadcasting/sending notification
  const [targetUserId, setTargetUserId] = useState('all');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('general_update');

  // Real-time notifications list with 5s polling
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['adminNotificationsList'],
    queryFn: () => adminService.getNotifications(),
    refetchInterval: 5000,
  });

  // Fetch customers for recipient dropdown
  const { data: customers = [] } = useQuery({
    queryKey: ['adminCustomerList'],
    queryFn: () => customerService.getCustomers(),
  });

  const sendMutation = useMutation({
    mutationFn: () =>
      adminService.sendNotification({
        userId: targetUserId,
        title: notifTitle.trim(),
        message: notifMessage.trim(),
        type: notifType,
      }),
    onSuccess: () => {
      showToast('Notification sent successfully to scholar(s)!', 'success');
      setIsSendModalOpen(false);
      setNotifTitle('');
      setNotifMessage('');
      setTargetUserId('all');
      queryClient.invalidateQueries({ queryKey: ['adminNotificationsList'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to send notification', 'error');
    },
  });

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.read : true));

  return (
    <div className="space-y-6">
      {/* Title, Actions & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
            Notifications & Broadcasts
          </h1>
          <p className="text-xs sm:text-sm text-editorial-muted mt-1">
            Real-time audit alerts and scholar broadcast messaging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSendModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Notification</span>
          </button>

          <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filter === 'all' ? 'bg-primary text-white' : 'text-editorial-muted hover:text-editorial-dark'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filter === 'unread' ? 'bg-primary text-white' : 'text-editorial-muted hover:text-editorial-dark'
              }`}
            >
              Unread
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3.5">
        {isLoading && notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-editorial-muted bg-surface rounded-2xl border border-border">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading real-time notifications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-editorial-muted bg-surface rounded-2xl border border-border">
            <Bell className="w-8 h-8 text-editorial-muted/50 mx-auto mb-2" />
            No notifications matching filter.
          </div>
        ) : (
          filtered.map((notif) => {
            const isCompleted = notif.type === 'chapter_completed';
            const isPayment = notif.type === 'payment_received';
            const isOverdue = notif.type === 'payment_overdue';
            const isDoc = notif.type === 'document_uploaded';

            return (
              <div
                key={notif.id}
                className="bg-surface rounded-2xl border border-border p-5 shadow-card hover:border-[#CBD5CD] transition-all flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isCompleted
                        ? 'bg-[#EAF3EC] text-[#266C44]'
                        : isPayment
                        ? 'bg-sky-50 text-sky-700'
                        : isOverdue
                        ? 'bg-[#FDF0ED] text-[#C8523A]'
                        : isDoc
                        ? 'bg-[#FBF2E7] text-[#B78352]'
                        : 'bg-[#F4F2EC] text-[#2E473E]'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-5 h-5" />}
                    {isPayment && <CreditCard className="w-4 h-4" />}
                    {isOverdue && <AlertTriangle className="w-4 h-4" />}
                    {isDoc && <FileText className="w-4 h-4" />}
                    {!isCompleted && !isPayment && !isOverdue && !isDoc && <Bell className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-editorial-dark">
                        {notif.title}
                      </h4>
                      {notif.customer_name && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-border text-editorial-muted">
                          {notif.customer_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-editorial-muted mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-editorial-muted whitespace-nowrap">
                  {notif.relative_time}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Send Notification Modal */}
      <Modal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        title="Broadcast Notification to Scholar(s)"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-editorial-muted font-medium mb-1">
              Select Recipient
            </label>
            <select
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs bg-white text-editorial-dark"
            >
              <option value="all">📢 All Scholars (Broadcast)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  👤 {c.full_name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-editorial-muted font-medium mb-1">
              Notification Type
            </label>
            <select
              value={notifType}
              onChange={(e) => setNotifType(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs bg-white text-editorial-dark"
            >
              <option value="general_update">General Progress Update</option>
              <option value="chapter_completed">Milestone / Chapter Completed</option>
              <option value="document_uploaded">Document Release Notice</option>
              <option value="payment_received">Payment Confirmation</option>
            </select>
          </div>

          <div>
            <label className="block text-editorial-muted font-medium mb-1">
              Notification Title
            </label>
            <input
              type="text"
              required
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              placeholder="e.g. Chapter 3 Draft Released"
              className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs"
            />
          </div>

          <div>
            <label className="block text-editorial-muted font-medium mb-1">
              Message Content
            </label>
            <textarea
              required
              rows={3}
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              placeholder="Write the message that will appear on the customer's portal..."
              className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsSendModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg border border-border text-editorial-muted hover:text-editorial-dark"
            >
              Cancel
            </button>
            <button
              disabled={!notifTitle.trim() || !notifMessage.trim() || sendMutation.isPending}
              onClick={() => sendMutation.mutate()}
              className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendMutation.isPending ? 'Sending...' : 'Send Now'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
