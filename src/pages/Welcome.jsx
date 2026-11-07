import { useNavigate } from 'react-router-dom'
import { markWelcomeSeen } from '../utils/welcome'
import Tomato from '../components/UI/Tomato'

const features = [
  {
    icon: TimerIcon,
    color: 'text-accent-green',
    title: 'Pomodoro, your way',
    description: '25 minutes of work, then a break. Every duration is adjustable.'
  },
  {
    icon: EyeIcon,
    color: 'text-accent-red',
    title: 'It notices when you drift',
    description: 'Look away, shut your eyes or turn your head and the timer pauses, then picks up where it left off.'
  },
  {
    icon: ChartIcon,
    color: 'text-dark-200',
    title: 'See where the time went',
    description: 'Focused minutes, streaks, and what distracted you most.'
  }
]

export default function Welcome() {
  const navigate = useNavigate()

  const handleStart = () => {
    markWelcomeSeen()
    navigate('/')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-14 px-5">
      <div className="max-w-3xl w-full">
        {/* Hero */}
        <div className="text-center">
          <Tomato className="w-14 h-14 mx-auto mb-6 drop-shadow-[0_8px_24px_rgba(255,69,58,0.3)]" />

          <h1 className="text-4xl sm:text-[2.75rem] font-semibold tracking-tight leading-[1.1] mb-4">
            Welcome to{' '}
            <span className="text-gradient">Pomodoro Timer</span>
          </h1>

          <p className="text-[15px] leading-relaxed text-dark-200 max-w-sm mx-auto">
            A timer that only counts the time you are actually focused. Your camera
            tells it when your attention has drifted, and it pauses until you are back.
          </p>
        </div>

        {/* Features */}
        <div className="mt-10 grid gap-px sm:grid-cols-3 rounded-xl overflow-hidden bg-dark-600 border border-dark-600">
          {features.map(({ icon: Icon, color, title, description }) => (
            <div
              key={title}
              className="bg-dark-800 p-5 transition-colors duration-200 hover:bg-dark-700"
            >
              <div className="w-8 h-8 mb-4 rounded-md border border-dark-600 bg-dark-950 flex items-center justify-center">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <h2 className="text-sm font-semibold tracking-tight mb-1.5 text-white">{title}</h2>
              <p className="text-[13px] leading-relaxed text-dark-300">{description}</p>
            </div>
          ))}
        </div>

        {/* Privacy note */}
        <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-lg border border-accent-green/25 bg-accent-green/[0.07]">
          <LockIcon className="w-4 h-4 text-accent-green shrink-0 mt-px" />
          <p className="text-[13px] leading-relaxed text-dark-300">
            <span className="text-white font-medium">Your camera stays yours.</span>{' '}
            Detection runs entirely in this browser — no video is uploaded or stored.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <button
            onClick={handleStart}
            className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm shadow-glow-green"
          >
            Start focusing
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function TimerIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function EyeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function ChartIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function LockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}

function ArrowIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  )
}
