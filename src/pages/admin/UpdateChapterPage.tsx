import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, UploadCloud, User } from 'lucide-react';
import { adminProjectService } from '../../services/adminProjectService';
import { customerService } from '../../services/customerService';
import { documentManagementService } from '../../services/documentManagementService';
import { activityLogService } from '../../services/activityLogService';
import { emailLogService } from '../../services/emailLogService';
import { useToast } from '../../context/ToastContext';

export const UpdateChapterPage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>(chapterId || '');
  const [status, setStatus] = useState<'Not Started' | 'In Progress' | 'Under Review' | 'Completed' | 'Released'>('In Progress');
  const [progress, setProgress] = useState(60);
  const [message, setMessage] = useState('Chapter is currently under active development.');
  const [addWatermark, setAddWatermark] = useState(true);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Customers
  const { data: customers = [] } = useQuery({
    queryKey: ['adminCustomerList'],
    queryFn: () => customerService.getCustomers(),
  });

  // Set default customer
  useEffect(() => {
    if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // 2. Fetch Chapters for selected customer
  const { data: customerData } = useQuery({
    queryKey: ['adminCustomerChapters', selectedCustomer?.id],
    queryFn: () =>
      selectedCustomer
        ? adminProjectService.getChaptersByCustomerId(selectedCustomer.id)
        : Promise.resolve({ project: null, chapters: [] }),
    enabled: Boolean(selectedCustomer?.id),
  });

  const chapters = customerData?.chapters || [];

  // When chapters load or selectedCustomer changes, auto-select first chapter or matching chapterId
  useEffect(() => {
    if (chapters.length > 0) {
      if (chapterId && chapters.some((c) => c.id === chapterId)) {
        setSelectedChapterId(chapterId);
      } else if (!chapters.some((c) => c.id === selectedChapterId)) {
        setSelectedChapterId(chapters[0].id);
      }
    }
  }, [chapters, chapterId, selectedChapterId]);

  const activeChapter = chapters.find((c) => c.id === selectedChapterId) || chapters[0];

  // Populate fields when activeChapter changes
  useEffect(() => {
    if (activeChapter) {
      setProgress(activeChapter.progress_percent || 0);
      setStatus(activeChapter.status || 'In Progress');
      if (activeChapter.update_message) {
        setMessage(activeChapter.update_message);
      }
      if (activeChapter.file_name) {
        setUploadedFileName(activeChapter.file_name);
      }
    }
  }, [activeChapter?.id]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedChapterId) throw new Error('No chapter selected');
      setIsSubmitting(true);

      const isReleased = status === 'Released' || (status === 'Completed' && Boolean(uploadedFileName));

      // 1. Update Chapter Progress
      const updated = await adminProjectService.updateChapterProgress(selectedChapterId, {
        status: status === 'Released' ? 'Completed' : status,
        progress_percent: progress,
        update_message: message,
        document_released: isReleased,
        document_version: uploadedFileName ? 'v1.0' : undefined,
        fileName: uploadedFileName || undefined,
      });

      // 2. If file uploaded, record document
      if (uploadedFileName && selectedCustomer) {
        await documentManagementService.uploadChapterDocument({
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.full_name,
          chapterId: updated.id,
          chapterTitle: `Chapter ${updated.chapter_number} — ${updated.title}`,
          projectTitle: selectedCustomer.research_topic || 'Research Project',
          fileName: uploadedFileName,
        });
      }

      // 3. Log Activity
      await activityLogService.logActivity({
        action: `Admin updated Chapter ${updated.chapter_number}`,
        user_name: 'Admin',
        user_role: 'Super Admin',
        target_name: selectedCustomer?.full_name || updated.customer_name,
        target_type: 'Chapter',
        details: `Set to ${status} (${progress}%). ${message}`,
      });

      // 4. Trigger Email if Completed/Released
      if (status === 'Completed' || status === 'Released') {
        await emailLogService.triggerEmail({
          recipient_name: selectedCustomer?.full_name || updated.customer_name,
          recipient_email: selectedCustomer?.email || 'scholar@gmail.com',
          subject: `Chapter ${updated.chapter_number} Completed — ResearchFlow`,
          email_type: 'Chapter Completion',
          status: 'Sent',
          related_chapter: `Chapter ${updated.chapter_number}`,
        });
      }

      return updated;
    },
    onSuccess: (updated) => {
      setIsSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ['adminCustomerChapters'] });
      queryClient.invalidateQueries({ queryKey: ['adminCustomerList'] });
      queryClient.invalidateQueries({ queryKey: ['adminChapters'] });
      queryClient.invalidateQueries({ queryKey: ['adminDocuments'] });
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
      showToast(`Chapter ${updated.chapter_number} progress updated successfully!`, 'success');
      navigate('/admin/progress-updates');
    },
    onError: (err: any) => {
      setIsSubmitting(false);
      showToast(err.message || 'Failed to update chapter progress', 'error');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
      showToast(`Attached ${e.target.files[0].name}`, 'info');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/admin/progress-updates"
          className="inline-flex items-center gap-1.5 text-xs text-editorial-muted hover:text-editorial-dark font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Progress Updates</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
          Update Research Progress
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted mt-1">
          Select scholar, select chapter (1 to N), update progress status, and upload review documents.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-card space-y-5">
        {/* Scholar Selection */}
        <div>
          <label className="block text-xs font-semibold text-editorial-dark mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-primary" />
            <span>Scholar / Customer</span>
          </label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-background/50 border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-editorial-dark font-medium"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} — {c.research_topic}
              </option>
            ))}
          </select>
        </div>

        {/* Chapter Selection (1..N) */}
        <div>
          <label className="block text-xs font-semibold text-editorial-dark mb-1.5">
            Chapter ({chapters.length} Total Chapters)
          </label>
          <select
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-background/50 border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-editorial-dark font-medium"
          >
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                Chapter {ch.chapter_number} — {ch.title} ({ch.progress_percent}%)
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-editorial-dark mb-1.5">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-background/50 border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-editorial-dark font-medium"
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
            <option value="Released">Released (Publish to Scholar)</option>
          </select>
        </div>

        {/* Progress Slider / Percentage */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-editorial-dark mb-1.5">
            <span>Progress</span>
            <span className="font-mono text-primary font-bold">{progress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full h-2 bg-[#E5E3DC] rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Update Message */}
        <div>
          <label className="block text-xs font-semibold text-editorial-dark mb-1.5">
            Supervisor Notes / Update Message
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Methodology chapter is currently under development..."
            className="w-full p-3 text-xs sm:text-sm bg-background/50 border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-editorial-dark placeholder:text-editorial-muted"
          />
        </div>

        {/* Upload Chapter Document Zone */}
        <div>
          <label className="block text-xs font-semibold text-editorial-dark mb-1.5">
            Upload Chapter Document (PDF)
          </label>
          <label className="border-2 border-dashed border-border hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#FAF9F5]/70 hover:bg-[#FAF9F5] block">
            <UploadCloud className="w-8 h-8 text-editorial-muted mb-2" />
            <span className="text-xs font-semibold text-editorial-dark block">
              {uploadedFileName ? uploadedFileName : 'Choose PDF (Max 25MB)'}
            </span>
            <span className="text-[10px] text-editorial-muted mt-1 block">
              Original file will be stored in private storage and served with dynamic watermarks.
            </span>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Add Watermark Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="watermarkCheck"
            checked={addWatermark}
            onChange={(e) => setAddWatermark(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
          />
          <label
            htmlFor="watermarkCheck"
            className="text-xs font-medium text-editorial-dark select-none cursor-pointer"
          >
            Add watermark automatically
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
          <button
            type="button"
            onClick={() => navigate('/admin/progress-updates')}
            className="px-5 py-2.5 rounded-xl border border-border text-xs font-semibold text-editorial-muted hover:text-editorial-dark transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || !selectedChapterId}
            onClick={() => updateMutation.mutate()}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover active:scale-98 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Updating...' : 'Update Progress'}
          </button>
        </div>
      </div>
    </div>
  );
};
