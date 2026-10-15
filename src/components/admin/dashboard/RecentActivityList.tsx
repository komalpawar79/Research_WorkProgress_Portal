import React from 'react';
import { Link } from 'react-router-dom';

interface ActivityItem {
  id: string;
  customer_name: string;
  customer_avatar: string;
  description: string;
  relative_time: string;
}

interface RecentActivityListProps {
  activities: ActivityItem[];
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({ activities }) => {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-card h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-base font-bold text-editorial-dark">
            Recent Updates
          </h3>
          <Link
            to="/admin/activity-logs"
            className="text-xs font-semibold text-primary hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="space-y-4">
          {activities.map((act) => (
            <div key={act.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={act.customer_avatar}
                  alt={act.customer_name}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-border flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-editorial-dark truncate">
                    {act.customer_name}
                  </h4>
                  <p className="text-[11px] text-editorial-muted truncate">
                    {act.description}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono text-editorial-muted whitespace-nowrap flex-shrink-0">
                {act.relative_time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

