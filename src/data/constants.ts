import type { Wire, Appliance, Breaker } from '../types/game';

/** 預設線材（PRD v0.2 第 3 節） */
export const DEFAULT_WIRES = [
  { crossSection: 1.6, maxCurrent: 15, costPerMeter: 3 },
  { crossSection: 2.0, maxCurrent: 20, costPerMeter: 5 },
  { crossSection: 3.5, maxCurrent: 25, costPerMeter: 8 },
  { crossSection: 5.5, maxCurrent: 30, costPerMeter: 12 },
  { crossSection: 8, maxCurrent: 45, costPerMeter: 18 },
  { crossSection: 14, maxCurrent: 70, costPerMeter: 28 },
] as const satisfies readonly Wire[];

/** 預設電器（PRD v0.2 第 3 節 + v0.3 電壓區分） */
export const DEFAULT_APPLIANCES = [
  { name: '吹風機', power: 1200, voltage: 110 },
  { name: '快煮壺', power: 1500, voltage: 110 },
  { name: '微波爐', power: 1100, voltage: 110 },
  { name: '廚下加熱器', power: 800, voltage: 110 },
  { name: '烘衣機', power: 2200, voltage: 220 },
  { name: '電熱水器', power: 4400, voltage: 220 },
  { name: 'IH 爐', power: 3000, voltage: 220 },
  { name: '冷氣', power: 2800, voltage: 220 },
  { name: '浴室暖風機', power: 1650, voltage: 220 },
  { name: '冰箱', power: 200, voltage: 110 },
] as const satisfies readonly Appliance[];

/** NFB 15A（照明/低功率迴路） */
export const BREAKER_15A: Breaker = { ratedCurrent: 15, tripDelay: 1.5 } as const;

/** NFB 20A（一般插座迴路，預設） */
export const BREAKER_20A: Breaker = { ratedCurrent: 20, tripDelay: 1.5 } as const;

/** NFB 30A（大電流專用迴路） */
export const BREAKER_30A: Breaker = { ratedCurrent: 30, tripDelay: 1.5 } as const;

/** 預設 NFB（向後相容，等同 BREAKER_20A） */
export const DEFAULT_BREAKER: Breaker = BREAKER_20A;

/** ELCB 漏電斷路器每迴路成本 */
export const ELCB_COST = 35;

/** 中性線安全容量 (A) */
export const NEUTRAL_MAX_CURRENT = 30;

/** 隨機漏電機率（每秒 5%） */
export const LEAKAGE_CHANCE_PER_SECOND = 0.05;

/** 預設線長（米），v0.1 固定值 */
export const DEFAULT_WIRE_LENGTH = 10;
