import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, CreditCard, AlertTriangle, FileText } from 'lucide-react';
import { mockAdminNotifications } from '../../services/adminMockData';

export const AdminNotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data: notifications = [] } = useQuery({
    queryKey: ['adminNotificationsList'],
    queryFn: () => Promise.resolve(mockAdminNotifications),
  });

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.read : true));

  return (
    <div className="space-y-6">
      {/* Title & Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-editorial-muted mt-1">
            View all notifications and updates.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-surface border border-border p-1 rounded-xl">
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

      {/* Notifications List matching reference Screen 8 */}
      <div className="space-y-3.5">
        {filtered.map((notif) => {
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
                      : 'bg-[#FBF2E7] text-[#B78352]'
                  }`}
                >
                  {isCompleted && <CheckCircle2 className="w-5 h-5" />}
                  {isPayment && <CreditCard className="w-4 h-4" />}
                  {isOverdue && <AlertTriangle className="w-4 h-4" />}
                  {isDoc && <FileText className="w-4 h-4" />}
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-editorial-dark">
                    {notif.title}
                  </h4>
                  <p className="text-xs text-editorial-muted mt-1">
                    {notif.message}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono text-editorial-muted whitespace-nowrap">
                {notif.relative_time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
