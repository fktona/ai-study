// Smart Contract Addresses for Base Sepolia Testnet
// Update these addresses after deploying contracts

export const CONTRACT_ADDRESSES = {
  // Base Sepolia Testnet
    baseSepolia: {
      StudyToken: "0x93635f5b064979FA3bC18C30614c5Ff40Dda0ed6",
      StudyAchievements: "0xb70a8e8e36077B95a87047b084A869473DB09846", 
      StudyStaking: "0xF4bF0776790FA56ea60387F799665276f5417E09",
      StudySubscription: "0x2C1524d83daDd2Cf51C8C1e1D087333581c4dDCC",
      StudyTokenShop: "0x0f3E353B65eFEe59551fEa9689B77C74C1E7423c",
      SessionManager: "0xBb87f967c583584E8FAB264B14aC090C18258bc2",
      // Base Names contracts
      BaseNamesRegistrarController: "0x4cCb0BB02FCABA27e82a56646E81d8c5bC4119a5",
      BaseNamesL2Resolver: "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD",
    },
};

// Contract ABIs (simplified - you'll need the full ABIs from compilation)
// Import the actual ABIs from compiled artifacts
import StudyTokenArtifact from '../artifacts/contracts/StudyToken.sol/StudyToken.json';
import StudyAchievementsArtifact from '../artifacts/contracts/StudyAchievements.sol/StudyAchievements.json';
import StudyStakingArtifact from '../artifacts/contracts/StudyStaking.sol/StudyStaking.json';
import StudySubscriptionArtifact from '../artifacts/contracts/StudySubscription.sol/StudySubscription.json';
import StudyTokenShopArtifact from '../artifacts/contracts/StudyTokenShop.sol/StudyTokenShop.json';
import SessionManagerArtifact from '../artifacts/contracts/SessionManager.sol/SessionManager.json';

export const CONTRACT_ABIS = {
  StudyToken: StudyTokenArtifact.abi,
  StudyAchievements: StudyAchievementsArtifact.abi,
  StudyStaking: StudyStakingArtifact.abi,
  StudySubscription: StudySubscriptionArtifact.abi,
  StudyTokenShop: StudyTokenShopArtifact.abi,
  SessionManager: SessionManagerArtifact.abi,
};

// Network configurations
export const NETWORKS = {
  baseSepolia: {
    chainId: 84532,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
  },
};

// Helper function to get contract address for current network
export function getContractAddress(contractName: keyof typeof CONTRACT_ADDRESSES.baseSepolia) {
  // For now, return Base Sepolia addresses
  // In production, you'd determine the network and return appropriate addresses
  return CONTRACT_ADDRESSES.baseSepolia[contractName];
}

// Contract interaction helpers
export const CONTRACT_FUNCTIONS = {
  // StudyToken functions
  mintStudyReward: "mintStudyReward",
  claimStudyTimeReward: "claimStudyTimeReward",
  purchasePremiumSubscription: "purchasePremiumSubscription",
  p2pConversion: "p2pConversion",
  
  // StudyAchievements functions
  mintSessionCompletion: "mintSessionCompletion",
  mintStudyMilestone: "mintStudyMilestone",
  mintBNSCredential: "mintBNSCredential",
  mintLearningPath: "mintLearningPath",
  
  // StudyStaking functions
  stake: "stake",
  unstake: "unstake",
  claimRewards: "claimRewards",
  
  // StudySubscription functions
  purchasePremiumMonthly: "purchasePremiumMonthly",
  purchasePremiumYearly: "purchasePremiumYearly",
  renewSubscription: "renewSubscription",
};

// Achievement types enum (matches contract)
export enum AchievementType {
  SESSION_COMPLETION = 0,
  STUDY_MILESTONE = 1,
  BNS_CREDENTIAL = 2,
  LEARNING_PATH = 3,
  COMMUNITY_CONTRIBUTOR = 4,
}

// Subscription tiers enum (matches contract)
export enum SubscriptionTier {
  FREE = 0,
  PREMIUM_MONTHLY = 1,
  PREMIUM_YEARLY = 2,
}

// Staking pool IDs
export const STAKING_POOLS = {
  SHORT_TERM: 0, // 7 days, 12% APY
  MEDIUM_TERM: 1, // 30 days, 15% APY
  LONG_TERM: 2, // 90 days, 20% APY
} as const;

