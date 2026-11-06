import { useEffect, useState } from 'react'
import { stats, isDebugEnabled } from '../../utils/detectStats'
import { useFocusContext } from '../../context/FocusContext'

/**
 * Diagnostic readout for detection behaviour. Only rendered when the URL
 * carries ?debug=1, so it never shows for normal use.
 */
export default function DebugPanel() {
  const [, tick] = useState(0)
  const {
    isFocused,
    distractionReason,
    focusScore,
    detectionStates,
    modelsLoaded,
    phoneDetectionReady,
    cameraEnabled,
    detectionEnabled
  } = useFocusContext()

  useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 400)
    return () => clearInterval(id)
  }, [])

  if (!isDebugEnabled()) return null

  const f = stats.face
  const o = stats.object
  const hitRate = f.calls ? Math.round((f.hits / (f.hits + f.misses || 1)) * 100) : 0

  const Row = ({ label, value, warn }) => (
    <div className="flex justify-between gap-4">
      <span className="text-dark-400">{label}</span>
      <span className={warn ? 'text-accent-orange' : 'text-white'}>{value}</span>
    </div>
  )

  return (
    <div className="mt-4 rounded-lg border border-dark-600 bg-dark-900 p-3 font-mono text-[11px] leading-relaxed">
      <div className="mb-2 font-semibold text-accent-blue">detection debug</div>

      <Row label="backend" value={stats.backend || '—'} warn={stats.backend !== 'webgl'} />
      <Row label="video" value={`${stats.video.w}x${stats.video.h} rs=${stats.video.readyState}`} warn={!stats.video.w} />
      <Row label="camera / detect" value={`${cameraEnabled ? 'on' : 'off'} / ${detectionEnabled ? 'on' : 'off'}`} />
      <Row label="models / phone" value={`${modelsLoaded ? 'ready' : 'loading'} / ${phoneDetectionReady ? 'ready' : 'loading'}`} />

      <div className="my-2 border-t border-dark-700" />

      <Row label="face hit rate" value={`${hitRate}%  (${f.hits}/${f.hits + f.misses})`} warn={hitRate < 90} />
      <Row label="face last count" value={String(f.lastCount)} warn={f.lastCount === 0} />
      <Row label="face miss streak" value={`${f.missStreak} (max ${f.maxMissStreak})`} warn={f.missStreak > 2} />
      <Row label="face infer ms" value={`${f.lastMs} (max ${f.maxMs})`} warn={f.lastMs > 100} />
      <Row label="face error" value={f.lastError || 'none'} warn={!!f.lastError} />

      <div className="my-2 border-t border-dark-700" />

      <Row label="object infer ms" value={`${o.lastMs} (max ${o.maxMs})`} warn={o.lastMs > 200} />
      <Row label="skipped (busy)" value={String(stats.skippedInFlight)} />
      <Row
        label="tensors"
        value={`${stats.tensors} (start ${stats.tensorsAtStart ?? "—"})`}
        warn={stats.tensorsAtStart !== null && stats.tensors > stats.tensorsAtStart + 200}
      />

      <div className="my-2 border-t border-dark-700" />

      <Row label="focused" value={String(isFocused)} warn={!isFocused} />
      <Row label="reason" value={distractionReason || 'none'} warn={!!distractionReason} />
      <Row label="score" value={`${focusScore}%`} />
      <Row
        label="signals"
        value={`face=${detectionStates.faceDetected} eyes=${detectionStates.eyesOpen} fwd=${detectionStates.headFacingForward} phone=${detectionStates.phoneDetected}`}
      />
    </div>
  )
}
