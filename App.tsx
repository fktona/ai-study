import React, { useState, useCallback, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import SetupScreen from "./components/SetupScreen";
import StudyRoom from "./components/StudyRoom";
import SessionSummary from "./components/SessionSummary";
import ConnectWalletScreen from "./components/ConnectWalletScreen";
import CreateProfileNameScreen from "./components/CreateProfileNameScreen";
import DashboardScreen from "./components/DashboardScreen";
import MarketplaceScreen from "./components/MarketplaceScreen";
import ProfileScreen from "./components/ProfileScreen";
import CommunityScreen from "./components/CommunityScreen";
import SessionHistoryScreen from "./components/SessionHistoryScreen";
import LearnBaseScreen from "./components/LearnBaseScreen";
import SubscriptionScreen from "./components/SubscriptionScreen";
import StakingScreen from "./components/StakingScreen";
import TokenShop from "./components/TokenShop";
import RewardDashboard from "./components/RewardDashboard";
import Header from "./components/Header";
import OnboardingModal from "./components/OnboardingModal";
import P2PModal from "./components/P2PModal";
import NotificationContainer from "./components/NotificationContainer";
import {
  AppState,
  Tutor,
  VoiceName,
  UserProfile,
  NFTCredential,
  PastSession,
  Reminder,
} from "./types";
import { Dna, BookOpen, BrainCircuit } from "lucide-react";
import { MOCK_NFTS, PREMIUM_SUBSCRIPTION_PRICE } from "./constants";
import { ThemeProvider } from "./context/ThemeContext";
import { ContractProvider } from "./context/ContractContext";

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.CONNECT_WALLET);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userNFTs, setUserNFTs] = useState<NFTCredential[]>([]);
  const [totalStudyTimeInSeconds, setTotalStudyTimeInSeconds] = useState(0);
  const [isOneHourRewardClaimed, setIsOneHourRewardClaimed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isP2PModalOpen, setIsP2PModalOpen] = useState(false);

  const [selectedTutors, setSelectedTutors] = useState<Tutor[]>([]);
  const [studyMaterial, setStudyMaterial] = useState<{
    name: string;
    content: string;
  } | null>(null);
  const [sessionTranscript, setSessionTranscript] = useState<string>("");
  const [sessionVoice, setSessionVoice] = useState<VoiceName>("Zephyr");
  const [currentSessionAudioUrl, setCurrentSessionAudioUrl] = useState<
    string | undefined
  >();

  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [completedBaseModules, setCompletedBaseModules] = useState<Set<string>>(
    new Set()
  );
  const [isBaseRewardClaimed, setIsBaseRewardClaimed] = useState(false);

  // Staking State
  const [stakedAmount, setStakedAmount] = useState(0);
  const [stakingRewards, setStakingRewards] = useState(0);

  const handleConnectWallet = useCallback((address: string) => {
    const isFirstTime = !localStorage.getItem("hasConnectedBefore");

    if (isFirstTime) {
      setUserProfile({
        address: address,
        bns: "", // BNS is empty initially for new user
        balance: 0, // Start with 0 balance
        subscription: "free",
        profilePictureUrl: `https://i.pravatar.cc/150?u=${address}`,
        school: "",
        major: "",
        year: 1,
      });
      setUserNFTs([]);
      setTotalStudyTimeInSeconds(0);
      setAppState(AppState.CREATE_PROFILE_NAME);
    } else {
      // Returning user
      setUserProfile({
        address: address,
        bns: "student.base",
        balance: 1500,
        subscription: "premium",
        profilePictureUrl: `https://i.pravatar.cc/150?u=${address}`,
        school: "Nexus University of Medicine",
        major: "Bio-Informatics",
        year: 2,
      });
      setUserNFTs(MOCK_NFTS.slice(0, 2));
      setTotalStudyTimeInSeconds(3540);
      setStakedAmount(500);
      setAppState(AppState.DASHBOARD);
    }
  }, []);

  const handleCreateProfileName = useCallback((bns: string) => {
    const bnsFullName = `${bns}.base`;
    setUserProfile((prev) => (prev ? { ...prev, bns: bnsFullName } : null));

    const newNameNFT: NFTCredential = {
      id: "nft-bns",
      name: `${bnsFullName}`,
      description: `A unique Base Name Service (BNS) credential for your onchain identity.`,
      imageUrl: `https://placehold.co/400x400/155ff4/ffffff?text=${bns}.base`,
      date: new Date().toISOString().split("T")[0],
      transactionHash: `0x${[...Array(64)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")}`,
    };
    setUserNFTs((prev) => [newNameNFT, ...prev]);

    localStorage.setItem("hasConnectedBefore", "true");
    setShowOnboarding(true); // Now show the onboarding tour
  }, []);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    setAppState(AppState.DASHBOARD);
  };

  const handleDisconnectWallet = useCallback(() => {
    disconnect();
    setUserProfile(null);
    setUserNFTs([]);
    setAppState(AppState.CONNECT_WALLET);
    setSelectedTutors([]);
    setStudyMaterial(null);
    setSessionTranscript("");
    setTotalStudyTimeInSeconds(0);
    setIsOneHourRewardClaimed(false);
    setPastSessions([]);
    setReminders([]);
    setCompletedBaseModules(new Set());
    setIsBaseRewardClaimed(false);
    setStakedAmount(0);
    setStakingRewards(0);
  }, [disconnect]);

  const handleUpdateProfile = useCallback((updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    setAppState(AppState.DASHBOARD);
  }, []);

  const handleStartSession = useCallback(
    (
      tutors: Tutor[],
      material: { name: string; content: string },
      voice: VoiceName,
      moduleId?: string
    ) => {
      setSelectedTutors(tutors);
      setStudyMaterial(material);
      setSessionVoice(voice);
      if (moduleId) {
        setCurrentModuleId(moduleId);
      }
      setAppState(AppState.STUDYING);
    },
    []
  );

  const handleEndSession = useCallback(
    (transcript: string, durationInSeconds: number, audioUrl?: string) => {
      setSessionTranscript(transcript);
      setTotalStudyTimeInSeconds((prev) => prev + durationInSeconds);
      setCurrentSessionAudioUrl(audioUrl);

      if (currentModuleId) {
        setCompletedBaseModules((prev) => new Set(prev).add(currentModuleId));
      }

      const sessionId = new Date().toISOString();
      setCurrentSessionId(sessionId);

      const newSession: PastSession = {
        id: sessionId,
        topic: studyMaterial!.name,
        date: new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        durationInSeconds: durationInSeconds,
        transcript: transcript,
        audioRecordingUrl: audioUrl,
      };
      setPastSessions((prev) => [newSession, ...prev]);

      setAppState(AppState.SUMMARY);
      setCurrentModuleId(null);
    },
    [studyMaterial, currentModuleId]
  );

  const handleStartNewSessionSetup = useCallback(() => {
    setSelectedTutors([]);
    setStudyMaterial(null);
    setSessionTranscript("");
    setSessionVoice("Zephyr");
    setCurrentSessionAudioUrl(undefined);
    setAppState(AppState.SETUP);
  }, []);

  const handleClaimRewards = useCallback((amount: number) => {
    setUserProfile((prev) =>
      prev ? { ...prev, balance: prev.balance + amount } : null
    );
  }, []);

  const handleClaimOneHourReward = useCallback(() => {
    if (totalStudyTimeInSeconds >= 3600 && !isOneHourRewardClaimed) {
      setUserProfile((prev) =>
        prev ? { ...prev, balance: prev.balance + 500 } : null
      );
      setIsOneHourRewardClaimed(true);
    }
  }, [totalStudyTimeInSeconds, isOneHourRewardClaimed]);

  const handleClaimBaseReward = useCallback(() => {
    if (completedBaseModules.size >= 5 && !isBaseRewardClaimed) {
      setUserProfile((prev) =>
        prev ? { ...prev, balance: prev.balance + 500 } : null
      );
      setIsBaseRewardClaimed(true);
    }
  }, [completedBaseModules, isBaseRewardClaimed]);

  const handleMintNFT = useCallback(
    (nft: NFTCredential, fee: number = 0) => {
      if (userProfile && userProfile.balance >= fee) {
        if (!userNFTs.find((existingNft) => existingNft.id === nft.id)) {
          setUserProfile((p) =>
            p ? { ...p, balance: p.balance - fee } : null
          );
          setUserNFTs((prev) => [...prev, nft]);
          return true;
        }
      }
      return false;
    },
    [userNFTs, userProfile]
  );

  const handleMintSessionNFT = useCallback(() => {
    const sessionNFT: NFTCredential = {
      id: `nft-session-${Date.now()}`,
      name: `${studyMaterial?.name || "Session"} Completion`,
      description: `Awarded for completing a study session on ${
        studyMaterial?.name || "an interesting topic"
      }.`,
      imageUrl: `https://placehold.co/400x400/10b981/ffffff?text=Session+Complete`,
      date: new Date().toISOString().split("T")[0],
      transactionHash: `0x${[...Array(64)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")}`,
    };
    handleMintNFT(sessionNFT);
  }, [handleMintNFT, studyMaterial]);

  const handleUpdateSessionSummary = useCallback(
    (sessionId: string, summary: string) => {
      setPastSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, summary } : session
        )
      );
    },
    []
  );

  const handleAddReminder = useCallback((title: string, dateTime: string) => {
    const add = () => {
      const newReminder: Reminder = {
        id: new Date().toISOString() + Math.random(),
        title,
        dateTime,
        notified: new Date(dateTime) <= new Date(),
      };
      setReminders((prev) =>
        [...prev, newReminder].sort(
          (a, b) =>
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        )
      );
    };

    if (Notification.permission === "granted") {
      add();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          add();
        } else {
          add();
        }
      });
    } else {
      add();
    }
  }, []);

  const handleDeleteReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleP2PConversion = useCallback((amount: number) => {
    setUserProfile((prev) => {
      if (!prev || prev.balance < amount) return prev;
      return { ...prev, balance: prev.balance - amount };
    });
  }, []);

  const handleUpgradeSubscription = useCallback(() => {
    if (userProfile && userProfile.balance >= PREMIUM_SUBSCRIPTION_PRICE) {
      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              balance: prev.balance - PREMIUM_SUBSCRIPTION_PRICE,
              subscription: "premium",
            }
          : null
      );
      setAppState(AppState.DASHBOARD);
    }
  }, [userProfile]);

  const handleStake = useCallback(
    (amount: number) => {
      if (userProfile && userProfile.balance >= amount && amount > 0) {
        setUserProfile((prev) =>
          prev ? { ...prev, balance: prev.balance - amount } : null
        );
        setStakedAmount((prev) => prev + amount);
      }
    },
    [userProfile]
  );

  const handleUnstake = useCallback(
    (amount: number) => {
      if (stakedAmount >= amount && amount > 0) {
        setUserProfile((prev) =>
          prev ? { ...prev, balance: prev.balance + amount } : null
        );
        setStakedAmount((prev) => prev - amount);
      }
    },
    [stakedAmount]
  );

  const handleClaimStakingRewards = useCallback(() => {
    if (stakingRewards > 0) {
      setUserProfile((prev) =>
        prev ? { ...prev, balance: prev.balance + stakingRewards } : null
      );
      setStakingRewards(0);
    }
  }, [stakingRewards]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (stakedAmount > 0) {
        setStakingRewards((prev) => prev + (stakedAmount * 0.12) / 365 / 24);
      }
    }, 3600);
    return () => clearInterval(interval);
  }, [stakedAmount]);

  // Handle wallet disconnection
  useEffect(() => {
    if (!isConnected && userProfile) {
      // Wallet was disconnected externally
      handleDisconnectWallet();
    }
  }, [isConnected, userProfile, handleDisconnectWallet]);

  useEffect(() => {
    const checkReminders = () => {
      if (Notification.permission !== "granted") return;

      const now = new Date();
      let remindersUpdated = false;
      const updatedReminders = reminders.map((reminder) => {
        if (!reminder.notified && new Date(reminder.dateTime) <= now) {
          new Notification("Study Reminder", {
            body: reminder.title,
            icon: "https://cdn-icons-png.flaticon.com/512/2991/2991108.png",
          });
          remindersUpdated = true;
          return { ...reminder, notified: true };
        }
        return reminder;
      });

      if (remindersUpdated) {
        setReminders(updatedReminders);
      }
    };

    const intervalId = setInterval(checkReminders, 15000);

    return () => clearInterval(intervalId);
  }, [reminders]);

  const renderContent = () => {
    if (showOnboarding) {
      return <OnboardingModal onClose={handleCloseOnboarding} />;
    }
    switch (appState) {
      case AppState.CONNECT_WALLET:
        return <ConnectWalletScreen onConnect={handleConnectWallet} />;
      case AppState.CREATE_PROFILE_NAME:
        return (
          <CreateProfileNameScreen onProfileCreated={handleCreateProfileName} />
        );
      case AppState.DASHBOARD:
        return (
          <DashboardScreen
            userProfile={userProfile!}
            onStartNewSession={() => setAppState(AppState.SETUP)}
            onNavigate={(state) => setAppState(state)}
            pastSessions={pastSessions}
            reminders={reminders}
            onAddReminder={handleAddReminder}
          />
        );
      case AppState.MARKETPLACE:
        return (
          <MarketplaceScreen
            userProfile={userProfile!}
            onUpdateBalance={(newBalance) =>
              setUserProfile((p) => (p ? { ...p, balance: newBalance } : null))
            }
          />
        );
      case AppState.PROFILE:
        return (
          <ProfileScreen
            userProfile={userProfile!}
            nfts={userNFTs}
            onSave={handleUpdateProfile}
            onCancel={() => setAppState(AppState.DASHBOARD)}
            onMintNFT={handleMintNFT}
          />
        );
      case AppState.COMMUNITY:
        return <CommunityScreen currentUser={userProfile!} />;
      case AppState.HISTORY:
        return (
          <SessionHistoryScreen
            sessions={pastSessions}
            onUpdateSessionSummary={handleUpdateSessionSummary}
            onNavigateBack={() => setAppState(AppState.DASHBOARD)}
          />
        );
      case AppState.LEARN_BASE:
        return (
          <LearnBaseScreen
            completedModules={completedBaseModules}
            isRewardClaimed={isBaseRewardClaimed}
            onClaimReward={handleClaimBaseReward}
            onStartSession={handleStartSession}
          />
        );
      case AppState.SUBSCRIPTION:
        return (
          <SubscriptionScreen
            userProfile={userProfile!}
            onUpgrade={handleUpgradeSubscription}
            onNavigateBack={() => setAppState(AppState.DASHBOARD)}
          />
        );
      case AppState.STAKING:
        return (
          <StakingScreen
            userProfile={userProfile!}
            stakedAmount={stakedAmount}
            stakingRewards={stakingRewards}
            onStake={handleStake}
            onUnstake={handleUnstake}
            onClaimRewards={handleClaimStakingRewards}
            onNavigateBack={() => setAppState(AppState.DASHBOARD)}
          />
        );
      case AppState.TOKEN_SHOP:
        return (
          <TokenShop onNavigateBack={() => setAppState(AppState.DASHBOARD)} />
        );
      case AppState.REWARD_DASHBOARD:
        return <RewardDashboard />;
      case AppState.STUDYING:
        return (
          <StudyRoom
            tutors={selectedTutors}
            studyMaterial={studyMaterial!}
            onEndSession={handleEndSession}
            sessionVoice={sessionVoice}
          />
        );
      case AppState.SUMMARY:
        return (
          <SessionSummary
            transcript={sessionTranscript}
            audioUrl={currentSessionAudioUrl}
            onStartNewSession={handleStartNewSessionSetup}
            onClaimRewards={handleClaimRewards}
            onMintNFT={handleMintSessionNFT}
            onNavigateToDashboard={() => setAppState(AppState.DASHBOARD)}
            onSummaryGenerated={(summary) =>
              handleUpdateSessionSummary(currentSessionId!, summary)
            }
          />
        );
      case AppState.SETUP:
      default:
        return (
          <SetupScreen
            onStartSession={handleStartSession}
            userSubscription={userProfile?.subscription || "free"}
          />
        );
    }
  };

  const showHeader =
    userProfile &&
    appState !== AppState.CONNECT_WALLET &&
    appState !== AppState.CREATE_PROFILE_NAME &&
    appState !== AppState.STUDYING &&
    !showOnboarding;

  return (
    <ThemeProvider>
      <ContractProvider>
        <div className="min-h-screen bg-slate-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-slate-900 font-sans text-slate-800 dark:text-white relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-full bg-black/20 backdrop-blur-sm hidden dark:block"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-5 dark:opacity-10 z-0">
            <Dna
              className="absolute top-1/4 left-1/4 w-64 h-64 text-blue-500 animate-pulse"
              strokeWidth={0.5}
            />
            <BookOpen
              className="absolute bottom-1/4 right-1/4 w-48 h-48 text-sky-500 animate-pulse delay-1000"
              strokeWidth={0.5}
            />
            <BrainCircuit
              className="absolute top-10 right-10 w-32 h-32 text-blue-400 animate-pulse delay-500"
              strokeWidth={0.5}
            />
          </div>
          {showHeader && userProfile && (
            <Header
              userProfile={userProfile}
              onDisconnect={handleDisconnectWallet}
              onNavigate={(state) => setAppState(state)}
              onOpenP2PModal={() => setIsP2PModalOpen(true)}
            />
          )}
          {isP2PModalOpen && userProfile && (
            <P2PModal
              isOpen={isP2PModalOpen}
              onClose={() => setIsP2PModalOpen(false)}
              userBalance={userProfile.balance}
              onConvert={handleP2PConversion}
            />
          )}
          <main
            className={`relative z-10 flex flex-col items-center justify-center min-h-screen p-4 ${
              showHeader ? "pt-24" : ""
            }`}
          >
            {renderContent()}
          </main>
          <NotificationContainer />
        </div>
      </ContractProvider>
    </ThemeProvider>
  );
};

export default App;
