import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Tutor, VoiceName, SessionStatus, TutorRole } from "../types";
import useGeminiLive from "../hooks/useGeminiLive";
import TutorAvatar from "./TutorAvatar";
import Timer from "./Timer";
import InitialPromptModal from "./InitialPromptModal";
import DialogueSetupModal from "./DialogueSetupModal";
import StudyMaterialViewer from "./StudyMaterialViewer";
import {
  Mic,
  MicOff,
  PhoneOff,
  AlertTriangle,
  Loader2,
  MessageSquare,
  X as IconX,
  Radio,
  StopCircle,
  Hand,
  ChevronDown,
} from "lucide-react";

interface StudyRoomProps {
  tutors: Tutor[];
  studyMaterial: { name: string; content: string };
  sessionVoice: VoiceName;
  onEndSession: (
    transcript: string,
    durationInSeconds: number,
    audioUrl?: string
  ) => void;
}

const StudyRoom: React.FC<StudyRoomProps> = ({
  tutors,
  studyMaterial,
  sessionVoice,
  onEndSession,
}) => {
  const [isInitialPromptModalOpen, setIsInitialPromptModalOpen] =
    useState(true);
  const [isDialogueSetupModalOpen, setIsDialogueSetupModalOpen] =
    useState(false);
  const [isDialogueActive, setIsDialogueActive] = useState(false);
  const [dialogueTutors, setDialogueTutors] = useState<Tutor[]>([]);
  const [isCasualMode, setIsCasualMode] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState("User");
  const [seconds, setSeconds] = useState(0);
  const [isContinuing, setIsContinuing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [thinkingTutor, setThinkingTutor] = useState<string | null>(null);
  const [isAIReady, setIsAIReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const sessionLead = useMemo(
    () => tutors.find((t) => t.role === TutorRole.EXPLAINER) || tutors[0],
    [tutors]
  );

  const systemInstruction = useMemo(() => {
    const tutorDescriptions = tutors
      .map(
        (t) => `- ${t.name} (${t.gender}, role: ${t.role}): ${t.description}`
      )
      .join("\n");

    return `You are a panel of expert AI tutors in a highly interactive, real-time voice study session on "${
      studyMaterial.name
    }".
Your panel consists of:\n${tutorDescriptions}
The user is a student. Your primary goal is to simulate a natural, collaborative, and engaging study group conversation.

**CORE DIRECTIVE: This is a DYNAMIC DIALOGUE, not a series of lectures.**

DEEP ANALYSIS OF STUDY MATERIAL:
Your entire knowledge base for this session is strictly confined to the provided study material. Do not introduce external information.
STUDY MATERIAL CONTENT:
---
${studyMaterial.content}
---

**MANDATORY CONVERSATIONAL RULES:**

1.  **IMMEDIATE TURN-TAKING:** This is a fast-paced, turn-by-turn conversation. After one or two tutors speak, you MUST stop talking and wait for the user to speak. The user's input will appear as "User:".

2.  **USER-CENTRIC RESPONSES:** ALWAYS acknowledge and directly respond to the user's most recent statement before adding new information. Show you've understood their point or question. Example: "User: I'm confused about the mechanism of action." -> "Clara: That's a great question. Let's break down the mechanism of action..."

3.  **SPEAKER IDENTIFICATION:** Every single response MUST start with your name and a colon (e.g., "Clara:"). This is non-negotiable.

4.  **FLUID COLLABORATION:** Do not just state facts. Actively engage with each other.
    - Directly reference other tutors: "Ben, that's a sharp point about the side effects. To add to that..."
    - Hand off the conversation: "...What do you think, Aria?"
    - Build on ideas together to create a seamless conversational thread.

5.  **EXTREME BREVITY:** Keep your individual responses **very concise** (typically 1-3 sentences). This is critical for maintaining a rapid, back-and-forth flow. Avoid long monologues.

6.  **ROLE EMBODIMENT:** Naturally embody your assigned role (Explainer, Quiz Master, etc.) through your contributions, without explicitly stating it.

7.  **SESSION LEADERSHIP:** ${
      sessionLead.name
    } acts as the Session Lead, responsible for guiding the conversation and keeping it on track.

8.  **!!! RAISE HAND IS TOP PRIORITY !!!**
    - If you see the system message "System: The user has raised their hand...", you must **ABANDON** your current thought immediately.
    - The very next tutor to speak must pause the discussion and invite the user to speak. Example: "Clara: I see your hand is raised. Please, go ahead with your question or thought."
    - Do not continue the previous topic until the user has spoken and their point has been addressed.

**SESSION FLOW:**

- **Session Start:** The Session Lead (${
      sessionLead.name
    }) will welcome the user, briefly outline a study plan based on the material's key sections, and then pose an open-ended question to the group to kick things off. Then, you MUST wait for the user to respond.
- **Dialogue Mode:** ${
      isDialogueActive
        ? `ACTIVE: A focused conversation between ${dialogueTutors[0].name} and ${dialogueTutors[1].name}. They will still pause for user input after their exchange.`
        : "INACTIVE"
    }
- **Casual Mode:** ${
      isCasualMode
        ? "ACTIVE: Use a more relaxed, friendly, and encouraging tone."
        : "INACTIVE: Maintain a professional, focused, yet engaging tone."
    }`;
  }, [
    tutors,
    studyMaterial,
    isDialogueActive,
    dialogueTutors,
    isCasualMode,
    sessionLead,
  ]);

  const handleMicVolumeChange = useCallback((volume: number) => {
    setMicVolume(volume);
  }, []);

  const {
    status,
    transcript,
    startSession,
    endSession,
    sendTextMessage,
    isMuted,
    toggleMute,
    isRecording,
    toggleRecording,
    getRecordingAsWavBlob,
  } = useGeminiLive(systemInstruction, sessionVoice, handleMicVolumeChange);

  const isSpeaking = micVolume > 0.02 && !isMuted;

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleContinueConversation = useCallback(() => {
    if (status !== SessionStatus.Connected) return;

    // Don't continue if AI is already thinking
    if (isAIThinking) return;

    setIsAIThinking(true);
    setIsAIReady(false); // AI is no longer ready when thinking
    setThinkingTutor(sessionLead.name);
    sendTextMessage(
      `System: The user pressed a key to continue the conversation. ${sessionLead.name}, please continue the discussion or ask a new question.`
    );
    setIsContinuing(true);
    setTimeout(() => setIsContinuing(false), 500);
  }, [status, sendTextMessage, sessionLead, isAIThinking]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle space key on desktop devices
      if (isMobile) return;

      const activeElement = document.activeElement;
      const isTyping =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA");

      if (
        event.code === "Space" &&
        !isTyping &&
        !isInitialPromptModalOpen &&
        !isDialogueSetupModalOpen
      ) {
        event.preventDefault();
        handleContinueConversation();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isInitialPromptModalOpen,
    isDialogueSetupModalOpen,
    handleContinueConversation,
    isMobile,
  ]);

  useEffect(() => {
    if (transcript.length > 0) {
      const lastEntry = transcript[transcript.length - 1];
      setActiveSpeaker(lastEntry.speaker);
      // Reset AI thinking state when a new transcript entry is added
      setIsAIThinking(false);
      setThinkingTutor(null);

      // Set AI as ready after a brief delay to allow for natural conversation flow
      setTimeout(() => {
        setIsAIReady(true);
      }, 2000); // 2 second delay after AI speaks
    }
  }, [transcript]);

  // Smooth scroll to bottom when transcript updates
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTo({
        top: transcriptRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [transcript, isAIThinking, isAIReady]);

  // Handle scroll position to show/hide scroll button
  const handleScroll = useCallback(() => {
    if (transcriptRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = transcriptRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  }, []);

  // Manual scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTo({
        top: transcriptRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  // Timeout mechanism to prevent AI from getting stuck in thinking state
  useEffect(() => {
    if (isAIThinking) {
      const timeout = setTimeout(() => {
        console.warn("AI thinking timeout - resetting state");
        setIsAIThinking(false);
        setThinkingTutor(null);
      }, 30000); // 30 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isAIThinking]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (status === SessionStatus.Connected) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const handleStartConversation = (initialFocus: string) => {
    startSession();
    setIsAIThinking(true);
    setIsAIReady(false);
    setThinkingTutor(sessionLead.name);
    setTimeout(() => {
      sendTextMessage(
        `System: The session has begun. The user's initial focus is: "${initialFocus}". ${sessionLead.name}, please take charge and start the session.`
      );
    }, 1000);
    setIsInitialPromptModalOpen(false);
  };

  const handleEndSession = async () => {
    const fullTranscript = transcript
      .map((entry) => `${entry.speaker}: ${entry.text}`)
      .join("\n");
    let audioUrl: string | undefined = undefined;
    if (isRecording) {
      const blob = await getRecordingAsWavBlob();
      if (blob) {
        audioUrl = URL.createObjectURL(blob);
      }
    }
    onEndSession(fullTranscript, seconds, audioUrl);
    endSession();
  };

  const handleStartDialogue = (selectedTutors: Tutor[]) => {
    setDialogueTutors(selectedTutors);
    setIsDialogueActive(true);
    setIsDialogueSetupModalOpen(false);
    setIsAIThinking(true);
    setIsAIReady(false);
    setThinkingTutor(selectedTutors[0].name);
    sendTextMessage(
      `System: Enter Dialogue Mode between ${selectedTutors[0].name} and ${selectedTutors[1].name}. ${selectedTutors[0].name}, you may begin.`
    );
  };

  const handleEndDialogue = () => {
    setIsDialogueActive(false);
    setDialogueTutors([]);
    sendTextMessage(
      `System: End the dialogue. ${sessionLead.name}, please reconvene the full group discussion.`
    );
  };

  const handleToggleHandRaise = () => {
    const newHandRaisedState = !isHandRaised;
    setIsHandRaised(newHandRaisedState);
    if (newHandRaisedState) {
      setIsAIThinking(true);
      setIsAIReady(false);
      setThinkingTutor(sessionLead.name);
      sendTextMessage(
        "System: The user has raised their hand, indicating they would like to contribute to the conversation. Please acknowledge them and give them the floor."
      );
    } else {
      sendTextMessage("System: The user has lowered their hand.");
    }
  };

  const renderStatusIndicator = () => {
    switch (status) {
      case SessionStatus.Connecting:
        return (
          <div className="flex items-center gap-2 text-amber-500">
            <Loader2 className="animate-spin" /> Connecting...
          </div>
        );
      case SessionStatus.Connected:
        return (
          <div className="flex items-center gap-2 text-emerald-500">
            <Mic /> Live
          </div>
        );
      case SessionStatus.Error:
        return (
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle /> Error
          </div>
        );
      case SessionStatus.Ended:
        return (
          <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400">
            <MicOff /> Session Ended
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400">
            <MicOff /> Idle
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-7xl h-[90vh] bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col p-4 sm:p-6 gap-4">
      {isInitialPromptModalOpen && studyMaterial && (
        <InitialPromptModal
          onStart={handleStartConversation}
          onClose={handleEndSession}
          studyMaterialName={studyMaterial.name}
        />
      )}
      {isDialogueSetupModalOpen && (
        <DialogueSetupModal
          tutors={tutors}
          isOpen={isDialogueSetupModalOpen}
          onClose={() => setIsDialogueSetupModalOpen(false)}
          onStartDialogue={handleStartDialogue}
        />
      )}

      <header className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
            AI Study Room
          </h1>
          <p className="text-slate-500 dark:text-sky-200 text-xs sm:text-sm truncate max-w-[200px] sm:max-w-xs">
            Topic: {studyMaterial.name}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {renderStatusIndicator()}
          <Timer seconds={seconds} />
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* Tutors Panel (Left) */}
        <div className="lg:col-span-3 flex flex-col items-center gap-6 bg-slate-100 dark:bg-black/20 rounded-lg p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-slate-600 dark:text-gray-300 flex-shrink-0">
            Your Study Group
          </h2>
          <div className="flex flex-col items-center gap-6 w-full">
            {tutors.map((tutor) => {
              const isTutorInDialogue = dialogueTutors.some(
                (dt) => dt.id === tutor.id
              );
              const isActive = !isDialogueActive || isTutorInDialogue;
              return (
                <TutorAvatar
                  key={tutor.id}
                  tutor={tutor}
                  isSpeaking={activeSpeaker === tutor.name}
                  isActive={isActive}
                />
              );
            })}
          </div>
        </div>

        {/* Study Material (Center) */}
        <div className="lg:col-span-5 flex flex-col overflow-hidden h-full">
          <StudyMaterialViewer
            studyMaterial={studyMaterial}
            isAIThinking={isAIThinking}
            thinkingTutor={thinkingTutor}
          />
        </div>

        {/* Transcript Area (Right) */}
        <div
          className={`lg:col-span-4 flex flex-col bg-slate-100 dark:bg-black/20 rounded-lg transition-all duration-300 overflow-hidden ${
            isContinuing ? "ring-2 ring-blue-500 shadow-lg" : ""
          }`}
        >
          <h2 className="text-lg font-semibold text-slate-600 dark:text-gray-300 p-4 pb-2 flex-shrink-0">
            Live Transcript
          </h2>
          <div
            ref={transcriptRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto space-y-4 px-4 relative"
          >
            {transcript.map((entry, index) => {
              const isUser = entry.speaker === "User";
              const isSystem = entry.speaker === "System";
              if (isSystem) return null;

              const tutor = tutors.find((t) => t.name === entry.speaker);
              const textColor = tutor
                ? tutor.voiceColor
                : isUser
                ? "text-white"
                : "text-gray-400";
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xl p-3 rounded-lg ${
                      isUser
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-800"
                    }`}
                  >
                    <p
                      className={`font-bold text-sm mb-1 ${
                        isUser ? "text-white" : textColor
                      }`}
                    >
                      {entry.speaker}
                    </p>
                    <p className="whitespace-pre-wrap">{entry.text}</p>
                  </div>
                </div>
              );
            })}
            {isAIThinking && thinkingTutor && (
              <div className="flex justify-start">
                <div className="max-w-xl p-3 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin text-blue-500" size={16} />
                    <p className="text-sm text-slate-600 dark:text-gray-300 font-medium">
                      {thinkingTutor} is thinking...
                    </p>
                  </div>
                </div>
              </div>
            )}
            {isAIReady && !isAIThinking && (
              <div className="flex justify-start">
                <div className="max-w-xl p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                      {isMobile
                        ? "AI is ready - Tap Continue button below"
                        : "AI is ready - Press Space to continue"}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {showScrollButton && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-4 right-4 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors z-10"
                aria-label="Scroll to bottom"
              >
                <ChevronDown size={20} />
              </button>
            )}
          </div>
          <div className="flex-shrink-0 border-t border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-3 p-4">
            <p
              className={`text-xs ${
                isAIThinking
                  ? "text-slate-400 dark:text-gray-500"
                  : isAIReady
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 dark:text-gray-400"
              }`}
            >
              {isAIThinking ? (
                <>
                  {isMobile ? (
                    "AI is thinking... Use Continue button below"
                  ) : (
                    <>
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-200 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600">
                        Space
                      </kbd>{" "}
                      disabled - AI is thinking...
                    </>
                  )}
                </>
              ) : isAIReady ? (
                <>
                  {isMobile ? (
                    "AI is ready - Tap Continue button below"
                  ) : (
                    <>
                      <kbd className="px-2 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 rounded-md dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700">
                        Space
                      </kbd>{" "}
                      ready - Press to continue!
                    </>
                  )}
                </>
              ) : (
                <>
                  {isMobile ? (
                    "Use Continue button below to prompt AI"
                  ) : (
                    <>
                      Press{" "}
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                        Space
                      </kbd>{" "}
                      to prompt AI to continue.
                    </>
                  )}
                </>
              )}
            </p>
            <div className="w-full flex items-center justify-center gap-1 sm:gap-3 md:gap-4">
              <button
                onClick={handleContinueConversation}
                disabled={status !== SessionStatus.Connected || isAIThinking}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isMobile ? "w-24 h-16" : "w-20 h-full"
                } ${
                  isAIThinking
                    ? "text-slate-400 dark:text-gray-500"
                    : isAIReady
                    ? "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    : "text-slate-500 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
                } ${
                  isMobile && isAIReady
                    ? "ring-2 ring-emerald-500 shadow-lg"
                    : ""
                }`}
              >
                <Loader2
                  size={isMobile ? 28 : 24}
                  className={isAIThinking ? "animate-spin" : ""}
                />
                <span
                  className={`${isMobile ? "text-sm font-medium" : "text-xs"}`}
                >
                  {isMobile && isAIReady ? "Tap to Continue" : "Continue"}
                </span>
              </button>
              <button
                onClick={
                  isDialogueActive
                    ? handleEndDialogue
                    : () => setIsDialogueSetupModalOpen(true)
                }
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg w-20 h-full text-center transition-colors text-slate-500 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
              >
                {isDialogueActive ? (
                  <IconX size={24} className="text-red-400" />
                ) : (
                  <MessageSquare size={24} className="text-sky-400" />
                )}
                <span className="text-xs">
                  {isDialogueActive ? "End" : "Dialogue"}
                </span>
              </button>
              <button
                onClick={toggleRecording}
                disabled={status !== SessionStatus.Connected}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg w-20 h-full text-center transition-colors disabled:opacity-50 ${
                  isRecording
                    ? "text-red-500 bg-red-500/10"
                    : "text-slate-500 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10"
                }`}
              >
                {isRecording ? (
                  <StopCircle className="animate-pulse" size={24} />
                ) : (
                  <Radio size={24} />
                )}
                <span className="text-xs">Record</span>
              </button>

              <button
                onClick={handleToggleHandRaise}
                disabled={status !== SessionStatus.Connected}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg w-20 h-full text-center transition-colors disabled:opacity-50 ${
                  isHandRaised
                    ? "text-amber-500 bg-amber-500/10"
                    : "text-slate-500 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10"
                }`}
              >
                <Hand size={24} />
                <span className="text-xs">
                  {isHandRaised ? "Lower" : "Raise Hand"}
                </span>
              </button>

              <button
                onClick={toggleMute}
                disabled={status !== SessionStatus.Connected}
                className={`p-4 rounded-full text-white shadow-lg transform transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${
                  isMuted
                    ? "bg-slate-600 hover:bg-slate-700"
                    : "bg-gradient-to-r from-blue-500 to-sky-500"
                } ${isSpeaking ? "speaking-glow" : ""}`}
                aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
              </button>

              <button
                onClick={handleEndSession}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg w-20 h-full text-center transition-colors text-slate-500 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
              >
                <PhoneOff size={24} className="text-red-400" />
                <span className="text-xs">End Session</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyRoom;
