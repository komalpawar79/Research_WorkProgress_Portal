import { supabase, isSupabaseConfigured } from './supabaseClient';
import { mockPayments, mockPaymentSummary } from './mockData';
import { PaymentRecord, PaymentSummary } from '../types/database.types';

export const paymentService = {
  async getPaymentSummary(userId: string): Promise<PaymentSummary> {
    if (!isSupabaseConfigured || !supabase) {
      return mockPaymentSummary;
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('amount, status')
        .eq('user_id', userId)
        .eq('status', 'Paid');

      if (error || !data || data.length === 0) {
        return mockPaymentSummary;
      }

      const totalContract = 50000;
      const amountPaid = data.reduce((acc, curr) => acc + Number(curr.amount), 0);
      const remaining = Math.max(0, totalContract - amountPaid);
      const status = remaining === 0 ? 'Full' : amountPaid > 0 ? 'Partial' : 'Pending';

      return {
        total_amount: totalContract,
        amount_paid: amountPaid,
        remaining,
        status,
      };
    } catch {
      return mockPaymentSummary;
    }
  },

  async getPaymentHistory(userId: string): Promise<PaymentRecord[]> {
    if (!isSupabaseConfigured || !supabase) {
      return mockPayments;
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('payment_date', { ascending: false });

      if (error || !data || data.length === 0) {
        return mockPayments;
      }
      return data as PaymentRecord[];
    } catch {
      return mockPayments;
    }
  },
};

