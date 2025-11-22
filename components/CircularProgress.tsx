
import React from 'react';

interface CircularProgressProps {
  progress: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ progress }) => {
  const radius = 50;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 z-10">
      <div className="relative w-32 h-32">
        <svg
          height="100%"
          width="100%"
          viewBox="0 0 120 120"
          className="transform -rotate-90"
        >
          <circle
            stroke="currentColor"
            className="text-gray-200 dark:text-gray-600"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius + stroke}
            cy={radius + stroke}
          />
          <circle
            stroke="currentColor"
            className="text-blue-600 dark:text-blue-400"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.35s' }}
            r={normalizedRadius}
            cx={radius + stroke}
            cy={radius + stroke}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-normal">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};