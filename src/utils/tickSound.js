/**
 * A mechanical kitchen-timer tick, synthesised rather than loaded.
 *
 * A real tick is a broadband click, not a tone, so this is a very short
 * burst of filtered noise. Alternating the filter frequency gives the
 * tick-tock asymmetry a real escapement has.
 */
let ctx = null
let noiseBuffer = null
let parity = 0

function getContext() {
  if (typeof window === 'undefined') return null
  const AudioCtor = window.AudioContext || window.webkitAudioContext
  if (!AudioCtor) return null

  if (!ctx) {
    try {
      ctx = new AudioCtor()
    } catch {
      return null
    }
  }
  // Browsers suspend audio until a user gesture; resuming is a no-op once running
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

function getNoise(audio) {
  if (noiseBuffer) return noiseBuffer
  const length = Math.floor(audio.sampleRate * 0.04)
  noiseBuffer = audio.createBuffer(1, length, audio.sampleRate)
  const data = noiseBuffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  return noiseBuffer
}

export function playTick(volume = 0.22) {
  const audio = getContext()
  if (!audio) return

  try {
    const now = audio.currentTime
    const source = audio.createBufferSource()
    source.buffer = getNoise(audio)

    const band = audio.createBiquadFilter()
    band.type = 'bandpass'
    // tick slightly brighter than tock
    band.frequency.value = parity % 2 === 0 ? 2400 : 1850
    band.Q.value = 2.2
    parity += 1

    const gain = audio.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035)

    source.connect(band)
    band.connect(gain)
    gain.connect(audio.destination)

    source.start(now)
    source.stop(now + 0.05)
  } catch {
    // Audio is a nicety - never let it break the timer
  }
}
