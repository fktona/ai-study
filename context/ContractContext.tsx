import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useAccount, useBalance } from "wagmi";
import { useStudyToken } from "../hooks/useStudyToken";
import { useStudyAchievements } from "../hooks/useStudyAchievements";
import { useSessionManager } from "../hooks/useSessionManager";
import { useStaking } from "../hooks/useStaking";
import { useSubscription } from "../hooks/useSubscription";

interface ContractContextType {
  // Token data
  tokenBalance: string;
  studyRewards: string;
  consecutiveDays: number;
  sessionStats: any;

  // Achievement data
  nftBalance: string;
  totalAchievements: number;

  // Subscription data
  hasActivePremium: boolean;
  subscriptionPrice: string;
  timeRemainingFormatted: string;

  // Contract functions
  claimStudyReward: (
    studyTimeSeconds: number,
    isPremium: boolean
  ) => Promise<void>;
  mintStudyReward: (to: string, amount: string) => Promise<void>;
  purchasePremiumSubscription: () => Promise<void>;
  p2pConversion: (to: string, amount: string) => Promise<void>;

  // Achievement functions
  mintSessionAchievement: (
    sessionTitle: string,
    sessionDescription: string
  ) => Promise<void>;
  mintStudyMilestone: (
    milestoneTitle: string,
    milestoneDescription: string
  ) => Promise<void>;
  mintBNSCredential: (bnsName: string, bnsDescription: string) => Promise<void>;
  mintLearningPath: (
    pathTitle: string,
    pathDescription: string
  ) => Promise<void>;

  // Staking functions
  stake: (poolId: number, amount: string) => Promise<void>;
  unstake: (poolId: number, amount: string) => Promise<void>;
  claimRewards: (poolId: number) => Promise<void>;

  // Session manager
  sessionManager: any;

  // Loading states
  isClaimingReward: boolean;
  isMintingAchievement: boolean;
  isPurchasingSubscription: boolean;
}

const ContractContext = createContext<ContractContextType | undefined>(
  undefined
);

interface ContractProviderProps {
  children: ReactNode;
}

export const ContractProvider: React.FC<ContractProviderProps> = ({
  children,
}) => {
  const { address, isConnected } = useAccount();
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [isMintingAchievement, setIsMintingAchievement] = useState(false);
  const [isPurchasingSubscription, setIsPurchasingSubscription] =
    useState(false);

  // Contract hooks
  const {
    balance: tokenBalance,
    studyRewards,
    consecutiveDays,
    sessionStats,
    claimStudyTimeReward,
    mintStudyReward,
    purchasePremiumSubscription,
    p2pConversion,
  } = useStudyToken();

  const {
    balance: nftBalance,
    totalAchievements,
    mintSessionCompletion,
    mintStudyMilestone: mintStudyMilestoneHook,
    mintBNSCredential: mintBNSCredentialHook,
    mintLearningPath: mintLearningPathHook,
  } = useStudyAchievements();

  const sessionManager = useSessionManager();

  const { stakes, pendingRewards, poolInfo, stake, unstake, claimRewards } =
    useStaking();

  const {
    subscription,
    subscriptionPrice,
    isActive: hasActivePremium,
    timeRemainingFormatted,
    subscribe,
    renewSubscription,
    cancelSubscription,
  } = useSubscription();

  // Contract interaction functions
  const claimStudyReward = async (
    studyTimeSeconds: number,
    isPremium: boolean
  ) => {
    if (!address) return;

    setIsClaimingReward(true);
    try {
      await claimStudyTimeReward(studyTimeSeconds, isPremium);
    } catch (error) {
      console.error("Error claiming study reward:", error);
    } finally {
      setIsClaimingReward(false);
    }
  };

  const handlePurchasePremiumSubscription = async () => {
    if (!address) return;

    setIsPurchasingSubscription(true);
    try {
      await purchasePremiumSubscription();
    } catch (error) {
      console.error("Error purchasing premium subscription:", error);
    } finally {
      setIsPurchasingSubscription(false);
    }
  };

  // Achievement functions
  const mintSessionAchievement = async (
    sessionTitle: string,
    sessionDescription: string
  ) => {
    if (!address) return;

    setIsMintingAchievement(true);
    try {
      await mintSessionCompletion(address, sessionTitle, sessionDescription);
    } catch (error) {
      console.error("Error minting session achievement:", error);
    } finally {
      setIsMintingAchievement(false);
    }
  };

  const mintStudyMilestone = async (
    milestoneTitle: string,
    milestoneDescription: string
  ) => {
    if (!address) return;

    setIsMintingAchievement(true);
    try {
      await mintStudyMilestoneHook(
        address,
        milestoneTitle,
        milestoneDescription
      );
    } catch (error) {
      console.error("Error minting study milestone:", error);
    } finally {
      setIsMintingAchievement(false);
    }
  };

  const mintBNSCredential = async (bnsName: string, bnsDescription: string) => {
    if (!address) return;

    setIsMintingAchievement(true);
    try {
      await mintBNSCredentialHook(address, bnsName, bnsDescription);
    } catch (error) {
      console.error("Error minting BNS credential:", error);
    } finally {
      setIsMintingAchievement(false);
    }
  };

  const mintLearningPath = async (
    pathTitle: string,
    pathDescription: string
  ) => {
    if (!address) return;

    setIsMintingAchievement(true);
    try {
      await mintLearningPathHook(address, pathTitle, pathDescription);
    } catch (error) {
      console.error("Error minting learning path:", error);
    } finally {
      setIsMintingAchievement(false);
    }
  };

  const contextValue: ContractContextType = {
    // Token data
    tokenBalance,
    studyRewards,
    consecutiveDays,
    sessionStats,

    // Achievement data
    nftBalance,
    totalAchievements,

    // Subscription data
    hasActivePremium,
    subscriptionPrice,
    timeRemainingFormatted,

    // Contract functions
    claimStudyReward,
    mintStudyReward,
    purchasePremiumSubscription: handlePurchasePremiumSubscription,
    p2pConversion,

    // Achievement functions
    mintSessionAchievement,
    mintStudyMilestone,
    mintBNSCredential,
    mintLearningPath,

    // Staking functions
    stake,
    unstake,
    claimRewards,

    // Session manager
    sessionManager,

    // Loading states
    isClaimingReward,
    isMintingAchievement,
    isPurchasingSubscription,
  };

  return (
    <ContractContext.Provider value={contextValue}>
      {children}
    </ContractContext.Provider>
  );
};

export const useContracts = () => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error("useContracts must be used within a ContractProvider");
  }
  return context;
};
