import React from 'react';
import { HourglassIcon } from '../constants';
import { EnhancedCircularProgress } from './EnhancedCircularProgress';

interface ProgressProps {
  progress: number;
}

export const OutputProgress: React.FC<ProgressProps> = ({ progress }) => {
  return (
    <EnhancedCircularProgress
      progress={progress}
      icon={<HourglassIcon className="w-full h-full animate-spin" />}
      primaryColorClass="text-secondary dark:text-secondary-light"
      secondaryColorClass="text-gray-200 dark:text-gray-700"
      label="AI đang kiến tạo..."
    />
  );
};
