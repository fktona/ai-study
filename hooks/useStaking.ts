import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ABIS, CONTRACT_ADDRESSES } from '../lib/contracts'
import { parseEther, formatEther } from 'viem'
import { useStudyToken } from './useStudyToken'

const StakingABI = CONTRACT_ABIS.StudyStaking
export const STAKING_POOLS = {
  SHORT_TERM: 0, // 7 days, 12% APY
  MEDIUM_TERM: 1, // 30 days, 15% APY
  LONG_TERM: 2, // 90 days, 20% APY
} as const

export const useStaking = () => {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { approve, stakingAllowance } = useStudyToken()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Get user's stake in each pool
  const { data: shortTermStake } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudyStaking as `0x${string}`,
    abi: StakingABI,
    functionName: 'getUserStake',
    args: address ? [address, BigInt(STAKING_POOLS.SHORT_TERM)] : undefined,
  })

  const { data: mediumTermStake } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudyStaking as `0x${string}`,
    abi: StakingABI,
    functionName: 'getUserStake',
    args: address ? [address, BigInt(STAKING_POOLS.MEDIUM_TERM)] : undefined,
  })

  const { data: longTermStake } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudyStaking as `0x${string}`,
    abi: StakingABI,
    functionName: 'getUserStake',
    args: address ? [address, BigInt(STAKING_POOLS.LONG_TERM)] : undefined,
  })

  // Get pending rewards for each pool
  const { data: shortTermRewards } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudyStaking as `0x${string}`,
    abi: StakingABI,
    functionName: 'getPendingRewards',
    args: address ? [address, BigInt(STAKING_POOLS.SHORT_TERM)] : undefined,
  })

  const { data: mediumTermRewards } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudyStaking as `0x${string}`,
    abi: StakingABI,
    functionName: 'getPendingRewards',
    args: address ? [address, BigInt(STAKING_POOLS.MEDIUM_TERM)] : undefined,
  })

  const { data: longTermRewards } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudyStaking as `0x${string}`,
    abi: StakingABI,
    functionName: 'getPendingRewards',
    args: address ? [address, BigInt(STAKING_POOLS.LONG_TERM)] : undefined,
  })

  // Get pool information
  const { data: shortTermPoolInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudyStaking as `0x${string}`,
    abi: StakingABI,
    functionName: 'getPoolInfo',
    args: [BigInt(STAKING_POOLS.SHORT_TERM)],
  })

  const { data: mediumTermPoolInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudyStaking as `0x${string}`,
    abi: StakingABI,
    functionName: 'getPoolInfo',
    args: [BigInt(STAKING_POOLS.MEDIUM_TERM)],
  })

  const { data: longTermPoolInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudyStaking as `0x${string}`,
    abi: StakingABI,
    functionName: 'getPoolInfo',
    args: [BigInt(STAKING_POOLS.LONG_TERM)],
  })

  // Stake tokens
  const stake = async (poolId: number, amount: string) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.StudyStaking as `0x${string}`,
        abi: StakingABI,
        functionName: 'stake',
        args: [BigInt(poolId), parseEther(amount)],
      })
    } catch (err) {
      console.error('Error staking tokens:', err)
      throw err
    }
  }

  // Approve and stake tokens (handles approval automatically)
  const approveAndStake = async (poolId: number, amount: string) => {
    try {
      const currentAllowance = parseFloat(stakingAllowance || '0')
      const stakeAmount = parseFloat(amount)
      
      // Check if we need to approve more tokens
      if (currentAllowance < stakeAmount) {
        console.log('Approving staking contract for', amount, 'STUDY tokens...')
        await approve(CONTRACT_ADDRESSES.baseSepolia.StudyStaking, amount)
        // Wait a bit for the approval to be processed
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
      // Now stake the tokens
      await stake(poolId, amount)
    } catch (err) {
      console.error('Error approving and staking tokens:', err)
      throw err
    }
  }

  // Unstake tokens
  const unstake = async (poolId: number, amount: string) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.StudyStaking as `0x${string}`,
        abi: StakingABI,
        functionName: 'unstake',
        args: [BigInt(poolId), parseEther(amount)],
      })
    } catch (err) {
      console.error('Error unstaking tokens:', err)
      throw err
    }
  }

  // Claim rewards
  const claimRewards = async (poolId: number) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.StudyStaking as `0x${string}`,
        abi: StakingABI,
        functionName: 'claimRewards',
        args: [BigInt(poolId)],
      })
    } catch (err) {
      console.error('Error claiming rewards:', err)
      throw err
    }
  }

  // Calculate APY for each pool
  const calculateAPY = (poolInfo: any) => {
    if (!poolInfo) return 0
    const annualRate = Number(poolInfo.rewardRate) * 365 * 24 * 3600
    return Math.round((annualRate / 1e18) * 100) // Convert to percentage
  }

  return {
    // Stake data
    stakes: {
      shortTerm: shortTermStake ? {
        amount: formatEther(shortTermStake.amount),
        lastStakeTime: shortTermStake.lastStakeTime,
        totalRewardsClaimed: formatEther(shortTermStake.totalRewardsClaimed),
      } : null,
      mediumTerm: mediumTermStake ? {
        amount: formatEther(mediumTermStake.amount),
        lastStakeTime: mediumTermStake.lastStakeTime,
        totalRewardsClaimed: formatEther(mediumTermStake.totalRewardsClaimed),
      } : null,
      longTerm: longTermStake ? {
        amount: formatEther(longTermStake.amount),
        lastStakeTime: longTermStake.lastStakeTime,
        totalRewardsClaimed: formatEther(longTermStake.totalRewardsClaimed),
      } : null,
    },
    
    // Pending rewards
    pendingRewards: {
      shortTerm: shortTermRewards ? formatEther(shortTermRewards) : '0',
      mediumTerm: mediumTermRewards ? formatEther(mediumTermRewards) : '0',
      longTerm: longTermRewards ? formatEther(longTermRewards) : '0',
    },
    
    // Pool information
    poolInfo: {
      shortTerm: shortTermPoolInfo ? {
        totalStaked: formatEther(shortTermPoolInfo.totalStaked),
        apy: calculateAPY(shortTermPoolInfo),
        isActive: shortTermPoolInfo.isActive,
      } : null,
      mediumTerm: mediumTermPoolInfo ? {
        totalStaked: formatEther(mediumTermPoolInfo.totalStaked),
        apy: calculateAPY(mediumTermPoolInfo),
        isActive: mediumTermPoolInfo.isActive,
      } : null,
      longTerm: longTermPoolInfo ? {
        totalStaked: formatEther(longTermPoolInfo.totalStaked),
        apy: calculateAPY(longTermPoolInfo),
        isActive: longTermPoolInfo.isActive,
      } : null,
    },
    
    // Actions
    stake,
    approveAndStake,
    unstake,
    claimRewards,
    
    // Transaction state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}
