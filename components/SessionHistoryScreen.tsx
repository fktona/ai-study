import React, { useState } from 'react';
import { PastSession } from '../types';
import { History, ArrowLeft, Clock, BookOpen } from 'lucide-react';
import SessionDetailModal from './SessionDetailModal';

interface SessionHistoryScreenProps {
  sessions: PastSession[];
  onUpdateSessionSummary: (sessionId: string, summary: string) => void;
  onNavigateBack: () => void;
}

const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    let parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 && hours === 0) parts.push(`${seconds}s`);
    
    return parts.join(' ') || '0s';
};

const SessionHistoryScreen: React.FC<SessionHistoryScreenProps> = ({ sessions, onUpdateSessionSummary, onNavigateBack }) => {
  const [selectedSession, setSelectedSession] = useState<PastSession | null>(null);

  return (
    <>
      <div className="w-full max-w-5xl bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-200 dark:border-white/10 flex flex-col gap-6 animate-fade-in">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-left">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600 flex items-center gap-3">
                    <History /> Session History
                </h1>
                <p className="text-slate-500 dark:text-sky-200 mt-1">Review your past study sessions and summaries.</p>
            </div>
            <button
                onClick={onNavigateBack}
                className="flex items-center gap-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 font-semibold py-2 px-4 rounded-lg transition-colors flex-shrink-0"
            >
                <ArrowLeft size={18} /> Back to Dashboard
            </button>
        </header>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {sessions.length > 0 ? (
            sessions.map(session => (
              <div key={session.id} className="bg-slate-100 dark:bg-white/5 p-4 rounded-lg border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="font-bold text-lg text-sky-600 dark:text-sky-300">{session.topic}</h3>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-gray-400 mt-1">
                      <span>{session.date}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14}/> {formatTime(session.durationInSeconds)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSession(session)}
                  className="flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto"
                >
                  <BookOpen size={16}/> View Details
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-slate-100 dark:bg-black/20 rounded-lg">
              <p className="text-slate-500 dark:text-gray-400">You haven't completed any study sessions yet.</p>
              <p className="text-slate-400 dark:text-gray-500 text-sm mt-1">Start a new session to build your history!</p>
            </div>
          )}
        </div>
      </div>

      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onUpdateSummary={onUpdateSessionSummary}
        />
      )}
    </>
  );
};

export default SessionHistoryScreen;
