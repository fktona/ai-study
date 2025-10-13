import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ABIS, CONTRACT_ADDRESSES } from '../lib/contracts'

const SessionManagerABI = CONTRACT_ABIS.SessionManager

export const useSessionManager = () => {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Get user's active sessions
  const { data: activeSessions } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.SessionManager as `0x${string}`,
    abi: SessionManagerABI,
    functionName: 'getActiveSessions',
    args: address ? [address] : undefined,
  })

  // Get user's session statistics
  const { data: sessionStats } = useReadContract({
    address: CONTRACT_ADDRESSES.baseSepolia.SessionManager as `0x${string}`,
    abi: SessionManagerABI,
    functionName: 'getUserSessionStats',
    args: address ? [address] : undefined,
  })

  // Start a new study session
  const startSession = async (topic: string, content: string) => {
    if (!address) return
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.SessionManager as `0x${string}`,
        abi: SessionManagerABI,
        functionName: 'startSession',
        args: [address, topic, content],
      })
    } catch (err) {
      console.error('Error starting session:', err)
      throw err
    }
  }

  // Record user engagement during session
  const recordEngagement = async (sessionId: number) => {
    if (!address) return
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.SessionManager as `0x${string}`,
        abi: SessionManagerABI,
        functionName: 'recordEngagement',
        args: [BigInt(sessionId), address],
      })
    } catch (err) {
      console.error('Error recording engagement:', err)
      throw err
    }
  }

  // Complete a study session
  const completeSession = async (sessionId: number, quizScore: number) => {
    if (!address) return
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.SessionManager as `0x${string}`,
        abi: SessionManagerABI,
        functionName: 'completeSession',
        args: [BigInt(sessionId), address, BigInt(quizScore)],
      })
    } catch (err) {
      console.error('Error completing session:', err)
      throw err
    }
  }

  // Abandon a session
  const abandonSession = async (sessionId: number) => {
    if (!address) return
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.baseSepolia.SessionManager as `0x${string}`,
        abi: SessionManagerABI,
        functionName: 'abandonSession',
        args: [BigInt(sessionId), address],
      })
    } catch (err) {
      console.error('Error abandoning session:', err)
      throw err
    }
  }

  return {
    // Data
    activeSessions: activeSessions || [],
    sessionStats: sessionStats || { totalSessions: 0, completedSessions: 0, quizPassedSessions: 0, totalStudyTime: 0 },
    
    // Actions
    startSession,
    recordEngagement,
    completeSession,
    abandonSession,
    
    // Transaction state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}
