import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { chapterService } from '../services/chapterService';
import { documentService } from '../services/documentService';
import { ProjectOverviewCard } from '../components/dashboard/ProjectOverviewCard';
import { LatestUpdateCard } from '../components/dashboard/LatestUpdateCard';
import { RecentChaptersGrid } from '../components/dashboard/RecentChaptersGrid';
import { ProtectedDocumentViewer } from '../components/viewer/ProtectedDocumentViewer';
import { ChapterDocument } from '../types/database.types';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedDoc, setSelectedDoc] = useState<ChapterDocument | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['project', user?.id],
    queryFn: () => (user ? projectService.getProjectByUserId(user.id) : null),
    refetchInterval: 5000,
  });

  const { data: chapters = [] } = useQuery({
    queryKey: ['chapters', project?.id],
    queryFn: () => (project ? chapterService.getChaptersByProjectId(project.id) : []),
    enabled: Boolean(project?.id),
    refetchInterval: 5000,
  });

  const { data: latestChapter } = useQuery({
    queryKey: ['latestChapter', project?.id],
    queryFn: () => (project ? chapterService.getLatestCompletedChapter(project.id) : null),
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
        showToast('Document is not available for this chapter yet.', 'error');
      }
    } catch {
      showToast('Error opening protected document.', 'error');
    } finally {
      setLoadingDoc(false);
    }
  };

  if (loadingProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-editorial-muted font-medium">Loading your research progress...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-surface rounded-2xl border border-border p-12 text-center shadow-card">
        <h3 className="font-serif text-lg font-bold text-editorial-dark mb-2">
          No Project Assigned
        </h3>
        <p className="text-xs text-editorial-muted max-w-sm mx-auto">
          No research project has been assigned to your account yet. Please contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
          Good Morning, {user?.full_name?.split(' ')[0] || 'Rahul'} 👋
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted mt-1">
          Here's an overview of your research work and progress.
        </p>
      </div>

      {/* Main Grid: Project Overview + Latest Update */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <ProjectOverviewCard project={project} />
        </div>
        <div>
          <LatestUpdateCard
            chapter={latestChapter || chapters.find((c) => c.status === 'Completed') || null}
            onViewChapter={handleViewChapter}
          />
        </div>
      </div>

      {/* Recent Chapter Progress */}
      <RecentChaptersGrid
        chapters={chapters}
        onViewChapter={handleViewChapter}
      />

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

