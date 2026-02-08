import type {
  Appliance,
  Breaker,
  Circuit,
  CircuitConfig,
  CircuitId,
  CircuitState,
  Level,
  MultiCircuitState,
  SimulationState,
  Wire,
} from './game';
import { DEFAULT_BREAKER } from '../data/constants';

/** 建立單迴路關卡的簡化 helper */
export function createSingleCircuitLevel(opts: {
  name: string;
  description: string;
  requiredAppliances: readonly Appliance[];
  budget: number;
  survivalTime: number;
  breaker?: Breaker;
}): Level {
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
    breaker: config.breaker,
    wire: connectedWire,
    appliances: assignedAppliances,
  };
}

/** 狀態嚴重度排序：burned > tripped > warning > normal */
const STATUS_SEVERITY: Record<CircuitState['status'], number> = {
  normal: 0,
  warning: 1,
  tripped: 2,
  burned: 3,
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
