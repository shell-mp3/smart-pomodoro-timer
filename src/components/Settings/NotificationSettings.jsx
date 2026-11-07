export default function NotificationSettings({ soundEnabled, onSoundEnabledChange }) {
  return (
    <section className="card">
      <h2 className="text-xl font-semibold mb-6">Notifications</h2>

      <div className="space-y-4">
        {/* Sound Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Sound Notifications</p>
            <p className="text-sm text-dark-400">Play a sound when sessions complete</p>
          </div>
          <button
            onClick={() => onSoundEnabledChange(!soundEnabled)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full
              transition-colors duration-200
              ${soundEnabled ? 'bg-accent-green' : 'bg-dark-600'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Browser Notification Permission */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Browser Notifications</p>
            <p className="text-sm text-dark-400">Get notified even when tab is inactive</p>
          </div>
          <BrowserNotificationButton />
        </div>
      </div>
    </section>
  )
}

function BrowserNotificationButton() {
  const permission = typeof Notification !== 'undefined' ? Notification.permission : 'denied'

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') {
      alert('Browser notifications are not supported')
      return
    }

    const result = await Notification.requestPermission()
    if (result === 'granted') {
      new Notification('Pomodoro Timer', {
        body: 'Notifications enabled!',
        icon: `${import.meta.env.BASE_URL}favicon.svg`
      })
    }
  }

  if (permission === 'granted') {
    return (
      <span className="flex items-center gap-2 text-accent-green text-sm">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Enabled
      </span>
    )
  }

  if (permission === 'denied') {
    return (
      <span className="text-dark-400 text-sm">
        Blocked in browser settings
      </span>
    )
  }

  return (
    <button
      onClick={requestPermission}
      className="text-sm text-accent-blue hover:underline"
    >
      Enable
    </button>
  )
}
