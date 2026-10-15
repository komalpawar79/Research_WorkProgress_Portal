import React from 'react';

interface ActiveProjectsDonutProps {
  totalProgress: number;
  completed: number;
  inProgress: number;
  pending: number;
}

export const ActiveProjectsDonut: React.FC<ActiveProjectsDonutProps> = ({
  totalProgress = 78,
  completed = 71,
  inProgress = 42,
  pending = 15,
}) => {
  const size = 130;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (totalProgress / 100) * circumference;

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-card h-full flex flex-col justify-between">
      <h3 className="font-serif text-base font-bold text-editorial-dark mb-2">
        Active Projects
      </h3>

      <div className="flex flex-col items-center justify-center my-2">
        <div className="relative" style={{ width: size, height: size }}>
          <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#EBE9E2"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
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

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-serif text-xl font-bold text-editorial-dark">
              {totalProgress}%
            </span>
            <span className="text-[9px] uppercase font-mono tracking-wider text-editorial-muted">
              Total Progress
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-1.5 pt-3 border-t border-border/60 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#266C44]" />
            <span className="text-editorial-muted">Completed</span>
          </div>
          <span className="font-semibold text-editorial-dark font-mono">{completed}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B78352]" />
            <span className="text-editorial-muted">In Progress</span>
          </div>
          <span className="font-semibold text-editorial-dark font-mono">{inProgress}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-editorial-muted">Pending</span>
          </div>
          <span className="font-semibold text-editorial-dark font-mono">{pending}</span>
        </div>
      </div>
    </div>
  );
};

