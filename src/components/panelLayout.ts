import type { CircuitConfig } from '../types/game';

// ── Panel Interior Layout Constants ──────────────────────────
export const LANE_WIDTH = 64;
export const PANEL_PADDING = 36;
const BUSBAR_Y = 70;
const BUSBAR_GAP = 20;
export const ROUTING_TOP = BUSBAR_Y + 3 * BUSBAR_GAP + 20;
export const ROUTING_HEIGHT = 170;

/** Compute wire start-X based on phase / voltage */
export function wireStartX(
  config: CircuitConfig,
  phase: 'R' | 'T' | undefined,
  busbarLeft: number,
  busbarRight: number,
): number {
  if (config.voltage === 220) {
    return (busbarLeft + busbarRight) / 2;
  }
  const p = phase ?? config.phase ?? 'R';
  if (p === 'R') return busbarLeft + (busbarRight - busbarLeft) * 0.2;
  return busbarLeft + (busbarRight - busbarLeft) * 0.8;
}
