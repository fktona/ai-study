import React, { useState } from "react";
import { UserProfile } from "../types";
import {
  PREMIUM_SUBSCRIPTION_PRICE,
  FREE_TIER_FEATURES,
  PREMIUM_TIER_FEATURES,
} from "../constants";
import { ArrowLeft, Check, Crown, Zap, Loader2 } from "lucide-react";
import { useContracts } from "../context/ContractContext";
import WalletConnection from "./WalletConnection";
import { useAccount } from "wagmi";

interface SubscriptionScreenProps {
  userProfile: UserProfile;
  onUpgrade: () => void;
  onNavigateBack: () => void;
}

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  userProfile,
  onUpgrade,
  onNavigateBack,
}) => {
  const {
    tokenBalance,
    hasActivePremium,
    purchasePremiumMonthly,
    purchasePremiumYearly,
    isPurchasingSubscription,
  } = useContracts();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const { isConnected } = useAccount();

  const canAffordMonthly = parseFloat(tokenBalance) >= 100; // 100 STUDY tokens for monthly
  const canAffordYearly = parseFloat(tokenBalance) >= 1000; // 1000 STUDY tokens for yearly

  const handlePurchase = async () => {
    try {
      if (selectedPlan === "monthly") {
        await purchasePremiumMonthly();
      } else {
        await purchasePremiumYearly();
      }
      onUpgrade();
    } catch (error) {
      console.error("Error purchasing subscription:", error);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-200 dark:border-white/10 flex flex-col gap-6 animate-fade-in">
      <WalletConnection />

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
            Nexus Premium
          </h1>
          <p className="text-slate-500 dark:text-sky-200 mt-1">
            Unlock your full learning potential.
          </p>
        </div>
        <button
          onClick={onNavigateBack}
          className="flex items-center gap-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 font-semibold py-2 px-4 rounded-lg transition-colors flex-shrink-0"
        >
          <ArrowLeft size={18} /> Back
        </button>
      </header>

      <div className="grid md:grid-cols-2 gap-8 mt-4">
        {/* Free Tier */}
        <div
          className={`p-6 rounded-2xl border-2 flex flex-col ${
            userProfile.subscription === "free"
              ? "border-blue-500 bg-blue-500/5"
              : "border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5"
          }`}
        >
          <h2 className="text-2xl font-bold">Free</h2>
          <p className="text-slate-500 dark:text-gray-400">
            The essentials for collaborative study.
          </p>
          <div className="my-6 text-center">
            <span className="text-4xl font-bold">0</span>
            <span className="text-slate-500 dark:text-gray-400">
              {" "}
              $STUDY/month
            </span>
          </div>
          <ul className="space-y-3 flex-grow">
            {FREE_TIER_FEATURES.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <button
            disabled
            className="mt-8 w-full bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-gray-400 font-bold py-3 px-6 rounded-full cursor-default"
          >
            Your Current Plan
          </button>
        </div>

        {/* Premium Tier */}
        <div
          className={`p-6 rounded-2xl border-2 flex flex-col ${
            hasActivePremium
              ? "border-amber-400 bg-amber-400/5"
              : "border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5"
          }`}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Crown className="text-amber-400" /> Premium
            </h2>
            <span className="text-xs font-bold bg-amber-400/20 text-amber-600 dark:text-amber-200 px-2 py-1 rounded-full">
              BEST VALUE
            </span>
          </div>
          <p className="text-slate-500 dark:text-gray-400">
            Supercharge your studies with advanced tools.
          </p>

          {/* Plan Selection */}
          <div className="my-4 flex gap-2">
            <button
              onClick={() => setSelectedPlan("monthly")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
                selectedPlan === "monthly"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedPlan("yearly")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
                selectedPlan === "yearly"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300"
              }`}
            >
              Yearly (2 months free!)
            </button>
          </div>

          <div className="my-6 text-center">
            <span className="text-4xl font-bold">
              {selectedPlan === "monthly" ? "100" : "1000"}
            </span>
            <span className="text-slate-500 dark:text-gray-400">
              {" "}
              $STUDY/{selectedPlan === "monthly" ? "month" : "year"}
            </span>
          </div>
          <ul className="space-y-3 flex-grow">
            {PREMIUM_TIER_FEATURES.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          {hasActivePremium ? (
            <button
              disabled
              className="mt-8 w-full bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-gray-400 font-bold py-3 px-6 rounded-full cursor-default"
            >
              Premium Active
            </button>
          ) : (
            <button
              onClick={handlePurchase}
              disabled={
                !canAffordMonthly || isPurchasingSubscription || !isConnected
              }
              className="mt-8 w-full bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPurchasingSubscription ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                `Upgrade to Premium - ${
                  selectedPlan === "monthly" ? "100" : "1000"
                } $STUDY`
              )}
            </button>
          )}
          {!canAffordMonthly && !hasActivePremium && (
            <p className="text-center text-xs text-red-500 mt-2">
              You need{" "}
              {selectedPlan === "monthly"
                ? (100 - parseFloat(tokenBalance)).toFixed(0)
                : (1000 - parseFloat(tokenBalance)).toFixed(0)}{" "}
              more $STUDY to upgrade.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionScreen;
