/**
 * Focus detection logic utilities
 */

// Grace period durations in milliseconds based on sensitivity
export const GRACE_PERIODS = {
  low: 5000,
  medium: 3000,
  high: 1000
}

// Eye aspect ratio threshold for determining if eyes are open
export const EYE_ASPECT_RATIO_THRESHOLD = 0.2

// Head rotation threshold in pixels (relative to face width)
export const HEAD_ROTATION_THRESHOLD = 0.15

/**
 * Calculate eye aspect ratio from landmarks
 * EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
 * @param {Array} eyeLandmarks - Array of eye landmark points
 * @returns {number} Eye aspect ratio
 */
export function calculateEyeAspectRatio(eyeLandmarks) {
  if (!eyeLandmarks || eyeLandmarks.length < 6) return 1

  const [p1, p2, p3, p4, p5, p6] = eyeLandmarks

  const verticalDist1 = Math.sqrt(
    Math.pow(p2.x - p6.x, 2) + Math.pow(p2.y - p6.y, 2)
  )
  const verticalDist2 = Math.sqrt(
    Math.pow(p3.x - p5.x, 2) + Math.pow(p3.y - p5.y, 2)
  )
  const horizontalDist = Math.sqrt(
    Math.pow(p1.x - p4.x, 2) + Math.pow(p1.y - p4.y, 2)
  )

  if (horizontalDist === 0) return 1

  return (verticalDist1 + verticalDist2) / (2 * horizontalDist)
}

/**
 * Determine if head is facing forward based on nose and face center
 * @param {Object} noseTip - Nose tip landmark {x, y}
 * @param {Object} faceCenter - Face center point {x, y}
 * @param {number} faceWidth - Width of detected face bounding box
 * @returns {boolean} True if head is facing forward
 */
export function isHeadFacingForward(noseTip, faceCenter, faceWidth) {
  if (!noseTip || !faceCenter || !faceWidth) return true

  const offsetX = Math.abs(noseTip.x - faceCenter.x) / faceWidth
  const offsetY = Math.abs(noseTip.y - faceCenter.y) / faceWidth

  return offsetX < HEAD_ROTATION_THRESHOLD && offsetY < HEAD_ROTATION_THRESHOLD
}

/**
 * Calculate rolling focus score
 * @param {Array<boolean>} recentFocusStates - Array of recent focus states (true/false)
 * @returns {number} Focus score 0-100
 */
export function calculateFocusScore(recentFocusStates) {
  if (!recentFocusStates || recentFocusStates.length === 0) return 100

  const focusedCount = recentFocusStates.filter(Boolean).length
  return Math.round((focusedCount / recentFocusStates.length) * 100)
}

/**
 * Determine distraction reason from detection states
 * @param {Object} states - Detection states
 * @returns {string|null} Distraction reason or null if focused
 */
export function getDistractionReason(states) {
  const { faceDetected, eyesOpen, headFacingForward } = states

  if (!faceDetected) return 'no_face'
  if (!eyesOpen) return 'eyes_closed'
  if (!headFacingForward) return 'head_turned'

  return null
}

/**
 * Get human-readable distraction message
 * @param {string} reason - Distraction reason code
 * @returns {string} Human readable message
 */
export function getDistractionMessage(reason) {
  const messages = {
    no_face: 'Face not detected',
    eyes_closed: 'Eyes appear closed',
    head_turned: 'Head turned away'
  }

  return messages[reason] || 'Focus lost'
}
