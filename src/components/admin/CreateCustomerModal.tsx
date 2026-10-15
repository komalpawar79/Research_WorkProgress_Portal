import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Key,
  BookOpen,
  DollarSign,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { customerService, CreateCustomerPayload } from '../../services/customerService';
import { useToast } from '../../context/ToastContext';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: () => void;
}

export const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  isOpen,
  onClose,
  onCustomerCreated,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateCustomerPayload>({
    fullName: '',
    email: '',
    phone: '',
    university: 'Indian Institute of Technology, Delhi',
    username: '',
    password: '',
    title: '',
    topic: '',
    researchType: 'Thesis',
    supervisor: 'Dr. Arvind Mehra',
    startDate: new Date().toISOString().split('T')[0],
    expectedCompletionDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    description: '',
    totalAmount: 50000,
    paidAmount: 20000,
    status: 'Active',
  });

  // Created credentials state for handover card
  const [createdCredentials, setCreatedCredentials] = useState<{
    fullName: string;
    username: string;
    password: string;
    email: string;
    phone: string;
    title: string;
    loginUrl: string;
  } | null>(null);

  if (!isOpen) return null;

  // Auto-generate username from full name
  const handleSuggestUsername = () => {
    if (!formData.fullName) {
      showToast('Please enter the customer Full Name first.', 'info');
      return;
    }
    const clean = formData.fullName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '.');
    const randomNum = Math.floor(10 + Math.random() * 89);
    setFormData((prev) => ({ ...prev, username: `${clean}${randomNum}` }));
  };

  // Auto-generate strong password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pass }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.username || !formData.password || !formData.title || !formData.topic) {
      showToast('Please fill in all mandatory fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      await customerService.createCustomer(formData);

      const loginUrl = `${window.location.origin}/login`;
      setCreatedCredentials({
        fullName: formData.fullName,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phone: formData.phone || '',
        title: formData.title,
        loginUrl,
      });

      showToast(`Customer account created for ${formData.fullName}!`, 'success');
      onCustomerCreated();
    } catch (err: any) {
      showToast(err.message || 'Failed to create customer.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Formatted message for WhatsApp or Email
  const getHandoverMessage = () => {
    if (!createdCredentials) return '';
    return `Hello ${createdCredentials.fullName},\n\nYour ResearchFlow account has been created successfully!\n\n🔑 *Your Login Credentials:*\n• Portal URL: ${createdCredentials.loginUrl}\n• Username: ${createdCredentials.username}\n• Temporary Password: ${createdCredentials.password}\n\n📚 *Assigned Research Project:*\n${createdCredentials.title}\n\nPlease login to track your research chapters, progress updates, and documents.\n\nBest regards,\nResearchFlow Team`;
  };

  const handleCopyCredentials = () => {
    const msg = getHandoverMessage();
    navigator.clipboard.writeText(msg);
    setCopied(true);
    showToast('Credentials copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const msg = encodeURIComponent(getHandoverMessage());
    const phone = createdCredentials?.phone?.replace(/[^0-9]/g, '') || '';
    const url = phone ? `https://api.whatsapp.com/send?phone=${phone}&text=${msg}` : `https://api.whatsapp.com/send?text=${msg}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Your ResearchFlow Credentials & Project Details`);
    const body = encodeURIComponent(getHandoverMessage());
    window.open(`mailto:${createdCredentials?.email}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-surface rounded-3xl border border-border shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-[#FAF9F5] flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-editorial-dark">
              {createdCredentials ? 'Customer Credentials Generated' : 'Create New Customer & Assign Project'}
            </h2>
            <p className="text-xs text-editorial-muted mt-0.5">
              {createdCredentials
                ? 'Share these login credentials directly with the customer.'
                : 'Generate credentials, link a thesis project, and initialize milestone tracking.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border hover:bg-background flex items-center justify-center text-editorial-muted hover:text-editorial-dark transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {createdCredentials ? (
            /* ==============================================================
               SUCCESS / CREDENTIALS HANDOVER SCREEN
               ============================================================== */
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#EAF3EC] border border-[#C1E1CB] flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-[#266C44] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm text-[#266C44]">
                    Customer & Research Project Successfully Created!
                  </h3>
                  <p className="text-xs text-[#2E473E] mt-1 leading-relaxed">
                    The customer record, secure password hash, initial chapters, and milestone payment records have been saved in PostgreSQL. Give these credentials to the user so they can log in.
                  </p>
                </div>
              </div>

              {/* Credential Card */}
              <div className="bg-[#FAF9F5] border-2 border-dashed border-[#B78352]/40 rounded-2xl p-6 relative">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#B78352]">
                    Customer Login Slip
                  </span>
                  <button
                    onClick={handleCopyCredentials}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border hover:border-primary text-xs font-medium text-editorial-dark shadow-xs transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-primary" />
                    <span>{copied ? 'Copied!' : 'Copy Slip'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-editorial-muted block">Customer Name</span>
                    <span className="font-semibold text-editorial-dark text-sm">
                      {createdCredentials.fullName}
                    </span>
                  </div>

                  <div>
                    <span className="text-editorial-muted block">Registered Email</span>
                    <span className="font-mono text-editorial-dark">{createdCredentials.email}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-border">
                    <span className="text-[11px] text-editorial-muted uppercase font-mono block">
                      Username
                    </span>
                    <span className="font-mono font-bold text-primary text-sm">
                      {createdCredentials.username}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-border">
                    <span className="text-[11px] text-editorial-muted uppercase font-mono block">
                      Password
                    </span>
                    <span className="font-mono font-bold text-primary text-sm">
                      {createdCredentials.password}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-editorial-muted block">Assigned Research Project</span>
                    <span className="font-medium text-editorial-dark">{createdCredentials.title}</span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-editorial-muted block">Portal Login URL</span>
                    <a
                      href={createdCredentials.loginUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline font-mono inline-flex items-center gap-1"
                    >
                      {createdCredentials.loginUrl}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Sharing Actions */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-editorial-dark">
                  Direct Handover Options:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={handleCopyCredentials}
                    className="py-2.5 px-4 rounded-xl border border-border bg-white hover:bg-background text-xs font-semibold text-editorial-dark flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Copy className="w-4 h-4 text-primary" />
                    <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BE5C] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Send on WhatsApp</span>
                  </button>

                  <button
                    onClick={handleShareEmail}
                    className="py-2.5 px-4 rounded-xl bg-[#263A33] hover:bg-[#1E2E29] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send via Email</span>
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-2xl bg-background border border-border text-xs text-editorial-muted leading-relaxed">
                💡 <strong>Next Step:</strong> Provide the username and password to <strong>{createdCredentials.fullName}</strong>. Once they visit the login page and enter their credentials, the system will load only their thesis project, chapters, documents, and payments.
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
                >
                  Done & Back to Customers
                </button>
              </div>
            </div>
          ) : (
            /* ==============================================================
               CREATE CUSTOMER FORM
               ============================================================== */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Personal Information */}
              <div>
                <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-primary mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>1. Personal Information</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-editorial-dark block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-background border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-editorial-dark"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-editorial-dark block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul.sharma@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-background border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-editorial-dark"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-editorial-dark block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-background border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-editorial-dark"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-editorial-dark block mb-1">
                      University / Institution
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. IIT Delhi"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-background border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-editorial-dark"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Login Credentials */}
              <div className="pt-2 border-t border-border">
                <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-primary mb-3 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>2. Login Credentials (What Admin Gives to Customer)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-editorial-dark">
                        Username *
                      </label>
                      <button
                        type="button"
                        onClick={handleSuggestUsername}
                        className="text-[11px] text-primary hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Auto-Suggest</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. rahul.sharma"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-background border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono text-editorial-dark"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-editorial-dark">
                        Temporary Password *
                      </label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-[11px] text-primary hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Generate</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="e.g. Rahul@123"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-3.5 pr-10 py-2 text-xs sm:text-sm bg-background border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono text-editorial-dark"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-editorial-muted hover:text-editorial-dark"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Research Information */}
              <div className="pt-2 border-t border-border">
                <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-primary mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>3. Research Project Information</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-editorial-dark block mb-1">
                      Research Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AI-Based Healthcare Decision Support System"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-background border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-editorial-dark"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-editorial-dark block mb-1">
                      Specific Research Topic / Focus *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Deep Learning in Early Diagnosis of Cardiac Arrhythmia"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-background border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-editorial-dark"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-editorial-dark block mb-1">
                        Research Type
                      </label>
                      <select
                        value={formData.researchType}
                        onChange={(e) => setFormData({ ...formData, researchType: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl outline-none text-editorial-dark"
                      >
                        <option value="Thesis">Thesis</option>
                        <option value="Dissertation">Dissertation</option>
                        <option value="Research Paper">Research Paper</option>
                        <option value="Synopsis">Synopsis / Proposal</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-editorial-dark block mb-1">
                        Guide / Supervisor
                      </label>
                      <input
                        type="text"
                        value={formData.supervisor}
                        onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl outline-none text-editorial-dark"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-editorial-dark block mb-1">
                        Expected Completion
                      </label>
                      <input
                        type="date"
                        value={formData.expectedCompletionDate}
                        onChange={(e) =>
                          setFormData({ ...formData, expectedCompletionDate: e.target.value })
                        }
                        className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl outline-none text-editorial-dark"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-editorial-dark block mb-1">
                      Project Description / Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief overview or research notes..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-editorial-dark resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Payment & Account Details */}
              <div className="pt-2 border-t border-border">
                <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-primary mb-3 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>4. Payment & Account Status</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-editorial-dark block mb-1">
                      Total Fee (INR ₹)
                    </label>
                    <input
                      type="number"
                      value={formData.totalAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, totalAmount: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl outline-none text-editorial-dark font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-editorial-dark block mb-1">
                      Amount Paid (INR ₹)
                    </label>
                    <input
                      type="number"
                      value={formData.paidAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, paidAmount: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl outline-none text-editorial-dark font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-editorial-dark block mb-1">
                      Account Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl outline-none text-editorial-dark"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-border hover:bg-background text-xs font-semibold text-editorial-dark transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover active:scale-98 text-white text-xs font-semibold shadow-md flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account & Project...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Create Customer & Generate Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
