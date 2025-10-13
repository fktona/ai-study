import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../lib/contracts'
import { parseEther, formatEther } from 'viem'

export const useStudyToken = () => {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Read user balance
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudyToken as `0x${string}`,
    abi: CONTRACT_ABIS.StudyToken,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Read user's study rewards
  const { data: studyRewards } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudyToken as `0x${string}`,
    abi: CONTRACT_ABIS.StudyToken,
    functionName: 'getUserStudyRewards',
    args: address ? [address] : undefined,
  })

  // Read consecutive days
  const { data: consecutiveDays } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudyToken as `0x${string}`,
    abi: CONTRACT_ABIS.StudyToken,
    functionName: 'getUserConsecutiveDays',
    args: address ? [address] : undefined,
  })

  // Read session statistics
  const { data: sessionStats } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudyToken as `0x${string}`,
    abi: CONTRACT_ABIS.StudyToken,
    functionName: 'getUserSessionStats',
    args: address ? [address] : undefined,
  })

  // Claim study time reward
  const claimStudyTimeReward = async (studyTimeSeconds: number, isPremium: boolean) => {
    if (!address) return
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.StudyToken as `0x${string}`,
        abi: CONTRACT_ABIS.StudyToken,
        functionName: 'claimStudyTimeReward',
        args: [address, BigInt(studyTimeSeconds), isPremium],
      })
    } catch (err) {
      console.error('Error claiming study time reward:', err)
      throw err
    }
  }

  // Mint study reward (admin function)
  const mintStudyReward = async (to: string, amount: string) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.StudyToken as `0x${string}`,
        abi: CONTRACT_ABIS.StudyToken,
        functionName: 'mintStudyReward',
        args: [to as `0x${string}`, parseEther(amount)],
      })
    } catch (err) {
      console.error('Error minting study reward:', err)
      throw err
    }
  }

  // Purchase premium subscription
  const purchasePremiumSubscription = async () => {
    if (!address) return
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.StudyToken as `0x${string}`,
        abi: CONTRACT_ABIS.StudyToken,
        functionName: 'purchasePremiumSubscription',
        args: [address],
      })
    } catch (err) {
      console.error('Error purchasing premium subscription:', err)
      throw err
    }
  }

  // P2P conversion
  const p2pConversion = async (to: string, amount: string) => {
    if (!address) return
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.StudyToken as `0x${string}`,
        abi: CONTRACT_ABIS.StudyToken,
        functionName: 'p2pConversion',
        args: [address, to as `0x${string}`, parseEther(amount)],
      })
    } catch (err) {
      console.error('Error converting tokens:', err)
      throw err
    }
  }

  // Approve spender to spend tokens
  const approve = async (spender: string, amount: string) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.StudyToken as `0x${string}`,
        abi: CONTRACT_ABIS.StudyToken,
        functionName: 'approve',
        args: [spender as `0x${string}`, parseEther(amount)],
      })
    } catch (err) {
      console.error('Error approving tokens:', err)
      throw err
    }
  }

  // Check allowance for staking contract
  const { data: stakingAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudyToken as `0x${string}`,
    abi: CONTRACT_ABIS.StudyToken,
    functionName: 'allowance',
    args: address ? [address, CONTRACT_ADDRESSES.baseSepolia.StudyStaking as `0x${string}`] : undefined,
  })

  return {
    // Data
    balance: balance ? formatEther(balance) : '0',
    studyRewards: studyRewards ? formatEther(studyRewards) : '0',
    consecutiveDays: consecutiveDays ? Number(consecutiveDays) : 0,
    sessionStats: sessionStats || { totalSessions: 0, completedSessions: 0, quizPassedSessions: 0 },
    stakingAllowance: stakingAllowance ? formatEther(stakingAllowance) : '0',
    
    // Actions
    claimStudyTimeReward,
    mintStudyReward,
    purchasePremiumSubscription,
    p2pConversion,
    approve,
    
    // Transaction state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}
