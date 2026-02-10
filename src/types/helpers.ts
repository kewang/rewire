import type {
  Appliance,
  Breaker,
  Circuit,
  CircuitConfig,
  CircuitId,
  CircuitState,
  FixedCircuitLevel,
  FreeCircuitLevel,
  Level,
  MultiCircuitState,
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
