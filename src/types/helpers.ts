import type {
  Appliance,
  Breaker,
  Circuit,
  CircuitConfig,
  CircuitId,
  CircuitState,
  CrimpResult,
  FixedCircuitLevel,
  FreeCircuitLevel,
  Level,
  MultiCircuitState,
  OldHouseProblem,
  SimulationState,
  Wire,
} from './game';
import { DEFAULT_BREAKER } from '../data/constants';

/** 判斷是否為自由配迴路關卡 */
export function isFreeCircuitLevel(level: Level): level is FreeCircuitLevel {
  return 'rooms' in level;
}

/** 判斷是否為固定迴路關卡 */
export function isFixedCircuitLevel(level: Level): level is FixedCircuitLevel {
  return 'circuitConfigs' in level;
}

/** 建立單迴路關卡的簡化 helper */
export function createSingleCircuitLevel(opts: {
  name: string;
  description: string;
  requiredAppliances: readonly Appliance[];
  budget: number;
  survivalTime: number;
  breaker?: Breaker;
}): FixedCircuitLevel {
  const breaker = opts.breaker ?? DEFAULT_BREAKER;
  return {
    name: opts.name,
    description: opts.description,
    requiredAppliances: opts.requiredAppliances,
    budget: opts.budget,
    survivalTime: opts.survivalTime,
    circuitConfigs: [
      {
        id: 'c1',
        label: '主迴路',
        voltage: 110,
        breaker,
        availableAppliances: opts.requiredAppliances,
      },
    ],
  };
}

/** 從 MultiCircuitState 取出單迴路的 SimulationState（向後相容） */
export function toLegacyState(
  multiState: MultiCircuitState,
  circuitId: CircuitId,
): SimulationState {
  const cs = multiState.circuitStates[circuitId];
  return {
    status: cs.status,
    totalCurrent: cs.totalCurrent,
    wireHeat: cs.wireHeat,
    elapsed: multiState.elapsed,
    breakerTripTimer: cs.breakerTripTimer,
  };
}

/** 從 CircuitConfig + 已連接線材 + 已分配電器 組成舊格式 Circuit */
export function toLegacyCircuit(
  config: CircuitConfig,
  connectedWire: Wire,
  assignedAppliances: readonly Appliance[],
): Circuit {
  return {
    id: config.id,
    label: config.label,
    voltage: config.voltage,
    breaker: config.breaker,
    wire: connectedWire,
    appliances: assignedAppliances,
  };
}

/** 問題修復判定所需的狀態 */
export interface ProblemResolutionState {
  /** 該迴路是否仍在 preWiredCircuitIds 中（尚未拆線） */
  readonly isPreWired: boolean;
  /** 該迴路是否已接線 */
  readonly isWired: boolean;
  /** 該迴路的壓接結果（undefined = 尚未壓接） */
  readonly crimpResult: CrimpResult | undefined;
  /** 該迴路當前的 NFB 規格 */
  readonly breaker: Breaker;
  /** 該迴路當前的線材 */
  readonly wire: Wire;
  /** 該迴路是否已安裝 ELCB */
  readonly elcbEnabled: boolean;
  /** 關卡是否要求壓接 */
  readonly requiresCrimp: boolean;
}

/**
 * 統一判定某個老屋問題是否已修復。
 * 各問題類型獨立判定，同迴路多問題需各自呼叫。
 */
export function isProblemResolved(problem: OldHouseProblem, state: ProblemResolutionState): boolean {
  switch (problem.type) {
    case 'bare-wire':
    case 'oxidized-splice':
      // 需要拆線（不在 preWired 中）+ 已接線 + 已壓接（若要求）
      return !state.isPreWired && state.isWired && (!state.requiresCrimp || state.crimpResult !== undefined);
    case 'wrong-wire-gauge':
      // 需要拆線 + 已接線（新線材）+ 已壓接（若要求）
      return !state.isPreWired && state.isWired && (!state.requiresCrimp || state.crimpResult !== undefined);
    case 'overrated-breaker':
      // NFB 額定電流 ≤ 線材安全電流
      return state.breaker.ratedCurrent <= state.wire.maxCurrent;
    case 'missing-elcb':
      // ELCB 已安裝
      return state.elcbEnabled;
  }
}

/** 狀態嚴重度排序：burned/neutral-burned/leakage/main-tripped > tripped/elcb-tripped > warning > normal */
const STATUS_SEVERITY: Record<CircuitState['status'], number> = {
  normal: 0,
  warning: 1,
  tripped: 2,
  'elcb-tripped': 2,
  burned: 3,
  'neutral-burned': 3,
  leakage: 3,
  'main-tripped': 3,
};

/** 計算所有迴路中最嚴重的狀態 */
export function worstStatus(
  states: Record<CircuitId, CircuitState>,
): CircuitState['status'] {
  let worst: CircuitState['status'] = 'normal';
  for (const cs of Object.values(states)) {
    if (STATUS_SEVERITY[cs.status] > STATUS_SEVERITY[worst]) {
      worst = cs.status;
    }
  }
  return worst;
}
