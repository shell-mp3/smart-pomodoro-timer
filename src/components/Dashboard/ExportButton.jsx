import { useState } from 'react'
import useSession from '../../hooks/useSession'
import { sessionsToCSV, downloadCSV, generateExportFilename } from '../../utils/exportCSV'
import { useNotification } from '../UI/Notification'

export default function ExportButton() {
  const { getAllSessions } = useSession()
  const { notify } = useNotification()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Get all sessions (last 365 days)
      const { sessions, distractionEvents } = await getAllSessions(365)

      if (sessions.length === 0) {
        notify({
          type: 'warning',
          message: 'No sessions to export'
        })
        setIsExporting(false)
        return
      }

      // Convert to CSV
      const csvContent = sessionsToCSV(sessions, distractionEvents)
      const filename = generateExportFilename()

      // Trigger download
      downloadCSV(csvContent, filename)

      notify({
        type: 'success',
        message: `Exported ${sessions.length} sessions`
      })
    } catch (err) {
      console.error('Export failed:', err)
      notify({
        type: 'error',
        message: 'Failed to export data'
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="btn-secondary inline-flex items-center gap-2"
    >
      {isExporting ? (
        <>
          <div className="w-4 h-4 border-2 border-dark-400 border-t-transparent rounded-full animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </>
      )}
    </button>
  )
}
