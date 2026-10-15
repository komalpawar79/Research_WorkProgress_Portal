import React from 'react';

interface ProgressBarProps {
  progress: number;
  height?: string;
  colorClass?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 'h-2',
  colorClass = 'bg-[#2E5E4E]',
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full bg-[#E5E3DC] rounded-full overflow-hidden ${height} ${className}`}>
      <div
        className={`${colorClass} h-full rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};

