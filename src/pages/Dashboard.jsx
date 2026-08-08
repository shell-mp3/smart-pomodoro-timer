import SessionStats from '../components/Dashboard/SessionStats'
import FocusHistory from '../components/Dashboard/FocusHistory'
import ExportButton from '../components/Dashboard/ExportButton'

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-dark-400 mt-1">Track your focus and productivity</p>
        </div>
        <ExportButton />
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">Today's Overview</h2>
          <SessionStats />
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Focus History</h2>
          <FocusHistory />
        </section>
      </div>
    </div>
  )
}
