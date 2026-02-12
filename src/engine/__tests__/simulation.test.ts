import { describe, it, expect } from 'vitest';
import {
  calcTotalCurrent,
  createInitialState,
  createInitialCircuitState,
  createInitialMultiState,
  step,
  stepMulti,
} from '../simulation';
import type { Appliance, Circuit, CircuitId, CircuitState } from '../../types/game';
import { BREAKER_20A } from '../../data/constants';

// ─── Test helpers ──────────────────────────────────────────────

function makeAppliance(power: number, voltage: 110 | 220 = 110): Appliance {
  return { name: 'test', power, voltage };
}

function makeCircuit(overrides: Partial<Circuit> = {}): Circuit {
  return {
    id: 'c1' as CircuitId,
    label: 'test',
    voltage: 110,
    breaker: BREAKER_20A,
    wire: { crossSection: 2.0, maxCurrent: 20, costPerMeter: 5 },
    appliances: [],
    ...overrides,
  };
}

// ─── calcTotalCurrent ──────────────────────────────────────────

describe('calcTotalCurrent', () => {
  it('returns 0 for empty appliances', () => {
    expect(calcTotalCurrent([])).toBe(0);
  });

  it('sums P/V for each appliance', () => {
    const appliances = [
      makeAppliance(1100, 110), // 10A
      makeAppliance(550, 110),  // 5A
    ];
    expect(calcTotalCurrent(appliances)).toBeCloseTo(15, 5);
  });

  it('filters by circuit voltage when specified', () => {
    const appliances = [
      makeAppliance(1100, 110), // 10A at 110V
      makeAppliance(2200, 220), // 10A at 220V — should be excluded
    ];
    expect(calcTotalCurrent(appliances, 110)).toBeCloseTo(10, 5);
  });

  it('returns 0 when no appliances match circuit voltage', () => {
    const appliances = [makeAppliance(2200, 220)];
    expect(calcTotalCurrent(appliances, 110)).toBe(0);
  });

  it('includes all appliances when no voltage filter', () => {
    const appliances = [
      makeAppliance(1100, 110), // 10A
      makeAppliance(2200, 220), // 10A
    ];
    expect(calcTotalCurrent(appliances)).toBeCloseTo(20, 5);
  });
});

// ─── createInitialState / createInitialCircuitState ────────────

describe('createInitialState', () => {
  it('returns normal state with zero values', () => {
    const state = createInitialState();
    expect(state.status).toBe('normal');
    expect(state.totalCurrent).toBe(0);
    expect(state.wireHeat).toBe(0);
    expect(state.elapsed).toBe(0);
    expect(state.breakerTripTimer).toBe(0);
  });
});

describe('createInitialCircuitState', () => {
  it('returns normal state with zero values', () => {
    const state = createInitialCircuitState();
    expect(state.status).toBe('normal');
    expect(state.totalCurrent).toBe(0);
    expect(state.wireHeat).toBe(0);
    expect(state.breakerTripTimer).toBe(0);
  });
});

describe('createInitialMultiState', () => {
  it('creates state for all circuit IDs', () => {
    const ids = ['c1', 'c2', 'c3'] as CircuitId[];
    const state = createInitialMultiState(ids);
    expect(Object.keys(state.circuitStates)).toHaveLength(3);
    expect(state.circuitStates['c1'].status).toBe('normal');
    expect(state.elapsed).toBe(0);
    expect(state.overallStatus).toBe('normal');
    expect(state.neutralCurrent).toBe(0);
    expect(state.neutralHeat).toBe(0);
    expect(state.mainBreakerTripTimer).toBe(0);
    expect(state.totalPanelCurrent).toBe(0);
  });

  it('handles empty circuit IDs', () => {
    const state = createInitialMultiState([]);
    expect(Object.keys(state.circuitStates)).toHaveLength(0);
    expect(state.overallStatus).toBe('normal');
  });
});

// ─── step (single circuit) ─────────────────────────────────────

