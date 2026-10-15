import React from 'react';
import { PaymentRecord } from '../../types/database.types';

interface PaymentHistoryTableProps {
  payments: PaymentRecord[];
}

export const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({ payments }) => {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-card mt-8">
      <h3 className="font-serif text-base sm:text-lg font-bold text-editorial-dark mb-4">
        Payment History
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider font-mono text-editorial-muted">
              <th className="py-3 px-4 font-semibold">Date</th>
              <th className="py-3 px-4 font-semibold">Amount</th>
              <th className="py-3 px-4 font-semibold">Method</th>
              <th className="py-3 px-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-background/40 transition-colors">
                <td className="py-4 px-4 font-medium text-editorial-dark whitespace-nowrap">
                  {p.payment_date}
                </td>
                <td className="py-4 px-4 font-semibold text-editorial-dark whitespace-nowrap">
                  ₹{p.amount.toLocaleString('en-IN')}
                </td>
                <td className="py-4 px-4 text-editorial-muted whitespace-nowrap">
                  {p.payment_method}
                </td>
                <td className="py-4 px-4 text-right whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF3EC] text-[#266C44] border border-[#C1E1CB]">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

