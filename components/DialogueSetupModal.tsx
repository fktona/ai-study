import React, { useState } from 'react';
import { Tutor } from '../types';
import { X, MessageSquare } from 'lucide-react';

interface DialogueSetupModalProps {
  tutors: Tutor[];
  isOpen: boolean;
  onClose: () => void;
  onStartDialogue: (selectedTutors: Tutor[]) => void;
}

const DialogueSetupModal: React.FC<DialogueSetupModalProps> = ({ tutors, isOpen, onClose, onStartDialogue }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelectTutor = (tutorId: string) => {
    setSelectedIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(tutorId)) {
        newSelection.delete(tutorId);
      } else {
        if (newSelection.size < 2) {
          newSelection.add(tutorId);
        }
      }
      return newSelection;
    });
  };

  const handleStart = () => {
    if (selectedIds.size === 2) {
      const selectedTutors = tutors.filter(t => selectedIds.has(t.id));
      onStartDialogue(selectedTutors);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col animate-fade-in">
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-500">Setup Tutor Dialogue</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10">
            <X size={20} />
          </button>
        </header>
        <div className="p-6 flex flex-col gap-4">
          <p className="text-slate-600 dark:text-gray-300">Select exactly two tutors to start a conversation with each other.</p>
          <div className="space-y-3">
            {tutors.map(tutor => {
              const isSelected = selectedIds.has(tutor.id);
              const isDisabled = !isSelected && selectedIds.size === 2;
              return (
                <div
                  key={tutor.id}
                  onClick={() => !isDisabled && handleSelectTutor(tutor.id)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${
                    isSelected ? 'bg-blue-500/20 dark:bg-blue-500/30 border-blue-500' : 
                    isDisabled ? 'bg-slate-200 dark:bg-gray-800/50 border-slate-300 dark:border-gray-700 opacity-50 cursor-not-allowed' : 
                    'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-blue-500 cursor-pointer'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isDisabled}
                    readOnly
                    className="h-5 w-5 rounded text-blue-600 bg-slate-200 dark:bg-gray-700 border-slate-300 dark:border-gray-600 focus:ring-blue-500 pointer-events-none"
                  />
                  <img src={tutor.avatarUrl} alt={tutor.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <h3 className="font-semibold">{tutor.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400">{tutor.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={handleStart}
            disabled={selectedIds.size !== 2}
            className="mt-2 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageSquare size={18} /> Start Dialogue
          </button>
        </div>
      </div>
    </div>
  );
};

export default DialogueSetupModal;
