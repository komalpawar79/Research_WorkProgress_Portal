import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, FileCheck, Eye, Lock, Unlock } from 'lucide-react';
import { documentManagementService } from '../../services/documentManagementService';
import { customerService } from '../../services/customerService';
import { ProtectedDocumentViewer } from '../../components/viewer/ProtectedDocumentViewer';
import { ChapterDocument } from '../../types/database.types';
import { DocumentRecord } from '../../types/admin.types';
import { useToast } from '../../context/ToastContext';

export const DocumentsPage: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('All');
  const [chapterFilter, setChapterFilter] = useState('All');
  const [versionFilter, setVersionFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [previewDoc, setPreviewDoc] = useState<ChapterDocument | null>(null);

  // 1. Fetch Documents with 5s live polling
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['adminDocuments', search, customerFilter, chapterFilter, versionFilter],
    queryFn: () =>
      documentManagementService.getDocuments({
        search,
        customer: customerFilter,
        chapter: chapterFilter,
        version: versionFilter,
      }),
    refetchInterval: 5000,
  });

  // 2. Fetch Customers for filter dropdown
  const { data: customers = [] } = useQuery({
    queryKey: ['adminCustomerList'],
    queryFn: () => customerService.getCustomers(),
  });

  // 3. Toggle Release Mutation
  const toggleReleaseMutation = useMutation({
    mutationFn: async ({ docId, chapterId, releaseState }: { docId: string; chapterId: string; releaseState: boolean }) => {
      return await documentManagementService.toggleRelease(docId, chapterId, releaseState);
    },
    onSuccess: (_data, variables) => {
      showToast(
        variables.releaseState
          ? 'Document successfully released to Scholar portal!'
          : 'Document access revoked.',
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['adminDocuments'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to update release status.', 'error');
    },
  });

  const handleView = (doc: DocumentRecord) => {
    setPreviewDoc({
      id: doc.id,
      chapter_id: doc.chapter_id,
      user_id: doc.customer_id,
      file_title: doc.file_name,
      storage_path: (doc as any).file_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      watermark_text: `${doc.customer_name} • CONFIDENTIAL • ResearchFlow`,
      page_count: 24,
      is_active: true,
      created_at: doc.uploaded_at,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
          Research Documents
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted mt-1">
          Manage, preview, and release protected thesis documents to scholars in real time.
        </p>
      </div>

      {/* Filters Bar matching reference Screen 6 */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-card flex flex-col lg:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-editorial-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by scholar, title, or filename..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-background/60 focus:bg-white border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary text-editorial-dark"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full lg:w-auto">
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-background/60 border border-border rounded-xl outline-none text-editorial-dark font-medium cursor-pointer"
          >
            <option value="All">All Scholars</option>
            {customers.map((c) => (
              <option key={c.id} value={c.full_name}>
                {c.full_name}
              </option>
            ))}
          </select>

          <select
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-background/60 border border-border rounded-xl outline-none text-editorial-dark font-medium cursor-pointer"
          >
            <option value="All">All Chapters</option>
            <option value="Chapter 1">Chapter 1</option>
            <option value="Chapter 2">Chapter 2</option>
            <option value="Chapter 3">Chapter 3</option>
            <option value="Chapter 4">Chapter 4</option>
            <option value="Chapter 5">Chapter 5</option>
          </select>

          <select
            value={versionFilter}
            onChange={(e) => setVersionFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-background/60 border border-border rounded-xl outline-none text-editorial-dark font-medium cursor-pointer"
          >
            <option value="All">All Versions</option>
            <option value="v1">v1.0</option>
            <option value="v2">v2.0</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        {isLoading && documents.length === 0 ? (
          <div className="p-12 text-center text-xs text-editorial-muted">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading documents from database...
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-xs text-editorial-muted">
            <FileCheck className="w-8 h-8 text-editorial-muted/50 mx-auto mb-2" />
            No documents found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-[#FAF9F5] text-[11px] uppercase tracking-wider font-mono text-editorial-muted">
                  <th className="py-3.5 px-5 font-semibold">Customer / Scholar</th>
                  <th className="py-3.5 px-4 font-semibold">Chapter & File</th>
                  <th className="py-3.5 px-4 font-semibold">Version</th>
                  <th className="py-3.5 px-4 font-semibold">Access Status</th>
                  <th className="py-3.5 px-4 font-semibold">Uploaded</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
                {documents.map((doc: DocumentRecord) => {
                  const isReleased = doc.status === 'Released';

                  return (
                    <tr key={doc.id} className="hover:bg-[#FBF9F4] transition-colors">
                      {/* Customer */}
                      <td className="py-4 px-5">
                        <span className="font-semibold text-editorial-dark block">
                          {doc.customer_name}
                        </span>
                        <span className="text-[11px] text-editorial-muted truncate max-w-[200px] block">
                          {doc.project_title}
                        </span>
                      </td>

                      {/* Chapter */}
                      <td className="py-4 px-4">
                        <span className="font-medium text-editorial-dark block">
                          {doc.chapter_title}
                        </span>
                        <span className="text-[11px] text-editorial-muted font-mono truncate max-w-[220px] block">
                          {doc.file_name}
                        </span>
                      </td>

                      {/* Version */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#EAF3EC] text-[#266C44] border border-[#C1E1CB]">
                          {doc.version}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isReleased ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EAF3EC] text-[#266C44] border border-[#C1E1CB]">
                            <Unlock className="w-3 h-3" />
                            <span>Released to Scholar</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FBF2E7] text-[#B78352] border border-[#F2D7B7]">
                            <Lock className="w-3 h-3" />
                            <span>In Review / Private</span>
                          </span>
                        )}
                      </td>

                      {/* Uploaded */}
                      <td className="py-4 px-4 text-editorial-muted font-mono text-xs whitespace-nowrap">
                        {doc.uploaded_at}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(doc)}
                            className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-editorial-dark hover:bg-primary hover:text-white hover:border-primary transition-colors shadow-xs flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>

                          <button
                            onClick={() =>
                              toggleReleaseMutation.mutate({
                                docId: doc.id,
                                chapterId: doc.chapter_id,
                                releaseState: !isReleased,
                              })
                            }
                            disabled={toggleReleaseMutation.isPending}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center gap-1 ${
                              isReleased
                                ? 'border border-[#E2B3A8] text-[#C8523A] hover:bg-[#FDF0ED]'
                                : 'bg-[#266C44] hover:bg-[#1E5736] text-white'
                            }`}
                          >
                            {isReleased ? (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>Revoke</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3 h-3" />
                                <span>Release</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-editorial-muted bg-[#FAF9F5]">
          <span>Showing 1 - {documents.length} of {documents.length}</span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-border hover:bg-white disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button className="w-7 h-7 rounded-lg text-xs font-semibold bg-primary text-white shadow-xs">
              1
            </button>

            <button
              disabled
              className="p-1.5 rounded-lg border border-border hover:bg-white disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal if clicked */}
      {previewDoc && (
        <ProtectedDocumentViewer
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};
