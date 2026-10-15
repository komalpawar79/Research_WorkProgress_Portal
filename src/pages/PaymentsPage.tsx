import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/paymentService';
import { PaymentSummaryCards } from '../components/payments/PaymentSummaryCards';
import { PaymentHistoryTable } from '../components/payments/PaymentHistoryTable';

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['paymentSummary', user?.id],
    queryFn: () => (user ? paymentService.getPaymentSummary(user.id) : null),
    refetchInterval: 5000,
  });

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['paymentHistory', user?.id],
    queryFn: () => (user ? paymentService.getPaymentHistory(user.id) : []),
    enabled: Boolean(user?.id),
    refetchInterval: 5000,
  });

  if (loadingSummary || loadingPayments) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-editorial-muted font-medium">Loading payment records...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
          Payments
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted mt-1">
          Review your research contract billing and payment transactions.
        </p>
      </div>

      {summary && <PaymentSummaryCards summary={summary} />}

      <PaymentHistoryTable payments={payments} />
    </div>
  );
};

