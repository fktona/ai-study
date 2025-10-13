import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES } from '../lib/contracts'
import { parseEther, formatEther } from 'viem'

const SubscriptionABI = [
  "function subscribe()",
  "function renewSubscription()",
  "function cancelSubscription()",
  "function getSubscription(address user) view returns (tuple(bool isActive, uint256 startTime, uint256 endTime, uint256 price, bool autoRenew))",
  "function getSubscriptionPrice() view returns (uint256)",
  "function getSubscriptionDuration() view returns (uint256)",
  "event SubscriptionCreated(address indexed user, uint256 startTime, uint256 endTime, uint256 price)",
  "event SubscriptionRenewed(address indexed user, uint256 startTime, uint256 endTime)",
  "event SubscriptionCancelled(address indexed user, uint256 timestamp)",
] as const

export const useSubscription = () => {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Get user's subscription status
  const { data: subscription } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudySubscription as `0x${string}`,
    abi: SubscriptionABI,
    functionName: 'getSubscription',
    args: address ? [address] : undefined,
  })

  // Get subscription price
  const { data: subscriptionPrice } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudySubscription as `0x${string}`,
    abi: SubscriptionABI,
    functionName: 'getSubscriptionPrice',
  })

  // Get subscription duration
  const { data: subscriptionDuration } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.StudySubscription as `0x${string}`,
    abi: SubscriptionABI,
    functionName: 'getSubscriptionDuration',
  })

  // Subscribe to premium
  const subscribe = async () => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.StudySubscription as `0x${string}`,
        abi: SubscriptionABI,
        functionName: 'subscribe',
      })
    } catch (err) {
      console.error('Error subscribing:', err)
      throw err
    }
  }

  // Renew subscription
  const renewSubscription = async () => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.StudySubscription as `0x${string}`,
        abi: SubscriptionABI,
        functionName: 'renewSubscription',
      })
    } catch (err) {
      console.error('Error renewing subscription:', err)
      throw err
    }
  }

  // Cancel subscription
  const cancelSubscription = async () => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.StudySubscription as `0x${string}`,
        abi: SubscriptionABI,
        functionName: 'cancelSubscription',
      })
    } catch (err) {
      console.error('Error cancelling subscription:', err)
      throw err
    }
  }

  // Check if subscription is active
  const isSubscriptionActive = () => {
    if (!subscription) return false
    return subscription.isActive && Date.now() / 1000 < Number(subscription.endTime)
  }

  // Get subscription time remaining
  const getSubscriptionTimeRemaining = () => {
    if (!subscription || !subscription.isActive) return 0
    const now = Date.now() / 1000
    const endTime = Number(subscription.endTime)
    return Math.max(0, endTime - now)
  }

  // Format subscription time remaining
  const formatTimeRemaining = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return {
    // Subscription data
    subscription: subscription ? {
      isActive: subscription.isActive,
      startTime: new Date(Number(subscription.startTime) * 1000),
      endTime: new Date(Number(subscription.endTime) * 1000),
      price: formatEther(subscription.price),
      autoRenew: subscription.autoRenew,
    } : null,
    
    subscriptionPrice: subscriptionPrice ? formatEther(subscriptionPrice) : '0',
    subscriptionDuration: subscriptionDuration ? Number(subscriptionDuration) : 0,
    
    // Computed values
    isActive: isSubscriptionActive(),
    timeRemaining: getSubscriptionTimeRemaining(),
    timeRemainingFormatted: formatTimeRemaining(getSubscriptionTimeRemaining()),
    
    // Actions
    subscribe,
    renewSubscription,
    cancelSubscription,
    
    // Transaction state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}
