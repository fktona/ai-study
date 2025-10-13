

import React from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  seconds: number;
}

const Timer: React.FC<TimerProps> = ({ seconds }) => {
  const formatTime = () => {
    const getSeconds = `0${seconds % 60}`.slice(-2);
    const minutes = Math.floor(seconds / 60);
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(seconds / 3600)}`.slice(-2);
    return `${getHours}:${getMinutes}:${getSeconds}`;
  };

  return (
    <div className="flex items-center gap-2 bg-slate-200/50 dark:bg-white/5 px-3 py-1 rounded-md">
      <Clock className="w-4 h-4 text-slate-500 dark:text-gray-300" />
      <span className="font-mono text-sm">{formatTime()}</span>
    </div>
  );
};

export default Timer;
