/**
 * Head pose from MediaPipe's facial transformation matrix.
 *
 * The matrix arrives as 16 floats in column-major order, so element (row, col)
 * lives at index col * 4 + row. We pull a standard XYZ Euler decomposition out
 * of the upper-left 3x3 rotation block.
 */
export function headPoseFromMatrix(matrixData) {
  if (!matrixData || matrixData.length < 16) return null

  const m = matrixData
  const r00 = m[0], r10 = m[1], r20 = m[2]
  const r21 = m[6], r22 = m[10]

  const sy = Math.hypot(r00, r10)
  const degrees = rad => (rad * 180) / Math.PI

  // Degenerate (gimbal lock) case: fall back to roll = 0
  if (sy < 1e-6) {
    return {
      pitch: degrees(Math.atan2(-m[9], m[5])),
      yaw: degrees(Math.atan2(-r20, sy)),
      roll: 0
    }
  }

  return {
    pitch: degrees(Math.atan2(r21, r22)),
    yaw: degrees(Math.atan2(-r20, sy)),
    roll: degrees(Math.atan2(r10, r00))
  }
}

/**
 * MediaPipe reports pitch near +/-180 for a forward-facing head, because the
 * face model's axis points back toward the camera. Fold the angle into the
 * -90..90 range so "facing forward" is a value near zero either way.
 */
export function normalizeAngle(deg) {
  let a = ((deg + 180) % 360 + 360) % 360 - 180
  if (a > 90) a = 180 - a
  if (a < -90) a = -180 - a
  return a
}
