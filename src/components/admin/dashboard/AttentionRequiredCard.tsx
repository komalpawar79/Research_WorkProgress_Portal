import React from 'react';
import { AlertTriangle, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AttentionItem } from '../../../types/admin.types';

interface AttentionRequiredCardProps {
  items: AttentionItem[];
}

export const AttentionRequiredCard: React.FC<AttentionRequiredCardProps> = ({ items }) => {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-card h-full flex flex-col justify-between">
      <div>
        <h3 className="font-serif text-base font-bold text-editorial-dark mb-4">
          Attention Required
        </h3>

        <div className="space-y-2.5">
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FDF7F2] border border-[#F6DECE] text-xs text-[#8F481B] hover:bg-[#FBEFE5] transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-[#D96B27] flex-shrink-0" />
              <span className="font-medium flex-1 truncate">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Decorative stacked books and quote from reference */}
      <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#263A33]/10 text-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="font-serif text-xs italic text-editorial-muted">
              "Better Research,
            </p>
            <p className="font-serif text-xs italic text-editorial-dark font-semibold">
              Brighter Future"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

