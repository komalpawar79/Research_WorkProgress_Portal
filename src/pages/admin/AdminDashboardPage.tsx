import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { AdminSummaryCards } from '../../components/admin/dashboard/AdminSummaryCards';
import { RecentActivityList } from '../../components/admin/dashboard/RecentActivityList';
import { ActiveProjectsDonut } from '../../components/admin/dashboard/ActiveProjectsDonut';
import { AttentionRequiredCard } from '../../components/admin/dashboard/AttentionRequiredCard';
import { BotanicalIllustration } from '../../components/dashboard/BotanicalIllustration';

export const AdminDashboardPage: React.FC = () => {
  const { data: metrics = [] } = useQuery({
    queryKey: ['adminMetrics'],
    queryFn: () => adminService.getDashboardMetrics(),
    refetchInterval: 5000,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['adminActivities'],
    queryFn: () => adminService.getRecentActivities(),
    refetchInterval: 5000,
  });

  const { data: projectStatus } = useQuery({
    queryKey: ['projectStatusBreakdown'],
    queryFn: () => adminService.getProjectStatusBreakdown(),
    refetchInterval: 5000,
  });

  const { data: attentionItems = [] } = useQuery({
    queryKey: ['attentionItems'],
    queryFn: () => adminService.getAttentionItems(),
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-6">
      {/* Header Banner with Botanical Quote */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
            Good Morning, Admin!
          </h1>
          <p className="text-xs sm:text-sm text-editorial-muted mt-1">
            Here's an overview of your research work and progress.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-3 bg-surface border border-border/80 rounded-2xl px-4 py-2.5 shadow-xs max-w-sm">
          <BotanicalIllustration className="w-10 h-10 opacity-80 flex-shrink-0" />
          <p className="font-serif text-xs italic text-editorial-muted leading-snug">
            "Research is creating new knowledge that benefits humanity."
          </p>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <AdminSummaryCards metrics={metrics} />

      {/* 3-Column Middle Grid matching reference Screen 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <RecentActivityList activities={activities} />
        <ActiveProjectsDonut
          totalProgress={projectStatus?.totalProgress || 78}
          completed={projectStatus?.completed || 71}
          inProgress={projectStatus?.inProgress || 42}
          pending={projectStatus?.pending || 15}
        />
        <AttentionRequiredCard items={attentionItems} />
      </div>
    </div>
  );
};

