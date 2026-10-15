import React from 'react';
import { GraduationCap } from 'lucide-react';
import { ResearchProject } from '../../types/database.types';
import { ProgressBar } from '../common/ProgressBar';
import { BotanicalIllustration } from './BotanicalIllustration';

interface ProjectOverviewCardProps {
  project: ResearchProject;
}

export const ProjectOverviewCard: React.FC<ProjectOverviewCardProps> = ({ project }) => {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6 sm:p-7 shadow-card relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left / Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-[#263A33] text-white flex items-center justify-center shadow-sm flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-[#F0EFEA]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-editorial-muted tracking-wider uppercase">
                Research Topic
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-editorial-dark mt-0.5">
                {project.topic}
              </h2>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mb-6 max-w-xl">
            <div className="flex items-center justify-between text-xs font-medium text-editorial-muted mb-2">
              <span>Overall Progress</span>
              <span className="text-sm font-bold text-primary">{project.overall_progress}%</span>
            </div>
            <ProgressBar progress={project.overall_progress} height="h-2.5" colorClass="bg-[#263A33]" />
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/70 text-xs">
            <div>
              <span className="text-editorial-muted block mb-1">Status</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#266C44]">
                <span className="w-2 h-2 rounded-full bg-[#266C44] animate-pulse" />
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
        </div>

        {/* Right Side: Botanical Illustration & Motivational Quote */}
        <div className="hidden md:flex flex-col items-center justify-center p-4 lg:pl-8 lg:border-l lg:border-border/70 text-center max-w-[200px] flex-shrink-0">
          <BotanicalIllustration className="w-20 h-20 mb-2 opacity-90" />
          <p className="font-serif text-xs italic text-editorial-muted leading-relaxed">
            "Small steps every day lead to big results."
          </p>
        </div>
      </div>
    </div>
  );
};

