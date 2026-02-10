import type { TFunction } from 'i18next';
import type { BonusCondition, CrimpQuality, CrimpResult, CircuitId } from '../types/game';
import { tBonusLabel } from '../i18nHelpers';

export interface StarDetail {
  readonly star: 1 | 2 | 3;
  readonly label: string;
  readonly achieved: boolean;
}

export interface CalcStarsInput {
  readonly passed: boolean;
  readonly finalCost: number;
  readonly budget: number;
  readonly bonusCondition?: BonusCondition;
  readonly hadWarning: boolean;
  readonly hadTrip: boolean;
  readonly remainingTime: number;
  readonly circuitCrimps: Record<CircuitId, CrimpResult>;
  readonly requiresCrimp: boolean;
  readonly aestheticsScore?: number;
}

const CRIMP_QUALITY_ORDER: Record<CrimpQuality, number> = {
  excellent: 3,
  good: 2,
  poor: 1,
  none: 0,
};

function checkBonus(input: CalcStarsInput): boolean {
  const { bonusCondition } = input;
  if (!bonusCondition) return false;

  switch (bonusCondition.type) {
    case 'no-warning':
      return !input.hadWarning;
    case 'under-budget-ratio':
      return input.finalCost <= input.budget * bonusCondition.ratio;
    case 'time-margin':
      return input.remainingTime >= bonusCondition.margin;
    case 'crimp-quality': {
      if (!input.requiresCrimp) return true;
      const minOrder = CRIMP_QUALITY_ORDER[bonusCondition.minQuality];
      return Object.values(input.circuitCrimps).every(
        cr => CRIMP_QUALITY_ORDER[cr.quality] >= minOrder
      );
    }
    case 'no-trip':
      return !input.hadTrip;
    case 'aesthetics-score':
      return input.aestheticsScore != null && input.aestheticsScore >= bonusCondition.minScore;
  }
}

export function calcStars(input: CalcStarsInput, t?: TFunction): { stars: number; details: StarDetail[] } {
  const star1 = input.passed;
  const star2 = star1 && input.finalCost <= input.budget;
  const star3 = star2 && checkBonus(input);

  const details: StarDetail[] = [
    { star: 1, label: t ? t('star.safePass') : '安全通關', achieved: star1 },
    { star: 2, label: t ? t('star.costMet') : '成本達標', achieved: star2 },
    {
      star: 3,
      label: input.bonusCondition
        ? (t ? tBonusLabel(t, input.bonusCondition) : input.bonusCondition.type)
        : (t ? t('star.bonusGoal') : '獎勵目標'),
      achieved: star3,
    },
  ];

  const stars = star3 ? 3 : star2 ? 2 : star1 ? 1 : 0;
  return { stars, details };
}

// localStorage persistence
const STORAGE_KEY = 'rewire-stars';

export function loadBestStars(): Record<number, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<number, number>;
  } catch {
    return {};
  }
}

export function saveBestStars(levelIndex: number, stars: number): void {
  const current = loadBestStars();
  if (stars > (current[levelIndex] ?? 0)) {
    current[levelIndex] = stars;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {
      // localStorage full or unavailable — silently ignore
    }
  }
}
