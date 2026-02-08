import type {
  Appliance,
  Circuit,
  CircuitId,
  CircuitState,
  MultiCircuitState,
  SimulationConfig,
  SimulationState,
  SimulationStatus,
} from '../types/game';
import { worstStatus } from '../types/helpers';

/** 預設模擬參數：過載約 3 秒燒毀（PRD 要求） */
const DEFAULT_CONFIG: SimulationConfig = {
  heatRate: 0.4,
  coolRate: 0.15,
};

/** 計算電器的總電流 I_total = Σ(P / V) */
export function calcTotalCurrent(appliances: readonly Appliance[]): number {
  return appliances.reduce((sum, a) => sum + a.power / a.voltage, 0);
}

/** 建立初始模擬狀態（單迴路，向後相容） */
export function createInitialState(): SimulationState {
  return {
    status: 'normal',
    totalCurrent: 0,
    wireHeat: 0,
    elapsed: 0,
    breakerTripTimer: 0,
  };
}

/** 建立初始單迴路狀態 */
export function createInitialCircuitState(): CircuitState {
  return {
    status: 'normal',
    totalCurrent: 0,
    wireHeat: 0,
    breakerTripTimer: 0,
  };
}

/** 建立多迴路初始狀態 */
export function createInitialMultiState(circuitIds: CircuitId[]): MultiCircuitState {
  const circuitStates: Record<CircuitId, CircuitState> = {};
  for (const id of circuitIds) {
    circuitStates[id] = createInitialCircuitState();
  }
  return {
    circuitStates,
    elapsed: 0,
    overallStatus: 'normal',
  };
}

/**
 * 單迴路模擬步進：純函式，接收 Circuit + 當前 CircuitState + dt，回傳新 CircuitState。
 * 不管理 elapsed（由 stepMulti 統一管理）。
 * 終態（tripped / burned）不可逆。
 */
export function step(
  circuit: Circuit,
  state: CircuitState,
  dt: number,
  config: SimulationConfig = DEFAULT_CONFIG,
): CircuitState {
  // 終態不可逆
  if (state.status === 'tripped' || state.status === 'burned') {
    return state;
  }

  const totalCurrent = calcTotalCurrent(circuit.appliances);

  // 斷路器跳脫判定（實際 NFB 在 1.25 倍額定以上才會快速跳脫）
  const tripThreshold = circuit.breaker.ratedCurrent * 1.25;
  let breakerTripTimer = state.breakerTripTimer;
  if (totalCurrent > tripThreshold) {
    breakerTripTimer += dt;
    if (breakerTripTimer >= circuit.breaker.tripDelay) {
      return {
        status: 'tripped',
        totalCurrent,
        wireHeat: state.wireHeat,
        breakerTripTimer,
      };
    }
  } else {
    breakerTripTimer = 0;
  }

  // 線材熱度模型
  let wireHeat = state.wireHeat;
  if (totalCurrent > circuit.wire.maxCurrent) {
    const overloadRatio = totalCurrent / circuit.wire.maxCurrent - 1;
    wireHeat += overloadRatio * config.heatRate * dt;
  } else {
    wireHeat -= config.coolRate * dt;
  }
  wireHeat = Math.max(0, Math.min(1, wireHeat));

  // 燒毀判定
  if (wireHeat >= 1) {
    return {
      status: 'burned',
      totalCurrent,
      wireHeat: 1,
      breakerTripTimer,
    };
  }

  // 狀態判定
  const status: SimulationStatus =
    totalCurrent > circuit.wire.maxCurrent ? 'warning' : 'normal';

  return {
    status,
    totalCurrent,
    wireHeat,
    breakerTripTimer,
  };
}

/**
 * 多迴路步進：迭代各迴路呼叫 step()，更新 elapsed 和 overallStatus。
 * 純函式，不產生副作用。
 */
export function stepMulti(
  circuits: readonly Circuit[],
  state: MultiCircuitState,
  dt: number,
  config: SimulationConfig = DEFAULT_CONFIG,
): MultiCircuitState {
  const newElapsed = state.elapsed + dt;

  const newCircuitStates: Record<CircuitId, CircuitState> = {};
  for (const circuit of circuits) {
    const circuitState = state.circuitStates[circuit.id] ?? createInitialCircuitState();
    newCircuitStates[circuit.id] = step(circuit, circuitState, dt, config);
  }

  return {
    circuitStates: newCircuitStates,
    elapsed: newElapsed,
    overallStatus: worstStatus(newCircuitStates),
  };
}
