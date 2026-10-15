import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet, Clock, ChevronLeft, ChevronRight, Plus, X, DollarSign } from 'lucide-react';
import { fetchApi } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';

interface PaymentItem {
  id: string;
  user_id: string;
  project_id: string;
  milestone_name: string;
  total_amount: number;
  paid_amount: number;
  amount: number;
  remaining_amount: number;
  currency: string;
  status: string;
  invoice_number: string;
  payment_date: string;
  project_title: string;
  customer_name: string;
  customer_email: string;
  customer_avatar?: string;
  created_at: string;
}

interface PaymentResponse {
  payments: PaymentItem[];
  summary: {
    totalRevenue: number;
    totalPending: number;
  };
}

export const AdminPaymentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [milestoneName, setMilestoneName] = useState('Phase Milestone Payment');
  const [amount, setAmount] = useState<number>(15000);
  const [paymentStatus, setPaymentStatus] = useState('Paid');

  const { data, isLoading } = useQuery<PaymentResponse>({
    queryKey: ['adminPaymentsList'],
    queryFn: async () => {
      try {
        const res = await fetchApi<PaymentResponse>('/api/payments?enveloped=true');
        if (res && res.payments) {
          return res;
        }
      } catch (e) {
        console.warn('Live payments API error:', e);
      }
      return {
        payments: [],
        summary: { totalRevenue: 0, totalPending: 0 },
      };
    },
    refetchInterval: 10000,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customersDropdown'],
    queryFn: async () => {
      try {
        const res = await fetchApi<any[]>('/api/admin/users');
        return Array.isArray(res) ? res : [];
      } catch {
        return [];
      }
    },
  });

  const recordMutation = useMutation({
    mutationFn: async () => {
      const targetCust = customers.find((c) => c.id === selectedCustomerId) || customers[0];
      return await fetchApi('/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          userId: targetCust?.id,
          projectId: targetCust?.project_id,
          milestoneName,
          amount,
          totalAmount: amount,
          status: paymentStatus,
          paymentDate: new Date().toISOString().split('T')[0],
        }),
      });
    },
    onSuccess: () => {
      showToast('Payment recorded and synchronized in PostgreSQL!', 'success');
      queryClient.invalidateQueries({ queryKey: ['adminPaymentsList'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      setIsRecordModalOpen(false);
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to record payment.', 'error');
    },
  });

  const payments = data?.payments || [];
  const totalRevenue = data?.summary?.totalRevenue ?? 0;
  const totalPending = data?.summary?.totalPending ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
            Payments & Revenue
          </h1>
          <p className="text-xs sm:text-sm text-editorial-muted mt-1">
            Real-time milestone transactions, invoicing, and revenue tracking.
          </p>
        </div>

        <button
          onClick={() => {
            if (customers.length > 0 && !selectedCustomerId) {
              setSelectedCustomerId(customers[0].id);
            }
            setIsRecordModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover active:scale-98 text-white text-xs sm:text-sm font-semibold transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Payment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EAF3EC] text-[#266C44] flex items-center justify-center flex-shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-editorial-muted uppercase tracking-wider block">
              Total Revenue Collected
            </span>
            <span className="font-serif text-2xl font-bold text-editorial-dark">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FDF0ED] text-[#C8523A] flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-editorial-muted uppercase tracking-wider block">
              Outstanding / Pending
            </span>
            <span className="font-serif text-2xl font-bold text-[#C8523A]">
              ₹{totalPending.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-editorial-muted">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading live transactions from PostgreSQL...
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-xs text-editorial-muted">
            No payments recorded yet. Click "Record Payment" to add the first transaction.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-[#FAF9F5] text-[11px] uppercase tracking-wider font-mono text-editorial-muted">
                  <th className="py-3.5 px-5 font-semibold">Customer & Project</th>
                  <th className="py-3.5 px-4 font-semibold">Milestone / Invoice</th>
                  <th className="py-3.5 px-4 font-semibold">Total Fee</th>
                  <th className="py-3.5 px-4 font-semibold">Paid Amount</th>
                  <th className="py-3.5 px-4 font-semibold">Remaining</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
                {payments.map((p) => {
                  const rem = Number(p.remaining_amount || Math.max(0, Number(p.total_amount || 0) - Number(p.paid_amount || 0)));
                  const isPaid = p.status === 'Paid' || rem === 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#FBF9F4] transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-editorial-dark">
                          {p.customer_name}
                        </div>
                        <div className="text-[11px] text-editorial-muted mt-0.5 line-clamp-1">
                          {p.project_title}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-editorial-dark">
                          {p.milestone_name || 'Project Milestone'}
                        </div>
                        <div className="text-[10px] text-editorial-muted font-mono mt-0.5">
                          {p.invoice_number || 'INV-2026-AUTO'}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-semibold text-editorial-dark font-mono whitespace-nowrap">
                        ₹{Number(p.total_amount || p.paid_amount || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-4 font-semibold text-[#266C44] font-mono whitespace-nowrap">
                        ₹{Number(p.paid_amount || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-4 font-semibold text-[#B78352] font-mono whitespace-nowrap">
                        ₹{rem.toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            isPaid
                              ? 'bg-[#EAF3EC] text-[#266C44] border border-[#C1E1CB]'
                              : 'bg-[#FBF2E7] text-[#B78352] border border-[#F2D7B7]'
                          }`}
                        >
                          {p.status || (isPaid ? 'Paid' : 'Pending')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-editorial-muted bg-[#FAF9F5]">
          <span>Showing 1 - {payments.length} transactions</span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-border hover:bg-white disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {[1, 2, 3].map((page) => (
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
              onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
              disabled={currentPage === 3}
              className="p-1.5 rounded-lg border border-border hover:bg-white disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-surface rounded-3xl border border-border shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-editorial-dark">
                    Record Milestone Payment
                  </h3>
                  <p className="text-[11px] text-editorial-muted">
                    Saves transaction in PostgreSQL & updates customer ledger
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="w-7 h-7 rounded-full border border-border hover:bg-background flex items-center justify-center text-editorial-muted"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs">
              <div>
                <label className="font-semibold text-editorial-dark block mb-1">
                  Select Customer & Project *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-editorial-dark outline-none font-medium"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.research_topic || c.project_title || 'Thesis'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-editorial-dark block mb-1">
                  Milestone Name *
                </label>
                <input
                  type="text"
                  value={milestoneName}
                  onChange={(e) => setMilestoneName(e.target.value)}
                  placeholder="e.g. Chapter 2 Literature Review Completion"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-editorial-dark outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-editorial-dark block mb-1">
                    Amount (INR ₹) *
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-editorial-dark outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-editorial-dark block mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-editorial-dark outline-none"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-editorial-dark hover:bg-background"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => recordMutation.mutate()}
                disabled={recordMutation.isPending || !selectedCustomerId}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {recordMutation.isPending ? 'Recording...' : 'Save & Synchronize'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
