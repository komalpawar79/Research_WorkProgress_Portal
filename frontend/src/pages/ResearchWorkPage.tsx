import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { ProgressDonut } from '../components/research/ProgressDonut';
import { ProjectTimeline } from '../components/research/ProjectTimeline';
import { Badge } from '../components/common/Badge';

export const ResearchWorkPage: React.FC = () => {
  const { user } = useAuth();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', user?.id],
    queryFn: () => (user ? projectService.getProjectByUserId(user.id) : null),
  });

  const { data: timelineSteps = [] } = useQuery({
    queryKey: ['timeline', project?.id],
    queryFn: () => (project ? projectService.getTimelineSteps(project.id) : []),
    enabled: Boolean(project?.id),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-editorial-muted font-medium">Loading research details...</p>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div>
      {/* Title & Subtitle */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-dark">
          My Research Work
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted mt-1">
          Detailed overview of your research project.
        </p>
      </div>

      {/* Main Project Card matching Reference Screen 3 */}
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Metadata */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-editorial-dark">
                {project.topic}
              </h2>
              <Badge variant="thesis">Thesis</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-xs sm:text-sm">
              <div>
                <span className="text-editorial-muted block mb-1">Research Type</span>
                <span className="font-semibold text-editorial-dark">{project.research_type}</span>
              </div>

              <div>
                <span className="text-editorial-muted block mb-1">Status</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#266C44]">
                  <span className="w-2 h-2 rounded-full bg-[#266C44]" />
                  {project.status}
                </span>
              </div>

              <div>
                <span className="text-editorial-muted block mb-1">Started</span>
                <span className="font-semibold text-editorial-dark">{project.started_at}</span>
              </div>

              <div>
                <span className="text-editorial-muted block mb-1">Expected Completion</span>
                <span className="font-semibold text-editorial-dark">{project.expected_completion}</span>
              </div>
            </div>

            {project.description && (
              <p className="text-xs text-editorial-muted mt-6 pt-4 border-t border-border/60 leading-relaxed">
                {project.description}
              </p>
            )}
          </div>

          {/* Right Circular Donut Progress */}
          <div className="flex items-center justify-center lg:pl-8 lg:border-l lg:border-border/70 flex-shrink-0">
            <ProgressDonut progress={project.overall_progress} size={150} strokeWidth={12} />
          </div>
        </div>
      </div>

      {/* Project Timeline Stepper */}
      <ProjectTimeline steps={timelineSteps} />
    </div>
  );
};

