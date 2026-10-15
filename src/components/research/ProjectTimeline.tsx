import React from 'react';
import { Check, Clock, Circle } from 'lucide-react';
import { TimelineStep } from '../../types/database.types';

interface ProjectTimelineProps {
  steps: TimelineStep[];
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ steps }) => {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-card mt-6">
      <h3 className="font-serif text-lg font-bold text-editorial-dark mb-6">
        Project Timeline
      </h3>

      {/* Desktop / Tablet Horizontal Stepper */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[650px] flex items-center justify-between relative px-4">
          {/* Background Connecting Line */}
          <div className="absolute left-8 right-8 top-5 h-0.5 bg-[#E2E0D8] -z-0" />

          {steps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = step.status === 'in_progress';

            return (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center max-w-[110px]">
                {/* Step Node */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
                    isCompleted
                      ? 'bg-[#2E6F48] text-white ring-4 ring-[#EAF3EC]'
                      : isInProgress
                      ? 'bg-[#B78352] text-white ring-4 ring-[#FBF2E7]'
                      : 'bg-white border-2 border-border text-editorial-muted'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : isInProgress ? (
                    <Clock className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-gray-300 fill-gray-100" />
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`text-xs font-semibold mt-3 ${
                    isCompleted
                      ? 'text-editorial-dark'
                      : isInProgress
                      ? 'text-[#B78352]'
                      : 'text-editorial-muted'
                  }`}
                >
                  {step.title}
                </span>

                {/* Step Date / Subtitle */}
                {step.date && (
                  <span className="text-[10px] text-editorial-muted mt-0.5 font-mono">
                    {step.date}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

