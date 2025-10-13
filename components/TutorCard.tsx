import React from 'react';
import { Tutor } from '../types';

interface TutorCardProps {
  tutor: Tutor;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor, isSelected, isDisabled, onSelect }) => {
  return (
    <div 
      onClick={isDisabled ? undefined : onSelect}
      className={`p-4 rounded-lg border-2 transition-all duration-300 flex items-center gap-4 ${
        isSelected
          ? 'bg-blue-500/20 dark:bg-blue-500/30 border-blue-500 dark:border-sky-400 shadow-lg'
          : isDisabled
          ? 'bg-slate-200 dark:bg-gray-800/50 border-slate-300 dark:border-gray-700 opacity-50 cursor-not-allowed'
          : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-sky-400 hover:bg-blue-500/5 dark:hover:bg-blue-500/10 cursor-pointer'
      }`}
      aria-disabled={isDisabled}
    >
      <img src={tutor.avatarUrl} alt={tutor.name} className="w-16 h-16 rounded-full border-2 border-slate-200 dark:border-white/20" />
      <div>
        <h3 className="font-bold text-lg">{tutor.name} <span className="text-sm font-normal text-slate-500 dark:text-gray-300">({tutor.role})</span></h3>
        <p className="text-sm text-slate-600 dark:text-gray-400">{tutor.description}</p>
      </div>
    </div>
  );
};

export default TutorCard;
