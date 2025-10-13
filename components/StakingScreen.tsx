import React, { useState, useMemo } from "react";
import { UserProfile } from "../types";
import { STAKING_APY } from "../constants";
import {
  ArrowLeft,
  BarChartHorizontal,
  CheckCircle,
  TrendingUp,
  Download,
  Plus,
  Minus,
  Loader2,
} from "lucide-react";
import { useContracts } from "../context/ContractContext";
import { useStaking } from "../hooks/useStaking";
import WalletConnection from "./WalletConnection";
import { useAccount } from "wagmi";

interface StakingScreenProps {
  userProfile: UserProfile;
  stakedAmount: number;
  stakingRewards: number;
  onStake: (amount: number) => void;
  onUnstake: (amount: number) => void;
  onClaimRewards: () => void;
  onNavigateBack: () => void;
}

const StakingScreen: React.FC<StakingScreenProps> = ({
  userProfile,
  stakedAmount,
  stakingRewards,
  onStake,
  onUnstake,
  onClaimRewards,
  onNavigateBack,
}) => {
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"stake" | "unstake">("stake");
  const [selectedPool, setSelectedPool] = useState(0); // 0: short-term, 1: medium-term, 2: long-term
  const [notification, setNotification] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { tokenBalance } = useContracts();
  const { isConnected } = useAccount();
  const {
    stakes,
    pendingRewards,
    poolInfo,
    approveAndStake,
    unstake,
    claimRewards,
  } = useStaking();

  // Get data for the selected pool
  const poolKey =
    selectedPool === 0
      ? "shortTerm"
      : selectedPool === 1
      ? "mediumTerm"
      : "longTerm";
  const userStake = stakes[poolKey];
  const poolPendingRewards = pendingRewards[poolKey];
  const poolInfoData = poolInfo[poolKey];

  const numericAmount = parseFloat(amount) || 0;
  const isStake = activeTab === "stake";
  const maxAmount = isStake
    ? parseFloat(tokenBalance)
    : userStake?.amount
    ? parseFloat(userStake.amount)
    : 0;

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0 || numericAmount > maxAmount) return;

    setIsProcessing(true);
    try {
      if (isStake) {
        await approveAndStake(selectedPool, amount);
        showNotification(`Successfully staked ${numericAmount} $STUDY!`);
      } else {
        await unstake(selectedPool, amount);
        showNotification(`Successfully unstaked ${numericAmount} $STUDY!`);
      }
      setAmount("");
      // Data will be refreshed automatically by the hook
    } catch (error) {
      console.error("Staking error:", error);
      showNotification("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClaim = async () => {
    setIsProcessing(true);
    try {
      await claimRewards(selectedPool);
      showNotification("Rewards claimed and added to your balance!");
      // Data will be refreshed automatically by the hook
    } catch (error) {
      console.error("Claim error:", error);
      showNotification("Claim failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-200 dark:border-white/10 flex flex-col gap-6 animate-fade-in">
      <WalletConnection />

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-500 flex items-center gap-3">
            <BarChartHorizontal /> $STUDY Staking
          </h1>
          <p className="text-slate-500 dark:text-sky-200 mt-1">
            Earn rewards by staking your tokens and supporting the ecosystem.
          </p>
        </div>
        <button
          onClick={onNavigateBack}
          className="flex items-center gap-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 font-semibold py-2 px-4 rounded-lg transition-colors flex-shrink-0"
        >
          <ArrowLeft size={18} /> Back to Hub
        </button>
      </header>

      {/* Pool Selection */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 0, name: "Short-term", duration: "7 days", apy: "12%" },
          { id: 1, name: "Medium-term", duration: "30 days", apy: "15%" },
          { id: 2, name: "Long-term", duration: "90 days", apy: "20%" },
        ].map((pool) => (
          <button
            key={pool.id}
            onClick={() => setSelectedPool(pool.id)}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-colors ${
              selectedPool === pool.id
                ? "bg-blue-500 text-white"
                : "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300"
            }`}
          >
            <div>{pool.name}</div>
            <div className="text-xs opacity-75">
              {pool.duration} • {pool.apy}
            </div>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6 text-center">
        <div className="bg-slate-100 dark:bg-black/20 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400">
            Staked Balance
          </h3>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {userStake?.amount || "0"}
          </p>
        </div>
        <div className="bg-slate-100 dark:bg-black/20 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400">
            Unclaimed Rewards
          </h3>
          <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">
            {poolPendingRewards || "0"}
          </p>
        </div>
        <div className="bg-slate-100 dark:bg-black/20 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400">
            Current APY
          </h3>
          <p className="text-2xl font-bold flex items-center justify-center gap-2">
            <TrendingUp size={20} />
            {selectedPool === 0 ? "12" : selectedPool === 1 ? "15" : "20"}%
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div className="bg-slate-100 dark:bg-black/20 p-6 rounded-lg">
          <div className="flex border-b border-slate-200 dark:border-white/10 mb-4">
            <button
              onClick={() => {
                setActiveTab("stake");
                setAmount("");
              }}
              className={`py-2 px-4 text-sm font-semibold flex-1 transition-colors ${
                activeTab === "stake"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-slate-500 hover:text-blue-400"
              }`}
            >
              Stake
            </button>
            <button
              onClick={() => {
                setActiveTab("unstake");
                setAmount("");
              }}
              className={`py-2 px-4 text-sm font-semibold flex-1 transition-colors ${
                activeTab === "unstake"
                  ? "border-b-2 border-red-500 text-red-500"
                  : "text-slate-500 hover:text-red-400"
              }`}
            >
              Unstake
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-baseline">
                <label htmlFor="amount" className="block text-sm font-medium">
                  {isStake ? "Amount to Stake" : "Amount to Unstake"}
                </label>
                <span className="text-xs text-slate-500">
                  Available: {maxAmount.toLocaleString()}
                </span>
              </div>
              <div className="relative mt-1">
                <input
                  type="text"
                  id="amount"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                  placeholder="0.0"
                  className="w-full bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/20 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition pr-16"
                />
                <button
                  type="button"
                  onClick={() => setAmount(String(maxAmount))}
                  className="absolute inset-y-0 right-0 my-1.5 mr-1.5 px-2 text-xs font-semibold text-blue-600 dark:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-md"
                >
                  MAX
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={
                numericAmount <= 0 ||
                numericAmount > maxAmount ||
                isProcessing ||
                !isConnected
              }
              className={`w-full flex items-center justify-center gap-2 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                isStake
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {isStake ? <Plus size={18} /> : <Minus size={18} />}
                  {isStake ? "Stake Tokens" : "Unstake Tokens"}
                </>
              )}
            </button>
          </form>
        </div>
        <div className="bg-slate-100 dark:bg-black/20 p-6 rounded-lg flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-semibold">Claim Your Rewards</h3>
          <p className="text-slate-500 dark:text-gray-400 mt-1 mb-4 text-sm">
            Add your earned staking rewards to your main balance.
          </p>
          <button
            onClick={handleClaim}
            disabled={
              !poolPendingRewards ||
              parseFloat(poolPendingRewards) <= 0 ||
              isProcessing ||
              !isConnected
            }
            className="w-full max-w-xs flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-amber-600 transition disabled:bg-gray-400 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                <Download size={18} />
                Claim {poolPendingRewards || "0"} $STUDY
              </>
            )}
          </button>
        </div>
      </div>
      {notification && (
        <div className="fixed bottom-5 right-5 bg-green-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in flex items-center gap-2">
          <CheckCircle size={18} /> {notification}
        </div>
      )}
    </div>
  );
};

export default StakingScreen;
