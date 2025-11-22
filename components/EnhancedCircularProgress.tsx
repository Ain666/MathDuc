import React from 'react';

interface EnhancedCircularProgressProps {
  progress: number;
  icon: React.ReactNode;
  primaryColorClass: string;
  secondaryColorClass: string;
  label: string;
}

export const EnhancedCircularProgress: React.FC<EnhancedCircularProgressProps> = ({
  progress,
  icon,
  primaryColorClass,
  secondaryColorClass,
  label
}) => {
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
      <div className="relative w-40 h-40">
        <svg
          height="100%"
          width="100%"
          viewBox="0 0 140 140"
          className="transform -rotate-90"
        >
          <defs>
              <filter id="glow">
                  <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                  <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                  </feMerge>
              </filter>
          </defs>
          <circle
            stroke="currentColor"
            className={secondaryColorClass}
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius + stroke/2 + 2}
            cy={radius + stroke/2 + 2}
          />
          <circle
            stroke="currentColor"
            className={primaryColorClass}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius + stroke/2 + 2}
            cy={radius + stroke/2 + 2}
            filter="url(#glow)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`w-12 h-12 ${primaryColorClass}`}>
            {icon}
          </div>
          <span className="text-xl font-semibold mt-2 text-gray-700 dark:text-gray-300">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
      <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400 animate-pulse">{label}</p>
    </div>
  );
};
