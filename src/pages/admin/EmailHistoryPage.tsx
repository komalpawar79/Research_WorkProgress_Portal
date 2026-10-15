import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { emailLogService } from '../../services/emailLogService';

export const EmailHistoryPage: React.FC = () => {
  const { data: emails = [], isLoading } = useQuery({
    queryKey: ['emailHistory'],
    queryFn: () => emailLogService.getEmailLogs(),
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
          Email History
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted mt-1">
          Track all sent emails to customers.
        </p>
      </div>

      {/* Table matching reference Screen 9 */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-editorial-muted">
            Loading email logs...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-[#FAF9F5] text-[11px] uppercase tracking-wider font-mono text-editorial-muted">
                  <th className="py-3.5 px-5 font-semibold">To</th>
                  <th className="py-3.5 px-4 font-semibold">Subject</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
                {emails.map((em) => (
                  <tr key={em.id} className="hover:bg-[#FBF9F4] transition-colors">
                    {/* To */}
                    <td className="py-4 px-5 font-medium text-editorial-dark whitespace-nowrap">
                      {em.recipient_name}
                    </td>

                    {/* Subject */}
                    <td className="py-4 px-4 text-editorial-dark font-medium whitespace-nowrap">
                      {em.subject}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF3EC] text-[#266C44] border border-[#C1E1CB]">
                        {em.status}
                      </span>
                    </td>

                    {/* Sent At */}
                    <td className="py-4 px-5 text-right font-mono text-xs text-editorial-muted whitespace-nowrap">
                      {em.sent_at}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

