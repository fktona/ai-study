import React from 'react'
import { CheckCircle, AlertCircle, Info, X, ExternalLink } from 'lucide-react'

interface NotificationToastProps {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  hash?: string
  onClose: (id: string) => void
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  id,
  type,
  title,
  message,
  hash,
  onClose
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'info':
        return 'text-blue-800'
      default:
        return 'text-blue-800'
    }
  }

  return (
    <div className={`max-w-sm w-full ${getBackgroundColor()} border rounded-lg shadow-lg p-4 animate-slide-in-right`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${getTextColor()}`}>
            {title}
          </p>
          <p className={`text-xs mt-1 ${getTextColor()} opacity-80`}>
            {message}
          </p>
          {hash && (
            <a
              href={`https://sepolia.basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 mt-2 text-xs ${getTextColor()} opacity-80 hover:opacity-100 underline`}
            >
              <ExternalLink className="w-3 h-3" />
              View Transaction
            </a>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className={`p-1 rounded-full hover:bg-black/10 transition-colors ${getTextColor()} opacity-60 hover:opacity-100`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default NotificationToast
