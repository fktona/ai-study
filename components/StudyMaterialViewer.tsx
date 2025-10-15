import React from "react";
import { BookOpen, Loader2 } from "lucide-react";

interface StudyMaterialViewerProps {
  studyMaterial: { name: string; content: string };
  isAIThinking?: boolean;
  thinkingTutor?: string | null;
}

const StudyMaterialViewer: React.FC<StudyMaterialViewerProps> = ({
  studyMaterial,
  isAIThinking = false,
  thinkingTutor = null,
}) => {
  return (
    <div className="flex flex-col bg-slate-100 dark:bg-black/20 rounded-lg overflow-hidden h-full">
      <h2 className="text-lg font-semibold text-slate-600 dark:text-gray-300 p-4 pb-2 border-b border-slate-200 dark:border-white/10 flex items-center gap-2">
        <BookOpen size={20} />
        Study Material: {studyMaterial.name}
      </h2>
      <div className="flex-1 overflow-y-auto p-4 relative">
        <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-gray-300 font-sans">
          {studyMaterial.content}
        </pre>
        {isAIThinking && thinkingTutor && (
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin text-blue-500" size={16} />
              <span className="text-sm text-slate-600 dark:text-gray-300 font-medium">
                {thinkingTutor} is preparing response...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyMaterialViewer;
