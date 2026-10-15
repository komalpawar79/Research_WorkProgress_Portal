import React from 'react';

interface WatermarkLayerProps {
  userName?: string;
}

export const WatermarkLayer: React.FC<WatermarkLayerProps> = ({
  userName = 'Rahul Sharma',
}) => {
  // Generate a grid of repeated diagonal watermark tiles
  const repeatCount = 16;

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-20 flex flex-wrap content-around justify-around opacity-15"
      aria-hidden="true"
    >
      {Array.from({ length: repeatCount }).map((_, i) => (
        <div
          key={i}
          className="transform -rotate-[28deg] py-12 px-6 text-center select-none"
        >
          <div className="font-mono text-sm tracking-widest font-extrabold uppercase text-gray-800">
            CONFIDENTIAL
          </div>
          <div className="font-serif text-xs font-semibold text-gray-900 tracking-wide mt-0.5">
            {userName}
          </div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-gray-700">
            FOR REVIEW ONLY
          </div>
        </div>
      ))}
    </div>
  );
};

