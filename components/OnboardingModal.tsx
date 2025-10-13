import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, PlusCircle, History, Store, Users } from 'lucide-react';

interface OnboardingModalProps {
  onClose: () => void;
}

const steps = [
  {
    title: 'Welcome to Nexus!',
    description: "Your new Web3-powered AI study hub. Let's take a quick tour of the key features to get you started.",
    content: <span className="text-5xl">👋</span>,
  },
  {
    title: 'Start a New Session',
    description: 'Click here in the header to assemble your AI tutor team, upload study materials, and begin an interactive voice session.',
    content: (
        <div className="bg-slate-200 dark:bg-slate-800 p-3 rounded-lg w-full max-w-xs mx-auto animate-pulse-ring-once ring-2 ring-blue-500">
            <div className="bg-white dark:bg-slate-900 rounded-md p-2 flex justify-between items-center shadow-md">
                <span className="font-bold text-blue-500 text-sm">Nexus</span>
                <div className="flex items-center gap-1">
                    <div className="h-5 w-10 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                    <div className="p-1 rounded-lg bg-blue-500/20 flex items-center gap-1 text-blue-600 dark:text-blue-300">
                       <PlusCircle size={16} />
                       <span className="font-medium text-xs">New Session</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                </div>
            </div>
        </div>
    )
  },
  {
    title: 'Review Your History',
    description: 'All your completed sessions, transcripts, and AI-generated summaries are saved here. Never lose your notes again!',
    content: (
        <div className="bg-slate-200 dark:bg-slate-800 p-3 rounded-lg w-full max-w-xs mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-md p-2 flex items-center shadow-md gap-1">
                <div className="p-1 rounded-lg flex items-center gap-1 text-slate-500 dark:text-gray-300">
                    <History size={16} className="text-blue-500/50" />
                    <span className="font-medium text-xs">Dashboard</span>
                </div>
                <div className="p-1 rounded-lg bg-blue-500/20 flex items-center gap-1 text-blue-600 dark:text-blue-300 ring-2 ring-blue-500">
                    <History size={16} />
                    <span className="font-medium text-xs">History</span>
                </div>
            </div>
        </div>
    )
  },
    {
    title: 'Explore the Marketplace',
    description: 'Use the $STUDY tokens you earn to buy and sell notes, mnemonics, and other study aids from the community.',
    content: (
        <div className="bg-slate-200 dark:bg-slate-800 p-3 rounded-lg w-full max-w-xs mx-auto">
             <div className="bg-white dark:bg-slate-900 rounded-md p-2 flex items-center shadow-md gap-1">
                <div className="p-1 rounded-lg flex items-center gap-1 text-slate-500 dark:text-gray-300">
                    <Users size={16} className="text-blue-500/50"/>
                    <span className="font-medium text-xs">Community</span>
                </div>
                <div className="p-1 rounded-lg bg-blue-500/20 flex items-center gap-1 text-blue-600 dark:text-blue-300 ring-2 ring-blue-500">
                    <Store size={16} />
                    <span className="font-medium text-xs">Marketplace</span>
                </div>
            </div>
        </div>
    )
  },
  {
    title: "You're All Set!",
    description: 'You have everything you need to start your journey. Happy studying!',
    content: <span className="text-5xl">🚀</span>,
  },
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col animate-fade-in transition-all duration-300">
        <header className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">Quick Tour</h2>
           <div className="flex items-center gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentStep === index ? 'bg-blue-500 w-4' : 'bg-slate-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10">
            <X size={20} />
          </button>
        </header>
        <div className="p-8 text-center flex flex-col items-center gap-4">
            <div className="w-full min-h-[100px] flex items-center justify-center mb-4">
               {step.content}
            </div>
            <h3 className="text-2xl font-bold">{step.title}</h3>
            <p className="text-slate-600 dark:text-gray-300 min-h-[70px]">{step.description}</p>
        </div>
        <footer className="p-4 flex justify-between items-center border-t border-slate-200 dark:border-white/10">
            <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center gap-2 py-2 px-4 rounded-lg font-semibold transition hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ArrowLeft size={16} /> Back
            </button>
            <button
                onClick={handleNext}
                className="flex items-center gap-2 py-2 px-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
            >
                {currentStep === steps.length - 1 ? "Let's Go!" : "Next"} <ArrowRight size={16} />
            </button>
        </footer>
      </div>
    </div>
  );
};

export default OnboardingModal;