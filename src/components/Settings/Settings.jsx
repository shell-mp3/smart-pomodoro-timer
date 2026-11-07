import { useState, useEffect } from 'react'
import useSettings from '../../hooks/useSettings'
import { useNotification } from '../UI/Notification'
import NotificationSettings from './NotificationSettings'

const SENSITIVITY_OPTIONS = [
  {
    value: 'low',
    label: 'Low',
    description: '5 second grace period - More forgiving, allows brief glances away'
  },
  {
    value: 'medium',
    label: 'Medium',
    description: '3 second grace period - Balanced detection sensitivity'
  },
  {
    value: 'high',
    label: 'High',
    description: '1 second grace period - Strict focus tracking'
  }
]

export default function Settings() {
  const { settings, isLoading, updateSettings, resetSettings } = useSettings()
  const { notify } = useNotification()

  const [formData, setFormData] = useState({
    work_duration: 25,
    short_break: 5,
    long_break: 15,
    sensitivity_level: 'medium',
    sound_enabled: true
  })

  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Load settings into form
  useEffect(() => {
    if (settings) {
      setFormData({
        work_duration: settings.work_duration,
        short_break: settings.short_break,
        long_break: settings.long_break,
        sensitivity_level: settings.sensitivity_level,
        sound_enabled: settings.sound_enabled
      })
    }
  }, [settings])

  // Check for changes
  useEffect(() => {
    if (settings) {
      const changed =
        formData.work_duration !== settings.work_duration ||
        formData.short_break !== settings.short_break ||
        formData.long_break !== settings.long_break ||
        formData.sensitivity_level !== settings.sensitivity_level ||
        formData.sound_enabled !== settings.sound_enabled

      setHasChanges(changed)
    }
  }, [formData, settings])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const success = await updateSettings(formData)

    if (success) {
      notify({ type: 'success', message: 'Settings saved!' })
      setHasChanges(false)
    } else {
      notify({ type: 'error', message: 'Failed to save settings' })
    }

    setIsSaving(false)
  }

  const handleReset = async () => {
    setIsSaving(true)
    const success = await resetSettings()

    if (success) {
      notify({ type: 'success', message: 'Settings reset to defaults' })
    } else {
      notify({ type: 'error', message: 'Failed to reset settings' })
    }

    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-accent-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Timer Settings */}
      <section className="card">
        <h2 className="text-xl font-semibold mb-6">Timer Settings</h2>

        <div className="space-y-6">
          {/* Work Duration */}
          <div>
            <label className="label">Work Duration</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="60"
                value={formData.work_duration}
                onChange={(e) => handleChange('work_duration', parseInt(e.target.value))}
                className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-accent-green"
              />
              <span className="w-16 text-center font-medium">{formData.work_duration} min</span>
            </div>
          </div>

          {/* Short Break */}
          <div>
            <label className="label">Short Break</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="15"
                value={formData.short_break}
                onChange={(e) => handleChange('short_break', parseInt(e.target.value))}
                className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
              />
              <span className="w-16 text-center font-medium">{formData.short_break} min</span>
            </div>
          </div>

          {/* Long Break */}
          <div>
            <label className="label">Long Break</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="30"
                value={formData.long_break}
                onChange={(e) => handleChange('long_break', parseInt(e.target.value))}
                className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-accent-purple"
              />
              <span className="w-16 text-center font-medium">{formData.long_break} min</span>
            </div>
          </div>
        </div>
      </section>

      {/* Detection Settings */}
      <section className="card">
        <h2 className="text-xl font-semibold mb-6">Focus Detection</h2>

        <div>
          <label className="label">Sensitivity Level</label>
          <div className="grid gap-3">
            {SENSITIVITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleChange('sensitivity_level', option.value)}
                className={`
                  p-4 rounded-lg border text-left transition-all
                  ${formData.sensitivity_level === option.value
                    ? 'border-accent-green bg-accent-green/10'
                    : 'border-dark-600 hover:border-dark-500'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  {formData.sensitivity_level === option.value && (
                    <svg className="w-5 h-5 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-dark-400 mt-1">{option.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Notification Settings */}
      <NotificationSettings
        soundEnabled={formData.sound_enabled}
        onSoundEnabledChange={(value) => handleChange('sound_enabled', value)}
      />

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleReset}
          disabled={isSaving}
          className="btn-secondary"
        >
          Reset to Defaults
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="btn-primary"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