describe('step', () => {
  it('returns normal status when current is within capacity', () => {
    const circuit = makeCircuit({
      appliances: [makeAppliance(1100, 110)], // 10A, wire max 20A
    });
    const state = createInitialCircuitState();
    const next = step(circuit, state, 0.1);
    expect(next.status).toBe('normal');
    expect(next.totalCurrent).toBeCloseTo(10, 5);
    expect(next.wireHeat).toBe(0); // no heat when within capacity
  });

  it('heats wire when effectiveCurrent exceeds maxCurrent', () => {
    const circuit = makeCircuit({
      appliances: [makeAppliance(2500, 110)], // ~22.7A, wire max 20A
    });
    const state = createInitialCircuitState();
    const next = step(circuit, state, 1.0);
    expect(next.status).toBe('warning');
    expect(next.wireHeat).toBeGreaterThan(0);
  });

  it('cools wire when current drops below capacity', () => {
    const circuit = makeCircuit({
      appliances: [makeAppliance(550, 110)], // 5A, well below 20A
    });
    const state: CircuitState = {
      status: 'warning',
      totalCurrent: 25,
      wireHeat: 0.5,
      breakerTripTimer: 0,
    };
    const next = step(circuit, state, 1.0);
    expect(next.wireHeat).toBeLessThan(0.5);
    expect(next.status).toBe('normal');
  });

  it('trips NFB when totalCurrent > ratedCurrent × 1.25', () => {
    // BREAKER_20A: ratedCurrent=20, tripThreshold=25A, tripDelay=1.5s
    // Need totalCurrent > 25A
    const circuit = makeCircuit({
      breaker: BREAKER_20A,
      wire: { crossSection: 5.5, maxCurrent: 30, costPerMeter: 12 }, // big wire to avoid burn
      appliances: [makeAppliance(3000, 110)], // ~27.3A > 25A threshold
    });
    let state = createInitialCircuitState();
    // Step multiple times to exceed tripDelay (1.5s)
    for (let i = 0; i < 20; i++) {
      state = step(circuit, state, 0.1);
      if (state.status === 'tripped') break;
    }
    expect(state.status).toBe('tripped');
  });

  it('does not trip when totalCurrent <= ratedCurrent × 1.25', () => {
    // 24A is below 25A threshold for 20A breaker
    const circuit = makeCircuit({
      breaker: BREAKER_20A,
      appliances: [makeAppliance(2640, 110)], // 24A
    });
    let state = createInitialCircuitState();
    for (let i = 0; i < 20; i++) {
      state = step(circuit, state, 0.1);
    }
    expect(state.status).not.toBe('tripped');
  });

  it('burns wire when wireHeat reaches 1.0', () => {
    // Small wire (15A max) with high current (no NFB trip — use big breaker)
    const circuit = makeCircuit({
      breaker: { ratedCurrent: 100, tripDelay: 100 }, // won't trip
      wire: { crossSection: 1.6, maxCurrent: 15, costPerMeter: 3 },
      appliances: [makeAppliance(5500, 110)], // 50A >> 15A max
    });
    let state = createInitialCircuitState();
    for (let i = 0; i < 100; i++) {
      state = step(circuit, state, 0.1);
      if (state.status === 'burned') break;
    }
    expect(state.status).toBe('burned');
    expect(state.wireHeat).toBe(1);
  });

  it('is immutable for terminal states', () => {
    const circuit = makeCircuit();
    const tripped: CircuitState = {
      status: 'tripped',
      totalCurrent: 30,
      wireHeat: 0.5,
      breakerTripTimer: 2,
    };
    const next = step(circuit, tripped, 1.0);
    expect(next).toBe(tripped); // same reference
  });

  it('accounts for contactResistance in effectiveCurrent', () => {
    // contactResistance = 2.0 → effectiveCurrent = totalCurrent × √2 ≈ 1.414×
    // 15A × 1.414 ≈ 21.2A > 20A maxCurrent → warning
    const circuit = makeCircuit({
      contactResistance: 2.0,
      appliances: [makeAppliance(1650, 110)], // 15A
    });
    const state = createInitialCircuitState();
    const next = step(circuit, state, 0.1);
    expect(next.status).toBe('warning');
    expect(next.wireHeat).toBeGreaterThan(0);
  });

  it('NFB trips on totalCurrent not effectiveCurrent', () => {
    // totalCurrent = 15A, effectiveCurrent = 15 × √2 ≈ 21.2A
    // But NFB threshold = 20 × 1.25 = 25A → no trip (15A < 25A)
    const circuit = makeCircuit({
      contactResistance: 2.0,
      breaker: BREAKER_20A,
      appliances: [makeAppliance(1650, 110)], // 15A
    });
    let state = createInitialCircuitState();
    for (let i = 0; i < 20; i++) {
      state = step(circuit, state, 0.1);
      if (state.status === 'tripped') break;
    }
    expect(state.status).not.toBe('tripped');
  });
});

// ─── stepMulti ─────────────────────────────────────────────────

