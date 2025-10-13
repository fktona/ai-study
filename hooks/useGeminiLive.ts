import { useState, useRef, useCallback } from 'react';
// FIX: The `LiveSession` type is not exported from the '@google/genai' package.
// It has been removed from this import statement.
// FIX: Aliased the `Blob` type from `@google/genai` to `GeminiBlob` to avoid name conflicts with the global `Blob` type.
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GeminiBlob } from '@google/genai';
import { SessionStatus, TranscriptEntry, VoiceName } from '../types';

// Helper functions for audio encoding/decoding
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// WAV conversion helpers
const writeWavHeader = (view: DataView, sampleRate: number, numChannels: number, numSamples: number) => {
    // RIFF chunk descriptor
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + numSamples * 2, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"
    // "fmt " sub-chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // Sub-chunk size (16 for PCM)
    view.setUint16(20, 1, true); // Audio format (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true); // Byte rate
    view.setUint16(32, numChannels * 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    // "data" sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, numSamples * 2, true);
};

const floatTo16BitPCM = (view: DataView, offset: number, input: Float32Array) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
};

const createWavBlob = (audioData: Float32Array[], sampleRate: number, numChannels: number): Blob | null => {
    if (audioData.length === 0) return null;
    
    const totalSamples = audioData.reduce((sum, chunk) => sum + chunk.length, 0);
    const buffer = new ArrayBuffer(44 + totalSamples * 2);
    const view = new DataView(buffer);
    
    writeWavHeader(view, sampleRate, numChannels, totalSamples);
    
    let offset = 44;
    for (const chunk of audioData) {
        floatTo16BitPCM(view, offset, chunk);
        offset += chunk.length * 2;
    }
    
    return new Blob([view], { type: 'audio/wav' });
};

// FIX: A custom `LiveSession` interface has been defined to provide type safety
// for the session object, as the official type is not exported.
interface LiveSession {
  // FIX: Updated to use `GeminiBlob` for media sent to the API.
  sendRealtimeInput(input: { text?: string; media?: GeminiBlob }): void;
  close(): void;
}


const useGeminiLive = (systemInstruction: string, voiceName: VoiceName, onMicVolumeChange?: (volume: number) => void) => {
  const [status, setStatus] = useState<SessionStatus>(SessionStatus.Idle);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  
  const aiRef = useRef<GoogleGenAI | null>(null);
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);

  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const micConnectedRef = useRef(false);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');
  const recordedChunksRef = useRef<Float32Array[]>([]);

  const parseAndAddEntry = (fullText: string) => {
    const parts = fullText.split(':');
    if (parts.length > 1) {
      const speaker = parts[0].trim();
      const text = parts.slice(1).join(':').trim();
      setTranscript(prev => [...prev, { speaker, text }]);
    } else {
        setTranscript(prev => [...prev, { speaker: 'System', text: fullText }]);
    }
  }

  const cleanup = useCallback(() => {
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if(mediaStreamSourceRef.current){
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    for (const source of sourcesRef.current.values()) {
        source.stop();
    }
    sourcesRef.current.clear();
    setIsRecording(false);
    recordedChunksRef.current = [];
    setStatus(SessionStatus.Ended);
  }, []);

  const startSession = useCallback(async () => {
    if (status !== SessionStatus.Idle) return;
    setStatus(SessionStatus.Connecting);
    
    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
      }
      aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;

      sessionPromiseRef.current = aiRef.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus(SessionStatus.Connected);
            if (!inputAudioContextRef.current) return;
            mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
            scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);

              if (onMicVolumeChange) {
                  let sum = 0;
                  for (let i = 0; i < inputData.length; i++) {
                      sum += inputData[i] * inputData[i];
                  }
                  const rms = Math.sqrt(sum / inputData.length);
                  onMicVolumeChange(rms);
              }

              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              // FIX: Updated to use `GeminiBlob` for the object sent to the API.
              const pcmBlob: GeminiBlob = {
                  data: encode(new Uint8Array(int16.buffer)),
                  mimeType: 'audio/pcm;rate=16000',
              };

              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };
            scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             if (message.serverContent?.outputTranscription?.text) {
                currentOutputTranscription.current += message.serverContent.outputTranscription.text;
             }
             if (message.serverContent?.inputTranscription?.text) {
                 currentInputTranscription.current += message.serverContent.inputTranscription.text;
             }

             if (message.serverContent?.turnComplete) {
                if (currentInputTranscription.current.trim()) {
                    setTranscript(prev => [...prev, { speaker: 'User', text: currentInputTranscription.current.trim() }]);
                }
                 if (currentOutputTranscription.current.trim()) {
                    parseAndAddEntry(currentOutputTranscription.current.trim());
                 }
                 currentInputTranscription.current = '';
                 currentOutputTranscription.current = '';
             }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                
                if (isRecording) {
                    recordedChunksRef.current.push(audioBuffer.getChannelData(0).slice(0));
                }

                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                const source = outputAudioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContextRef.current.destination);
                source.addEventListener('ended', () => { sourcesRef.current.delete(source); });
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session Error:', e);
            setStatus(SessionStatus.Error);
            cleanup();
          },
          onclose: () => {
             cleanup();
          },
        },
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } },
            },
            systemInstruction,
        },
      });

    } catch (error) {
      console.error("Failed to start session:", error);
      setStatus(SessionStatus.Error);
    }
  }, [systemInstruction, voiceName, status, parseAndAddEntry, isRecording, onMicVolumeChange, cleanup]);

  const endSession = useCallback(async () => {
    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current;
      session.close();
      sessionPromiseRef.current = null;
    }
    cleanup();
  }, [cleanup]);

  const sendTextMessage = useCallback(async (text: string) => {
    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current;
      session.sendRealtimeInput({ text });
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!mediaStreamSourceRef.current || !scriptProcessorRef.current) return;
    
    setIsMuted(prevIsMuted => {
        const shouldBeMuted = !prevIsMuted;
        if (shouldBeMuted) {
            if (micConnectedRef.current) {
                mediaStreamSourceRef.current?.disconnect(scriptProcessorRef.current!);
                micConnectedRef.current = false;
            }
        } else {
            if (!micConnectedRef.current) {
                mediaStreamSourceRef.current?.connect(scriptProcessorRef.current!);
                micConnectedRef.current = true;
            }
        }
        return shouldBeMuted;
    });
  }, []);

  const toggleRecording = useCallback(() => {
    setIsRecording(prev => {
        const newIsRecording = !prev;
        if (!newIsRecording) {
            // If stopping, you could process the recording here or wait for session end
        } else {
            // Reset chunks when starting a new recording
            recordedChunksRef.current = [];
        }
        return newIsRecording;
    });
  }, []);

  const getRecordingAsWavBlob = useCallback(async (): Promise<Blob | null> => {
    if (recordedChunksRef.current.length === 0) return null;
    const blob = createWavBlob(recordedChunksRef.current, 24000, 1);
    recordedChunksRef.current = [];
    setIsRecording(false);
    return blob;
  }, []);

  return { status, transcript, startSession, endSession, sendTextMessage, isMuted, toggleMute, isRecording, toggleRecording, getRecordingAsWavBlob };
};

export default useGeminiLive;
