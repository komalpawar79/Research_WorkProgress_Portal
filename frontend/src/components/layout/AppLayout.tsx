import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useAuth();

  const { data: unreadCount = 3 } = useQuery({
    queryKey: ['unreadNotifications', user?.id],
    queryFn: () => (user ? notificationService.getUnreadCount(user.id) : 3),
    staleTime: 10000,
  });

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar (Persistent) */}
      <div className="hidden lg:block">
        <Sidebar unreadNotifsCount={unreadCount} />
      </div>

      {/* Tablet / Mobile Drawer (Collapsible) */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-editorial-dark/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 shadow-2xl">
            <Sidebar
              unreadNotifsCount={unreadCount}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          unreadCount={unreadCount}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-20 lg:pb-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Mobile Navigation Bar */}
        <MobileNav />
      </div>
    </div>
  );
};