describe('stepMulti', () => {
  it('advances elapsed time', () => {
    const circuits = [makeCircuit()];
    const state = createInitialMultiState(['c1' as CircuitId]);
    const next = stepMulti(circuits, state, 0.5);
    expect(next.elapsed).toBeCloseTo(0.5, 5);
  });

  it('computes neutralCurrent as |sumR - sumT|', () => {
    const c1 = makeCircuit({
      id: 'c1' as CircuitId,
      appliances: [makeAppliance(1100, 110)], // 10A on R
    });
    const c2 = makeCircuit({
      id: 'c2' as CircuitId,
      appliances: [makeAppliance(660, 110)], // 6A on T
    });
    const phases = { c1: 'R' as const, c2: 'T' as const };
    const state = createInitialMultiState(['c1', 'c2'] as CircuitId[]);
    const next = stepMulti([c1, c2], state, 0.1, phases);
    // |10 - 6| = 4A
    expect(next.neutralCurrent).toBeCloseTo(4, 1);
  });

  it('does not count 220V circuits in neutral current', () => {
    const c1 = makeCircuit({
      id: 'c1' as CircuitId,
      voltage: 220,
      appliances: [makeAppliance(2200, 220)], // 10A at 220V
    });
    // No phase assigned for 220V circuit
    const state = createInitialMultiState(['c1'] as CircuitId[]);
    const next = stepMulti([c1], state, 0.1, {});
    expect(next.neutralCurrent).toBe(0);
  });

  it('triggers neutral-burned when neutralHeat reaches 1.0', () => {
    // Two circuits, highly imbalanced: R has very high current, T has 0
    const c1 = makeCircuit({
      id: 'c1' as CircuitId,
      breaker: { ratedCurrent: 100, tripDelay: 100 },
      wire: { crossSection: 14, maxCurrent: 70, costPerMeter: 28 },
      appliances: [makeAppliance(5500, 110)], // 50A on R, way above NEUTRAL_MAX_CURRENT(30A)
    });
    const phases = { c1: 'R' as const };
    let state = createInitialMultiState(['c1'] as CircuitId[]);
    for (let i = 0; i < 100; i++) {
      state = stepMulti([c1], state, 0.1, phases);
      if (state.overallStatus === 'neutral-burned') break;
    }
    expect(state.overallStatus).toBe('neutral-burned');
    expect(state.neutralHeat).toBe(1);
  });

  it('triggers main-tripped when totalPanelCurrent exceeds rating for 1.5s', () => {
    // mainBreakerRating = 30A, threshold = 37.5A
    // Two circuits each drawing 25A = 50A total
    const c1 = makeCircuit({
      id: 'c1' as CircuitId,
      breaker: { ratedCurrent: 100, tripDelay: 100 },
      wire: { crossSection: 5.5, maxCurrent: 30, costPerMeter: 12 },
      appliances: [makeAppliance(2750, 110)], // 25A
    });
    const c2 = makeCircuit({
      id: 'c2' as CircuitId,
      breaker: { ratedCurrent: 100, tripDelay: 100 },
      wire: { crossSection: 5.5, maxCurrent: 30, costPerMeter: 12 },
      appliances: [makeAppliance(2750, 110)], // 25A
    });
    let state = createInitialMultiState(['c1', 'c2'] as CircuitId[]);
    for (let i = 0; i < 30; i++) {
      state = stepMulti([c1, c2], state, 0.1, undefined, 30);
      if (state.overallStatus === 'main-tripped') break;
    }
    expect(state.overallStatus).toBe('main-tripped');
  });

  it('does not trigger main-tripped without mainBreakerRating', () => {
    const c1 = makeCircuit({
      id: 'c1' as CircuitId,
      breaker: { ratedCurrent: 100, tripDelay: 100 },
      wire: { crossSection: 5.5, maxCurrent: 30, costPerMeter: 12 },
      appliances: [makeAppliance(2750, 110)], // 25A
    });
    let state = createInitialMultiState(['c1'] as CircuitId[]);
    for (let i = 0; i < 30; i++) {
      state = stepMulti([c1], state, 0.1);
    }
    expect(state.overallStatus).not.toBe('main-tripped');
  });

  it('overallStatus reflects worst circuit status', () => {
    const c1 = makeCircuit({
      id: 'c1' as CircuitId,
      appliances: [makeAppliance(550, 110)], // 5A — normal
    });
    const c2 = makeCircuit({
      id: 'c2' as CircuitId,
      appliances: [makeAppliance(2500, 110)], // ~22.7A > 20A — warning
    });
    const state = createInitialMultiState(['c1', 'c2'] as CircuitId[]);
    const next = stepMulti([c1, c2], state, 0.1);
    expect(next.overallStatus).toBe('warning');
  });

  it('is immutable for fatal terminal states', () => {
    const circuits = [makeCircuit({ id: 'c1' as CircuitId })];
    const state = createInitialMultiState(['c1'] as CircuitId[]);
    const terminalState = { ...state, overallStatus: 'neutral-burned' as const };
    const next = stepMulti(circuits, terminalState, 0.1);
    expect(next).toBe(terminalState);
  });

  it('resets main breaker trip timer when current drops', () => {
    // First accumulate some timer, then reduce current
    const c1 = makeCircuit({
      id: 'c1' as CircuitId,
      breaker: { ratedCurrent: 100, tripDelay: 100 },
      wire: { crossSection: 14, maxCurrent: 70, costPerMeter: 28 },
      appliances: [makeAppliance(5500, 110)], // 50A > 37.5A (30×1.25)
    });
    let state = createInitialMultiState(['c1'] as CircuitId[]);
    // Accumulate timer
    state = stepMulti([c1], state, 0.5, undefined, 30);
    expect(state.mainBreakerTripTimer).toBeGreaterThan(0);

    // Drop current below threshold
    const c1Low = makeCircuit({
      id: 'c1' as CircuitId,
      breaker: { ratedCurrent: 100, tripDelay: 100 },
      wire: { crossSection: 14, maxCurrent: 70, costPerMeter: 28 },
      appliances: [makeAppliance(550, 110)], // 5A << 37.5A
    });
    state = stepMulti([c1Low], state, 0.1, undefined, 30);
    expect(state.mainBreakerTripTimer).toBe(0);
  });
});
