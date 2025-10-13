import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, AchievementType } from '../lib/contracts'

const StudyAchievementsABI = CONTRACT_ABIS.StudyAchievements

export const useStudyAchievements = () => {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Read contract functions
  const { data: name } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudyAchievements as `0x${string}`,
    abi: StudyAchievementsABI,
    functionName: 'name',
  })

  const { data: symbol } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudyAchievements as `0x${string}`,
    abi: StudyAchievementsABI,
    functionName: 'symbol',
  })

  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudyAchievements as `0x${string}`,
    abi: StudyAchievementsABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const { data: totalAchievements } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudyAchievements as `0x${string}`,
    abi: StudyAchievementsABI,
    functionName: 'getTotalAchievements',
    args: address ? [address] : undefined,
  })

  // Get achievements by type
  const getAchievementsByType = (achievementType: AchievementType) => {
    const { data } = useReadContract({
      address: CONTRACT_ADDRESSES.baseSepolia.StudyAchievements as `0x${string}`,
      abi: StudyAchievementsABI,
      functionName: 'getAchievementsByType',
      args: address ? [address, BigInt(achievementType)] : undefined,
    })
    return data || []
  }

  // Mint session completion achievement
  const mintSessionCompletion = async (recipient: string, sessionTitle: string, sessionDescription: string) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.StudyAchievements as `0x${string}`,
        abi: StudyAchievementsABI,
        functionName: 'mintSessionCompletion',
        args: [recipient as `0x${string}`, sessionTitle, sessionDescription],
      })
    } catch (err) {
      console.error('Error minting session completion achievement:', err)
      throw err
    }
  }

  // Mint study milestone achievement
  const mintStudyMilestone = async (recipient: string, milestoneTitle: string, milestoneDescription: string) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.StudyAchievements as `0x${string}`,
        abi: StudyAchievementsABI,
        functionName: 'mintStudyMilestone',
        args: [recipient as `0x${string}`, milestoneTitle, milestoneDescription],
      })
    } catch (err) {
      console.error('Error minting study milestone achievement:', err)
      throw err
    }
  }

  // Mint BNS credential achievement
  const mintBNSCredential = async (recipient: string, bnsName: string, bnsDescription: string) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.StudyAchievements as `0x${string}`,
        abi: StudyAchievementsABI,
        functionName: 'mintBNSCredential',
        args: [recipient as `0x${string}`, bnsName, bnsDescription],
      })
    } catch (err) {
      console.error('Error minting BNS credential achievement:', err)
      throw err
    }
  }

  // Mint learning path achievement
  const mintLearningPath = async (recipient: string, pathTitle: string, pathDescription: string) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.StudyAchievements as `0x${string}`,
        abi: StudyAchievementsABI,
        functionName: 'mintLearningPath',
        args: [recipient as `0x${string}`, pathTitle, pathDescription],
      })
    } catch (err) {
      console.error('Error minting learning path achievement:', err)
      throw err
    }
  }

  // Mint community contributor achievement
  const mintCommunityContributor = async (recipient: string, contributorTitle: string, contributorDescription: string) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.StudyAchievements as `0x${string}`,
        abi: StudyAchievementsABI,
        functionName: 'mintCommunityContributor',
        args: [recipient as `0x${string}`, contributorTitle, contributorDescription],
      })
    } catch (err) {
      console.error('Error minting community contributor achievement:', err)
      throw err
    }
  }

  return {
    // Data
    name: name || 'Study Achievements',
    symbol: symbol || 'ACHIEVE',
    balance: balance ? balance.toString() : '0',
    totalAchievements: totalAchievements ? Number(totalAchievements) : 0,
    
    // Functions
    getAchievementsByType,
    mintSessionCompletion,
    mintStudyMilestone,
    mintBNSCredential,
    mintLearningPath,
    mintCommunityContributor,
    
    // Transaction state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}
