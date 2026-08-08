import SettingsComponent from '../components/Settings/Settings'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user, signOut, isConfigured } = useAuth()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-dark-400 mt-1">Customize your FocusFlow experience</p>
      </div>

      <SettingsComponent />

      {/* Account Section */}
      {isConfigured && (
        <section className="card mt-8">
          <h2 className="text-xl font-semibold mb-6">Account</h2>

          {user ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-dark-400">Signed in</p>
              </div>
              <button
                onClick={signOut}
                className="btn-secondary"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400">Not signed in</p>
                <p className="text-sm text-dark-500">Your data is saved locally</p>
              </div>
              <a href="/auth" className="btn-primary">
                Sign In
              </a>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
