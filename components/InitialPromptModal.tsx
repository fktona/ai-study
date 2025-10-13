import React, { useState } from 'react';
import { X, Mic } from 'lucide-react';

interface InitialPromptModalProps {
  onStart: (initialPrompt: string) => void;
  onClose: () => void;
  studyMaterialName: string;
}

const InitialPromptModal: React.FC<InitialPromptModalProps> = ({ onStart, onClose, studyMaterialName }) => {
  const [initialPrompt, setInitialPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialPrompt.trim()) {
      onStart(initialPrompt.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col animate-fade-in">
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">Set Your Focus</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10">
            <X size={20} />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <p className="text-slate-600 dark:text-gray-300">
            Your AI study group is ready. What is your primary focus for this session on{' '}
            <strong className="text-blue-600 dark:text-blue-300">{studyMaterialName}</strong>?
          </p>
          <div>
            <label htmlFor="initial-prompt" className="block text-sm font-medium text-slate-600 dark:text-gray-300 mb-1">
              State a topic or learning goal:
            </label>
            <textarea
              id="initial-prompt"
              rows={4}
              value={initialPrompt}
              onChange={(e) => setInitialPrompt(e.target.value)}
              placeholder="e.g., 'The main differences between ACE inhibitors and ARBs,' or 'I need to master the cardiac cycle for my exam.'"
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/20 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={!initialPrompt.trim()}
            className="mt-2 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mic size={18} /> Begin Session
          </button>
        </form>
      </div>
    </div>
  );
};

export default InitialPromptModal;
