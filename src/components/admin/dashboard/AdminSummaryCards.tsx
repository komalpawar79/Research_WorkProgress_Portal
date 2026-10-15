import React from 'react';
import { Users, Briefcase, FileCheck, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { DashboardMetric } from '../../../types/admin.types';

interface AdminSummaryCardsProps {
  metrics: DashboardMetric[];
}

export const AdminSummaryCards: React.FC<AdminSummaryCardsProps> = ({ metrics }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'users':
        return <Users className="w-5 h-5 text-[#263A33]" />;
      case 'briefcase':
        return <Briefcase className="w-5 h-5 text-[#B78352]" />;
      case 'file-check':
        return <FileCheck className="w-5 h-5 text-[#266C44]" />;
      case 'wallet':
        return <Wallet className="w-5 h-5 text-[#C8523A]" />;
      default:
        return <Users className="w-5 h-5 text-editorial-dark" />;
    }
  };

  const getIconBg = (iconName: string) => {
    switch (iconName) {
      case 'users':
        return 'bg-[#EAF3EC]';
      case 'briefcase':
        return 'bg-[#FBF2E7]';
      case 'file-check':
        return 'bg-[#EAF3EC]';
      case 'wallet':
        return 'bg-[#FDF0ED]';
      default:
        return 'bg-[#F4F2EC]';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => {
        const isIncrease = metric.changeType === 'increase';
        return (
          <div
            key={idx}
            className="bg-surface rounded-2xl border border-border p-5 shadow-card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${getIconBg(
                  metric.icon
                )} flex items-center justify-center`}
              >
                {getIcon(metric.icon)}
              </div>
              <span className="text-xs font-semibold text-editorial-muted">
                {metric.label}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <span className="font-serif text-3xl font-bold text-editorial-dark">
                {metric.value}
              </span>

              <div
                className={`flex items-center gap-1 text-xs font-semibold ${
                  isIncrease ? 'text-[#266C44]' : 'text-[#C8523A]'
                }`}
              >
                {isIncrease ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>{metric.changePercent}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

