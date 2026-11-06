/**
 * Lightweight detection instrumentation, surfaced by the ?debug=1 panel.
 * Counters live on a module object and are mutated in place - no React state,
 * so recording a frame costs nothing and cannot trigger re-renders.
 */
const blank = () => ({
  calls: 0,
  hits: 0,
  misses: 0,
  lastMs: 0,
  maxMs: 0,
  lastCount: null,
  missStreak: 0,
  maxMissStreak: 0,
  lastError: null
})

export const stats = {
  face: blank(),
  object: blank(),
  video: { w: 0, h: 0, readyState: 0 },
  backend: null,
  skippedInFlight: 0,
  tensors: 0,
  tensorsAtStart: null
}

export function recordDetection(kind, { ms, count, error }) {
  const s = stats[kind]
  if (!s) return
  s.calls += 1
  if (error) {
    s.lastError = String(error).slice(0, 120)
    return
  }
  s.lastMs = Math.round(ms)
  if (s.lastMs > s.maxMs) s.maxMs = s.lastMs
  s.lastCount = count
  if (count > 0) {
    s.hits += 1
    s.missStreak = 0
  } else {
    s.misses += 1
    s.missStreak += 1
    if (s.missStreak > s.maxMissStreak) s.maxMissStreak = s.missStreak
  }
}

export function recordSkip() {
  stats.skippedInFlight += 1
}

export function recordVideo(video) {
  stats.video.w = video.videoWidth
  stats.video.h = video.videoHeight
  stats.video.readyState = video.readyState
}

export function recordBackend(name) {
  stats.backend = name
}

// A steadily climbing tensor count means inference is leaking GPU memory,
// which degrades detection over the course of a session.
export function recordTensors(n) {
  if (stats.tensorsAtStart === null) stats.tensorsAtStart = n
  stats.tensors = n
}

export function isDebugEnabled() {
  try {
    return new URLSearchParams(window.location.search).has('debug')
  } catch {
    return false
  }
}

if (typeof window !== 'undefined') window.__ffStats = stats
