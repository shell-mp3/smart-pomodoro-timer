import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext({})

export function useNotification() {
  return useContext(NotificationContext)
}

const NOTIFICATION_STYLES = {
  success: {
    bg: 'bg-accent-green/10',
    border: 'border-accent-green/50',
    icon: 'text-accent-green'
  },
  error: {
    bg: 'bg-accent-red/10',
    border: 'border-accent-red/50',
    icon: 'text-accent-red'
  },
  warning: {
    bg: 'bg-accent-orange/10',
    border: 'border-accent-orange/50',
    icon: 'text-accent-orange'
  },
  info: {
    bg: 'bg-accent-blue/10',
    border: 'border-accent-blue/50',
    icon: 'text-accent-blue'
  }
}

const ICONS = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const notify = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = Date.now() + Math.random()

    setNotifications(prev => [...prev, { id, type, message }])

    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, duration)
    }

    return id
  }, [])

  const dismiss = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider value={{ notify, dismiss, dismissAll }}>
      {children}
      <NotificationContainer notifications={notifications} onDismiss={dismiss} />
    </NotificationContext.Provider>
  )
}

function NotificationContainer({ notifications, onDismiss }) {
  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={() => onDismiss(notification.id)}
        />
      ))}
    </div>
  )
}

function NotificationToast({ notification, onDismiss }) {
  const { type, message } = notification
  const styles = NOTIFICATION_STYLES[type] || NOTIFICATION_STYLES.info

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm
        ${styles.bg} ${styles.border}
      `}
      style={{
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <span className={styles.icon}>{ICONS[type]}</span>
      <p className="flex-1 text-sm text-white">{message}</p>
      <button
        onClick={onDismiss}
        className="text-dark-400 hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
