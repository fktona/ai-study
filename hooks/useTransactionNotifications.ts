import { useState, useEffect } from 'react'

interface TransactionNotification {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  hash?: string
  timestamp: Date
}

export const useTransactionNotifications = () => {
  const [notifications, setNotifications] = useState<TransactionNotification[]>([])

  const addNotification = (notification: Omit<TransactionNotification, 'id' | 'timestamp'>) => {
    const newNotification: TransactionNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    
    setNotifications(prev => [...prev, newNotification])
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      removeNotification(newNotification.id)
    }, 10000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  // Add notification for successful transactions
  const notifySuccess = (title: string, message: string, hash?: string) => {
    addNotification({
      type: 'success',
      title,
      message,
      hash,
    })
  }

  // Add notification for failed transactions
  const notifyError = (title: string, message: string) => {
    addNotification({
      type: 'error',
      title,
      message,
    })
  }

  // Add notification for info/status updates
  const notifyInfo = (title: string, message: string) => {
    addNotification({
      type: 'info',
      title,
      message,
    })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    notifySuccess,
    notifyError,
    notifyInfo,
  }
}
