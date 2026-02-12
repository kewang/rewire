import { describe, it, expect } from 'vitest';
import { detectCrossings, getCrossingPairIndices, countUnbundledPairs, calcAestheticsScore } from '../aesthetics';
import type { CircuitId, CableTieQuality } from '../../types/game';
import { CROSSING_PENALTY, UNBUNDLED_PENALTY, CABLE_TIE_GOOD_PENALTY, CABLE_TIE_POOR_PENALTY } from '../../data/constants';

// ─── Constants for tests ───────────────────────────────────────

const PANEL_PADDING = 20;
const LANE_WIDTH = 50;
const ROUTING_TOP = 10;
const ROUTING_HEIGHT = 200;

// ─── detectCrossings ───────────────────────────────────────────

describe('detectCrossings', () => {
  it('returns empty for single lane', () => {
    const lanes = ['c1'] as CircuitId[];
    const configIndex = { c1: 0 } as Record<CircuitId, number>;
    const startXMap = { c1: 30 } as Record<CircuitId, number>;
    const result = detectCrossings(lanes, configIndex, startXMap, PANEL_PADDING, LANE_WIDTH, ROUTING_TOP, ROUTING_HEIGHT);
    expect(result).toHaveLength(0);
  });

  it('returns empty when lanes are in order (no crossing)', () => {
    // Lanes [c1, c2] with configIndex [0, 1] and startX increasing → no inversion
    const lanes = ['c1', 'c2'] as CircuitId[];
    const configIndex = { c1: 0, c2: 1 } as Record<CircuitId, number>;
    const startXMap = { c1: 30, c2: 80 } as Record<CircuitId, number>;
    const result = detectCrossings(lanes, configIndex, startXMap, PANEL_PADDING, LANE_WIDTH, ROUTING_TOP, ROUTING_HEIGHT);
    expect(result).toHaveLength(0);
  });

  it('detects crossing when lanes swap order vs NFB positions', () => {
    // Lane order: [c2, c1], but config order c1=0, c2=1
    // Lane slots: c2→slot0, c1→slot1; NFB: c1→pos0, c2→pos1
    // Bottom: laneX(0) < laneX(1) but nfbX(1) > nfbX(0) → c2 goes left in lane but right in NFB = inversion
    const lanes = ['c2', 'c1'] as CircuitId[];
    const configIndex = { c1: 0, c2: 1 } as Record<CircuitId, number>;
    // startX same relative order as lane slots (no top inversion)
    const startXMap = { c1: 80, c2: 30 } as Record<CircuitId, number>;
    const result = detectCrossings(lanes, configIndex, startXMap, PANEL_PADDING, LANE_WIDTH, ROUTING_TOP, ROUTING_HEIGHT);
    expect(result.length).toBeGreaterThan(0);
  });

  it('detects top inversion when start positions cross', () => {
    // Lanes in order [c1, c2] but startX reversed
    const lanes = ['c1', 'c2'] as CircuitId[];
    const configIndex = { c1: 0, c2: 1 } as Record<CircuitId, number>;
    // c1 starts right, c2 starts left but lane positions are c1=slot0(left), c2=slot1(right) → top inversion
    const startXMap = { c1: 100, c2: 20 } as Record<CircuitId, number>;
    const result = detectCrossings(lanes, configIndex, startXMap, PANEL_PADDING, LANE_WIDTH, ROUTING_TOP, ROUTING_HEIGHT);
    expect(result.length).toBeGreaterThan(0);
  });
});

// ─── getCrossingPairIndices ────────────────────────────────────

describe('getCrossingPairIndices', () => {
  it('returns empty for no crossings', () => {
    const lanes = ['c1', 'c2'] as CircuitId[];
    const configIndex = { c1: 0, c2: 1 } as Record<CircuitId, number>;
    const startXMap = { c1: 30, c2: 80 } as Record<CircuitId, number>;
    const result = getCrossingPairIndices(lanes, configIndex, startXMap, PANEL_PADDING, LANE_WIDTH);
    expect(result.size).toBe(0);
  });

  it('returns pair index for adjacent crossing', () => {
    const lanes = ['c2', 'c1'] as CircuitId[];
    const configIndex = { c1: 0, c2: 1 } as Record<CircuitId, number>;
    const startXMap = { c1: 80, c2: 30 } as Record<CircuitId, number>;
    const result = getCrossingPairIndices(lanes, configIndex, startXMap, PANEL_PADDING, LANE_WIDTH);
    expect(result.has(0)).toBe(true); // pair (lanes[0], lanes[1])
  });
});

