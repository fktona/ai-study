import React, { useState } from "react";
import { UserProfile, PastSession, AppState, Reminder } from "../types";
import {
  ArrowRight,
  Clock,
  PlusCircle,
  Store,
  BarChartHorizontal,
  CheckCircle,
  Bell,
  History,
  Send,
} from "lucide-react";
import { useContracts } from "../context/ContractContext";
import WalletConnection from "./WalletConnection";
import P2PTransferModal from "./P2PTransferModal";
import { useAccount, useChainId } from "wagmi";

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${String(hours)}h ${String(minutes).padStart(2, "0")}m`;
};

const formatReminderDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return `Today at ${time}`;

  return (
    date.toLocaleDateString([], { month: "short", day: "numeric" }) +
    ` at ${time}`
  );
};

interface DashboardScreenProps {
  userProfile: UserProfile;
  onStartNewSession: () => void;
  onNavigate: (state: AppState) => void;
  pastSessions: PastSession[];
  reminders: Reminder[];
  onAddReminder: (title: string, dateTime: string) => void;
}

const LaunchpadCard = ({
  icon: Icon,
  title,
  description,
  buttonText,
  onNavigate,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonText: string;
  onNavigate: () => void;
}) => (
  <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-xl border border-slate-200 dark:border-white/10 flex flex-col">
    <div className="flex items-center gap-3">
      <div className="bg-blue-500/10 p-2 rounded-lg">
        <Icon className="text-blue-500" size={24} />
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
    <p className="text-slate-500 dark:text-gray-400 mt-2 flex-grow">
      {description}
    </p>
    <button
      onClick={onNavigate}
      className="mt-4 flex items-center justify-center gap-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 font-semibold py-2.5 px-4 rounded-lg transition-colors w-full"
    >
      {buttonText} <ArrowRight size={16} />
    </button>
  </div>
);

const DashboardScreen: React.FC<DashboardScreenProps> = ({
  userProfile,
  onStartNewSession,
  onNavigate,
  pastSessions,
  reminders,
  onAddReminder,
}) => {
  const upcomingReminders = reminders
    .filter((r) => new Date(r.dateTime) > new Date())
    .slice(0, 2);
  const {
    tokenBalance,
    tokenSymbol,
    nftBalance,
    hasActivePremium,
    refetchTokenBalance,
  } = useContracts();
  const { address } = useAccount();
  const chainId = useChainId();
  const [isP2PModalOpen, setIsP2PModalOpen] = useState(false);

  return (
    <div className="w-full max-w-7xl space-y-8 animate-fade-in">
      <WalletConnection />

      <header>
        <h1 className="text-3xl font-bold">
          Welcome,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
            {userProfile.bns}
          </span>
          .
        </h1>
        <p className="text-slate-500 dark:text-sky-200">
          This is your Study Hub. Let's get started.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-blue-500 to-sky-500 p-8 rounded-xl text-white shadow-lg flex flex-col items-start">
            <h2 className="text-2xl font-bold">Ready to Study?</h2>
            <p className="mt-1 mb-6 opacity-90">
              Assemble your AI team and dive into your materials.
            </p>
            <button
              onClick={onStartNewSession}
              className="bg-white text-blue-600 font-bold py-3 px-6 rounded-full shadow-md hover:scale-105 transform transition-all duration-300 flex items-center justify-center gap-2"
            >
              <PlusCircle size={20} />
              Start New Session
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <LaunchpadCard
              icon={Store}
              title="Marketplace"
              description="Buy and sell study materials with your earned $STUDY tokens."
              buttonText="Explore Marketplace"
              onNavigate={() => onNavigate(AppState.MARKETPLACE)}
            />
            <LaunchpadCard
              icon={BarChartHorizontal}
              title="Staking"
              description="Stake your $STUDY tokens to earn rewards and support the platform."
              buttonText="Manage Staking"
              onNavigate={() => onNavigate(AppState.STAKING)}
            />
          </div>
        </div>

        {/* Sidebar Column */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-4">
            <h3 className="font-semibold text-lg">At a Glance</h3>

            {/* Network Status */}
            <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-gray-400">
                Network:{" "}
                {chainId === 84532
                  ? "Base Sepolia ✅"
                  : `Unknown (${chainId}) ❌`}
              </p>
              <p className="text-xs text-slate-600 dark:text-gray-400">
                Address:{" "}
                {address
                  ? `${address.slice(0, 6)}...${address.slice(-4)}`
                  : "Not connected"}
              </p>
            </div>

            {/* Balance */}
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-gray-400">
                  Your Balance
                </p>
                <button
                  onClick={() => {
                    // Force refresh contract data
                    refetchTokenBalance();
                  }}
                  className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Refresh
                </button>
              </div>
              <p className="text-2xl font-bold">
                {parseFloat(tokenBalance).toLocaleString()}{" "}
                <span className="text-lg font-normal text-slate-500 dark:text-gray-300">
                  {tokenSymbol}
                </span>
              </p>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                Raw: {tokenBalance}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setIsP2PModalOpen(true)}
                  className="flex items-center gap-1 text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md transition-colors"
                >
                  <Send className="w-3 h-3" />
                  Send Tokens
                </button>
              </div>
            </div>

            {/* NFT Balance */}
            <div>
              <p className="text-sm text-slate-500 dark:text-gray-400">
                Achievement NFTs
              </p>
              <p className="text-2xl font-bold">
                {nftBalance}{" "}
                <span className="text-lg font-normal text-slate-500 dark:text-gray-300">
                  NFTs
                </span>
              </p>
            </div>

            {/* Premium Status */}
            {hasActivePremium && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-3 rounded-lg">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle size={16} />
                  Premium Active
                </p>
                <p className="text-xs opacity-90">Enjoy enhanced features!</p>
              </div>
            )}

            {/* Recent Activity */}
            <div>
              <h4 className="font-semibold text-slate-700 dark:text-gray-200 flex items-center gap-2">
                <History size={16} /> Recent Activity
              </h4>
              <div className="mt-2 space-y-2">
                {pastSessions.slice(0, 2).map((session) => (
                  <div key={session.id} className="text-sm">
                    <p className="font-medium text-slate-600 dark:text-gray-300 truncate">
                      Studied: {session.topic}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-gray-500">
                      {session.date}
                    </p>
                  </div>
                ))}
                {pastSessions.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-gray-500">
                    No recent sessions.
                  </p>
                )}
              </div>
            </div>

            {/* Upcoming Reminders */}
            <div>
              <h4 className="font-semibold text-slate-700 dark:text-gray-200 flex items-center gap-2">
                <Bell size={16} /> Upcoming Reminders
              </h4>
              <div className="mt-2 space-y-2">
                {upcomingReminders.map((reminder) => (
                  <div key={reminder.id} className="text-sm">
                    <p className="font-medium text-slate-600 dark:text-gray-300">
                      {reminder.title}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-gray-500">
                      {formatReminderDate(reminder.dateTime)}
                    </p>
                  </div>
                ))}
                {upcomingReminders.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-gray-500">
                    No upcoming reminders.
                  </p>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* P2P Transfer Modal */}
      <P2PTransferModal
        isOpen={isP2PModalOpen}
        onClose={() => setIsP2PModalOpen(false)}
      />
    </div>
  );
};

export default DashboardScreen;
