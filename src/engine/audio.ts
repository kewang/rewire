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

// --- Appliance sounds (電器運作環境音) ---

interface ApplianceAudioNode {
  osc: OscillatorNode;
  gain: GainNode;
  filter?: BiquadFilterNode;
  lfo?: OscillatorNode;
  lfoGain?: GainNode;
}

let applianceNodes: ApplianceAudioNode[] = [];

function createApplianceSound(ctx: AudioContext, name: string): ApplianceAudioNode | null {
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  if (name === '吹風機') {
    // Bandpass-filtered sawtooth to approximate wind noise
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 800;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 0.5;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    osc.connect(filter);
    filter.connect(gain);
    osc.start();
    return { osc, gain, filter };
  }

  if (name === '快煮壺') {
    // Low-frequency sine with LFO amplitude modulation (bubbling)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 100;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 3;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    osc.connect(gain);
    lfo.start();
    osc.start();
    return { osc, gain, lfo, lfoGain };
  }

  if (name === '微波爐') {
    // Steady 60Hz hum
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 60;
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    osc.connect(gain);
    osc.start();
    return { osc, gain };
  }

  if (name === '廚下加熱器') {
    // Very quiet 50Hz
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 50;
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    osc.connect(gain);
    osc.start();
    return { osc, gain };
  }

  if (name === '烘衣機') {
    // Low-frequency triangle with slight LFO (tumbling vibration)
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 80;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 1.5;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.015;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    osc.connect(gain);
    lfo.start();
    osc.start();
    return { osc, gain, lfo, lfoGain };
  }

  return null;
}

/** 開始播放所有已插入電器的運作音效 */
export function startApplianceSounds(appliances: readonly { readonly name: string }[]) {
  stopApplianceSounds();
  try {
    const ctx = getCtx();
    for (const a of appliances) {
      const node = createApplianceSound(ctx, a.name);
      if (node) applianceNodes.push(node);
    }
  } catch {
    // Audio not available
  }
}

/** 停止所有電器運作音效 */
export function stopApplianceSounds() {
  for (const n of applianceNodes) {
    try { n.osc.stop(); } catch { /* already stopped */ }
    n.osc.disconnect();
    n.gain.disconnect();
    n.filter?.disconnect();
    try { n.lfo?.stop(); } catch { /* already stopped */ }
    n.lfo?.disconnect();
    n.lfoGain?.disconnect();
  }
  applianceNodes = [];
}

/** 過關音 */
export function playWin() {
  playTone(523, 0.15, 'sine');
  setTimeout(() => playTone(659, 0.15, 'sine'), 120);
  setTimeout(() => playTone(784, 0.2, 'sine'), 240);
}
