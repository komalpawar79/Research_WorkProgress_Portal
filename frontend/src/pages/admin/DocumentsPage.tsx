import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { documentManagementService } from '../../services/documentManagementService';
import { ProtectedDocumentViewer } from '../../components/viewer/ProtectedDocumentViewer';
import { mockDocumentMap } from '../../services/mockData';
import { ChapterDocument } from '../../types/database.types';
import { DocumentRecord } from '../../types/admin.types';

export const DocumentsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('All');
  const [chapterFilter, setChapterFilter] = useState('All');
  const [versionFilter, setVersionFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [previewDoc, setPreviewDoc] = useState<ChapterDocument | null>(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['adminDocuments', search, customerFilter, chapterFilter, versionFilter],
    queryFn: () =>
      documentManagementService.getDocuments({
        search,
        customer: customerFilter,
        chapter: chapterFilter,
        version: versionFilter,
      }),
  });

  const handleView = (_docId: string) => {
    // Map to chapter 2 protected preview
    const sample = mockDocumentMap['ch-02-lit-review'];
    setPreviewDoc(sample);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
          Documents
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted mt-1">
          Manage all uploaded research documents.
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
            placeholder="Search documents..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-background/60 focus:bg-white border border-border rounded-xl outline-none focus:ring-1 focus:ring-primary text-editorial-dark"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full lg:w-auto">
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-background/60 border border-border rounded-xl outline-none text-editorial-dark font-medium cursor-pointer"
          >
            <option value="All">Customer</option>
            <option value="Rahul Sharma">Rahul Sharma</option>
            <option value="Priya Patel">Priya Patel</option>
            <option value="Amit Shah">Amit Shah</option>
            <option value="Neha Verma">Neha Verma</option>
          </select>

          <select
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-background/60 border border-border rounded-xl outline-none text-editorial-dark font-medium cursor-pointer"
          >
            <option value="All">Chapter</option>
            <option value="Chapter 1">Chapter 1</option>
            <option value="Chapter 2">Chapter 2</option>
            <option value="Chapter 3">Chapter 3</option>
          </select>

          <select
            value={versionFilter}
            onChange={(e) => setVersionFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-background/60 border border-border rounded-xl outline-none text-editorial-dark font-medium cursor-pointer"
          >
            <option value="All">Version</option>
            <option value="v1">v1</option>
            <option value="v2">v2</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-editorial-muted">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading documents...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-[#FAF9F5] text-[11px] uppercase tracking-wider font-mono text-editorial-muted">
                  <th className="py-3.5 px-5 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Chapter</th>
                  <th className="py-3.5 px-4 font-semibold">Version</th>
                  <th className="py-3.5 px-4 font-semibold">Uploaded</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
                {documents.map((doc: DocumentRecord) => (
                  <tr key={doc.id} className="hover:bg-[#FBF9F4] transition-colors">
                    {/* Customer */}
                    <td className="py-4 px-5 font-medium text-editorial-dark">
                      {doc.customer_name}
                    </td>

                    {/* Chapter */}
                    <td className="py-4 px-4 text-editorial-muted">
                      {doc.chapter_title}
                    </td>

                    {/* Version */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#EAF3EC] text-[#266C44] border border-[#C1E1CB]">
                        {doc.version}
                      </span>
                    </td>

                    {/* Uploaded */}
                    <td className="py-4 px-4 text-editorial-muted font-mono text-xs">
                      {doc.uploaded_at}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleView(doc.id)}
                        className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold text-editorial-dark hover:bg-primary hover:text-white hover:border-primary transition-colors shadow-xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-editorial-muted bg-[#FAF9F5]">
          <span>Showing 1 - {documents.length} of 48</span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-border hover:bg-white disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {[1, 2, 3, 4, 5].map((page) => (
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
              onClick={() => setCurrentPage((p: number) => Math.min(5, p + 1))}
              disabled={currentPage === 5}
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
