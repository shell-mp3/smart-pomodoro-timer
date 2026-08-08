/**
 * Export sessions data to CSV format
 */

/**
 * Convert sessions and distraction events to CSV string
 * @param {Array} sessions - Array of session objects
 * @param {Array} distractionEvents - Array of distraction event objects
 * @returns {string} CSV formatted string
 */
export function sessionsToCSV(sessions, distractionEvents = []) {
  const headers = [
    'session_id',
    'date',
    'start_time',
    'end_time',
    'planned_duration_seconds',
    'focused_duration_seconds',
    'distraction_count',
    'completed',
    'distraction_reasons'
  ]

  const rows = sessions.map(session => {
    const sessionEvents = distractionEvents.filter(
      event => event.session_id === session.id
    )
    const reasons = [...new Set(sessionEvents.map(e => e.reason))].join('; ')

    return [
      session.id,
      new Date(session.started_at).toLocaleDateString(),
      new Date(session.started_at).toLocaleTimeString(),
      session.ended_at ? new Date(session.ended_at).toLocaleTimeString() : '',
      session.planned_duration,
      session.focused_duration,
      session.distraction_count,
      session.completed ? 'Yes' : 'No',
      reasons
    ]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCSVField).join(','))
  ].join('\n')

  return csvContent
}

/**
 * Escape a field for CSV format
 * @param {any} field - Field value to escape
 * @returns {string} Escaped field
 */
function escapeCSVField(field) {
  if (field === null || field === undefined) return ''

  const stringField = String(field)

  // If field contains comma, newline, or quote, wrap in quotes
  if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
    return `"${stringField.replace(/"/g, '""')}"`
  }

  return stringField
}

/**
 * Trigger CSV download in browser
 * @param {string} csvContent - CSV string content
 * @param {string} filename - Name for downloaded file
 */
export function downloadCSV(csvContent, filename = 'focusflow-export.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Generate filename with current date
 * @returns {string} Filename with date
 */
export function generateExportFilename() {
  const date = new Date().toISOString().split('T')[0]
  return `focusflow-sessions-${date}.csv`
}
