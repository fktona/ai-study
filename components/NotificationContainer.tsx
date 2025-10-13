import React from 'react'
import { useTransactionNotifications } from '../hooks/useTransactionNotifications'
import NotificationToast from './NotificationToast'

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useTransactionNotifications()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          id={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          hash={notification.hash}
          onClose={removeNotification}
        />
      ))}
    </div>
  )
}

export default NotificationContainer
