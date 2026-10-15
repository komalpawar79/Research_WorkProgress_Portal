import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  TrendingUp,
  MessageSquare,
  Activity,
  Plus,
  ArrowLeft,
  Mail,
  Phone,
  GraduationCap,
} from 'lucide-react';
import { customerService } from '../../services/customerService';
import { adminProjectService } from '../../services/adminProjectService';
import { documentManagementService } from '../../services/documentManagementService';
import { activityLogService } from '../../services/activityLogService';
import { fetchApi } from '../../services/apiClient';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

export const CustomerDetailPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'progress' | 'payments' | 'documents' | 'activity'>('progress');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('15000');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // 1. Fetch Customer Profile
  const { data: customer, isLoading } = useQuery({
    queryKey: ['customerDetail', customerId],
    queryFn: () => customerService.getCustomerById(customerId || 'cust-01'),
    refetchInterval: 5000,
  });

  // 2. Fetch Customer's Real Project & Chapters (1..N) from PostgreSQL
  const { data: customerProjectData } = useQuery({
    queryKey: ['customerChapters', customerId],
    queryFn: () => (customerId ? adminProjectService.getChaptersByCustomerId(customerId) : null),
    enabled: Boolean(customerId),
    refetchInterval: 5000,
  });

  const chapters = customerProjectData?.chapters || [];
  const project = customerProjectData?.project;

  // 3. Fetch Real Payments for this customer
  const { data: payments = [] } = useQuery({
    queryKey: ['customerPayments', customerId],
    queryFn: async () => {
      try {
        const res = await fetchApi<any>('/api/payments?enveloped=true');
        const all = res?.payments || [];
        return all.filter((p: any) => p.user_id === customerId || p.customer_name === customer?.full_name);
      } catch {
        return [];
      }
    },
    enabled: Boolean(customerId),
    refetchInterval: 5000,
  });

  // 4. Fetch Real Documents for this customer
  const { data: documents = [] } = useQuery({
    queryKey: ['customerDocuments', customerId],
    queryFn: () => documentManagementService.getDocuments({ customer: customer?.full_name }),
    enabled: Boolean(customer?.full_name),
    refetchInterval: 5000,
  });

  // 5. Fetch Real Activities for this customer
  const { data: activities = [] } = useQuery({
    queryKey: ['customerActivities', customerId],
    queryFn: async () => {
      try {
        const logs = await activityLogService.getActivityLogs();
        return logs.filter((l: any) => l.user_id === customerId || l.customer_name === customer?.full_name);
      } catch {
        return [];
      }
    },
    enabled: Boolean(customerId),
    refetchInterval: 5000,
  });

  // 6. Record Payment Mutation
  const addPaymentMutation = useMutation({
    mutationFn: async () => {
      return await fetchApi<any>('/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          userId: customer?.id,
          projectId: project?.id,
          milestoneName: 'Milestone Progress Payment',
          totalAmount: Number(paymentAmount),
          paidAmount: Number(paymentAmount),
          status: 'Paid',
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerDetail'] });
      queryClient.invalidateQueries({ queryKey: ['adminCustomerList'] });
      queryClient.invalidateQueries({ queryKey: ['customerPayments'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
      showToast(`Recorded ₹${Number(paymentAmount).toLocaleString('en-IN')} payment via ${paymentMethod}`, 'success');
      setPaymentModalOpen(false);
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to record payment', 'error');
    },
  });

  if (isLoading || !customer) {
    return (
      <div className="p-12 text-center text-xs text-editorial-muted">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading customer profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-editorial-muted font-medium">
        <Link to="/admin/customers" className="hover:text-editorial-dark flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Customers</span>
        </Link>
        <span>&gt;</span>
        <span className="font-semibold text-editorial-dark">{customer.full_name}</span>
      </div>

      {/* Top Grid: Customer Info & Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information Card */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif text-xl font-bold border border-primary/20">
                {customer.full_name.charAt(0)}
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold text-editorial-dark">
                  {customer.full_name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-editorial-muted font-mono">
                    @{customer.username || 'scholar'}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EAF3EC] text-[#266C44] border border-[#C1E1CB]">
                    ● {(customer as any).status || customer.project_status || 'Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-editorial-muted">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-editorial-muted" />
                <span className="font-medium text-editorial-dark">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-editorial-muted" />
                <span>{customer.phone || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-editorial-muted" />
                <span>{customer.university}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/70 flex items-center justify-between text-xs text-editorial-muted mt-5">
            <span>Customer ID: <span className="font-mono">{customer.id}</span></span>
            <span>Joined: {customer.start_date}</span>
          </div>
        </div>

        {/* Project Details Card */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase tracking-wider font-mono text-editorial-muted font-semibold">
                Project Overview
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F4F2EC] text-[#2E473E] border border-border">
                {customer.project_type}
              </span>
            </div>

            <h3 className="font-serif text-lg font-bold text-editorial-dark mb-4 leading-snug">
              {customer.research_topic}
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs mb-6">
              <div>
                <span className="text-editorial-muted block mb-1">Start Date</span>
                <span className="font-semibold text-editorial-dark">{customer.start_date}</span>
              </div>
              <div>
                <span className="text-editorial-muted block mb-1">Expected Completion</span>
                <span className="font-semibold text-editorial-dark">{customer.expected_completion}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/70">
            <div className="flex items-center justify-between text-xs font-semibold text-editorial-muted mb-2">
              <span>Overall Research Progress</span>
              <span className="text-primary font-bold">{customer.progress_percent}%</span>
            </div>
            <ProgressBar progress={customer.progress_percent} height="h-2" colorClass="bg-primary" />
          </div>
        </div>
      </div>

      {/* Middle Grid: Payment Summary & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Summary Card */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-base font-bold text-editorial-dark">
              Payment Summary
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FBF2E7] text-[#B78352] border border-[#F2D7B7]">
              {customer.payment_status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/70 text-xs mb-4">
            <div>
              <span className="text-editorial-muted block mb-0.5">Total Amount</span>
              <span className="font-serif text-base font-bold text-editorial-dark">
                ₹{customer.total_amount.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-editorial-muted block mb-0.5">Paid</span>
              <span className="font-serif text-base font-bold text-[#266C44]">
                ₹{customer.amount_paid.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-editorial-muted block mb-0.5">Remaining</span>
              <span className="font-serif text-base font-bold text-[#B78352]">
                ₹{customer.remaining_amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            onClick={() => setPaymentModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Payment</span>
          </button>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-card">
          <h3 className="font-serif text-base font-bold text-editorial-dark mb-4">
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/admin/progress-updates')}
              className="p-3.5 rounded-xl border border-border hover:border-primary hover:bg-[#FAF9F5] text-left transition-all group"
            >
              <TrendingUp className="w-4 h-4 text-[#B78352] mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-semibold text-editorial-dark">Update Progress</p>
              <p className="text-[10px] text-editorial-muted mt-0.5">Chapters & PDF release</p>
            </button>

            <button
              onClick={() => navigate('/admin/notifications')}
              className="p-3.5 rounded-xl border border-border hover:border-primary hover:bg-[#FAF9F5] text-left transition-all group"
            >
              <MessageSquare className="w-4 h-4 text-[#266C44] mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-semibold text-editorial-dark">Send Message</p>
              <p className="text-[10px] text-editorial-muted mt-0.5">Direct notification</p>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className="p-3.5 rounded-xl border border-border hover:border-primary hover:bg-[#FAF9F5] text-left transition-all group"
            >
              <Activity className="w-4 h-4 text-[#2E473E] mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-semibold text-editorial-dark">View Activity</p>
              <p className="text-[10px] text-editorial-muted mt-0.5">Audit log history</p>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Tabs matching reference Screen 3 */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="flex border-b border-border bg-[#FAF9F5] px-4 overflow-x-auto">
          {[
            { key: 'progress', label: `Research Chapters (${chapters.length})` },
            { key: 'payments', label: `Payments (${payments.length})` },
            { key: 'documents', label: `Documents (${documents.length})` },
            { key: 'activity', label: `Activity Log (${activities.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary font-bold bg-white'
                  : 'border-transparent text-editorial-muted hover:text-editorial-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'progress' && (
            <div className="space-y-3">
              {chapters.length === 0 ? (
                <p className="text-xs text-editorial-muted">No chapters found for this project.</p>
              ) : (
                chapters.map((ch: any) => (
                  <div
                    key={ch.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 hover:bg-[#FAF9F5] transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold text-xs text-editorial-dark">
                        Chapter {ch.chapter_number} — {ch.title}
                      </h4>
                      <p className="text-[11px] text-editorial-muted mt-0.5">
                        Status: <span className="font-medium text-editorial-dark">{ch.status}</span> · Updated: {ch.updated_date || 'Recent'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold font-mono text-editorial-dark">
                        {ch.progress_percent}%
                      </span>
                      <button
                        onClick={() => navigate('/admin/progress-updates')}
                        className="px-3 py-1 text-xs rounded-lg border border-border hover:bg-white transition-colors"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-2 text-xs">
              {payments.length === 0 ? (
                <p className="text-xs text-editorial-muted">No milestone payment records found.</p>
              ) : (
                payments.map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/60">
                    <div>
                      <span className="font-semibold text-editorial-dark block">{p.milestone_name}</span>
                      <span className="text-[10px] text-editorial-muted">
                        Invoice #{p.invoice_number} · {p.payment_date}
                      </span>
                    </div>
                    <span className="font-bold text-[#266C44] font-serif text-sm">
                      ₹{Number(p.paid_amount || p.amount || 0).toLocaleString('en-IN')} (Paid)
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-2 text-xs">
              {documents.length === 0 ? (
                <p className="text-xs text-editorial-muted">No documents uploaded for this scholar yet.</p>
              ) : (
                documents.map((doc: any) => (
                  <div key={doc.id} className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/60">
                    <div>
                      <span className="font-semibold text-editorial-dark block">
                        {doc.chapter_title} ({doc.version})
                      </span>
                      <span className="text-[10px] text-editorial-muted font-mono">
                        {doc.file_name} · {doc.uploaded_at}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate('/admin/documents')}
                      className="text-primary font-semibold hover:underline text-xs"
                    >
                      View
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-2 text-xs text-editorial-muted">
              {activities.length === 0 ? (
                <p className="text-xs text-editorial-muted">No audit activity logged yet.</p>
              ) : (
                activities.map((act: any) => (
                  <div key={act.id} className="flex items-start gap-2 p-2 rounded-lg bg-background/30">
                    <span className="text-primary font-bold">•</span>
                    <div>
                      <span className="text-editorial-dark font-medium">{act.action}</span>: {act.description}
                      <span className="block text-[10px] text-editorial-muted font-mono mt-0.5">
                        {act.relative_time || act.created_at} · By {act.actor_name || 'Admin'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={`Record Payment for ${customer.full_name}`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-editorial-muted font-medium mb-1">
              Payment Amount (₹)
            </label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-editorial-muted font-medium mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs bg-white text-editorial-dark"
            >
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setPaymentModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg border border-border text-editorial-muted hover:text-editorial-dark"
            >
              Cancel
            </button>
            <button
              disabled={!paymentAmount || Number(paymentAmount) <= 0 || addPaymentMutation.isPending}
              onClick={() => addPaymentMutation.mutate()}
              className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold disabled:opacity-50"
            >
              {addPaymentMutation.isPending ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
