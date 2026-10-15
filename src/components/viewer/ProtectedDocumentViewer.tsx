import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
  Download,
  Printer,
  Copy,
  MousePointer,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
} from 'lucide-react';
import { ChapterDocument, DocumentPage } from '../../types/database.types';
import { WatermarkLayer } from './WatermarkLayer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ProtectedDocumentViewerProps {
  document: ChapterDocument;
  onClose: () => void;
}

export const ProtectedDocumentViewer: React.FC<ProtectedDocumentViewerProps> = ({
  document: doc,
  onClose,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);

  const pages: DocumentPage[] = doc.pages && doc.pages.length > 0
    ? doc.pages
    : Array.from({ length: doc.page_count }).map((_, idx) => ({
        page_number: idx + 1,
        title: doc.file_title,
        section_title: `Section ${doc.file_title.match(/\d+/)?.[0] || '1'}.${idx + 1}`,
        paragraphs: [
          'This is a protected academic document provided strictly for student review.',
          'All content has been digitally watermarked with your authorized credentials. Redistribution, copying, extraction, or automated capture is prohibited by academic integrity policies.',
          'Please review this draft carefully and share any supervisory revision requests directly through your ResearchFlow portal coordinator.',
        ],
      }));

  const activePageData = pages[currentPage - 1] || pages[0];

  // Disable keyboard shortcuts for print, save, copy, screenshot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to close
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Page left / right with arrow keys
      if (e.key === 'ArrowRight' && currentPage < pages.length) {
        setCurrentPage((p) => p + 1);
      }
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      }

      // Intercept Ctrl/Cmd + P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setSecurityWarning('Printing is disabled for this protected document.');
        showToast('Printing is restricted for review documents', 'error');
        return false;
      }

      // Intercept Ctrl/Cmd + S (Save)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        setSecurityWarning('Direct saving is disabled.');
        showToast('Saving is disabled for review documents', 'error');
        return false;
      }

      // Intercept Ctrl/Cmd + C (Copy)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setSecurityWarning('Text copying is prohibited.');
        showToast('Text copying is disabled', 'error');
        return false;
      }

      // Intercept PrintScreen
      if (e.key === 'PrintScreen') {
        setSecurityWarning('Screenshot attempt detected. Watermark is burned into all pages.');
        showToast('Document is watermarked with your identity', 'error');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length, onClose, showToast]);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#121B17]/85 backdrop-blur-md flex flex-col h-screen overflow-hidden select-none animate-in fade-in duration-200"
      onContextMenu={(e) => {
        e.preventDefault();
        showToast('Right-click context menu is disabled for security', 'info');
      }}
    >
      {/* Top Header Bar */}
      <header className="h-14 bg-[#1E3128] text-white px-4 sm:px-6 flex items-center justify-between border-b border-[#2D4539] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#52B788]" />
          <h2 className="font-serif text-sm sm:text-base font-semibold text-white truncate max-w-xs sm:max-w-md">
            {doc.file_title}
          </h2>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#263A33] text-[#B7C7BF] border border-[#3A564A]">
            Cloudinary Watermarked • Verified
          </span>
        </div>

        {/* Page Nav Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center bg-[#284236] rounded-lg px-2 py-1 text-xs text-white">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 hover:text-[#B78352] disabled:opacity-30 disabled:hover:text-white transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">
              Page {currentPage} of {pages.length}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pages.length, p + 1))}
              disabled={currentPage >= pages.length}
              className="p-1 hover:text-[#B78352] disabled:opacity-30 disabled:hover:text-white transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom controls (hidden on small mobile) */}
          <div className="hidden sm:flex items-center bg-[#284236] rounded-lg px-1.5 py-1 text-xs text-[#C5D7CD]">
            <button
              onClick={() => setZoom((z) => Math.max(80, z - 10))}
              className="p-1 hover:text-white"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] font-mono">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(130, z + 10))}
              className="p-1 hover:text-white"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#284236] hover:bg-[#345445] text-white transition-colors ml-2"
            title="Close viewer (Esc)"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* Security alert banner if triggered */}
      {securityWarning && (
        <div className="bg-[#B78352] text-white px-4 py-1.5 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{securityWarning}</span>
          </div>
          <button
            onClick={() => setSecurityWarning(null)}
            className="underline text-[11px] opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Reader Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Thumbnail Rail (Collapsible on mobile) */}
        <aside className="w-24 sm:w-32 bg-[#17251F] border-r border-[#243A30] overflow-y-auto p-3 hidden md:flex flex-col gap-3 flex-shrink-0">
          <p className="text-[10px] uppercase font-mono tracking-wider text-[#799084] text-center">
            Pages ({pages.length})
          </p>
          {pages.map((p) => (
            <button
              key={p.page_number}
              onClick={() => setCurrentPage(p.page_number)}
              className={`w-full group text-left transition-all ${
                currentPage === p.page_number
                  ? 'ring-2 ring-[#B78352] rounded-lg'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className="aspect-[3/4] bg-white rounded p-1.5 flex flex-col justify-between text-[6px] text-gray-400 overflow-hidden shadow-sm relative">
                <div className="h-1 w-3/4 bg-gray-300 rounded-xs mb-1" />
                <div className="space-y-0.5">
                  <div className="h-0.5 w-full bg-gray-200 rounded-xs" />
                  <div className="h-0.5 w-5/6 bg-gray-200 rounded-xs" />
                  <div className="h-0.5 w-4/6 bg-gray-200 rounded-xs" />
                </div>
                <div className="text-center font-mono text-[8px] font-bold text-gray-700">
                  {p.page_number}
                </div>
              </div>
              <span className="block text-center text-[10px] text-[#A5B8AD] mt-1">
                Page {p.page_number}
              </span>
            </button>
          ))}
        </aside>

        {/* Center: High-Fidelity Academic Reading Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-[#2B3B34]">
          <div
            className="w-full max-w-2xl bg-white shadow-2xl rounded-sm p-8 sm:p-14 relative overflow-hidden my-auto protected-canvas transition-transform duration-200"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              minHeight: '820px',
            }}
          >
            {/* User-Specific Watermark Layer */}
            <WatermarkLayer userName={user?.full_name || 'Rahul Sharma'} />

            {/* Document Header */}
            <div className="border-b border-gray-200 pb-4 mb-6">
              <span className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">
                ResearchFlow Protected Publication
              </span>
              <h1 className="font-serif text-2xl font-bold text-gray-900 mt-1">
                {activePageData.title}
              </h1>
              {activePageData.section_title && (
                <h2 className="font-serif text-base font-semibold text-gray-800 mt-2 text-primary">
                  {activePageData.section_title}
                </h2>
              )}
            </div>

            {/* Document Body Text */}
            <div className="space-y-4 text-gray-800 font-serif leading-relaxed text-sm sm:text-base">
              {activePageData.paragraphs.map((para, i) => (
                <p key={i} className="text-justify leading-7">
                  {para}
                </p>
              ))}

              {/* Optional Tables for Academic Realism */}
              {activePageData.tables && (
                <div className="my-6 space-y-2">
                  {activePageData.tables.map((t, idx) => (
                    <div key={idx} className="border border-gray-300 rounded overflow-hidden text-xs">
                      <div className="bg-gray-100 font-sans font-semibold p-2 border-b border-gray-300 text-gray-800">
                        {t.caption}
                      </div>
                      <table className="w-full text-left font-sans">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            {t.headers.map((h, hi) => (
                              <th key={hi} className="p-2 font-medium text-gray-700">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {t.rows.map((r, ri) => (
                            <tr key={ri} className="hover:bg-gray-50/60">
                              {r.map((cell, ci) => (
                                <td key={ci} className="p-2 text-gray-600">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}

              {activePageData.notes && (
                <div className="mt-8 p-3 bg-gray-50 border-l-2 border-[#6F806F] text-xs font-sans text-gray-600 italic">
                  Note: {activePageData.notes}
                </div>
              )}
            </div>

            {/* Document Footer */}
            <div className="mt-12 pt-4 border-t border-gray-200 flex items-center justify-between text-[11px] font-mono text-gray-400">
              <span>CONFIDENTIAL — FOR REVIEW ONLY</span>
              <span>
                Page {activePageData.page_number} of {pages.length}
              </span>
            </div>
          </div>
        </div>

        {/* Right Security Panel (Matching reference Screen 5) */}
        <aside className="w-64 sm:w-72 bg-[#1C2C24] border-l border-[#273D32] p-5 text-white hidden lg:flex flex-col justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#2E483C] text-[#D8A775] flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-base font-semibold text-white">
                Protected Document
              </h3>
            </div>

            <p className="text-xs text-[#9BB1A4] leading-relaxed mb-6">
              This document is view only. Downloading, printing and copying are disabled for your security.
            </p>

            {/* Disabled Action Indicators */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#24392F] text-[#869E91] text-xs">
                <Download className="w-4 h-4 line-through opacity-60" />
                <span className="line-through">Download</span>
                <span className="ml-auto text-[10px] text-rose-400 font-medium">Restricted</span>
              </div>

              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#24392F] text-[#869E91] text-xs">
                <Printer className="w-4 h-4 line-through opacity-60" />
                <span className="line-through">Print</span>
                <span className="ml-auto text-[10px] text-rose-400 font-medium">Restricted</span>
              </div>

              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#24392F] text-[#869E91] text-xs">
                <Copy className="w-4 h-4 line-through opacity-60" />
                <span className="line-through">Copy</span>
                <span className="ml-auto text-[10px] text-rose-400 font-medium">Restricted</span>
              </div>

              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#24392F] text-[#869E91] text-xs">
                <MousePointer className="w-4 h-4 line-through opacity-60" />
                <span className="line-through">Select Text</span>
                <span className="ml-auto text-[10px] text-rose-400 font-medium">Restricted</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#23382E] border border-[#2F4A3D] text-[11px] text-[#A6BCB0] leading-relaxed">
            <span className="font-semibold text-white block mb-1">Confidentiality Guarantee</span>
            Watermarked with your name ({user?.full_name || 'Rahul Sharma'}) for safety and security.
          </div>
        </aside>
      </div>
    </div>
  );
};

