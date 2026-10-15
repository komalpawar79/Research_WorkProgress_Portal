import React from 'react';

interface ProgressDonutProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

export const ProgressDonut: React.FC<ProgressDonutProps> = ({
  progress,
  size = 140,
  strokeWidth = 12,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E3E1D9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#263A33"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-serif text-2xl font-bold text-editorial-dark">
            {progress}%
          </span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-editorial-muted">
            Progress
          </span>
        </div>
      </div>

      <span className="text-xs font-semibold text-editorial-muted mt-2">
        Overall Progress
      </span>
    </div>
  );
};

