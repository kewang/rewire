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

// --- Buzzing (持續性過載預警音) ---

let buzzOsc: OscillatorNode | null = null;
let buzzGain: GainNode | null = null;

/** 開始播放持續性 buzzing 音效（sawtooth ~120Hz），初始音量 0 */
export function startBuzzing() {
  if (buzzOsc) return; // already playing
  try {
    const ctx = getCtx();
    buzzOsc = ctx.createOscillator();
    buzzGain = ctx.createGain();
    buzzOsc.type = 'sawtooth';
    buzzOsc.frequency.value = 120;
    buzzGain.gain.setValueAtTime(0, ctx.currentTime);
    buzzOsc.connect(buzzGain);
    buzzGain.connect(ctx.destination);
    buzzOsc.start();
  } catch {
    // Audio not available
  }
}

/** 根據 wireHeat 更新 buzzing 音量（0→0, 1→0.12） */
export function updateBuzzingVolume(wireHeat: number) {
  if (!buzzGain) return;
  try {
    const ctx = getCtx();
    const vol = Math.max(0, Math.min(1, wireHeat)) * 0.12;
    buzzGain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.05);
  } catch {
    // Audio not available
  }
}

/** 停止 buzzing 音效 */
export function stopBuzzing() {
  try {
    buzzOsc?.stop();
  } catch {
    // already stopped
  }
  buzzOsc?.disconnect();
  buzzGain?.disconnect();
  buzzOsc = null;
  buzzGain = null;
}

/** 過關音 */
export function playWin() {
  playTone(523, 0.15, 'sine');
  setTimeout(() => playTone(659, 0.15, 'sine'), 120);
  setTimeout(() => playTone(784, 0.2, 'sine'), 240);
}