// ─── countUnbundledPairs ───────────────────────────────────────

describe('countUnbundledPairs', () => {
  it('counts all pairs as unbundled when no cable ties', () => {
    const lanes = ['c1', 'c2', 'c3'] as CircuitId[];
    const cableTies = new Map<number, CableTieQuality>();
    const crossingIndices = new Set<number>();
    // 2 adjacent pairs: (0,1) and (1,2)
    expect(countUnbundledPairs(lanes, cableTies, crossingIndices)).toBe(2);
  });

  it('excludes pairs with cable ties', () => {
    const lanes = ['c1', 'c2', 'c3'] as CircuitId[];
    const cableTies = new Map<number, CableTieQuality>([[0, 'tight']]);
    const crossingIndices = new Set<number>();
    // Only pair (1,2) is unbundled
    expect(countUnbundledPairs(lanes, cableTies, crossingIndices)).toBe(1);
  });

  it('excludes crossing pairs', () => {
    const lanes = ['c1', 'c2', 'c3'] as CircuitId[];
    const cableTies = new Map<number, CableTieQuality>();
    const crossingIndices = new Set<number>([1]); // pair (1,2) is crossing
    // Only pair (0,1) counts as unbundled
    expect(countUnbundledPairs(lanes, cableTies, crossingIndices)).toBe(1);
  });

  it('returns 0 when all pairs are either tied or crossing', () => {
    const lanes = ['c1', 'c2', 'c3'] as CircuitId[];
    const cableTies = new Map<number, CableTieQuality>([[0, 'tight']]);
    const crossingIndices = new Set<number>([1]);
    expect(countUnbundledPairs(lanes, cableTies, crossingIndices)).toBe(0);
  });
});

// ─── calcAestheticsScore ───────────────────────────────────────

describe('calcAestheticsScore', () => {
  it('returns 100 for perfect score (no crossings, no unbundled)', () => {
    expect(calcAestheticsScore(0, 0)).toBe(100);
  });

  it('deducts CROSSING_PENALTY per crossing', () => {
    expect(calcAestheticsScore(2, 0)).toBe(100 - 2 * CROSSING_PENALTY);
  });

  it('deducts UNBUNDLED_PENALTY per unbundled pair', () => {
    expect(calcAestheticsScore(0, 3)).toBe(100 - 3 * UNBUNDLED_PENALTY);
  });

  it('deducts CABLE_TIE_GOOD_PENALTY for good quality ties', () => {
    const cableTies = new Map<number, CableTieQuality>([[0, 'good'], [1, 'good']]);
    expect(calcAestheticsScore(0, 0, cableTies)).toBe(100 - 2 * CABLE_TIE_GOOD_PENALTY);
  });

  it('deducts CABLE_TIE_POOR_PENALTY for loose/over-tight ties', () => {
    const cableTies = new Map<number, CableTieQuality>([[0, 'loose'], [1, 'over-tight']]);
    expect(calcAestheticsScore(0, 0, cableTies)).toBe(100 - 2 * CABLE_TIE_POOR_PENALTY);
  });

  it('does not deduct for tight quality ties', () => {
    const cableTies = new Map<number, CableTieQuality>([[0, 'tight']]);
    expect(calcAestheticsScore(0, 0, cableTies)).toBe(100);
  });

  it('clamps to minimum 0', () => {
    expect(calcAestheticsScore(10, 10)).toBe(0); // 100 - 200 - 50 → clamped to 0
  });

  it('combines all penalties', () => {
    const cableTies = new Map<number, CableTieQuality>([[0, 'good']]);
    const expected = 100 - 1 * CROSSING_PENALTY - 1 * UNBUNDLED_PENALTY - CABLE_TIE_GOOD_PENALTY;
    expect(calcAestheticsScore(1, 1, cableTies)).toBe(expected);
  });
});
