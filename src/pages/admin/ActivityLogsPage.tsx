import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { activityLogService } from '../../services/activityLogService';

export const ActivityLogsPage: React.FC = () => {
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [userFilter, setUserFilter] = useState('All Users');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['activityLogs', actionFilter, userFilter],
    queryFn: () => activityLogService.getActivityLogs({ action: actionFilter, user: userFilter }),
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
          Activity Log
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted mt-1">
          Track all system activities and changes.
        </p>
      </div>

      {/* Filter Bar matching reference Screen 10 */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-card flex flex-wrap items-center gap-3">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3.5 py-2 text-xs bg-background/60 border border-border rounded-xl outline-none text-editorial-dark font-medium cursor-pointer"
        >
          <option value="All Actions">All Actions</option>
          <option value="updated">Update Chapter</option>
          <option value="uploaded">Upload Document</option>
          <option value="Payment">Payment</option>
          <option value="completed">Completed</option>
          <option value="replaced">Document Replaced</option>
        </select>

        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="px-3.5 py-2 text-xs bg-background/60 border border-border rounded-xl outline-none text-editorial-dark font-medium cursor-pointer"
        >
          <option value="All Users">All Users</option>
          <option value="Admin">Admin</option>
        </select>

        <div className="flex items-center gap-2 px-3.5 py-2 bg-background/60 border border-border rounded-xl text-xs text-editorial-muted font-mono ml-auto">
          <Calendar className="w-3.5 h-3.5 text-editorial-muted" />
          <span>09/01/2026 — 09/20/2026</span>
        </div>
      </div>

      {/* Table matching reference Screen 10 */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-editorial-muted">
            Loading activity audit logs...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-[#FAF9F5] text-[11px] uppercase tracking-wider font-mono text-editorial-muted">
                  <th className="py-3.5 px-5 font-semibold">Action</th>
                  <th className="py-3.5 px-4 font-semibold">User</th>
                  <th className="py-3.5 px-4 font-semibold">Target</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#FBF9F4] transition-colors">
                    <td className="py-4 px-5 font-semibold text-editorial-dark whitespace-nowrap">
                      {l.action}
                    </td>
                    <td className="py-4 px-4 text-editorial-muted whitespace-nowrap">
                      {l.user_name}
                    </td>
                    <td className="py-4 px-4 font-medium text-editorial-dark whitespace-nowrap">
                      {l.target_name}
                    </td>
                    <td className="py-4 px-5 text-right font-mono text-xs text-editorial-muted whitespace-nowrap">
                      {l.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination matching reference Screen 10 */}
        <div className="p-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-editorial-muted bg-[#FAF9F5]">
          <span>Showing 1 - {logs.length} of 45</span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-border hover:bg-white disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-white shadow-xs'
                    : 'hover:bg-white text-editorial-dark'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(5, p + 1))}
              disabled={currentPage === 5}
              className="p-1.5 rounded-lg border border-border hover:bg-white disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

