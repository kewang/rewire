import type {
  Appliance,
  Circuit,
  SimulationConfig,
  SimulationState,
  SimulationStatus,
} from '../types/game';

/** 預設模擬參數：過載約 3 秒燒毀（PRD 要求） */
const DEFAULT_CONFIG: SimulationConfig = {
  heatRate: 0.4,
  coolRate: 0.15,
};

/** 計算電器的總電流 I_total = Σ(P / V) */
export function calcTotalCurrent(appliances: readonly Appliance[]): number {
  return appliances.reduce((sum, a) => sum + a.power / a.voltage, 0);
}

/** 建立初始模擬狀態 */
export function createInitialState(): SimulationState {
  return {
    status: 'normal',
    totalCurrent: 0,
    wireHeat: 0,
    elapsed: 0,
    breakerTripTimer: 0,
  };
}

/**
 * 模擬步進：純函式，接收 Circuit + 當前狀態 + dt，回傳新狀態。
 * 終態（tripped / burned）不可逆。
 */
export function step(
  circuit: Circuit,
  state: SimulationState,
  dt: number,
  config: SimulationConfig = DEFAULT_CONFIG,
): SimulationState {
  // 終態不可逆
  if (state.status === 'tripped' || state.status === 'burned') {
    return state;
  }

  const totalCurrent = calcTotalCurrent(circuit.appliances);
  const elapsed = state.elapsed + dt;

  // 斷路器跳脫判定
  let breakerTripTimer = state.breakerTripTimer;
  if (totalCurrent > circuit.breaker.ratedCurrent) {
    breakerTripTimer += dt;
    if (breakerTripTimer >= circuit.breaker.tripDelay) {
      return {
        status: 'tripped',
        totalCurrent,
        wireHeat: state.wireHeat,
        elapsed,
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
      elapsed,
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
    elapsed,
    breakerTripTimer,
  };
}
