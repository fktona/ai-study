import React from 'react';
import { Tutor } from '../types';

interface TutorAvatarProps {
  tutor: Tutor;
  isSpeaking: boolean;
  isActive: boolean;
}

const TutorAvatar: React.FC<TutorAvatarProps> = ({ tutor, isSpeaking, isActive }) => {
  return (
    <div className="flex flex-col items-center gap-2 transition-all duration-300 transform" style={{ opacity: isActive ? 1 : 0.6, scale: isActive ? '1' : '0.9' }}>
      <div className={`relative rounded-full p-1 ${isSpeaking ? 'bg-blue-500 animate-pulse' : ''}`}>
        <img
          src={tutor.avatarUrl}
          alt={tutor.name}
          className={`w-28 h-28 rounded-full border-4 object-cover transition-all duration-300 ${isActive ? 'border-sky-400' : 'border-slate-300 dark:border-gray-600'}`}
        />
         {isSpeaking && (
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full border-2 border-slate-100 dark:border-gray-900 flex items-center justify-center">
               <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            </div>
         )}
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-sm">{tutor.name}</h3>
        <p className={`text-xs ${tutor.voiceColor}`}>{tutor.role}</p>
      </div>
    </div>
  );
};

export default TutorAvatar;