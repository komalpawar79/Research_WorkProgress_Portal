import React from 'react';
import { Link } from 'react-router-dom';
import { Chapter } from '../../types/database.types';
import { Badge } from '../common/Badge';

interface LatestUpdateCardProps {
  chapter: Chapter | null;
  onViewChapter: (chapterId: string) => void;
}

export const LatestUpdateCard: React.FC<LatestUpdateCardProps> = ({
  chapter,
  onViewChapter,
}) => {
  if (!chapter) return null;

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-card flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-base font-bold text-editorial-dark">
            Latest Update
          </h3>
          <Link
            to="/chapters"
            className="text-xs font-semibold text-primary hover:text-[#182822] hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="flex items-center gap-2.5 mb-2">
          <h4 className="font-semibold text-sm text-editorial-dark">
            Chapter {chapter.chapter_number} — {chapter.title}
          </h4>
          <Badge variant="completed">Completed</Badge>
        </div>

        <p className="text-xs text-editorial-muted leading-relaxed mb-4">
          Your {chapter.title} chapter has been completed successfully.
        </p>

        <div className="text-[11px] text-editorial-muted mb-5">
          <span className="font-medium">Updated: </span>
          <span>{chapter.updated_date}</span>
        </div>
      </div>

      <button
        onClick={() => onViewChapter(chapter.id)}
        className="w-full sm:w-auto self-start px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-98 transition-all shadow-sm"
      >
        View Chapter
      </button>
    </div>
  );
};

