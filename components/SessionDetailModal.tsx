import React, { useState, useCallback, useEffect } from 'react';
import { PastSession } from '../types';
import { GoogleGenAI } from '@google/genai';
import { X, FileText, Download, Loader2, Play, Pause, Music } from 'lucide-react';

interface SessionDetailModalProps {
  session: PastSession;
  onClose: () => void;
  onUpdateSummary: (sessionId: string, summary: string) => void;
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({ session, onClose, onUpdateSummary }) => {
  const [summary, setSummary] = useState(session.summary || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // FIX: Added missing state and ref for read-aloud functionality.
  const [isReading, setIsReading] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const generateSummary = useCallback(async () => {
    if (!session.transcript) {
        setError("Transcript is empty, cannot generate summary.");
        return;
    };
    setIsLoading(true);
    setError('');
    setSummary('');

    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Please provide a detailed summary of the following study session transcript. Highlight key concepts, questions asked, and main conclusions. Format it neatly using markdown.\n\nTranscript:\n${session.transcript}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        setSummary(response.text);
        onUpdateSummary(session.id, response.text);
    // FIX: Corrected syntax for the catch block.
    } catch (err) {
      console.error("Error generating summary:", err);
      setError("Failed to generate summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [session.id, session.transcript, onUpdateSummary]);

  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
    const handleToggleReadAloud = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      if (!session.transcript) return;
      utteranceRef.current = new SpeechSynthesisUtterance(session.transcript);
      utteranceRef.current.rate = speechRate;
      utteranceRef.current.onend = () => setIsReading(false);
      window.speechSynthesis.speak(utteranceRef.current);
      setIsReading(true);
    }
  };

  const handleRateChange = (rate: number) => {
    setSpeechRate(rate);
    if (isReading) {
      window.speechSynthesis.cancel();
      const newUtterance = new SpeechSynthesisUtterance(session.transcript);
      newUtterance.rate = rate;
      newUtterance.onend = () => setIsReading(false);
      utteranceRef.current = newUtterance;
      window.speechSynthesis.speak(newUtterance);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col h-[85vh] animate-fade-in">
        <header className="flex-shrink-0 flex items-start justify-between p-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">{session.topic}</h2>
            <p className="text-sm text-slate-500 dark:text-gray-400">{session.date}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10">
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 flex flex-col gap-4 p-6 overflow-hidden">
          {session.audioRecordingUrl && (
            <div className="bg-slate-50 dark:bg-black/30 rounded-lg p-3">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><Music size={18} /> Session Recording</h3>
              <audio controls src={session.audioRecordingUrl} className="w-full">
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
            <div className="md:w-1/2 flex flex-col bg-slate-50 dark:bg-black/30 rounded-lg p-4">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2"><FileText /> Full Transcript</h3>
                  <div className="flex items-center gap-2">
                       <button onClick={handleToggleReadAloud} className="p-2 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20">
                          {isReading ? <Pause size={16} /> : <Play size={16} />}
                       </button>
                       <div className="flex items-center bg-slate-200 dark:bg-white/10 rounded-full p-0.5">
                          {[1, 1.5, 2].map(rate => (
                              <button key={rate} onClick={() => handleRateChange(rate)} className={`px-2 py-0.5 text-xs rounded-full ${speechRate === rate ? 'bg-blue-500 text-white' : ''}`}>
                                  {rate}x
                              </button>
                          ))}
                       </div>
                  </div>
              </div>
              <textarea readOnly value={session.transcript} className="flex-1 bg-transparent border border-slate-200 dark:border-white/10 rounded p-2 text-sm text-slate-600 dark:text-gray-300 w-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={() => downloadFile('transcript.txt', session.transcript)} className="mt-2 w-full flex items-center justify-center gap-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 py-2 rounded transition-colors">
                <Download size={16} /> Download Transcript
              </button>
            </div>
            <div className="md:w-1/2 flex flex-col bg-slate-50 dark:bg-black/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">AI Generated Summary</h3>
              <div className="flex-1 bg-transparent border border-slate-200 dark:border-white/10 rounded p-2 text-sm text-slate-600 dark:text-gray-300 overflow-y-auto">
                {isLoading && <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin w-8 h-8 text-blue-400" /></div>}
                {error && <p className="text-red-500">{error}</p>}
                {summary && !isLoading && <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br/>') }} />}
                {!isLoading && !summary && !error && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-slate-500 dark:text-gray-400">No summary has been generated for this session yet.</p>
                      <button onClick={generateSummary} className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg">
                          Generate Summary
                      </button>
                  </div>
                )}
              </div>
               {summary && !isLoading && (
                <button onClick={() => downloadFile('summary.txt', summary)} className="mt-2 w-full flex items-center justify-center gap-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 py-2 rounded transition-colors">
                  <Download size={16} /> Download Summary
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailModal;