import type { Wire, Appliance, Breaker } from '../types/game';

/** 預設線材（PRD v0.1 第 6 節） */
export const DEFAULT_WIRES = [
  { crossSection: 1.6, maxCurrent: 15, costPerMeter: 3 },
  { crossSection: 2.0, maxCurrent: 20, costPerMeter: 5 },
  { crossSection: 5.5, maxCurrent: 30, costPerMeter: 12 },
] as const satisfies readonly Wire[];

/** 預設電器（PRD v0.1 第 6 節） */
export const DEFAULT_APPLIANCES = [
  { name: '吹風機', power: 1200, voltage: 110 },
  { name: '快煮壺', power: 1500, voltage: 110 },
  { name: '微波爐', power: 1100, voltage: 110 },
] as const satisfies readonly Appliance[];

/** 預設 NFB（PRD v0.1 第 6 節） */
export const DEFAULT_BREAKER: Breaker = {
  ratedCurrent: 20,
  tripDelay: 1.5,
} as const;

/** 預設線長（米），v0.1 固定值 */
export const DEFAULT_WIRE_LENGTH = 10;
