import React from 'react';
import { PaymentSummary } from '../../types/database.types';

interface PaymentSummaryCardsProps {
  summary: PaymentSummary;
}

export const PaymentSummaryCards: React.FC<PaymentSummaryCardsProps> = ({ summary }) => {
  return (
    <div>
      <h3 className="font-serif text-lg font-bold text-editorial-dark mb-4">
        Payment Summary
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Amount */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-card">
          <span className="text-xs font-semibold text-editorial-muted uppercase tracking-wider block mb-1">
            Total Amount
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
            ₹{summary.total_amount.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Amount Paid */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-card">
          <span className="text-xs font-semibold text-editorial-muted uppercase tracking-wider block mb-1">
            Amount Paid
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-[#266C44]">
            ₹{summary.amount_paid.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Remaining */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-card">
          <span className="text-xs font-semibold text-editorial-muted uppercase tracking-wider block mb-1">
            Remaining
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-[#B78352]">
            ₹{summary.remaining.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Payment Status */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-card flex flex-col justify-between">
          <span className="text-xs font-semibold text-editorial-muted uppercase tracking-wider block mb-1">
            Payment Status
          </span>
          <div className="mt-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FBF2E7] text-[#B78352] border border-[#F2D7B7]">
              {summary.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

