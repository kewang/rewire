import type { TFunction } from 'i18next';
import type { SimulationStatus, CrimpQuality, CableTieQuality, BonusCondition } from './types/game';

/** Map appliance Chinese name → i18n key */
const APPLIANCE_KEY_MAP: Record<string, string> = {
  '吹風機': 'appliance.hairDryer',
  '快煮壺': 'appliance.kettle',
  '微波爐': 'appliance.microwave',
  '廚下加熱器': 'appliance.underSinkHeater',
  '烘衣機': 'appliance.dryer',
  '電熱水器': 'appliance.waterHeater',
  'IH 爐': 'appliance.ihStove',
  '冷氣': 'appliance.airCon',
  '浴室暖風機': 'appliance.bathHeater',
  '冰箱': 'appliance.fridge',
  '電暖器': 'appliance.heater',
  '烤箱': 'appliance.oven',
  '除濕機': 'appliance.dehumidifier',
};

export function tApplianceName(t: TFunction, name: string): string {
  const key = APPLIANCE_KEY_MAP[name];
  return key ? t(key) : name;
}

/** Map room Chinese name → i18n key */
const ROOM_KEY_MAP: Record<string, string> = {
  '客廳': 'room.living',
  '廚房': 'room.kitchen',
  '臥室': 'room.bedroom',
  '浴室': 'room.bathroom',
  '洗衣間': 'room.laundry',
  '儲藏室': 'room.storage',
  '陽台': 'room.balcony',
  '冷氣間': 'room.acRoom',
  '主迴路': 'room.mainCircuit',
  '書房': 'room.study',
  '客廳冷氣': 'room.livingAc',
  '主臥': 'room.masterBedroom',
  '次臥': 'room.secondBedroom',
  '玄關': 'room.entrance',
  '餐廳': 'room.dining',
  '主浴': 'room.masterBathroom',
  '客浴': 'room.guestBathroom',
  '更衣室': 'room.walkInCloset',
  '小孩房': 'room.kidsRoom',
};

export function tRoomName(t: TFunction, name: string): string {
  const key = ROOM_KEY_MAP[name];
  return key ? t(key) : name;
}

/** Translate simulation status */
const STATUS_KEY_MAP: Record<SimulationStatus, string> = {
  normal: 'status.normal',
  warning: 'status.warning',
  tripped: 'status.tripped',
  burned: 'status.burned',
  'neutral-burned': 'status.neutralBurned',
  'elcb-tripped': 'status.elcbTripped',
  leakage: 'status.leakage',
  'main-tripped': 'status.mainTripped',
};

export function tStatus(t: TFunction, status: SimulationStatus): string {
  return t(STATUS_KEY_MAP[status]);
}

/** Translate crimp quality */
const CRIMP_KEY_MAP: Record<CrimpQuality, string> = {
  excellent: 'crimp.excellent',
  good: 'crimp.good',
  poor: 'crimp.poor',
  none: 'crimp.none',
};

export function tCrimpQuality(t: TFunction, quality: CrimpQuality): string {
  return t(CRIMP_KEY_MAP[quality]);
}

/** Translate cable tie quality */
const TIE_KEY_MAP: Record<CableTieQuality, string> = {
  tight: 'cableTie.tight',
  good: 'cableTie.good',
  loose: 'cableTie.loose',
  'over-tight': 'cableTie.overTight',
};

export function tTieQuality(t: TFunction, quality: CableTieQuality): string {
  return t(TIE_KEY_MAP[quality]);
}

/** Translate level name (by index) */
export function tLevelName(t: TFunction, levelIndex: number): string {
  const key = `level.L${String(levelIndex + 1).padStart(2, '0')}.name`;
  return t(key);
}

/** Translate level description (by index) */
export function tLevelDesc(t: TFunction, levelIndex: number): string {
  const key = `level.L${String(levelIndex + 1).padStart(2, '0')}.description`;
  return t(key);
}

/** Translate bonus condition label */
export function tBonusLabel(t: TFunction, condition: BonusCondition): string {
  switch (condition.type) {
    case 'no-warning':
      return t('star.noWarning');
    case 'under-budget-ratio':
      return t('star.underBudgetRatio', { ratio: Math.round(condition.ratio * 100) });
    case 'time-margin':
      return t('star.timeMargin', { margin: condition.margin });
    case 'crimp-quality':
      return t('star.crimpQuality', { quality: condition.minQuality });
    case 'no-trip':
      return t('star.noTrip');
    case 'aesthetics-score':
      return t('star.aestheticsScore', { score: condition.minScore });
  }
}

/** Translate crimp terminal name */
export function tTerminalName(t: TFunction, type: string): string {
  return type === 'o-ring' ? t('crimp.oRing') : t('crimp.yFork');
}
