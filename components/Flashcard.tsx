import React, { useState } from 'react';

interface FlashcardProps {
  front: string;
  back: string;
}

const Flashcard: React.FC<FlashcardProps> = ({ front, back }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="perspective-1000 w-full h-48 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-500 ease-in-out ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden bg-sky-100 dark:bg-sky-900/50 border border-sky-300 dark:border-sky-500 rounded-lg flex items-center justify-center p-4 text-center">
          <p className="font-semibold text-sky-800 dark:text-sky-200 group-hover:scale-105 transition-transform">{front}</p>
        </div>
        {/* Back */}
        <div className="absolute w-full h-full backface-hidden bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-500 rounded-lg flex items-center justify-center p-4 text-center transform rotate-y-180">
           <p className="text-sm text-slate-800 dark:text-slate-200">{back}</p>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
