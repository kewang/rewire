import type { OldHouseSnapshot, OldHouseProblem, CircuitId, CircuitConfig, Wire, Breaker } from '../types/game';

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
  snapshot: OldHouseSnapshot,
  circuitConfigs: readonly CircuitConfig[],
  currentWires: Record<CircuitId, Wire>,
  currentBreakers: Record<CircuitId, Breaker>,
): RepairItem[] {
  const configMap = new Map(circuitConfigs.map(c => [c.id, c]));

  return snapshot.problems.map(problem => {
    const config = configMap.get(problem.circuitId);
    const label = config?.label ?? problem.circuitId;
    const snap = snapshot.circuits[problem.circuitId];

    let beforeText: string;
    let afterText: string;

    switch (problem.type) {
      case 'bare-wire':
        beforeText = '沒壓端子';
        afterText = '重新接線 + 壓接';
        break;
      case 'oxidized-splice':
        beforeText = '氧化接點';
        afterText = '重新接線 + 壓接';
        break;
      case 'wrong-wire-gauge': {
        const oldWire = snap?.wire.crossSection ?? '?';
        const newWire = currentWires[problem.circuitId]?.crossSection ?? '?';
        beforeText = `線徑過小 (${oldWire}mm²)`;
        afterText = `更換線材 → ${newWire}mm²`;
        break;
      }
      case 'overrated-breaker': {
        const oldBreaker = snap?.breaker.ratedCurrent ?? '?';
        const newBreaker = currentBreakers[problem.circuitId]?.ratedCurrent ?? '?';
        beforeText = `NFB 過大 (${oldBreaker}A)`;
        afterText = `更換 NFB ${oldBreaker}A → ${newBreaker}A`;
        break;
      }
      case 'missing-elcb':
        beforeText = '缺漏電保護';
        afterText = '安裝漏電斷路器（ELCB）';
        break;
    }

    return { circuitId: problem.circuitId, circuitLabel: label, problem, beforeText, afterText };
  });
}

export default function BeforeAfterView({ snapshot, circuitConfigs, currentWires, currentBreakers }: BeforeAfterViewProps) {
  const items = generateRepairItems(snapshot, circuitConfigs, currentWires, currentBreakers);

  if (items.length === 0) return null;

  return (
    <div className="before-after-view">
      <h3 className="before-after-title">修復對比</h3>
      <div className="before-after-grid">
        {/* Before panel */}
        <div className="ba-panel ba-before">
          <div className="ba-panel-header ba-header-before">修復前</div>
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
          <div className="ba-panel-header ba-header-after">修復後</div>
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
