import { describe, it, expect } from 'vitest';
import { isProblemResolved, worstStatus } from '../helpers';
import type { OldHouseProblem, CircuitId, CircuitState } from '../game';
import type { ProblemResolutionState } from '../helpers';
import { BREAKER_15A, BREAKER_20A, BREAKER_30A } from '../../data/constants';

// ─── Test helpers ──────────────────────────────────────────────

function makeResolutionState(overrides: Partial<ProblemResolutionState> = {}): ProblemResolutionState {
  return {
    isPreWired: false,
    isWired: true,
    crimpResult: { terminalType: 'o-ring', quality: 'good', contactResistance: 1.05 },
    breaker: BREAKER_20A,
    wire: { crossSection: 2.0, maxCurrent: 20, costPerMeter: 5 },
    elcbEnabled: false,
    requiresCrimp: true,
    ...overrides,
  };
}

// ─── isProblemResolved ─────────────────────────────────────────

describe('isProblemResolved', () => {
  describe('bare-wire', () => {
    const problem: OldHouseProblem = { circuitId: 'c1' as CircuitId, type: 'bare-wire' };

    it('returns true when unwired, rewired, and crimped', () => {
      const state = makeResolutionState({ isPreWired: false, isWired: true });
      expect(isProblemResolved(problem, state)).toBe(true);
    });

    it('returns false when still pre-wired', () => {
      const state = makeResolutionState({ isPreWired: true });
      expect(isProblemResolved(problem, state)).toBe(false);
    });

    it('returns false when not yet wired', () => {
      const state = makeResolutionState({ isPreWired: false, isWired: false });
      expect(isProblemResolved(problem, state)).toBe(false);
    });

    it('returns false when crimp required but not done', () => {
      const state = makeResolutionState({ requiresCrimp: true, crimpResult: undefined });
      expect(isProblemResolved(problem, state)).toBe(false);
    });

    it('returns true when crimp not required even without crimp', () => {
      const state = makeResolutionState({ requiresCrimp: false, crimpResult: undefined });
      expect(isProblemResolved(problem, state)).toBe(true);
    });
  });

  describe('wrong-wire-gauge', () => {
    const problem: OldHouseProblem = { circuitId: 'c1' as CircuitId, type: 'wrong-wire-gauge' };

    it('returns true when unwired, rewired with new wire, and crimped', () => {
      const state = makeResolutionState({ isPreWired: false, isWired: true });
      expect(isProblemResolved(problem, state)).toBe(true);
    });

    it('returns false when still pre-wired', () => {
      const state = makeResolutionState({ isPreWired: true });
      expect(isProblemResolved(problem, state)).toBe(false);
    });
  });

  describe('oxidized-splice', () => {
    const problem: OldHouseProblem = { circuitId: 'c1' as CircuitId, type: 'oxidized-splice' };

    it('returns true when unwired, rewired, and crimped', () => {
      const state = makeResolutionState({ isPreWired: false, isWired: true });
      expect(isProblemResolved(problem, state)).toBe(true);
    });

    it('returns false when still pre-wired', () => {
      const state = makeResolutionState({ isPreWired: true });
      expect(isProblemResolved(problem, state)).toBe(false);
    });
  });

  describe('overrated-breaker', () => {
    const problem: OldHouseProblem = { circuitId: 'c1' as CircuitId, type: 'overrated-breaker' };

    it('returns true when breaker ratedCurrent <= wire maxCurrent', () => {
      const state = makeResolutionState({
        breaker: BREAKER_20A, // 20A
        wire: { crossSection: 2.0, maxCurrent: 20, costPerMeter: 5 }, // 20A max
      });
      expect(isProblemResolved(problem, state)).toBe(true);
    });

    it('returns true when breaker is smaller than wire', () => {
      const state = makeResolutionState({
        breaker: BREAKER_15A, // 15A
        wire: { crossSection: 2.0, maxCurrent: 20, costPerMeter: 5 }, // 20A max
      });
      expect(isProblemResolved(problem, state)).toBe(true);
    });

    it('returns false when breaker ratedCurrent > wire maxCurrent', () => {
      const state = makeResolutionState({
        breaker: BREAKER_30A, // 30A
        wire: { crossSection: 2.0, maxCurrent: 20, costPerMeter: 5 }, // 20A max
      });
      expect(isProblemResolved(problem, state)).toBe(false);
    });
  });

  describe('missing-elcb', () => {
    const problem: OldHouseProblem = { circuitId: 'c1' as CircuitId, type: 'missing-elcb' };

    it('returns true when ELCB is enabled', () => {
      const state = makeResolutionState({ elcbEnabled: true });
      expect(isProblemResolved(problem, state)).toBe(true);
    });

    it('returns false when ELCB is disabled', () => {
      const state = makeResolutionState({ elcbEnabled: false });
      expect(isProblemResolved(problem, state)).toBe(false);
    });
  });
});

// ─── worstStatus ───────────────────────────────────────────────

describe('worstStatus', () => {
  it('returns normal for all-normal circuits', () => {
    const states: Record<CircuitId, CircuitState> = {
      c1: { status: 'normal', totalCurrent: 5, wireHeat: 0, breakerTripTimer: 0 },
      c2: { status: 'normal', totalCurrent: 8, wireHeat: 0, breakerTripTimer: 0 },
    };
    expect(worstStatus(states)).toBe('normal');
  });

  it('returns warning when one circuit is warning', () => {
    const states: Record<CircuitId, CircuitState> = {
      c1: { status: 'normal', totalCurrent: 5, wireHeat: 0, breakerTripTimer: 0 },
      c2: { status: 'warning', totalCurrent: 22, wireHeat: 0.3, breakerTripTimer: 0 },
    };
    expect(worstStatus(states)).toBe('warning');
  });

  it('returns tripped over warning', () => {
    const states: Record<CircuitId, CircuitState> = {
      c1: { status: 'warning', totalCurrent: 22, wireHeat: 0.3, breakerTripTimer: 0 },
      c2: { status: 'tripped', totalCurrent: 30, wireHeat: 0.5, breakerTripTimer: 2 },
    };
    expect(worstStatus(states)).toBe('tripped');
  });

  it('treats elcb-tripped same severity as tripped', () => {
    const states: Record<CircuitId, CircuitState> = {
      c1: { status: 'warning', totalCurrent: 22, wireHeat: 0.3, breakerTripTimer: 0 },
      c2: { status: 'elcb-tripped', totalCurrent: 0, wireHeat: 0, breakerTripTimer: 0 },
    };
    expect(worstStatus(states)).toBe('elcb-tripped');
  });

  it('returns burned over tripped', () => {
    const states: Record<CircuitId, CircuitState> = {
      c1: { status: 'tripped', totalCurrent: 30, wireHeat: 0.5, breakerTripTimer: 2 },
      c2: { status: 'burned', totalCurrent: 50, wireHeat: 1, breakerTripTimer: 0 },
    };
    expect(worstStatus(states)).toBe('burned');
  });

  it('treats neutral-burned, leakage, main-tripped as highest severity', () => {
    const states: Record<CircuitId, CircuitState> = {
      c1: { status: 'burned', totalCurrent: 50, wireHeat: 1, breakerTripTimer: 0 },
      c2: { status: 'leakage', totalCurrent: 10, wireHeat: 0, breakerTripTimer: 0 },
    };
    // Both are severity 3, first encountered wins
    const result = worstStatus(states);
    expect(['burned', 'leakage', 'neutral-burned', 'main-tripped']).toContain(result);
  });

  it('returns normal for empty states', () => {
    expect(worstStatus({})).toBe('normal');
  });
});
