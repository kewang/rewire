/** 線材 */
export interface Wire {
  /** 線徑 (mm²) */
  readonly crossSection: number;
  /** 最大安全電流 (A) */
  readonly maxCurrent: number;
  /** 每米成本 */
  readonly costPerMeter: number;
}

/** 電器 */
export interface Appliance {
  /** 名稱 */
  readonly name: string;
  /** 功率 (W) */
  readonly power: number;
  /** 電壓 (V) */
  readonly voltage: number;
}

/** NFB 斷路器 */
export interface Breaker {
  /** 額定電流 (A) */
  readonly ratedCurrent: number;
  /** 跳脫延遲 (秒) */
  readonly tripDelay: number;
}

/** 迴路：NFB + 線材 + 插座上的電器 */
export interface Circuit {
  readonly breaker: Breaker;
  readonly wire: Wire;
  readonly appliances: readonly Appliance[];
}

/** 模擬狀態 */
export type SimulationStatus = 'normal' | 'warning' | 'tripped' | 'burned';

/** 模擬動態狀態 */
export interface SimulationState {
  /** 當前狀態 */
  readonly status: SimulationStatus;
  /** 當前總電流 (A) */
  readonly totalCurrent: number;
  /** 線材熱度 (0.0 ~ 1.0，1.0 = 燒毀) */
  readonly wireHeat: number;
  /** 已通電時間 (秒) */
  readonly elapsed: number;
  /** 斷路器跳脫計時器 (秒，電流超過額定時累計) */
  readonly breakerTripTimer: number;
}

/** 模擬可調參數 */
export interface SimulationConfig {
  /** 過載時每秒熱度上升係數 */
  readonly heatRate: number;
  /** 正常時每秒熱度冷卻係數 */
  readonly coolRate: number;
}

/** 關卡定義 */
export interface Level {
  /** 關卡名稱 */
  readonly name: string;
  /** 關卡描述 */
  readonly description: string;
  /** 必須正常運作的電器 */
  readonly requiredAppliances: readonly Appliance[];
  /** 預算 */
  readonly budget: number;
  /** 需通電維持的秒數 */
  readonly survivalTime: number;
}
