import React, { useState, useCallback, useEffect } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import {
  FileText,
  Download,
  RotateCcw,
  Loader2,
  Award,
  Star,
  LayoutDashboard,
  Play,
  Pause,
  Music,
  Layers3,
} from "lucide-react";
import Flashcard from "./Flashcard";
import { useContracts } from "../context/ContractContext";
import WalletConnection from "./WalletConnection";
import { useAccount } from "wagmi";

interface SessionSummaryProps {
  transcript: string;
  audioUrl?: string;
  onStartNewSession: () => void;
  onClaimRewards: (amount: number) => void;
  onMintNFT: () => void;
  onNavigateToDashboard: () => void;
  onSummaryGenerated: (summary: string) => void;
}

const SessionSummary: React.FC<SessionSummaryProps> = ({
  transcript,
  audioUrl,
  onStartNewSession,
  onClaimRewards,
  onMintNFT,
  onNavigateToDashboard,
  onSummaryGenerated,
}) => {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rewardsClaimed, setRewardsClaimed] = useState(false);
  const [nftMinted, setNftMinted] = useState(false);
  const {
    claimStudyReward,
    mintSessionAchievement,
    isClaimingReward,
    isMintingAchievement,
  } = useContracts();

  const [isReading, setIsReading] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  const [flashcards, setFlashcards] = useState<
    { front: string; back: string }[]
  >([]);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [flashcardError, setFlashcardError] = useState("");
  const { isConnected } = useAccount();

  const REWARD_AMOUNT = 100;

  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleClaim = async () => {
    try {
      // Calculate study time from transcript length (rough estimate)
      const studyTimeSeconds = Math.max(300, transcript.length / 10); // Minimum 5 minutes
      await claimStudyReward(studyTimeSeconds, false); // Assuming free tier for now
      onClaimRewards(REWARD_AMOUNT);
      setRewardsClaimed(true);
    } catch (error) {
      console.error("Error claiming rewards:", error);
    }
  };

  const handleMint = async () => {
    try {
      const sessionTitle = `Study Session - ${new Date().toLocaleDateString()}`;
      const sessionDescription = `Completed a study session with ${transcript.length} characters of content.`;
      await mintSessionAchievement(sessionTitle, sessionDescription);
      onMintNFT();
      setNftMinted(true);
    } catch (error) {
      console.error("Error minting NFT:", error);
    }
  };

  const generateSummary = useCallback(async () => {
    if (!transcript) {
      setError("Transcript is empty, cannot generate summary.");
      return;
    }
    setIsLoading(true);
    setError("");
    setSummary("");

    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Please provide a detailed summary of the following study session transcript. Highlight key concepts, questions asked, and main conclusions. Format it neatly using markdown.\n\nTranscript:\n${transcript}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      setSummary(response.text);
      onSummaryGenerated(response.text);
    } catch (err) {
      console.error("Error generating summary:", err);
      setError("Failed to generate summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [transcript, onSummaryGenerated]);

  const generateFlashcards = useCallback(async () => {
    if (!transcript) {
      setFlashcardError("Transcript is empty, cannot generate flashcards.");
      return;
    }
    setIsGeneratingFlashcards(true);
    setFlashcardError("");
    setFlashcards([]);

    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Based on the following study session transcript, create a concise set of 5-10 key flashcards for review. Each flashcard must have a 'front' (a question, term, or concept) and a 'back' (the answer or definition).\n\nTranscript:\n${transcript}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: {
                  type: Type.STRING,
                  description:
                    "The question or term for the front of the flashcard.",
                },
                back: {
                  type: Type.STRING,
                  description:
                    "The answer or definition for the back of the flashcard.",
                },
              },
              required: ["front", "back"],
            },
          },
        },
      });

      const parsedFlashcards = JSON.parse(response.text);
      setFlashcards(parsedFlashcards);
    } catch (err) {
      console.error("Error generating flashcards:", err);
      setFlashcardError("Failed to generate flashcards. Please try again.");
    } finally {
      setIsGeneratingFlashcards(false);
    }
  }, [transcript]);

  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
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
      if (!transcript) return;
      utteranceRef.current = new SpeechSynthesisUtterance(transcript);
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
      const newUtterance = new SpeechSynthesisUtterance(transcript);
      newUtterance.rate = rate;
      newUtterance.onend = () => setIsReading(false);
      utteranceRef.current = newUtterance;
      window.speechSynthesis.speak(newUtterance);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-200 dark:border-white/10 flex flex-col gap-6">
      <WalletConnection />

      <header className="text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-sky-500">
          Session Review
        </h1>
        <p className="text-slate-500 dark:text-sky-200 mt-2">
          Review your session, claim rewards, and mint your achievements.
        </p>
      </header>

      {audioUrl && (
        <div className="bg-slate-100 dark:bg-black/30 rounded-lg p-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Music /> Session Recording
          </h2>
          <audio controls src={audioUrl} className="w-full">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 h-auto md:h-[40vh]">
        <div className="md:w-1/2 flex flex-col bg-slate-100 dark:bg-black/30 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText /> Full Transcript
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleReadAloud}
                className="p-2 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20"
              >
                {isReading ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <div className="flex items-center bg-slate-200 dark:bg-white/10 rounded-full p-0.5">
                {[1, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      speechRate === rate ? "bg-blue-500 text-white" : ""
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
          <textarea
            readOnly
            value={transcript}
            className="flex-1 bg-transparent border border-slate-200 dark:border-white/10 rounded p-2 text-sm text-slate-600 dark:text-gray-300 w-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => downloadFile("transcript.txt", transcript)}
            className="mt-2 w-full flex items-center justify-center gap-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 py-2 rounded transition-colors"
          >
            <Download size={16} /> Download Transcript
          </button>
        </div>
        <div className="md:w-1/2 flex flex-col bg-slate-100 dark:bg-black/30 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">AI Generated Summary</h2>
          <div className="flex-1 bg-transparent border border-slate-200 dark:border-white/10 rounded p-2 text-sm text-slate-600 dark:text-gray-300 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin w-8 h-8 text-blue-400" />
              </div>
            )}
            {error && <p className="text-red-500">{error}</p>}
            {summary && (
              <div
                className="prose prose-sm dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: summary.replace(/\n/g, "<br/>"),
                }}
              />
            )}
            {!isLoading && !summary && !error && (
              <p className="text-slate-400 dark:text-gray-400">
                Click "Generate Summary" to begin.
              </p>
            )}
          </div>
          {summary && (
            <button
              onClick={() => downloadFile("summary.txt", summary)}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 py-2 rounded transition-colors"
            >
              <Download size={16} /> Download Summary
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-100 dark:bg-black/30 rounded-lg p-4 text-center border border-blue-500/20 dark:border-blue-500/50">
        <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-300">
          Session Complete!
        </h2>
        <p className="text-slate-600 dark:text-gray-300 mb-4">
          Claim your rewards for this study session on the Base network.
        </p>
        <div className="flex justify-center flex-wrap gap-4">
          <button
            onClick={handleClaim}
            disabled={rewardsClaimed || isClaimingReward || !isConnected}
            className="bg-amber-500 text-white font-bold py-2 px-5 rounded-full shadow-md hover:bg-amber-600 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isClaimingReward ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Award size={18} />
            )}
            {rewardsClaimed
              ? "Rewards Claimed!"
              : isClaimingReward
              ? "Claiming..."
              : `Claim ${REWARD_AMOUNT} $STUDY`}
          </button>
          <button
            onClick={handleMint}
            disabled={nftMinted || isMintingAchievement || !isConnected}
            className="bg-sky-500 text-white font-bold py-2 px-5 rounded-full shadow-md hover:bg-sky-600 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isMintingAchievement ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Star size={18} />
            )}
            {nftMinted
              ? "Achievement NFT Minted!"
              : isMintingAchievement
              ? "Minting..."
              : "Mint Session NFT"}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
        <button
          onClick={generateSummary}
          disabled={isLoading || isGeneratingFlashcards}
          className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" /> Generating...
            </>
          ) : (
            "Generate AI Summary"
          )}
        </button>
        <button
          onClick={generateFlashcards}
          disabled={isLoading || isGeneratingFlashcards}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-2"
        >
          {isGeneratingFlashcards ? (
            <>
              <Loader2 className="animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Layers3 /> Generate Flashcards
            </>
          )}
        </button>
        <button
          onClick={onNavigateToDashboard}
          className="bg-gradient-to-r from-blue-500 to-sky-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300 flex items-center gap-2"
        >
          <LayoutDashboard /> View Dashboard
        </button>
        <button
          onClick={onStartNewSession}
          className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300 flex items-center gap-2"
        >
          <RotateCcw /> Start New Session
        </button>
      </div>

      {flashcardError && (
        <p className="text-red-500 dark:text-red-400 text-center animate-pulse">
          {flashcardError}
        </p>
      )}
      {flashcards.length > 0 && (
        <div className="pt-6 border-t border-slate-200 dark:border-white/10">
          <h2 className="text-2xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">
            Review Flashcards
          </h2>
          <p className="text-center text-sm text-slate-500 dark:text-gray-400 -mt-2 mb-6">
            Click a card to flip it.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcards.map((card, index) => (
              <Flashcard key={index} front={card.front} back={card.back} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionSummary;
