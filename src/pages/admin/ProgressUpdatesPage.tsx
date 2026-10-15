import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  Clock,
  Circle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit2,
  FileText,
  Eye,
  UploadCloud,
  User,
  Search,
  BookOpen,
  AlertCircle,
  Sparkles,
  X,
  FileCheck,
} from 'lucide-react';
import { customerService } from '../../services/customerService';
import { adminProjectService } from '../../services/adminProjectService';
import { ProgressBar } from '../../components/common/ProgressBar';
import { ProtectedDocumentViewer } from '../../components/viewer/ProtectedDocumentViewer';
import { ChapterDocument } from '../../types/database.types';
import { useToast } from '../../context/ToastContext';

export const ProgressUpdatesPage: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Selected customer state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedChapterForAction, setSelectedChapterForAction] = useState<any | null>(null);

  // Document viewer modal
  const [viewingDoc, setViewingDoc] = useState<ChapterDocument | null>(null);

  // Form states for Add Chapter
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterDesc, setNewChapterDesc] = useState('');
  const [newChapterWordCount, setNewChapterWordCount] = useState(5000);

  // Form states for Edit Chapter
  const [editChapterTitle, setEditChapterTitle] = useState('');
  const [editChapterNumber, setEditChapterNumber] = useState(1);
  const [editChapterDesc, setEditChapterDesc] = useState('');
  const [editChapterWordCount, setEditChapterWordCount] = useState(5000);

  // Update & Upload PDF modal state
  const [updateStatus, setUpdateStatus] = useState<
    'Not Started' | 'In Progress' | 'Under Review' | 'Completed' | 'Released'
  >('In Progress');
  const [updateProgress, setUpdateProgress] = useState(50);
  const [updateMessage, setUpdateMessage] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [docVersion, setDocVersion] = useState('v1.0');
  const [releaseImmediately, setReleaseImmediately] = useState(false);

  // 1. Fetch all customers from PostgreSQL
  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ['adminCustomerList'],
    queryFn: () => customerService.getCustomers(),
  });

  // Set default selected customer once loaded
  useEffect(() => {
    if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // 2. Fetch selected customer's dynamic chapters (1..N) and project details
  const {
    data: customerData,
    isLoading: loadingChapters,
    refetch: refetchChapters,
  } = useQuery({
    queryKey: ['adminCustomerChapters', selectedCustomer?.id],
    queryFn: () =>
      selectedCustomer
        ? adminProjectService.getChaptersByCustomerId(selectedCustomer.id)
        : Promise.resolve({ project: null, chapters: [] }),
    enabled: Boolean(selectedCustomer?.id),
  });

  const chapters = customerData?.chapters || [];
  const project = customerData?.project;

  // Filter customers for search
  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.research_topic.toLowerCase().includes(customerSearch.toLowerCase()) ||
      ((c as any).username && (c as any).username.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  // Mutations
  // A. Add Chapter
  const addMutation = useMutation({
    mutationFn: async () => {
      if (!project?.id) throw new Error('No active project found');
      return await adminProjectService.addChapter({
        projectId: project.id,
        title: newChapterTitle.trim(),
        chapterNumber: chapters.length + 1,
        description: newChapterDesc.trim(),
        wordCount: Number(newChapterWordCount) || 5000,
      });
    },
    onSuccess: () => {
      showToast('New chapter added successfully!', 'success');
      setIsAddModalOpen(false);
      setNewChapterTitle('');
      setNewChapterDesc('');
      refetchChapters();
      queryClient.invalidateQueries({ queryKey: ['adminCustomerList'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to add chapter', 'error');
    },
  });

  // B. Edit Chapter
  const editMutation = useMutation({
    mutationFn: async () => {
      if (!selectedChapterForAction) return;
      return await adminProjectService.editChapter(selectedChapterForAction.id, {
        title: editChapterTitle.trim(),
        chapterNumber: Number(editChapterNumber),
        description: editChapterDesc.trim(),
        wordCount: Number(editChapterWordCount) || 5000,
      });
    },
    onSuccess: () => {
      showToast('Chapter details updated successfully!', 'success');
      setIsEditModalOpen(false);
      setSelectedChapterForAction(null);
      refetchChapters();
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to edit chapter', 'error');
    },
  });

  // C. Delete Chapter
  const deleteMutation = useMutation({
    mutationFn: async (chapterId: string) => {
      return await adminProjectService.deleteChapter(chapterId);
    },
    onSuccess: () => {
      showToast('Chapter deleted. Remaining chapters re-indexed.', 'success');
      refetchChapters();
      queryClient.invalidateQueries({ queryKey: ['adminCustomerList'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete chapter', 'error');
    },
  });

  // D. Reorder Chapter (Move Up / Down)
  const reorderMutation = useMutation({
    mutationFn: async ({ chapterIndex, direction }: { chapterIndex: number; direction: 'up' | 'down' }) => {
      if (!project?.id) return;
      const targetIndex = direction === 'up' ? chapterIndex - 1 : chapterIndex + 1;
      if (targetIndex < 0 || targetIndex >= chapters.length) return;

      const newOrder = [...chapters];
      const temp = newOrder[chapterIndex];
      newOrder[chapterIndex] = newOrder[targetIndex];
      newOrder[targetIndex] = temp;

      const orderedIds = newOrder.map((c) => c.id);
      return await adminProjectService.reorderChapters(project.id, orderedIds);
    },
    onSuccess: () => {
      showToast('Chapter order updated!', 'success');
      refetchChapters();
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to reorder chapters', 'error');
    },
  });

  // E. Update Progress & Upload PDF
  const updateProgressMutation = useMutation({
    mutationFn: async () => {
      if (!selectedChapterForAction) return;
      const finalStatus = releaseImmediately ? 'Released' : updateStatus;
      return await adminProjectService.updateChapterProgress(selectedChapterForAction.id, {
        progress_percent: updateProgress,
        status: finalStatus,
        update_message: updateMessage,
        document_released:
          releaseImmediately ||
          finalStatus === 'Released' ||
          (finalStatus === 'Completed' && Boolean(uploadedFileName)),
        fileName: uploadedFileName || undefined,
        version: docVersion,
      });
    },
    onSuccess: () => {
      showToast('Chapter progress and document updated successfully!', 'success');
      setIsUpdateModalOpen(false);
      setSelectedChapterForAction(null);
      refetchChapters();
      queryClient.invalidateQueries({ queryKey: ['adminCustomerList'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to update progress', 'error');
    },
  });

  // Handlers
  const handleOpenEdit = (ch: any) => {
    setSelectedChapterForAction(ch);
    setEditChapterTitle(ch.title);
    setEditChapterNumber(ch.chapter_number);
    setEditChapterDesc(ch.update_message || '');
    setEditChapterWordCount(ch.word_count || 5000);
    setIsEditModalOpen(true);
  };

  const handleOpenUpdate = (ch: any) => {
    setSelectedChapterForAction(ch);
    setUpdateStatus(ch.status || 'In Progress');
    setUpdateProgress(ch.progress_percent || 0);
    setUpdateMessage(ch.update_message || '');
    setUploadedFileName(ch.file_name || '');
    setDocVersion(ch.document_version || ch.doc_version || 'v1.0');
    setReleaseImmediately(Boolean(ch.document_released));
    setIsUpdateModalOpen(true);
  };

  const handleDeleteChapter = (ch: any) => {
    if (
      window.confirm(
        `Are you sure you want to delete Chapter ${ch.chapter_number}: "${ch.title}"? Remaining chapters will be automatically re-numbered 1 to N.`
      )
    ) {
      deleteMutation.mutate(ch.id);
    }
  };

  const handleViewDocument = (ch: any) => {
    const docData: ChapterDocument = {
      id: ch.doc_id || `doc-${ch.id}`,
      chapter_id: ch.id,
      user_id: selectedCustomer?.id || 'scholar-01',
      file_title: ch.file_name || `Chapter ${ch.chapter_number} — ${ch.title}.pdf`,
      page_count: 14,
      storage_path: `/storage/theses/${ch.id}.pdf`,
      watermark_text: `${selectedCustomer?.full_name || 'Scholar'} • CONFIDENTIAL DRAFT`,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setViewingDoc(docData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      showToast(`Selected file: ${file.name}`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-primary" />
            Research Chapters & Progress Management
          </h1>
          <p className="text-xs sm:text-sm text-editorial-muted mt-1">
            Select a scholar to view and manage their dynamic chapters (1 to N), update progress, upload review documents, and reorder chapters.
          </p>
        </div>

        {selectedCustomer && (
          <button
            onClick={() => {
              setNewChapterTitle('');
              setNewChapterDesc('');
              setNewChapterWordCount(5000);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-all active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add Chapter (Chapter {chapters.length + 1})
          </button>
        )}
      </div>

      {/* Scholar Selection Bar */}
      <div className="bg-surface rounded-2xl border border-border p-5 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-editorial-dark uppercase tracking-wider">
            <User className="w-4 h-4 text-primary" />
            <span>Select Scholar / Customer:</span>
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-editorial-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search scholar by name, topic, or username..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Scholar Pills */}
        {loadingCustomers ? (
          <div className="py-4 text-center text-xs text-editorial-muted">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-1" />
            Loading scholars from database...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <p className="text-xs text-editorial-muted italic py-2">No matching scholars found.</p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1 max-h-36 overflow-y-auto">
            {filteredCustomers.map((c) => {
              const isSelected = c.id === selectedCustomerId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm ring-2 ring-primary/30 font-semibold'
                      : 'bg-white border border-border text-editorial-dark hover:bg-background hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {c.full_name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <span className="block leading-tight">{c.full_name}</span>
                    <span
                      className={`block text-[10px] truncate max-w-[150px] ${
                        isSelected ? 'text-white/80' : 'text-editorial-muted'
                      }`}
                    >
                      {c.research_topic}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Scholar Thesis Banner */}
      {selectedCustomer && (
        <div className="bg-gradient-to-r from-[#F9F6F0] via-[#FAF8F5] to-surface rounded-2xl border border-[#E5DECE] p-6 shadow-card">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                  {selectedCustomer.project_type || 'PhD Thesis'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-border text-editorial-muted text-[11px] font-mono">
                  Username: {(selectedCustomer as any).username || selectedCustomer.email.split('@')[0]}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                  Status: {selectedCustomer.project_status || 'Active'}
                </span>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-editorial-dark">
                {selectedCustomer.research_topic}
              </h2>

              <p className="text-xs text-editorial-muted flex flex-wrap items-center gap-4">
                <span>Scholar: <strong className="text-editorial-dark">{selectedCustomer.full_name}</strong></span>
                <span>•</span>
                <span>University: <strong className="text-editorial-dark">{selectedCustomer.university}</strong></span>
                <span>•</span>
                <span>Total Chapters: <strong className="text-editorial-dark font-mono">{chapters.length}</strong></span>
              </p>
            </div>

            {/* Overall Progress Widget */}
            <div className="lg:w-72 bg-white rounded-xl p-4 border border-border shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-editorial-dark mb-1.5">
                <span>Thesis Overall Progress</span>
                <span className="font-mono text-sm text-primary font-bold">
                  {project?.overall_progress !== undefined
                    ? `${Number(project.overall_progress)}%`
                    : `${selectedCustomer.progress_percent}%`}
                </span>
              </div>
              <ProgressBar
                progress={
                  project?.overall_progress !== undefined
                    ? Number(project.overall_progress)
                    : selectedCustomer.progress_percent
                }
                height="h-2.5"
                colorClass="bg-primary"
              />
              <p className="text-[10px] text-editorial-muted mt-2 text-right">
                Auto-calculated from all {chapters.length} chapters
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chapters Progression List (1 to N) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-editorial-dark flex items-center gap-2">
            <span>Thesis Chapters</span>
            <span className="text-xs font-mono font-normal bg-surface px-2.5 py-0.5 rounded-full border border-border">
              {chapters.length} Total
            </span>
          </h3>
          <span className="text-xs text-editorial-muted italic">
            Supports Chapter 1 → Chapter 2 → ... → Chapter N
          </span>
        </div>

        {loadingChapters ? (
          <div className="p-12 text-center text-xs text-editorial-muted bg-surface rounded-2xl border border-border">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading customer chapters...
          </div>
        ) : chapters.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-editorial-muted mx-auto" />
            <p className="text-sm font-semibold text-editorial-dark">No chapters configured yet for this thesis.</p>
            <p className="text-xs text-editorial-muted max-w-md mx-auto">
              Click &quot;Add Chapter&quot; to begin building Chapter 1, Chapter 2, etc. for this scholar.
            </p>
            <button
              onClick={() => {
                setNewChapterTitle('');
                setNewChapterDesc('');
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add First Chapter
            </button>
          </div>
        ) : (
          chapters.map((ch, index) => {
            const isCompleted = ch.status === 'Completed' || ch.status === 'Released';
            const isInProgress = ch.status === 'In Progress';
            const isUnderReview = ch.status === 'Under Review';
            const hasDocument = Boolean(ch.document_released || ch.file_name);

            return (
              <div
                key={ch.id}
                className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-card hover:border-[#CBD5CD] transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Left Info & Status */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Status Icon */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs ${
                        isCompleted
                          ? 'bg-[#EAF3EC] text-[#266C44] ring-1 ring-[#C1E1CB]'
                          : isInProgress
                          ? 'bg-[#FBF2E7] text-[#B78352] ring-1 ring-[#F2D7B7]'
                          : isUnderReview
                          ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-200'
                          : 'bg-[#F0EFEA] text-[#7B817D] ring-1 ring-[#D7D6CF]'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      ) : isInProgress ? (
                        <Clock className="w-5 h-5 stroke-[2.5]" />
                      ) : isUnderReview ? (
                        <FileCheck className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </div>

                    {/* Chapter Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                        <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          CH #{ch.chapter_number}
                        </span>

                        <h4 className="font-serif text-base sm:text-lg font-bold text-editorial-dark truncate">
                          {ch.title}
                        </h4>

                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            isCompleted
                              ? 'bg-[#EAF3EC] text-[#266C44] border border-[#C1E1CB]'
                              : isInProgress
                              ? 'bg-[#FBF2E7] text-[#B78352] border border-[#F2D7B7]'
                              : isUnderReview
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-[#F0EFEA] text-[#7B817D] border border-[#D7D6CF]'
                          }`}
                        >
                          {ch.status}
                        </span>

                        {/* Released Document Indicator */}
                        {hasDocument ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <FileText className="w-3 h-3" />
                            PDF Released ({ch.document_version || ch.doc_version || 'v1'})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-editorial-muted bg-gray-100">
                            No PDF attached
                          </span>
                        )}
                      </div>

                      {ch.update_message && (
                        <p className="text-xs text-editorial-dark/80 bg-white/70 p-2 rounded-lg border border-border/60 mb-2 max-w-2xl">
                          <strong className="text-editorial-muted font-medium">Supervisor Notes: </strong>
                          {ch.update_message}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-editorial-muted">
                        <span>Updated: <span className="font-medium text-editorial-dark">{ch.updated_date}</span></span>
                        {ch.file_name && (
                          <span className="font-mono text-[11px] text-primary truncate max-w-xs">
                            File: {ch.file_name}
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 max-w-md">
                        <div className="flex items-center justify-between text-xs font-semibold text-editorial-dark mb-1">
                          <span>Chapter Completion</span>
                          <span className="font-mono">{ch.progress_percent}%</span>
                        </div>
                        <ProgressBar
                          progress={ch.progress_percent}
                          height="h-2"
                          colorClass={
                            isCompleted
                              ? 'bg-[#266C44]'
                              : isInProgress
                              ? 'bg-[#B78352]'
                              : isUnderReview
                              ? 'bg-purple-600'
                              : 'bg-gray-300'
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                    {/* View Document button if released */}
                    {hasDocument && (
                      <button
                        onClick={() => handleViewDocument(ch)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border bg-white text-xs font-semibold text-editorial-dark hover:bg-background transition-all shadow-xs"
                        title="View watermarked confidential PDF"
                      >
                        <Eye className="w-3.5 h-3.5 text-primary" />
                        View Document
                      </button>
                    )}

                    {/* Update & Upload PDF Button */}
                    <button
                      onClick={() => handleOpenUpdate(ch)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-all active:scale-98"
                    >
                      <UploadCloud className="w-4 h-4" />
                      Update & Upload PDF
                    </button>

                    {/* Secondary Chapter Actions: Edit, Reorder, Delete */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-border">
                      <button
                        onClick={() => handleOpenEdit(ch)}
                        className="p-1.5 rounded-lg hover:bg-background text-editorial-muted hover:text-editorial-dark transition-colors"
                        title="Edit chapter title/details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Up */}
                      <button
                        disabled={index === 0}
                        onClick={() => reorderMutation.mutate({ chapterIndex: index, direction: 'up' })}
                        className={`p-1.5 rounded-lg transition-colors ${
                          index === 0
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'hover:bg-background text-editorial-muted hover:text-editorial-dark'
                        }`}
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        disabled={index === chapters.length - 1}
                        onClick={() => reorderMutation.mutate({ chapterIndex: index, direction: 'down' })}
                        className={`p-1.5 rounded-lg transition-colors ${
                          index === chapters.length - 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'hover:bg-background text-editorial-muted hover:text-editorial-dark'
                        }`}
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Chapter */}
                      <button
                        onClick={() => handleDeleteChapter(ch)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-editorial-muted hover:text-red-600 transition-colors"
                        title="Delete Chapter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: ADD CHAPTER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-editorial-dark/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-card max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-serif text-lg font-bold text-editorial-dark">
                  Add Chapter {chapters.length + 1}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-background text-editorial-muted hover:text-editorial-dark"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-editorial-dark mb-1">
                  Chapter Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Results, Discussion & Experimental Findings"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-editorial-dark mb-1">
                  Target Word Count
                </label>
                <input
                  type="number"
                  value={newChapterWordCount}
                  onChange={(e) => setNewChapterWordCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-editorial-dark mb-1">
                  Scope & Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the research objectives covered in this chapter..."
                  value={newChapterDesc}
                  onChange={(e) => setNewChapterDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border bg-white text-xs font-semibold text-editorial-dark hover:bg-background"
              >
                Cancel
              </button>
              <button
                disabled={!newChapterTitle.trim() || addMutation.isPending}
                onClick={() => addMutation.mutate()}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold disabled:opacity-50 transition-all"
              >
                {addMutation.isPending ? 'Adding Chapter...' : 'Create Chapter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT CHAPTER */}
      {isEditModalOpen && selectedChapterForAction && (
        <div className="fixed inset-0 z-50 bg-editorial-dark/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-card max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary" />
                <h3 className="font-serif text-lg font-bold text-editorial-dark">
                  Edit Chapter {selectedChapterForAction.chapter_number}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-background text-editorial-muted hover:text-editorial-dark"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-editorial-dark mb-1">
                    Chapter #
                  </label>
                  <input
                    type="number"
                    value={editChapterNumber}
                    onChange={(e) => setEditChapterNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-editorial-dark mb-1">
                    Word Count Target
                  </label>
                  <input
                    type="number"
                    value={editChapterWordCount}
                    onChange={(e) => setEditChapterWordCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-editorial-dark mb-1">
                  Chapter Title *
                </label>
                <input
                  type="text"
                  value={editChapterTitle}
                  onChange={(e) => setEditChapterTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-editorial-dark mb-1">
                  Description / Supervisor Notes
                </label>
                <textarea
                  rows={3}
                  value={editChapterDesc}
                  onChange={(e) => setEditChapterDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border bg-white text-xs font-semibold text-editorial-dark hover:bg-background"
              >
                Cancel
              </button>
              <button
                disabled={!editChapterTitle.trim() || editMutation.isPending}
                onClick={() => editMutation.mutate()}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold disabled:opacity-50 transition-all"
              >
                {editMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: UPDATE PROGRESS & UPLOAD PDF */}
      {isUpdateModalOpen && selectedChapterForAction && (
        <div className="fixed inset-0 z-50 bg-editorial-dark/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-card max-w-xl w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-editorial-dark">
                    Update Progress & Upload PDF
                  </h3>
                  <p className="text-xs text-editorial-muted">
                    Chapter {selectedChapterForAction.chapter_number} — {selectedChapterForAction.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-background text-editorial-muted hover:text-editorial-dark"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Progress Slider */}
              <div className="bg-white p-4 rounded-xl border border-border space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-editorial-dark">
                  <span>Progress Percentage:</span>
                  <span className="font-mono text-primary text-sm">{updateProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={updateProgress}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setUpdateProgress(val);
                    if (val === 100 && updateStatus !== 'Completed' && updateStatus !== 'Released') {
                      setUpdateStatus('Completed');
                    }
                  }}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-editorial-muted font-mono">
                  <span>0% (Not Started)</span>
                  <span>50% (Drafting)</span>
                  <span>100% (Completed)</span>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-editorial-dark mb-1">
                  Chapter Status
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Completed">Completed</option>
                  <option value="Released">Released (Publish to Scholar)</option>
                </select>
              </div>

              {/* Supervisor Feedback Note */}
              <div>
                <label className="block text-xs font-semibold text-editorial-dark mb-1">
                  Supervisor Notes / Progress Update Message
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Methodology reviewed and approved. Statistical model parameters verified."
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Upload Document Section */}
              <div className="p-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-editorial-dark">Attach Review PDF Document</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-[11px] text-editorial-muted font-semibold">Version:</label>
                    <input
                      type="text"
                      value={docVersion}
                      onChange={(e) => setDocVersion(e.target.value)}
                      className="w-16 px-2 py-0.5 text-xs rounded-md border border-border bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="text-center py-3 bg-white rounded-lg border border-border">
                  <UploadCloud className="w-6 h-6 text-primary mx-auto mb-1" />
                  <label className="cursor-pointer text-xs font-semibold text-primary hover:underline">
                    <span>Click to browse and upload PDF</span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-editorial-muted mt-0.5">
                    {uploadedFileName ? (
                      <span className="text-emerald-700 font-mono font-bold">Attached: {uploadedFileName}</span>
                    ) : (
                      'PDF files up to 50MB. Auto-watermarked on scholar view.'
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="releaseToggle"
                    checked={releaseImmediately}
                    onChange={(e) => setReleaseImmediately(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <label htmlFor="releaseToggle" className="text-xs text-editorial-dark font-medium cursor-pointer">
                    Release document to scholar dashboard immediately
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border bg-white text-xs font-semibold text-editorial-dark hover:bg-background"
              >
                Cancel
              </button>
              <button
                disabled={updateProgressMutation.isPending}
                onClick={() => updateProgressMutation.mutate()}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold disabled:opacity-50 transition-all"
              >
                {updateProgressMutation.isPending ? 'Saving & Uploading...' : 'Save Progress & Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIDENTIAL DOCUMENT VIEWER MODAL */}
      {viewingDoc && (
        <ProtectedDocumentViewer
          document={viewingDoc}
          onClose={() => setViewingDoc(null)}
        />
      )}
    </div>
  );
};
