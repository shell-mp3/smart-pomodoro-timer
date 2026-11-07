import { useNavigate } from 'react-router-dom'
import { markWelcomeSeen } from '../utils/welcome'

const features = [
  {
    icon: TimerIcon,
    color: 'text-emerald-400',
    title: 'Pomodoro, your way',
    description:
      'Focused sprints with short breaks between them, and a long break every fourth session. Every duration is adjustable.'
  },
  {
    icon: EyeIcon,
    color: 'text-sky-400',
    title: 'It notices when you drift',
    description:
      'Your webcam watches for the usual suspects — looking away, eyes shut, head turned — and pauses until you are back.'
  },
  {
    icon: ChartIcon,
    color: 'text-violet-400',
    title: 'See where the time went',
    description:
      'Focused minutes, streaks, and what distracted you most — with the full history one click from a CSV.'
  }
]

const defaults = [
  { value: '25', unit: 'min work' },
  { value: '5', unit: 'min break' },
  { value: '4', unit: 'to long break' }
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
          <div className="w-11 h-11 mx-auto mb-7 rounded-lg bg-gradient-to-br from-accent-green to-accent-blue ring-1 ring-white/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400 mb-4">
            Focus, measured
          </p>

          <h1 className="text-4xl sm:text-[2.75rem] font-semibold tracking-tight leading-[1.1] mb-4">
            Welcome to{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-sky-400">
              FocusFlow
            </span>
          </h1>

          <p className="text-[15px] leading-relaxed text-dark-200 max-w-md mx-auto">
            A Pomodoro timer that knows whether you are actually focusing. It watches
            through your webcam, pauses when your attention wanders, and shows you the
            damage afterwards.
          </p>

          {/* Defaults at a glance */}
          <div className="mt-7 inline-flex items-stretch divide-x divide-dark-600 rounded-lg border border-dark-600 bg-dark-800">
            {defaults.map(({ value, unit }) => (
              <div key={unit} className="px-5 py-2.5">
                <div className="text-lg font-semibold tabular-nums leading-none text-white">{value}</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-dark-300">{unit}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid gap-px sm:grid-cols-3 rounded-xl overflow-hidden bg-dark-600 border border-dark-600">
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
        <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.07]">
          <LockIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-px" />
          <p className="text-[13px] leading-relaxed text-dark-300">
            <span className="text-white font-medium">Your camera stays yours.</span>{' '}
            Detection runs entirely in this browser — no video is uploaded or stored.
            Prefer not to use it? Deny camera access and the timer still works, just
            without focus tracking.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <button
            onClick={handleStart}
            className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm shadow-glow-green"
          >
            Start focusing
            <ArrowIcon className="w-4 h-4" />
          </button>
          <p className="mt-4 text-xs text-dark-400">
            Back any time at{' '}
            <span className="font-mono text-dark-200">/welcome</span>
          </p>
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
