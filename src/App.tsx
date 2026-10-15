import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Scholar Portal
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ResearchWorkPage } from './pages/ResearchWorkPage';
import { ChaptersPage } from './pages/ChaptersPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ProfilePage } from './pages/ProfilePage';

// Admin Portal
import { AdminLayout } from './components/admin/layout/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { CustomersPage } from './pages/admin/CustomersPage';
import { CustomerDetailPage } from './pages/admin/CustomerDetailPage';
import { ResearchProjectsPage } from './pages/admin/ResearchProjectsPage';
import { ProgressUpdatesPage } from './pages/admin/ProgressUpdatesPage';
import { UpdateChapterPage } from './pages/admin/UpdateChapterPage';
import { DocumentsPage } from './pages/admin/DocumentsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { EmailHistoryPage } from './pages/admin/EmailHistoryPage';
import { ActivityLogsPage } from './pages/admin/ActivityLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 0,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Login Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Scholar / Customer Portal */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="research" element={<ResearchWorkPage />} />
                <Route path="chapters" element={<ChaptersPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Admin Portal Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="customers/:customerId" element={<CustomerDetailPage />} />
                <Route path="research-projects" element={<ResearchProjectsPage />} />
                <Route path="progress-updates" element={<ProgressUpdatesPage />} />
                <Route path="progress-updates/:chapterId" element={<UpdateChapterPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="notifications" element={<AdminNotificationsPage />} />
                <Route path="email-history" element={<EmailHistoryPage />} />
                <Route path="activity-logs" element={<ActivityLogsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
