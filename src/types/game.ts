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

/** 關卡定義 */
export interface Level {
  /** 關卡名稱 */
  readonly name: string;
  /** 必須正常運作的電器 */
  readonly requiredAppliances: readonly Appliance[];
  /** 預算 */
  readonly budget: number;
  /** 需通電維持的秒數 */
  readonly survivalTime: number;
}
