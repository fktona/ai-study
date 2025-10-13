import React from 'react';
import { BookOpen } from 'lucide-react';

interface StudyMaterialViewerProps {
  studyMaterial: { name: string; content: string };
}

const StudyMaterialViewer: React.FC<StudyMaterialViewerProps> = ({ studyMaterial }) => {
  return (
    <div className="flex flex-col bg-slate-100 dark:bg-black/20 rounded-lg overflow-hidden h-full">
      <h2 className="text-lg font-semibold text-slate-600 dark:text-gray-300 p-4 pb-2 border-b border-slate-200 dark:border-white/10 flex items-center gap-2">
        <BookOpen size={20} />
        Study Material: {studyMaterial.name}
      </h2>
      <div className="flex-1 overflow-y-auto p-4">
        <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-gray-300 font-sans">
          {studyMaterial.content}
        </pre>
      </div>
    </div>
  );
};

export default StudyMaterialViewer;
