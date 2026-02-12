import { describe, it, expect } from 'vitest';
import { calcStars } from '../scoring';
import type { CalcStarsInput } from '../scoring';
import type { CircuitId } from '../../types/game';

// ─── Test helpers ──────────────────────────────────────────────

function makeInput(overrides: Partial<CalcStarsInput> = {}): CalcStarsInput {
  return {
    passed: true,
    finalCost: 50,
    budget: 100,
    hadWarning: false,
    hadTrip: false,
    remainingTime: 5,
    circuitCrimps: {},
    requiresCrimp: false,
    ...overrides,
  };
}

// ─── calcStars ─────────────────────────────────────────────────

describe('calcStars', () => {
  it('returns 0 stars when not passed', () => {
    const result = calcStars(makeInput({ passed: false }));
    expect(result.stars).toBe(0);
    expect(result.details[0].achieved).toBe(false);
  });

  it('returns 1 star when passed but over budget', () => {
    const result = calcStars(makeInput({ finalCost: 150, budget: 100 }));
    expect(result.stars).toBe(1);
    expect(result.details[0].achieved).toBe(true); // star 1: passed
    expect(result.details[1].achieved).toBe(false); // star 2: cost
  });

  it('returns 2 stars when passed and under budget, no bonus condition', () => {
    const result = calcStars(makeInput({ finalCost: 80, budget: 100 }));
    expect(result.stars).toBe(2);
    expect(result.details[1].achieved).toBe(true); // star 2: cost
    expect(result.details[2].achieved).toBe(false); // star 3: no bonus
  });

  it('returns 2 stars when passed, under budget, but bonus fails', () => {
    const result = calcStars(makeInput({
      finalCost: 80,
      budget: 100,
      bonusCondition: { type: 'no-warning' },
      hadWarning: true, // bonus fails
    }));
    expect(result.stars).toBe(2);
  });

  it('returns 3 stars when all conditions met', () => {
    const result = calcStars(makeInput({
      finalCost: 80,
      budget: 100,
      bonusCondition: { type: 'no-warning' },
      hadWarning: false,
    }));
    expect(result.stars).toBe(3);
    expect(result.details.every(d => d.achieved)).toBe(true);
  });

  it('stars are cumulative: 3 stars requires both 1 and 2', () => {
    // Over budget but bonus met — should be 1 star (not 3)
    const result = calcStars(makeInput({
      finalCost: 150,
      budget: 100,
      bonusCondition: { type: 'no-warning' },
      hadWarning: false,
    }));
    expect(result.stars).toBe(1);
  });

  // ─── Bonus condition types ─────────────────────────────────

  describe('bonus: no-warning', () => {
    it('passes when no warnings occurred', () => {
      const result = calcStars(makeInput({
        bonusCondition: { type: 'no-warning' },
        hadWarning: false,
      }));
      expect(result.stars).toBe(3);
    });

    it('fails when warnings occurred', () => {
      const result = calcStars(makeInput({
        bonusCondition: { type: 'no-warning' },
        hadWarning: true,
      }));
      expect(result.stars).toBe(2);
    });
  });

  describe('bonus: under-budget-ratio', () => {
    it('passes when cost <= budget × ratio', () => {
      const result = calcStars(makeInput({
        finalCost: 70,
        budget: 100,
        bonusCondition: { type: 'under-budget-ratio', ratio: 0.8 },
      }));
      expect(result.stars).toBe(3);
    });

    it('fails when cost > budget × ratio', () => {
      const result = calcStars(makeInput({
        finalCost: 85,
        budget: 100,
        bonusCondition: { type: 'under-budget-ratio', ratio: 0.8 },
      }));
      expect(result.stars).toBe(2);
    });

    it('passes at exact boundary (cost == budget × ratio)', () => {
      const result = calcStars(makeInput({
        finalCost: 80,
        budget: 100,
        bonusCondition: { type: 'under-budget-ratio', ratio: 0.8 },
      }));
      expect(result.stars).toBe(3);
    });
  });

  describe('bonus: time-margin', () => {
    it('passes when remaining time >= margin', () => {
      const result = calcStars(makeInput({
        remainingTime: 5,
        bonusCondition: { type: 'time-margin', margin: 3 },
      }));
      expect(result.stars).toBe(3);
    });

    it('fails when remaining time < margin', () => {
      const result = calcStars(makeInput({
        remainingTime: 2,
        bonusCondition: { type: 'time-margin', margin: 3 },
      }));
      expect(result.stars).toBe(2);
    });
  });

  describe('bonus: crimp-quality', () => {
    it('passes when all crimps meet minimum quality', () => {
      const result = calcStars(makeInput({
        requiresCrimp: true,
        circuitCrimps: {
          c1: { terminalType: 'o-ring', quality: 'good', contactResistance: 1.05 },
          c2: { terminalType: 'o-ring', quality: 'excellent', contactResistance: 1.0 },
        } as Record<CircuitId, { terminalType: 'o-ring'; quality: 'good' | 'excellent'; contactResistance: number }>,
        bonusCondition: { type: 'crimp-quality', minQuality: 'good' },
      }));
      expect(result.stars).toBe(3);
    });

    it('fails when any crimp is below minimum quality', () => {
      const result = calcStars(makeInput({
        requiresCrimp: true,
        circuitCrimps: {
          c1: { terminalType: 'o-ring', quality: 'good', contactResistance: 1.05 },
          c2: { terminalType: 'o-ring', quality: 'poor', contactResistance: 1.25 },
        } as Record<CircuitId, { terminalType: 'o-ring'; quality: 'good' | 'poor'; contactResistance: number }>,
        bonusCondition: { type: 'crimp-quality', minQuality: 'good' },
      }));
      expect(result.stars).toBe(2);
    });

    it('passes when crimp not required', () => {
      const result = calcStars(makeInput({
        requiresCrimp: false,
        circuitCrimps: {},
        bonusCondition: { type: 'crimp-quality', minQuality: 'good' },
      }));
      expect(result.stars).toBe(3);
    });
  });

  describe('bonus: no-trip', () => {
    it('passes when no trips occurred', () => {
      const result = calcStars(makeInput({
        hadTrip: false,
        bonusCondition: { type: 'no-trip' },
      }));
      expect(result.stars).toBe(3);
    });

    it('fails when trips occurred', () => {
      const result = calcStars(makeInput({
        hadTrip: true,
        bonusCondition: { type: 'no-trip' },
      }));
      expect(result.stars).toBe(2);
    });
  });

  describe('bonus: aesthetics-score', () => {
    it('passes when score >= minScore', () => {
      const result = calcStars(makeInput({
        aestheticsScore: 85,
        bonusCondition: { type: 'aesthetics-score', minScore: 80 },
      }));
      expect(result.stars).toBe(3);
    });

    it('fails when score < minScore', () => {
      const result = calcStars(makeInput({
        aestheticsScore: 70,
        bonusCondition: { type: 'aesthetics-score', minScore: 80 },
      }));
      expect(result.stars).toBe(2);
    });

    it('fails when aestheticsScore is undefined', () => {
      const result = calcStars(makeInput({
        aestheticsScore: undefined,
        bonusCondition: { type: 'aesthetics-score', minScore: 80 },
      }));
      expect(result.stars).toBe(2);
    });
  });

  it('returns 3 details always', () => {
    const result = calcStars(makeInput());
    expect(result.details).toHaveLength(3);
    expect(result.details[0].star).toBe(1);
    expect(result.details[1].star).toBe(2);
    expect(result.details[2].star).toBe(3);
  });
});
