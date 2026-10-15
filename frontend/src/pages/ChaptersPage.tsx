import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { chapterService } from '../services/chapterService';
import { documentService } from '../services/documentService';
import { ChapterListItem } from '../components/chapters/ChapterListItem';
import { ProtectedDocumentViewer } from '../components/viewer/ProtectedDocumentViewer';
import { ChapterDocument } from '../types/database.types';
import { useToast } from '../context/ToastContext';

export const ChaptersPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedDoc, setSelectedDoc] = useState<ChapterDocument | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  const { data: project } = useQuery({
    queryKey: ['project', user?.id],
    queryFn: () => (user ? projectService.getProjectByUserId(user.id) : null),
    refetchInterval: 5000,
  });

  const { data: chapters = [], isLoading } = useQuery({
    queryKey: ['chapters', project?.id],
    queryFn: () => (project ? chapterService.getChaptersByProjectId(project.id) : []),
    enabled: Boolean(project?.id),
    refetchInterval: 5000,
  });

  const handleViewChapter = async (chapterId: string) => {
    if (!user) return;
    setLoadingDoc(true);
    try {
      const doc = await documentService.getDocumentByChapterId(
        chapterId,
        user.id,
        user.full_name
      );
      if (doc) {
        setSelectedDoc(doc);
      } else {
        showToast('Document is not available for this chapter.', 'error');
      }
    } catch {
      showToast('Failed to load protected document.', 'error');
    } finally {
      setLoadingDoc(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-editorial-muted font-medium">Loading chapters...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Title & Subtitle */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
          My Chapters
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted mt-1">
          Track your chapter-wise progress and access completed research content.
        </p>
      </div>

      {/* Chapters Vertical List matching Reference Screen 4 */}
      <div className="space-y-4">
        {chapters.map((ch) => (
          <ChapterListItem
            key={ch.id}
            chapter={ch}
            onViewChapter={handleViewChapter}
          />
        ))}
      </div>

      {/* Protected Document Viewer Modal */}
      {selectedDoc && (
        <ProtectedDocumentViewer
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}

      {loadingDoc && (
        <div className="fixed inset-0 z-50 bg-editorial-dark/40 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-white rounded-xl p-4 shadow-card flex items-center gap-3 text-xs font-semibold text-editorial-dark">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Preparing your protected document...</span>
          </div>
        </div>
      )}
    </div>
  );
};

