import React from 'react';
import { CheckCircle2, CreditCard, Info, Clock } from 'lucide-react';
import { Notification } from '../../types/database.types';

interface NotificationItemProps {
  notification: Notification;
  onAction?: (url: string, chapterId?: string) => void;
  onMarkRead?: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification: notif,
  onAction,
  onMarkRead,
}) => {
  const isCompleted = notif.type === 'chapter_completed';
  const isPayment = notif.type === 'payment_received';
  const isProgress = notif.type === 'chapter_progress';

  return (
    <div
      onClick={() => onMarkRead && !notif.read && onMarkRead(notif.id)}
      className={`bg-surface rounded-2xl border p-5 sm:p-6 transition-all ${
        !notif.read
          ? 'border-[#BCCEC4] bg-white shadow-card ring-1 ring-[#D8E6DE]/60'
          : 'border-border bg-white/70 shadow-subtle'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {/* Icon based on notification type */}
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              isCompleted
                ? 'bg-[#EAF3EC] text-[#266C44]'
                : isPayment
                ? 'bg-[#FBF2E7] text-[#B78352]'
                : isProgress
                ? 'bg-sky-50 text-sky-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {isCompleted && <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />}
            {isPayment && <CreditCard className="w-4 h-4" />}
            {isProgress && <Clock className="w-4 h-4" />}
            {!isCompleted && !isPayment && !isProgress && <Info className="w-4 h-4" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm sm:text-base text-editorial-dark">
                {notif.title}
              </h4>
              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-[#C8523A]" />
              )}
            </div>

            <p className="text-xs sm:text-sm text-editorial-muted mt-1 leading-relaxed">
              {notif.message}
            </p>
          </div>
        </div>

        {/* Right side: Timestamp & Action */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
          <span className="text-[11px] font-mono text-editorial-muted">
            {notif.created_at}
          </span>

          {notif.action_url && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onAction) onAction(notif.action_url!, notif.related_chapter_id);
              }}
              className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-colors"
            >
              View Chapter
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

