import { useState, useEffect, useCallback, useRef } from 'react'
import { useSessionManager } from './useSessionManager'
import { useStudyToken } from './useStudyToken'

interface SessionData {
  sessionId: number
  topic: string
  content: string
  startTime: Date
  lastEngagement: Date
  engagementCount: number
  isActive: boolean
}

export const useSessionTracking = () => {
  const { startSession, recordEngagement, completeSession, abandonSession } = useSessionManager()
  const { claimStudyTimeReward, consecutiveDays, sessionStats } = useStudyToken()
  
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null)
  const [engagementTimer, setEngagementTimer] = useState<NodeJS.Timeout | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [engagementCount, setEngagementCount] = useState(0)
  const [isEngagementRequired, setIsEngagementRequired] = useState(false)
  const [nextEngagementTime, setNextEngagementTime] = useState<Date | null>(null)

  const engagementIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Start a new study session
  const startNewSession = useCallback(async (topic: string, content: string) => {
    try {
      await startSession(topic, content)
      const sessionId = Date.now() // This would be the actual session ID from the contract
      
      const newSession: SessionData = {
        sessionId,
        topic,
        content,
        startTime: new Date(),
        lastEngagement: new Date(),
        engagementCount: 0,
        isActive: true,
      }
      
      setCurrentSession(newSession)
      setSessionStartTime(new Date())
      setEngagementCount(0)
      setIsEngagementRequired(false)
      
      // Start engagement monitoring
      startEngagementMonitoring()
      
      return sessionId
    } catch (error) {
      console.error('Error starting session:', error)
      throw error
    }
  }, [startSession])

  // Start engagement monitoring (every 5 minutes)
  const startEngagementMonitoring = useCallback(() => {
    if (engagementIntervalRef.current) {
      clearInterval(engagementIntervalRef.current)
    }
    
    engagementIntervalRef.current = setInterval(() => {
      setIsEngagementRequired(true)
      setNextEngagementTime(new Date(Date.now() + 5 * 60 * 1000)) // 5 minutes from now
    }, 5 * 60 * 1000) // Check every 5 minutes
  }, [])

  // Record user engagement
  const recordUserEngagement = useCallback(async () => {
    if (!currentSession) return
    
    try {
      await recordEngagement(currentSession.sessionId)
      
      setCurrentSession(prev => prev ? {
        ...prev,
        lastEngagement: new Date(),
        engagementCount: prev.engagementCount + 1
      } : null)
      
      setEngagementCount(prev => prev + 1)
      setIsEngagementRequired(false)
      setNextEngagementTime(null)
    } catch (error) {
      console.error('Error recording engagement:', error)
    }
  }, [currentSession, recordEngagement])

  // Complete the current session
  const completeCurrentSession = useCallback(async (quizScore: number = 0) => {
    if (!currentSession || !sessionStartTime) return
    
    try {
      const studyTimeSeconds = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)
      
      // Check if minimum 20 minutes completed
      if (studyTimeSeconds < 1200) {
        throw new Error('Session must be at least 20 minutes long')
      }
      
      // Check if enough engagement (at least 4 interactions in 20+ minutes)
      if (engagementCount < 4) {
        throw new Error('Insufficient engagement. Need at least 4 interactions.')
      }
      
      await completeSession(currentSession.sessionId, quizScore)
      
      // Claim study time reward
      const isPremium = false // You can determine this from subscription status
      await claimStudyTimeReward(studyTimeSeconds, isPremium)
      
      // Reset session state
      setCurrentSession(null)
      setSessionStartTime(null)
      setEngagementCount(0)
      setIsEngagementRequired(false)
      setNextEngagementTime(null)
      
      // Stop engagement monitoring
      if (engagementIntervalRef.current) {
        clearInterval(engagementIntervalRef.current)
        engagementIntervalRef.current = null
      }
      
      return {
        sessionId: currentSession.sessionId,
        studyTime: studyTimeSeconds,
        engagementCount,
        quizScore,
        rewards: calculateRewards(studyTimeSeconds, engagementCount, quizScore, consecutiveDays)
      }
    } catch (error) {
      console.error('Error completing session:', error)
      throw error
    }
  }, [currentSession, sessionStartTime, engagementCount, completeSession, claimStudyTimeReward, consecutiveDays])

  // Abandon the current session
  const abandonCurrentSession = useCallback(async () => {
    if (!currentSession) return
    
    try {
      await abandonSession(currentSession.sessionId)
      
      // Reset session state
      setCurrentSession(null)
      setSessionStartTime(null)
      setEngagementCount(0)
      setIsEngagementRequired(false)
      setNextEngagementTime(null)
      
      // Stop engagement monitoring
      if (engagementIntervalRef.current) {
        clearInterval(engagementIntervalRef.current)
        engagementIntervalRef.current = null
      }
    } catch (error) {
      console.error('Error abandoning session:', error)
    }
  }, [currentSession, abandonSession])

  // Calculate rewards based on session performance
  const calculateRewards = useCallback((studyTimeSeconds: number, engagementCount: number, quizScore: number, consecutiveDays: number) => {
    const baseReward = 10 // 10 tokens for session completion
    const engagementBonus = Math.min(engagementCount - 4, 6) * 1 // 1 token per extra engagement (max 6)
    const quizBonus = quizScore >= 70 ? 5 : 0 // 5 tokens for passing quiz
    const consecutiveBonus = consecutiveDays * 2 // 2 tokens per consecutive day
    const timeBonus = Math.floor(studyTimeSeconds / 3600) * 2 // 2 tokens per hour
    
    return {
      baseReward,
      engagementBonus,
      quizBonus,
      consecutiveBonus,
      timeBonus,
      total: baseReward + engagementBonus + quizBonus + consecutiveBonus + timeBonus
    }
  }, [])

  // Get session progress
  const getSessionProgress = useCallback(() => {
    if (!sessionStartTime) return { progress: 0, timeRemaining: 0, isValid: false }
    
    const elapsed = Date.now() - sessionStartTime.getTime()
    const progress = Math.min(elapsed / (20 * 60 * 1000), 1) // 20 minutes target
    const timeRemaining = Math.max(20 * 60 * 1000 - elapsed, 0)
    const isValid = elapsed >= 20 * 60 * 1000 && engagementCount >= 4
    
    return {
      progress: Math.round(progress * 100),
      timeRemaining: Math.floor(timeRemaining / 1000),
      isValid,
      elapsed: Math.floor(elapsed / 1000)
    }
  }, [sessionStartTime, engagementCount])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (engagementIntervalRef.current) {
        clearInterval(engagementIntervalRef.current)
      }
    }
  }, [])

  return {
    // Session state
    currentSession,
    sessionStartTime,
    engagementCount,
    isEngagementRequired,
    nextEngagementTime,
    consecutiveDays,
    sessionStats,
    
    // Actions
    startNewSession,
    recordUserEngagement,
    completeCurrentSession,
    abandonCurrentSession,
    
    // Utilities
    getSessionProgress,
    calculateRewards,
  }
}
