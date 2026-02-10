import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import type { OldHouseSnapshot, OldHouseProblem, CircuitId, CircuitConfig, Wire, Breaker } from '../types/game';
import { tRoomName } from '../i18nHelpers';

interface BeforeAfterViewProps {
  snapshot: OldHouseSnapshot;
  circuitConfigs: readonly CircuitConfig[];
  currentWires: Record<CircuitId, Wire>;
  currentBreakers: Record<CircuitId, Breaker>;
}

interface RepairItem {
  circuitId: CircuitId;
  circuitLabel: string;
  problem: OldHouseProblem;
  beforeText: string;
  afterText: string;
}

function generateRepairItems(
  t: TFunction,
  snapshot: OldHouseSnapshot,
  circuitConfigs: readonly CircuitConfig[],
  currentWires: Record<CircuitId, Wire>,
  currentBreakers: Record<CircuitId, Breaker>,
): RepairItem[] {
  const configMap = new Map(circuitConfigs.map(c => [c.id, c]));

  return snapshot.problems.map(problem => {
    const config = configMap.get(problem.circuitId);
    const rawLabel = config?.label ?? problem.circuitId;
    const label = tRoomName(t, rawLabel);
    const snap = snapshot.circuits[problem.circuitId];

    let beforeText: string;
    let afterText: string;

    switch (problem.type) {
      case 'bare-wire':
        beforeText = t('beforeAfter.bareWire');
        afterText = t('beforeAfter.bareWireFixed');
        break;
      case 'oxidized-splice':
        beforeText = t('beforeAfter.oxidizedSplice');
        afterText = t('beforeAfter.oxidizedFixed');
        break;
      case 'wrong-wire-gauge': {
        const oldWire = snap?.wire.crossSection ?? '?';
        const newWire = currentWires[problem.circuitId]?.crossSection ?? '?';
        beforeText = t('beforeAfter.wrongGauge', { size: oldWire });
        afterText = t('beforeAfter.wrongGaugeFixed', { size: newWire });
        break;
      }
      case 'overrated-breaker': {
        const oldBreaker = snap?.breaker.ratedCurrent ?? '?';
        const newBreaker = currentBreakers[problem.circuitId]?.ratedCurrent ?? '?';
        beforeText = t('beforeAfter.overratedBreaker', { rating: oldBreaker });
        afterText = t('beforeAfter.overratedFixed', { old: oldBreaker, new: newBreaker });
        break;
      }
      case 'missing-elcb':
        beforeText = t('beforeAfter.missingElcb');
        afterText = t('beforeAfter.missingElcbFixed');
        break;
    }

    return { circuitId: problem.circuitId, circuitLabel: label, problem, beforeText, afterText };
  });
}

export default function BeforeAfterView({ snapshot, circuitConfigs, currentWires, currentBreakers }: BeforeAfterViewProps) {
  const { t } = useTranslation();
  const items = generateRepairItems(t, snapshot, circuitConfigs, currentWires, currentBreakers);

  if (items.length === 0) return null;

  return (
    <div className="before-after-view">
      <h3 className="before-after-title">{t('beforeAfter.title')}</h3>
      <div className="before-after-grid">
        {/* Before panel */}
        <div className="ba-panel ba-before">
          <div className="ba-panel-header ba-header-before">{t('beforeAfter.before')}</div>
          <ul className="ba-list">
            {items.map((item) => (
              <li key={`${item.circuitId}-${item.problem.type}`} className="ba-item ba-item-before">
                <span className="ba-icon ba-icon-warning">&#9888;</span>
                <span className="ba-label">{item.circuitLabel}</span>
                <span className="ba-desc">{item.beforeText}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* After panel */}
        <div className="ba-panel ba-after">
          <div className="ba-panel-header ba-header-after">{t('beforeAfter.after')}</div>
          <ul className="ba-list">
            {items.map((item, i) => (
              <li
                key={`${item.circuitId}-${item.problem.type}`}
                className="ba-item ba-item-after"
                style={{ animationDelay: `${0.3 + i * 0.15}s` }}
              >
                <span className="ba-icon ba-icon-check">&#10004;</span>
                <span className="ba-label">{item.circuitLabel}</span>
                <span className="ba-desc">{item.afterText}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
