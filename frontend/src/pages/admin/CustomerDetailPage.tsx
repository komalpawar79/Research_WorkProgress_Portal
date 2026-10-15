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
  Layers,
} from 'lucide-react';
import { customerService } from '../../services/customerService';
import { adminProjectService } from '../../services/adminProjectService';
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

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customerDetail', customerId],
    queryFn: () => customerService.getCustomerById(customerId || 'cust-01'),
  });

  const { data: chapters = [] } = useQuery({
    queryKey: ['customerChapters', customerId],
    queryFn: () => adminProjectService.getAllChapters(),
  });

  const addPaymentMutation = useMutation({
    mutationFn: () =>
      customerService.addPayment(customer?.id || 'cust-01', Number(paymentAmount), paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerDetail'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      showToast(`Recorded ₹${Number(paymentAmount).toLocaleString('en-IN')} payment via ${paymentMethod}`, 'success');
      setPaymentModalOpen(false);
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
      {/* Breadcrumb Navigation matching reference Screen 3 */}
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
              <img
                src={customer.avatar_url}
                alt={customer.full_name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
              />
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-serif text-xl font-bold text-editorial-dark">
                    {customer.full_name}
                  </h2>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF3EC] text-[#266C44] border border-[#C1E1CB]">
                    Active
                  </span>
                </div>
                <p className="text-xs text-editorial-muted capitalize mt-0.5">
                  Scholar · {customer.department}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-editorial-muted pt-3 border-t border-border/70">
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-editorial-muted" />
                <span className="text-editorial-dark font-medium">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-editorial-muted" />
                <span className="text-editorial-dark font-mono">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-3.5 h-3.5 text-editorial-muted" />
                <span className="text-editorial-dark">{customer.university}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Layers className="w-3.5 h-3.5 text-editorial-muted" />
                <span className="text-editorial-dark font-medium">
                  Research Topic: {customer.research_topic}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Details Card */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-editorial-muted">
                Project Details
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F4F2EC] text-[#2E473E] border border-border">
                {customer.project_type}
              </span>
            </div>

            <h3 className="font-serif text-lg font-bold text-editorial-dark mb-4">
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
            <ProgressBar
              progress={customer.progress_percent}
              height="h-2"
              colorClass="bg-[#263A33]"
            />
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

        {/* Quick Actions Card matching reference Screen 3 */}
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
              <p className="text-[10px] text-editorial-muted mt-0.5">Add chapter notes</p>
            </button>

            <button
              onClick={() => {
                showToast(`Notification email queued for ${customer.full_name}`, 'info');
              }}
              className="p-3.5 rounded-xl border border-border hover:border-primary hover:bg-[#FAF9F5] text-left transition-all group"
            >
              <MessageSquare className="w-4 h-4 text-[#266C44] mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-semibold text-editorial-dark">Send Message</p>
              <p className="text-[10px] text-editorial-muted mt-0.5">Transactional alert</p>
            </button>

            <button
              onClick={() => navigate('/admin/activity-logs')}
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
            { key: 'progress', label: 'Research Progress' },
            { key: 'payments', label: 'Payments' },
            { key: 'documents', label: 'Documents' },
            { key: 'activity', label: 'Activity Log' },
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
              {chapters.map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 hover:bg-[#FAF9F5] transition-colors"
                >
                  <div>
                    <h4 className="font-semibold text-xs text-editorial-dark">
                      Chapter {ch.chapter_number} — {ch.title}
                    </h4>
                    <p className="text-[11px] text-editorial-muted mt-0.5">
                      Status: <span className="font-medium">{ch.status}</span> · Updated: {ch.updated_date}
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
              ))}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="text-xs text-editorial-muted space-y-2">
              <div className="flex justify-between p-3 rounded-lg bg-background/50">
                <span>05 Sept 2026 · UPI</span>
                <span className="font-bold text-[#266C44]">₹15,000 (Paid)</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-background/50">
                <span>12 Sept 2026 · Bank Transfer</span>
                <span className="font-bold text-[#266C44]">₹20,000 (Paid)</span>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="text-xs text-editorial-muted space-y-2">
              <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                <div>
                  <span className="font-semibold text-editorial-dark block">Chapter 2 — Literature Review (v2)</span>
                  <span className="text-[10px]">Uploaded 10 Sept 2026 · Protected & Watermarked</span>
                </div>
                <button
                  onClick={() => navigate('/admin/documents')}
                  className="text-primary font-semibold hover:underline text-xs"
                >
                  View
                </button>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="text-xs text-editorial-muted space-y-2">
              <p>• Admin updated Chapter 3 progress to 60% (10 Sept, 04:30 PM)</p>
              <p>• ₹20,000 payment received via Bank Transfer (12 Sept, 02:15 PM)</p>
              <p>• Chapter 2 marked Completed and Released (15 Sept, 10:30 AM)</p>
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
              className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary text-xs"
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
              onClick={() => addPaymentMutation.mutate()}
              className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold"
            >
              Save Payment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

