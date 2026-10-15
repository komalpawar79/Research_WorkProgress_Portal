import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import { NotificationItem } from '../components/notifications/NotificationItem';
import { CheckCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => (user ? notificationService.getNotifications(user.id) : []),
    enabled: Boolean(user?.id),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => (user ? notificationService.markAllAsRead(user.id) : Promise.resolve()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
      showToast('All notifications marked as read', 'success');
    },
  });

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-editorial-muted font-medium">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-editorial-muted mt-1">
            Stay updated with the latest changes.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold text-editorial-dark hover:bg-white transition-colors shadow-xs"
          >
            <CheckCheck className="w-3.5 h-3.5 text-primary" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs matching Reference Screen 6 */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-white/80 text-editorial-muted hover:bg-white hover:text-editorial-dark border border-border'
          }`}
        >
          All
        </button>

        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filter === 'unread'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-white/80 text-editorial-muted hover:bg-white hover:text-editorial-dark border border-border'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                filter === 'unread' ? 'bg-[#C8523A] text-white' : 'bg-[#E3E2DB] text-editorial-dark'
              }`}
            >
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilter('read')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'read'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-white/80 text-editorial-muted hover:bg-white hover:text-editorial-dark border border-border'
          }`}
        >
          Read
        </button>
      </div>

      {/* Notification List */}
      {filteredNotifs.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border p-12 text-center shadow-card">
          <p className="text-sm font-serif font-semibold text-editorial-dark">
            You're all caught up!
          </p>
          <p className="text-xs text-editorial-muted mt-1">
            No {filter !== 'all' ? filter : ''} notifications at this moment.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredNotifs.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkRead={(id) => markReadMutation.mutate(id)}
              onAction={(url) => navigate(url)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

