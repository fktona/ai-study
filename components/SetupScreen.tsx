import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Tutor, VoiceName, UserSubscription } from '../types';
import { AVAILABLE_TUTORS, AVAILABLE_VOICES, VOICE_SAMPLES } from '../constants';
import { GoogleGenAI } from '@google/genai';
import { UploadCloud, Users, Book, ArrowRight, Volume2, Loader2, Play, Pause, Lock } from 'lucide-react';
import TutorCard from './TutorCard';

interface SetupScreenProps {
  onStartSession: (tutors: Tutor[], material: { name: string; content: string }, voice: VoiceName) => void;
  userSubscription: UserSubscription;
}

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                resolve((reader.result as string).split(',')[1]);
            } else {
                reject(new Error("Failed to read file."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartSession, userSubscription }) => {
  const [selectedTutorIds, setSelectedTutorIds] = useState<Set<string>>(new Set());
  const [studyFile, setStudyFile] = useState<File | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Zephyr');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingState, setProcessingState] = useState({ step: '', progress: 0 });
  const [extractedContent, setExtractedContent] = useState('');


  const [audioPreview, setAudioPreview] = useState<HTMLAudioElement | null>(null);
  const [playingVoice, setPlayingVoice] = useState<VoiceName | null>(null);

  const maxTutors = userSubscription === 'premium' ? 6 : 3;
  const minTutors = 3;

  useEffect(() => {
    const audio = new Audio();
    const handleAudioEnd = () => setPlayingVoice(null);
    audio.addEventListener('ended', handleAudioEnd);
    audio.addEventListener('pause', handleAudioEnd);
    setAudioPreview(audio);
    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleAudioEnd);
      audio.removeEventListener('pause', handleAudioEnd);
    };
  }, []);

  const handlePlayPreview = useCallback((voice: VoiceName) => {
    if (!audioPreview) return;
    if (playingVoice === voice) {
      audioPreview.pause();
      setPlayingVoice(null);
    } else {
      audioPreview.src = VOICE_SAMPLES[voice];
      audioPreview.play().catch(e => console.error("Audio preview failed:", e));
      setPlayingVoice(voice);
    }
  }, [audioPreview, playingVoice]);

  const toggleTutorSelection = useCallback((tutorId: string) => {
    setSelectedTutorIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(tutorId)) {
        newSelection.delete(tutorId);
      } else {
        if (newSelection.size < maxTutors) {
          newSelection.add(tutorId);
        }
      }
      return newSelection;
    });
  }, [maxTutors]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      const allowedExtensions = ['.txt', '.md', '.pdf'];
      if (allowedExtensions.some(ext => fileName.endsWith(ext))) {
          setStudyFile(file);
          setError('');
      } else {
          setStudyFile(null);
          setError('Please upload a TXT, MD, or PDF file.');
      }
    }
  };

  const selectedTutors = useMemo(() => {
    return AVAILABLE_TUTORS.filter(t => selectedTutorIds.has(t.id));
  }, [selectedTutorIds]);

  const handleStart = async () => {
    if (selectedTutors.length < minTutors) {
      setError(`Please select at least ${minTutors} AI tutors.`);
      return;
    }
    if (!studyFile) {
      setError('Please upload your study material.');
      return;
    }
    
    setIsProcessing(true);
    setExtractedContent('');
    setError('');

    try {
        const file = studyFile!;
        const fileName = file.name.toLowerCase();
        let materialContent = '';

        setProcessingState({ step: 'Reading file...', progress: 20 });
        
        if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
            materialContent = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const textContent = (e.target?.result as string) || '';
                    const cleanedContent = textContent.replace(/\r\n/g, '\n').replace(/ +/g, ' ');
                    resolve(cleanedContent);
                };
                reader.onerror = (error) => reject(error);
                reader.readAsText(file);
            });
            setExtractedContent(materialContent.substring(0, 500) + (materialContent.length > 500 ? '...' : ''));
        } else {
            setProcessingState({ step: 'Extracting text from document...', progress: 50 });
            if (!process.env.API_KEY) {
                throw new Error("API_KEY environment variable not set.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const filePart = await fileToGenerativePart(file);
            const responseStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: { parts: [
                    filePart,
                    { text: 'Extract all text content from this document. Provide only the extracted text, formatted for readability with appropriate line breaks, without adding any commentary, summary, or introductory phrases like "Here is the text...".' }
                ]},
            });
            
            let accumulatedText = '';
            for await (const chunk of responseStream) {
              const chunkText = chunk.text;
              accumulatedText += chunkText;
              setExtractedContent(prev => prev + chunkText);
            }
            materialContent = accumulatedText;
        }

        setProcessingState({ step: 'Preparing AI tutors...', progress: 90 });

        setTimeout(() => {
            setProcessingState({ step: 'Starting session...', progress: 100 });
            onStartSession(selectedTutors, { name: file.name, content: materialContent }, selectedVoice);
        }, 500);

    } catch (err) {
        console.error("Failed to process file:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred during file processing.");
        setIsProcessing(false);
    }
  };

  const isProcessingComplexFile = isProcessing && studyFile && (studyFile.type === 'application/pdf');

  return (
    <div className="w-full max-w-5xl bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-200 dark:border-white/10 flex flex-col gap-8 transition-all duration-500">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">Create Your AI Study Group</h1>
        <p className="text-slate-500 dark:text-sky-200 mt-2">Assemble your team and upload your material to begin.</p>
      </header>

      <div className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold"><Users className="text-blue-500"/>Choose Your Tutors ({minTutors}-{maxTutors})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AVAILABLE_TUTORS.map(tutor => (
            <TutorCard 
              key={tutor.id} 
              tutor={tutor} 
              isSelected={selectedTutorIds.has(tutor.id)} 
              onSelect={() => toggleTutorSelection(tutor.id)}
              isDisabled={(selectedTutorIds.size >= maxTutors && !selectedTutorIds.has(tutor.id)) || isProcessing}
            />
          ))}
           {userSubscription === 'free' && (
             <div className="p-4 rounded-lg border-2 border-dashed border-amber-400/50 bg-amber-400/10 flex flex-col items-center justify-center text-center gap-2">
                 <Lock className="text-amber-500"/>
                <h3 className="font-bold">Unlock Custom Tutors</h3>
                <p className="text-sm text-amber-700 dark:text-amber-200">Upgrade to Premium to create your own specialized AI tutors.</p>
                <button className="text-sm font-semibold text-amber-800 dark:text-amber-100 underline">Learn More</button>
             </div>
           )}
        </div>
      </div>
      
       <div className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold"><Volume2 className="text-blue-500"/>Choose Session Voice</h2>
        <p className="text-sm text-slate-500 dark:text-gray-400 -mt-2">Select the voice for all AI tutors. Click to preview.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {AVAILABLE_VOICES.map(voice => (
              <div key={voice} className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/20 rounded-lg p-3">
                 <input
                    type="radio"
                    id={`voice-${voice}`}
                    name="session-voice"
                    value={voice}
                    checked={selectedVoice === voice}
                    onChange={() => setSelectedVoice(voice)}
                    disabled={isProcessing}
                    className="form-radio h-4 w-4 text-blue-600 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`voice-${voice}`} className="flex-1 text-sm font-medium">{voice}</label>
                  <button 
                    onClick={() => handlePlayPreview(voice)} 
                    disabled={isProcessing}
                    className="p-1 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 disabled:opacity-50"
                    aria-label={`Preview voice ${voice}`}
                  >
                    {playingVoice === voice ? <Pause size={16} className="text-blue-500"/> : <Play size={16} />}
                  </button>
              </div>
            ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold"><Book className="text-sky-500"/>Upload Study Material</h2>
        <div className={`cursor-pointer bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-lg p-8 flex flex-col items-center justify-center text-center transition ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-white/10'}`}>
          <input id="file-upload" type="file" className="hidden" accept=".txt,.md,.pdf" onChange={handleFileChange} disabled={isProcessing} />
          <label htmlFor="file-upload" className="w-full cursor-pointer">
            {isProcessingComplexFile ? (
               <div className="w-full text-left">
                  <h3 className="font-semibold text-slate-700 dark:text-gray-200 text-center mb-2">Extracting Text in Real-time...</h3>
                  <pre className="w-full h-24 overflow-y-auto bg-slate-200 dark:bg-gray-800 p-2 rounded text-xs whitespace-pre-wrap text-slate-600 dark:text-gray-300">
                    {extractedContent}
                    <span className="animate-pulse">▋</span>
                  </pre>
                </div>
            ) : (
                <>
                  <UploadCloud className="w-12 h-12 text-gray-400 mb-2 mx-auto" />
                  {studyFile ? (
                    <p className="font-semibold text-emerald-500 dark:text-emerald-400">{studyFile.name}</p>
                  ) : (
                    <>
                      <p className="font-semibold">Click to upload a TXT, MD, or PDF file</p>
                      <p className="text-sm text-slate-500 dark:text-gray-400">Your materials fuel the AI discussion.</p>
                    </>
                  )}
                </>
            )}
          </label>
        </div>
      </div>

      {error && <p className="text-red-500 dark:text-red-400 text-center animate-pulse">{error}</p>}
      
      <div className="text-center min-h-[56px] flex items-center justify-center">
        <button 
          onClick={handleStart} 
          disabled={selectedTutors.length < minTutors || !studyFile || isProcessing}
          className="bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center mx-auto gap-2 w-full max-w-xs"
        >
          {isProcessing ? (
             <div className="w-full flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="animate-spin" size={18} />
                    <span>{processingState.step}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-gray-700/50 rounded-full h-1.5">
                    <div className="bg-white h-1.5 rounded-full" style={{ width: `${processingState.progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                </div>
            </div>
          ) : (
            <>
              Start Study Session <ArrowRight />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;