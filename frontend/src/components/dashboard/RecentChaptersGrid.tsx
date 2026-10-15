import React from 'react';
import { Link } from 'react-router-dom';
import { Chapter } from '../../types/database.types';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { FileText } from 'lucide-react';

interface RecentChaptersGridProps {
  chapters: Chapter[];
  onViewChapter: (chapterId: string) => void;
}

export const RecentChaptersGrid: React.FC<RecentChaptersGridProps> = ({
  chapters,
  onViewChapter,
}) => {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-base sm:text-lg font-bold text-editorial-dark">
          Recent Chapter Progress
        </h3>
        <Link
          to="/chapters"
          className="text-xs font-semibold text-primary hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {chapters.map((ch) => {
          const isCompleted = ch.status === 'Completed';
          const isInProgress = ch.status === 'In Progress';
          const isLocked = !ch.document_released;

          return (
            <div
              key={ch.id}
              className="bg-surface rounded-xl border border-border p-4 shadow-card flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-editorial-muted flex-shrink-0" />
                    <span className="text-xs font-bold text-editorial-dark">
                      Chapter {ch.chapter_number}
                    </span>
                  </div>
                  <Badge
                    variant={
                      isCompleted
                        ? 'completed'
                        : isInProgress
                        ? 'progress'
                        : 'locked'
                    }
                  >
                    {ch.status}
                  </Badge>
                </div>

                <h4 className="text-xs font-medium text-editorial-muted truncate mb-4">
                  {ch.title}
                </h4>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-editorial-dark mb-1">
                    <span>{ch.progress_percent}%</span>
                  </div>
                  <ProgressBar
                    progress={ch.progress_percent}
                    height="h-1.5"
                    colorClass={
                      isCompleted
                        ? 'bg-[#2E6F48]'
                        : isInProgress
                        ? 'bg-[#B26926]'
                        : 'bg-gray-300'
                    }
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
                <span className="text-editorial-muted truncate">
                  Updated: {ch.updated_date || 'Pending'}
                </span>
                {isCompleted && ch.document_released ? (
                  <button
                    onClick={() => onViewChapter(ch.id)}
                    className="font-semibold text-primary hover:text-primary-hover hover:underline"
                  >
                    View
                  </button>
                ) : (
                  <span className="text-editorial-muted text-[10px] italic">
                    {isLocked ? 'Locked' : 'View'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

