let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available, silently skip
  }
}

/** 送電啟動音 */
export function playPowerOn() {
  playTone(440, 0.15, 'sine');
  setTimeout(() => playTone(660, 0.15, 'sine'), 100);
}

/** 跳電音 */
export function playTripped() {
  playTone(200, 0.4, 'square', 0.1);
}

/** 燒線音 */
export function playBurned() {
  playTone(150, 0.6, 'sawtooth', 0.08);
}

/** 過關音 */
export function playWin() {
  playTone(523, 0.15, 'sine');
  setTimeout(() => playTone(659, 0.15, 'sine'), 120);
  setTimeout(() => playTone(784, 0.2, 'sine'), 240);
}
