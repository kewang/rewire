import i18next from 'i18next';
import type { FixedCircuitLevel, CircuitConfig, OldHouseProblem, PreWiredCircuit, OldHouseConfig, Wire, Appliance, Breaker, CircuitId, OldHouseProblemType, CrimpQuality } from '../types/game';
import { DEFAULT_WIRES, DEFAULT_APPLIANCES, BREAKER_15A, BREAKER_20A, BREAKER_30A, DEFAULT_WIRE_LENGTH, ELCB_COST } from '../data/constants';
import { tRoomName } from '../i18nHelpers';

const ALL_BREAKERS: Breaker[] = [BREAKER_15A, BREAKER_20A, BREAKER_30A];

const APPLIANCES_110V: readonly Appliance[] = DEFAULT_APPLIANCES.filter(a => a.voltage === 110);
const APPLIANCES_220V: readonly Appliance[] = DEFAULT_APPLIANCES.filter(a => a.voltage === 220);

type Difficulty = 1 | 2 | 3;

interface DifficultyConfig {
  circuitRange: [number, number];
  problemRange: [number, number];
  problemPool: OldHouseProblemType[];
  phaseMode: 'auto' | 'manual' | undefined;
  leakageMode: 'random' | undefined;
  requiresRouting: boolean;
  survivalTime: number;
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  1: {
    circuitRange: [2, 3],
    problemRange: [1, 2],
    problemPool: ['bare-wire', 'wrong-wire-gauge', 'oxidized-splice'],
    phaseMode: undefined,
    leakageMode: undefined,
    requiresRouting: false,
    survivalTime: 13,
  },
  2: {
    circuitRange: [3, 4],
    problemRange: [2, 3],
    problemPool: ['bare-wire', 'wrong-wire-gauge', 'oxidized-splice', 'overrated-breaker', 'missing-elcb'],
    phaseMode: 'manual',
    leakageMode: undefined,
    requiresRouting: false,
    survivalTime: 16,
  },
  3: {
    circuitRange: [4, 6],
    problemRange: [3, 5],
    problemPool: ['bare-wire', 'wrong-wire-gauge', 'oxidized-splice', 'overrated-breaker', 'missing-elcb'],
    phaseMode: 'manual',
    leakageMode: 'random',
    requiresRouting: true,
    survivalTime: 19,
  },
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Find the minimum wire that can safely handle the given current */
function findMinWire(current: number): Wire {
  for (const wire of DEFAULT_WIRES) {
    if (wire.maxCurrent >= current) return wire;
  }
  return DEFAULT_WIRES[DEFAULT_WIRES.length - 1];
}

/** Find a wire that is too small for the given current (for wrong-wire-gauge problem) */
function findTooSmallWire(current: number): Wire | null {
  for (let i = DEFAULT_WIRES.length - 1; i >= 0; i--) {
    if (DEFAULT_WIRES[i].maxCurrent < current) return DEFAULT_WIRES[i];
  }
  return null;
}

/** Find a breaker that is correct for the given wire */
function findCorrectBreaker(wire: Wire): Breaker {
  for (const b of ALL_BREAKERS) {
    if (b.ratedCurrent <= wire.maxCurrent) return b;
  }
  return BREAKER_15A;
}

/** Find a breaker that is overrated for the given wire (ratedCurrent > wire.maxCurrent) */
function findOverratedBreaker(wire: Wire): Breaker | null {
  for (let i = ALL_BREAKERS.length - 1; i >= 0; i--) {
    if (ALL_BREAKERS[i].ratedCurrent > wire.maxCurrent) return ALL_BREAKERS[i];
  }
  return null;
}

const CIRCUIT_LABEL_KEYS = ['廚房', '客廳', '臥室', '浴室', '儲藏室', '陽台', '書房', '洗衣間'];


/**
 * Generate a random old house level for the given difficulty.
 * Pure function (depends on Math.random).
 */
export function generateRandomOldHouse(difficulty: Difficulty): FixedCircuitLevel {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const numCircuits = randInt(config.circuitRange[0], config.circuitRange[1]);
  const numProblems = Math.min(randInt(config.problemRange[0], config.problemRange[1]), numCircuits);

  // Generate circuits
  const t = i18next.t.bind(i18next);
  const labels = shuffle([...CIRCUIT_LABEL_KEYS]).slice(0, numCircuits).map(name => tRoomName(t, name));
  const circuitIds: CircuitId[] = [];
  const circuitConfigs: CircuitConfig[] = [];
  const problems: OldHouseProblem[] = [];
  const preWiredCircuits: Record<CircuitId, PreWiredCircuit> = {};

  // Decide voltage distribution: at least 1x 110V
  // Difficulty 2+: maybe 1x 220V. Difficulty 3: maybe wetArea
  const voltages: (110 | 220)[] = Array(numCircuits).fill(110);
  if (difficulty >= 2 && numCircuits >= 3 && Math.random() < 0.6) {
    voltages[numCircuits - 2] = 220;
  }
  if (difficulty >= 3 && numCircuits >= 4 && Math.random() < 0.5) {
    // Add another 220V
    const candidates = voltages.map((v, i) => v === 110 ? i : -1).filter(i => i >= 0);
    if (candidates.length > 2) {
      voltages[pick(candidates)] = 220;
    }
  }

  // wetArea decision: difficulty 3, one 220V circuit can be wetArea
  const wetAreaIndices = new Set<number>();
  if (difficulty >= 3) {
    const idx220 = voltages.map((v, i) => v === 220 ? i : -1).filter(i => i >= 0);
    if (idx220.length > 0 && Math.random() < 0.7) {
      wetAreaIndices.add(pick(idx220));
    }
  }
  // Difficulty 2 can also have wetArea for missing-elcb
  if (difficulty === 2 && !wetAreaIndices.size) {
    const idx220 = voltages.map((v, i) => v === 220 ? i : -1).filter(i => i >= 0);
    if (idx220.length > 0 && Math.random() < 0.4) {
      wetAreaIndices.add(pick(idx220));
    }
  }

  // Assign appliances to circuits
  const circuitAppliances: Appliance[][] = [];
  for (let i = 0; i < numCircuits; i++) {
    const pool = voltages[i] === 110 ? APPLIANCES_110V : APPLIANCES_220V;
    // 1-2 appliances per circuit
    const count = voltages[i] === 220 ? 1 : randInt(1, 2);
    const selected: Appliance[] = [];
    for (let j = 0; j < count; j++) {
      selected.push(pick(pool));
    }
    circuitAppliances.push(selected);
  }

  // Assign wires and breakers for each circuit
  const circuitWires: Wire[] = [];
  const circuitBreakers: Breaker[] = [];
  for (let i = 0; i < numCircuits; i++) {
    const totalCurrent = circuitAppliances[i].reduce((sum, a) => sum + a.power / a.voltage, 0);
    const wire = findMinWire(totalCurrent);
    const breaker = findCorrectBreaker(wire);
    circuitWires.push(wire);
    circuitBreakers.push(breaker);
  }

  // Select which circuits get problems
  const problemCircuitIndices = shuffle(Array.from({ length: numCircuits }, (_, i) => i)).slice(0, numProblems);
  const assignedProblems = new Map<number, OldHouseProblemType[]>();

  // Assign problems
  const availablePool = [...config.problemPool];
  for (const idx of problemCircuitIndices) {
    // Filter problem types that are valid for this circuit
    const validTypes = availablePool.filter(type => {
      if (type === 'missing-elcb') return wetAreaIndices.has(idx);
      if (type === 'overrated-breaker') {
        // Need a wire that can have an overrated breaker
        return findOverratedBreaker(circuitWires[idx]) !== null;
      }
      return true;
    });

    if (validTypes.length === 0) continue;

    const problemType = pick(validTypes);
    if (!assignedProblems.has(idx)) assignedProblems.set(idx, []);
    assignedProblems.get(idx)!.push(problemType);

    // For wrong-wire-gauge + overrated-breaker combo on same circuit (realistic)
    if (problemType === 'wrong-wire-gauge' && numProblems > problemCircuitIndices.length && Math.random() < 0.3) {
      const overrated = findOverratedBreaker(circuitWires[idx]);
      if (overrated) {
        assignedProblems.get(idx)!.push('overrated-breaker');
      }
    }
  }

  // Ensure missing-elcb is used if wetArea exists and missing-elcb is in pool
  if (wetAreaIndices.size > 0 && config.problemPool.includes('missing-elcb')) {
    const hasElcbProblem = [...assignedProblems.values()].some(types => types.includes('missing-elcb'));
    if (!hasElcbProblem) {
      const wetIdx = [...wetAreaIndices][0];
      if (!assignedProblems.has(wetIdx)) assignedProblems.set(wetIdx, []);
      assignedProblems.get(wetIdx)!.push('missing-elcb');
    }
  }

  // Build level data
  let repairCost = 0;

  for (let i = 0; i < numCircuits; i++) {
    const cid = `c${i + 1}` as CircuitId;
    circuitIds.push(cid);
    const label = labels[i];
    const voltage = voltages[i];
    const isWetArea = wetAreaIndices.has(i);
    const probs = assignedProblems.get(i) ?? [];

    // Determine the correct wire for this circuit
    const totalCurrent = circuitAppliances[i].reduce((sum, a) => sum + a.power / a.voltage, 0);
    const correctWire = findMinWire(totalCurrent);
    let preWire = correctWire;
    let preBreaker = circuitBreakers[i];
    let crimpQuality: CrimpQuality = pick(['excellent', 'good'] as CrimpQuality[]);

    // Apply problem effects to pre-wired state
    for (const prob of probs) {
      switch (prob) {
        case 'bare-wire':
          crimpQuality = 'none';
          break;
        case 'oxidized-splice':
          crimpQuality = 'none';
          break;
        case 'wrong-wire-gauge': {
          const tooSmall = findTooSmallWire(totalCurrent);
          if (tooSmall) {
            preWire = tooSmall;
            // Repair cost: need to buy correct wire
            repairCost += correctWire.costPerMeter * DEFAULT_WIRE_LENGTH;
          }
          break;
        }
        case 'overrated-breaker': {
          const overrated = findOverratedBreaker(preWire);
          if (overrated) preBreaker = overrated;
          break;
        }
        case 'missing-elcb':
          repairCost += ELCB_COST;
          break;
      }
    }

    // For problems requiring unwire+rewire (bare-wire, oxidized-splice, wrong-wire-gauge without wrong-wire)
    const needsRewire = probs.some(p => p === 'bare-wire' || p === 'oxidized-splice');
    if (needsRewire && !probs.includes('wrong-wire-gauge')) {
      // Rewiring with same gauge
      repairCost += correctWire.costPerMeter * DEFAULT_WIRE_LENGTH;
    }

    // Build problems list
    for (const prob of probs) {
      problems.push({ circuitId: cid, type: prob });
    }

    // Phase assignment for 110V circuits
    const phase = voltage === 110 && config.phaseMode ? (i % 2 === 0 ? 'R' as const : 'T' as const) : undefined;

    const circuitConfig: CircuitConfig = {
      id: cid,
      label,
      voltage,
      breaker: probs.includes('overrated-breaker') ? findCorrectBreaker(correctWire) : preBreaker,
      availableAppliances: circuitAppliances[i],
      ...(phase ? { phase } : {}),
      ...(isWetArea ? { wetArea: true, elcbAvailable: true } : {}),
    };
    circuitConfigs.push(circuitConfig);

    preWiredCircuits[cid] = {
      wire: preWire,
      crimpQuality,
      appliances: circuitAppliances[i],
      ...(probs.includes('overrated-breaker') && preBreaker ? { breaker: preBreaker } : {}),
    };
  }

  // Calculate budget: repair cost * 1.3 (30% margin), minimum $100
  const budget = Math.max(100, Math.ceil(repairCost * 1.3 / 10) * 10);

  const oldHouse: OldHouseConfig = {
    problems,
    preWiredCircuits,
  };

  const difficultyKeys: Record<Difficulty, string> = {
    1: 'random.beginner',
    2: 'random.intermediate',
    3: 'random.advanced',
  };

  const difficultyName = t(difficultyKeys[difficulty]);

  const level: FixedCircuitLevel = {
    name: t('random.levelName', { difficulty: difficultyName }),
    description: t('random.levelDesc', { circuits: numCircuits, problems: problems.length }),
    requiredAppliances: circuitAppliances.flat(),
    budget,
    survivalTime: config.survivalTime,
    requiresCrimp: true,
    circuitConfigs,
    oldHouse,
    bonusCondition: { type: 'no-warning' },
    randomDifficulty: difficulty,
    ...(config.phaseMode ? { phaseMode: config.phaseMode } : {}),
    ...(config.leakageMode ? { leakageMode: config.leakageMode } : {}),
    ...(config.requiresRouting ? { requiresRouting: true } : {}),
    ...(config.requiresRouting ? { initialLanes: shuffle([...circuitIds]) } : {}),
  };

  return level;
}

// localStorage helpers for random old house completion tracking
const STORAGE_KEY = 'rewire-random-completions';

export function loadRandomCompletions(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveRandomCompletion(difficulty: Difficulty): void {
  const data = loadRandomCompletions();
  const key = String(difficulty);
  data[key] = (data[key] ?? 0) + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
