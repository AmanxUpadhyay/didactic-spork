/**
 * Web Audio API sound system — synthesized sounds, no audio files required.
 * All sounds generated procedurally from oscillators + envelopes.
 */

export type SoundType = 'softPop' | 'chime' | 'fanfare' | 'victory' | 'levelUp'

let _ctx: AudioContext | null = null

/** Get (or lazily create) the AudioContext and resume if suspended (iOS unlock). */
function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!_ctx) {
      _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    if (_ctx.state === 'suspended') {
      _ctx.resume().catch(() => {})
    }
    return _ctx
  } catch {
    return null
  }
}

// ── Persistent settings ────────────────────────────────────────────────────
let _volume = 0.6
let _muted = false

try {
  const stored = localStorage.getItem('jugalbandi_sound')
  if (stored) {
    const s = JSON.parse(stored) as { volume?: number; muted?: boolean }
    _volume = s.volume ?? 0.6
    _muted = s.muted ?? false
  }
} catch { /* ignore SSR / private browsing */ }

function save() {
  try {
    localStorage.setItem('jugalbandi_sound', JSON.stringify({ volume: _volume, muted: _muted }))
  } catch { /* ignore */ }
}

export function setVolume(v: number) { _volume = Math.max(0, Math.min(1, v)); save() }
export function setMuted(m: boolean) { _muted = m; save() }
export function isMuted(): boolean { return _muted }
export function getVolume(): number { return _volume }

/** Call once inside a user-gesture handler to unlock AudioContext on iOS Safari. */
export function unlockAudio() {
  getCtx()
}

// ── Synthesis primitives ───────────────────────────────────────────────────

function tone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainPeak = 0.25,
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = type
  osc.frequency.setValueAtTime(frequency, startTime)

  const vol = _volume * gainPeak
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + Math.max(duration, 0.05))

  osc.start(startTime)
  osc.stop(startTime + duration + 0.02)
}

// ── Sound library ──────────────────────────────────────────────────────────

export const sounds = {
  /** Single habit check — brief bright pop */
  softPop() {
    if (_muted) return
    const ctx = getCtx()
    if (!ctx) return
    const t = ctx.currentTime
    tone(ctx, 880, t, 0.12, 'sine', 0.20)
    tone(ctx, 1320, t + 0.01, 0.08, 'sine', 0.10)
  },

  /** All habits done / small celebration — warm harmonic chord */
  chime() {
    if (_muted) return
    const ctx = getCtx()
    if (!ctx) return
    const t = ctx.currentTime
    // C5 + G5 + E6 — bright, satisfying
    ;[523.25, 783.99, 1318.5].forEach((freq, i) => {
      tone(ctx, freq, t + i * 0.06, 0.7, 'sine', 0.18)
    })
  },

  /** Medium celebration — 3-note ascending arpeggio */
  fanfare() {
    if (_muted) return
    const ctx = getCtx()
    if (!ctx) return
    const t = ctx.currentTime
    // C5 → E5 → G5
    ;[523.25, 659.25, 783.99].forEach((freq, i) => {
      tone(ctx, freq, t + i * 0.10, 0.35, 'triangle', 0.22)
    })
  },

  /** Large celebration (sprint win, 30+ streak) — 4-note ascending fanfare */
  victory() {
    if (_muted) return
    const ctx = getCtx()
    if (!ctx) return
    const t = ctx.currentTime
    // C5 → E5 → G5 → C6
    ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      tone(ctx, freq, t + i * 0.12, 0.45, 'triangle', 0.25)
    })
  },

  /** Epic / tier unlock — upward frequency sweep */
  levelUp() {
    if (_muted) return
    const ctx = getCtx()
    if (!ctx) return
    const t = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.frequency.setValueAtTime(330, t)
    osc.frequency.exponentialRampToValueAtTime(1320, t + 0.4)

    gain.gain.setValueAtTime(_volume * 0.25, t)
    gain.gain.linearRampToValueAtTime(0, t + 0.5)

    osc.start(t)
    osc.stop(t + 0.55)

    // Add shimmer octave on top
    tone(ctx, 660, t + 0.1, 0.35, 'sine', 0.12)
    tone(ctx, 1320, t + 0.25, 0.25, 'sine', 0.10)
  },
}
