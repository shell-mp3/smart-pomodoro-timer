const STATUS_STYLES = {
  focused: {
    bg: 'bg-accent-green/20',
    border: 'border-accent-green/50',
    text: 'text-accent-green',
    dot: 'bg-accent-green'
  },
  distracted: {
    bg: 'bg-accent-red/20',
    border: 'border-accent-red/50',
    text: 'text-accent-red',
    dot: 'bg-accent-red'
  },
  idle: {
    bg: 'bg-dark-600/50',
    border: 'border-dark-500',
    text: 'text-dark-300',
    dot: 'bg-dark-400'
  },
  loading: {
    bg: 'bg-accent-blue/20',
    border: 'border-accent-blue/50',
    text: 'text-accent-blue',
    dot: 'bg-accent-blue'
  },
  warning: {
    bg: 'bg-accent-orange/20',
    border: 'border-accent-orange/50',
    text: 'text-accent-orange',
    dot: 'bg-accent-orange'
  }
}

export default function StatusBadge({ status = 'idle', text, showDot = true, className = '' }) {
  const styles = STATUS_STYLES[status] || STATUS_STYLES.idle

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2 py-1 rounded-full
        ${styles.bg} ${styles.border} border backdrop-blur-sm
        ${className}
      `}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${styles.dot} ${
            status === 'focused' ? 'animate-pulse' : ''
          }`}
        />
      )}
      <span className={`text-xs font-medium ${styles.text}`}>
        {text}
      </span>
    </div>
  )
}
