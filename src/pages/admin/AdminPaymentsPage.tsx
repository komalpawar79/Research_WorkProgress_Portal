import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockAdminPayments } from '../../services/adminMockData';

export const AdminPaymentsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: payments = [] } = useQuery({
    queryKey: ['adminPaymentsList'],
    queryFn: () => Promise.resolve(mockAdminPayments),
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
          Payments
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted mt-1">
          Track all payments and revenue details.
        </p>
      </div>

      {/* 2 Stat Cards matching reference Screen 7 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        {/* Total Revenue */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EAF3EC] text-[#266C44] flex items-center justify-center flex-shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-editorial-muted uppercase tracking-wider block">
              Total Revenue
            </span>
            <span className="font-serif text-2xl font-bold text-editorial-dark">
              ₹8,45,000
            </span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FDF0ED] text-[#C8523A] flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-editorial-muted uppercase tracking-wider block">
              Pending
            </span>
            <span className="font-serif text-2xl font-bold text-[#C8523A]">
              ₹1,25,000
            </span>
          </div>
        </div>
      </div>

      {/* Payments Table matching reference Screen 7 */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-[#FAF9F5] text-[11px] uppercase tracking-wider font-mono text-editorial-muted">
                <th className="py-3.5 px-5 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Total</th>
                <th className="py-3.5 px-4 font-semibold">Paid</th>
                <th className="py-3.5 px-4 font-semibold">Remaining</th>
                <th className="py-3.5 px-5 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-[#FBF9F4] transition-colors">
                  {/* Customer */}
                  <td className="py-4 px-5 font-medium text-editorial-dark">
                    {p.customer_name}
                  </td>

                  {/* Total */}
                  <td className="py-4 px-4 font-semibold text-editorial-dark font-mono">
                    ₹{p.total_amount.toLocaleString('en-IN')}
                  </td>

                  {/* Paid */}
                  <td className="py-4 px-4 font-semibold text-[#266C44] font-mono">
                    ₹{p.amount_paid.toLocaleString('en-IN')}
                  </td>

                  {/* Remaining */}
                  <td className="py-4 px-4 font-semibold text-[#B78352] font-mono">
                    ₹{p.remaining.toLocaleString('en-IN')}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        p.status === 'Paid'
                          ? 'bg-[#EAF3EC] text-[#266C44] border border-[#C1E1CB]'
                          : 'bg-[#FBF2E7] text-[#B78352] border border-[#F2D7B7]'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination matching reference Screen 7 */}
        <div className="p-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-editorial-muted bg-[#FAF9F5]">
          <span>Showing 1 - {payments.length} of 20</span>

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

