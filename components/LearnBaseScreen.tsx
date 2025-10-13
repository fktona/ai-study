import React, { useState, useMemo, useCallback } from 'react';
import { BaseLearningModule, Tutor, VoiceName } from '../types';
import { BASE_LEARNING_MODULES, AVAILABLE_TUTORS } from '../constants';
import TutorCard from './TutorCard';
import { GraduationCap, CheckCircle, Award, ArrowRight } from 'lucide-react';

interface LearnBaseScreenProps {
  completedModules: Set<string>;
  isRewardClaimed: boolean;
  onClaimReward: () => void;
  onStartSession: (tutors: Tutor[], material: { name: string; content: string }, voice: VoiceName, moduleId: string) => void;
}

const LearnBaseScreen: React.FC<LearnBaseScreenProps> = ({ completedModules, isRewardClaimed, onClaimReward, onStartSession }) => {
  const [selectedModule, setSelectedModule] = useState<BaseLearningModule | null>(null);
  const [selectedTutorIds, setSelectedTutorIds] = useState<Set<string>>(new Set());

  const progress = useMemo(() => completedModules.size, [completedModules]);
  const requiredCompletions = 5;
  const canClaimReward = progress >= requiredCompletions;

  const toggleTutorSelection = useCallback((tutorId: string) => {
    setSelectedTutorIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(tutorId)) {
        newSelection.delete(tutorId);
      } else {
        if (newSelection.size < 4) {
          newSelection.add(tutorId);
        }
      }
      return newSelection;
    });
  }, []);

  const handleStartSession = () => {
    if (!selectedModule || selectedTutorIds.size < 3) return;
    const selectedTutors = AVAILABLE_TUTORS.filter(t => selectedTutorIds.has(t.id));
    onStartSession(selectedTutors, { name: selectedModule.title, content: selectedModule.content }, 'Zephyr', selectedModule.id);
  };
  
  const handleSelectModule = (module: BaseLearningModule) => {
      setSelectedModule(module);
      setSelectedTutorIds(new Set());
  }

  return (
    <div className="w-full max-w-7xl bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-200 dark:border-white/10 flex flex-col gap-6 animate-fade-in">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 flex items-center justify-center gap-3">
          <GraduationCap /> Learn Base
        </h1>
        <p className="text-slate-500 dark:text-sky-200 mt-2">Master the fundamentals of Base with interactive AI-powered study sessions.</p>
      </header>

      <div className="bg-slate-100 dark:bg-black/30 rounded-lg p-4 text-center border border-blue-500/20 dark:border-blue-500/50">
        <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-300">Learning Progress</h2>
        <p className="text-slate-600 dark:text-gray-300 mb-3">Complete {requiredCompletions} modules to earn a special reward!</p>
        <div className="w-full bg-slate-200 dark:bg-gray-700/50 rounded-full h-4 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-sky-500 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white transition-all duration-500" 
              style={{ width: `${Math.min((progress / requiredCompletions) * 100, 100)}%` }}
            >
              {progress} / {requiredCompletions}
            </div>
        </div>
        {canClaimReward && (
          <button
            onClick={onClaimReward}
            disabled={isRewardClaimed}
            className="mt-2 bg-amber-500 text-white font-bold py-2 px-5 rounded-full shadow-md hover:bg-amber-600 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            <Award size={18} />
            {isRewardClaimed ? 'Reward Claimed!' : `Claim 500 $STUDY`}
          </button>
        )}
      </div>
      
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
           {BASE_LEARNING_MODULES.map(module => {
               const isCompleted = completedModules.has(module.id);
               return (
                   <div 
                     key={module.id} 
                     onClick={() => handleSelectModule(module)}
                     className={`p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${selectedModule?.id === module.id ? 'bg-blue-500/20 dark:bg-blue-500/30 border-blue-500' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-blue-400'}`}
                   >
                       <div className="flex justify-between items-start">
                           <h3 className="font-bold text-lg flex-1 pr-2">{module.title}</h3>
                           {isCompleted && <CheckCircle className="text-emerald-500 flex-shrink-0 mt-1" />}
                       </div>
                       <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">{module.description}</p>
                   </div>
               )
           })}
        </div>

        <div className="lg:col-span-7 bg-slate-100 dark:bg-black/30 rounded-lg p-6 flex flex-col">
            {selectedModule ? (
                <>
                    <h2 className="text-xl font-semibold mb-1">Configure Session: <span className="text-blue-500">{selectedModule.title}</span></h2>
                    <p className="text-slate-500 dark:text-gray-400 mb-4">Choose 3-4 AI tutors to start your interactive learning session.</p>
                    <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                         {AVAILABLE_TUTORS.map(tutor => (
                            <TutorCard 
                              key={tutor.id} 
                              tutor={tutor} 
                              isSelected={selectedTutorIds.has(tutor.id)} 
                              onSelect={() => toggleTutorSelection(tutor.id)}
                              isDisabled={selectedTutorIds.size >= 4 && !selectedTutorIds.has(tutor.id)}
                            />
                        ))}
                    </div>
                    <button
                        onClick={handleStartSession}
                        disabled={selectedTutorIds.size < 3}
                        className="mt-4 w-full bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
                    >
                        Begin Interactive Session <ArrowRight />
                    </button>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <GraduationCap className="w-16 h-16 text-slate-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-gray-300">Select a Module</h3>
                    <p className="text-slate-500 dark:text-gray-400 mt-1">Choose a topic from the left to get started.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LearnBaseScreen;