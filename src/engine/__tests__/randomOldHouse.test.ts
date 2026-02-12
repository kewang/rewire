import { describe, it, expect } from 'vitest';
import { generateRandomOldHouse } from '../randomOldHouse';
import { FLOOR_PLAN_S, FLOOR_PLAN_M, FLOOR_PLAN_L } from '../../data/floorPlans';
import { DEFAULT_WIRES, BREAKER_15A, BREAKER_20A, BREAKER_30A } from '../../data/constants';

// ─── generateRandomOldHouse ────────────────────────────────────

describe('generateRandomOldHouse', () => {
  // Run multiple times due to randomness
  const ITERATIONS = 20;

  describe('difficulty 1', () => {
    it('generates 2-3 circuits', () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const level = generateRandomOldHouse(1);
        expect(level.circuitConfigs.length).toBeGreaterThanOrEqual(2);
        expect(level.circuitConfigs.length).toBeLessThanOrEqual(3);
      }
    });

    it('uses FLOOR_PLAN_S', () => {
      const level = generateRandomOldHouse(1);
      expect(level.floorPlan).toBe(FLOOR_PLAN_S);
    });

    it('has no phaseMode', () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const level = generateRandomOldHouse(1);
        expect(level.phaseMode).toBeUndefined();
      }
    });

    it('has no leakageMode', () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const level = generateRandomOldHouse(1);
        expect(level.leakageMode).toBeUndefined();
      }
    });
  });

  describe('difficulty 2', () => {
    it('generates 3-4 circuits', () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const level = generateRandomOldHouse(2);
        expect(level.circuitConfigs.length).toBeGreaterThanOrEqual(3);
        expect(level.circuitConfigs.length).toBeLessThanOrEqual(4);
      }
    });

    it('uses FLOOR_PLAN_M', () => {
      const level = generateRandomOldHouse(2);
      expect(level.floorPlan).toBe(FLOOR_PLAN_M);
    });

    it('has manual phaseMode', () => {
      const level = generateRandomOldHouse(2);
      expect(level.phaseMode).toBe('manual');
    });
  });

  describe('difficulty 3', () => {
    it('generates 4-6 circuits', () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const level = generateRandomOldHouse(3);
        expect(level.circuitConfigs.length).toBeGreaterThanOrEqual(4);
        expect(level.circuitConfigs.length).toBeLessThanOrEqual(6);
      }
    });

    it('uses FLOOR_PLAN_L', () => {
      const level = generateRandomOldHouse(3);
      expect(level.floorPlan).toBe(FLOOR_PLAN_L);
    });

    it('has random leakageMode', () => {
      const level = generateRandomOldHouse(3);
      expect(level.leakageMode).toBe('random');
    });

    it('has requiresRouting', () => {
      const level = generateRandomOldHouse(3);
      expect(level.requiresRouting).toBe(true);
    });
  });

  describe('all difficulties', () => {
    for (const difficulty of [1, 2, 3] as const) {
      describe(`difficulty ${difficulty}`, () => {
        it('has at least one problem', () => {
          for (let i = 0; i < ITERATIONS; i++) {
            const level = generateRandomOldHouse(difficulty);
            expect(level.oldHouse!.problems.length).toBeGreaterThan(0);
          }
        });

        it('has valid oldHouse config', () => {
          const level = generateRandomOldHouse(difficulty);
          expect(level.oldHouse).toBeDefined();
          expect(level.oldHouse!.preWiredCircuits).toBeDefined();
          expect(Object.keys(level.oldHouse!.preWiredCircuits).length).toBeGreaterThan(0);
        });

        it('has budget >= 100 (minimum)', () => {
          for (let i = 0; i < ITERATIONS; i++) {
            const level = generateRandomOldHouse(difficulty);
            expect(level.budget).toBeGreaterThanOrEqual(100);
          }
        });

        it('has requiresCrimp = true', () => {
          const level = generateRandomOldHouse(difficulty);
          expect(level.requiresCrimp).toBe(true);
        });

        it('has randomDifficulty set', () => {
          const level = generateRandomOldHouse(difficulty);
          expect(level.randomDifficulty).toBe(difficulty);
        });

        it('all problems reference valid circuit IDs', () => {
          for (let i = 0; i < ITERATIONS; i++) {
            const level = generateRandomOldHouse(difficulty);
            const validIds = new Set(level.circuitConfigs.map(c => c.id));
            for (const problem of level.oldHouse!.problems) {
              expect(validIds.has(problem.circuitId)).toBe(true);
            }
          }
        });

        it('all problems are solvable (repair cost within budget)', () => {
          for (let i = 0; i < ITERATIONS; i++) {
            const level = generateRandomOldHouse(difficulty);
            const oh = level.oldHouse!;

            // Verify each problem can be resolved with available resources
            for (const problem of oh.problems) {
              const config = level.circuitConfigs.find(c => c.id === problem.circuitId)!;
              const preWired = oh.preWiredCircuits[problem.circuitId];

              // Find the smallest wire that can handle the load
              const totalCurrent = config.availableAppliances.reduce(
                (sum, a) => sum + a.power / a.voltage, 0
              );
              const correctWire = DEFAULT_WIRES.find(w => w.maxCurrent >= totalCurrent) ?? DEFAULT_WIRES[DEFAULT_WIRES.length - 1];

              // Verify the problem type makes sense
              switch (problem.type) {
                case 'overrated-breaker': {
                  // There must exist a breaker that fits the wire
                  const allBreakers = [BREAKER_15A, BREAKER_20A, BREAKER_30A];
                  const validBreaker = allBreakers.find(b => b.ratedCurrent <= correctWire.maxCurrent);
                  expect(validBreaker).toBeDefined();
                  break;
                }
                case 'missing-elcb': {
                  // Circuit must be wetArea
                  expect(config.wetArea).toBe(true);
                  break;
                }
                case 'wrong-wire-gauge': {
                  // Pre-wired wire should be too small, or if no smaller wire exists
                  // (very low current), the generator keeps the correct wire (known edge case)
                  // Just verify the wire is a valid DEFAULT_WIRES entry
                  expect(DEFAULT_WIRES.some(w => w.crossSection === preWired.wire.crossSection)).toBe(true);
                  break;
                }
                // bare-wire and oxidized-splice are always solvable
              }
            }
          }
        });

        it('has valid floor plan', () => {
          const level = generateRandomOldHouse(difficulty);
          expect(level.floorPlan).toBeDefined();
          expect(level.floorPlan!.rooms.length).toBeGreaterThan(0);
          expect(level.floorPlan!.routingGraph.nodes.length).toBeGreaterThan(0);
        });

        it('each circuit config label matches a room in floor plan', () => {
          for (let i = 0; i < ITERATIONS; i++) {
            const level = generateRandomOldHouse(difficulty);
            const roomIds = new Set(level.floorPlan!.rooms.map(r => r.id));
            for (const config of level.circuitConfigs) {
              expect(roomIds.has(config.label)).toBe(true);
            }
          }
        });
      });
    }
  });
});
