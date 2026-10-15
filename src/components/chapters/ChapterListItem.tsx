import React from 'react';
import { Check, Clock, Lock } from 'lucide-react';
import { Chapter } from '../../types/database.types';
import { chapterService } from '../../services/chapterService';

interface ChapterListItemProps {
  chapter: Chapter;
  onViewChapter: (chapterId: string) => void;
}

export const ChapterListItem: React.FC<ChapterListItemProps> = ({
  chapter,
  onViewChapter,
}) => {
  const isCompleted = chapter.status === 'Completed';
  const isInProgress = chapter.status === 'In Progress';
  const access = chapterService.canAccessDocument(chapter);

  return (
    <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-card transition-all hover:border-[#CBD5CD]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Status Icon & Details */}
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              isCompleted
                ? 'bg-[#EAF3EC] text-[#266C44] ring-1 ring-[#C1E1CB]'
                : isInProgress
                ? 'bg-[#FBF2E7] text-[#B78352] ring-1 ring-[#F2D7B7]'
                : 'bg-[#F0EFEA] text-[#7B817D] ring-1 ring-[#D7D6CF]'
            }`}
          >
            {isCompleted ? (
              <Check className="w-5 h-5 stroke-[2.5]" />
            ) : isInProgress ? (
              <Clock className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
          </div>

          <div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-editorial-dark">
              Chapter {chapter.chapter_number} — {chapter.title}
            </h3>

            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-editorial-muted">
              <span
                className={`font-semibold ${
                  isCompleted
                    ? 'text-[#266C44]'
                    : isInProgress
                    ? 'text-[#B78352]'
                    : 'text-[#7B817D]'
                }`}
              >
                {chapter.status} · {chapter.progress_percent}%
              </span>

              {chapter.updated_date && chapter.updated_date !== 'Pending' && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>Updated: {chapter.updated_date}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Action Button & Explanatory Notice */}
        <div className="flex flex-col sm:items-end gap-1.5 self-start sm:self-center">
          {access.allowed ? (
            <button
              onClick={() => onViewChapter(chapter.id)}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-98 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              View Chapter
            </button>
          ) : (
            <button
              disabled
              className="px-5 py-2.5 rounded-xl bg-[#EFECE6] text-[#7A807C] text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1.5 border border-[#DDDCD5]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Locked</span>
            </button>
          )}

          {access.reason && (
            <p className="text-[11px] text-editorial-muted italic sm:text-right max-w-xs">
              {access.reason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

