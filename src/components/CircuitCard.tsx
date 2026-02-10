import type { Wire, Breaker, PlannerCircuit } from '../types/game';
import { DEFAULT_WIRES, BREAKER_15A, BREAKER_20A, BREAKER_30A, DEFAULT_WIRE_LENGTH, NFB_COSTS } from '../data/constants';

interface CircuitCardProps {
  readonly circuit: PlannerCircuit;
  readonly index: number;
  readonly onDelete: (id: string) => void;
  readonly onChangeVoltage: (id: string, voltage: 110 | 220) => void;
  readonly onChangeBreaker: (id: string, breaker: Breaker) => void;
  readonly onSelectWire: (id: string, wire: Wire) => void;
  readonly onUnassignAppliance: (circuitId: string, applianceIndex: number) => void;
}

const BREAKER_OPTIONS: { breaker: Breaker; label: string }[] = [
  { breaker: BREAKER_15A, label: '15A' },
  { breaker: BREAKER_20A, label: '20A' },
  { breaker: BREAKER_30A, label: '30A' },
];

export default function CircuitCard({
  circuit,
  index,
  onDelete,
  onChangeVoltage,
  onChangeBreaker,
  onSelectWire,
  onUnassignAppliance,
}: CircuitCardProps) {
  const totalCurrent = circuit.assignedAppliances.reduce((sum, a) => {
    if (a.appliance.voltage !== circuit.voltage) return sum;
    return sum + a.appliance.power / a.appliance.voltage;
  }, 0);

  const wireCapacity = circuit.selectedWire?.maxCurrent ?? 0;
  const loadRatio = wireCapacity > 0 ? totalCurrent / wireCapacity : 0;
  const currentColor = loadRatio >= 1 ? 'var(--color-danger)' : loadRatio >= 0.8 ? 'var(--color-warning)' : 'var(--color-safe)';

  const wireCost = circuit.selectedWire ? circuit.selectedWire.costPerMeter * DEFAULT_WIRE_LENGTH : 0;
  const nfbCost = NFB_COSTS[circuit.breaker.ratedCurrent] ?? 0;
  const circuitCost = wireCost + nfbCost;

  return (
    <div className={`circuit-card voltage-${circuit.voltage}`}>
      <div className="circuit-card-header">
        <span className="circuit-card-number">迴路 {index + 1}</span>
        <button className="circuit-card-delete" onClick={() => onDelete(circuit.id)} title="刪除迴路">✕</button>
      </div>

      <div className="circuit-card-controls">
        <div className="circuit-card-field">
          <label>電壓</label>
          <div className="voltage-toggle">
            <button
              className={circuit.voltage === 110 ? 'active' : ''}
              onClick={() => onChangeVoltage(circuit.id, 110)}
            >110V</button>
            <button
              className={circuit.voltage === 220 ? 'active' : ''}
              onClick={() => onChangeVoltage(circuit.id, 220)}
            >220V</button>
          </div>
        </div>

        <div className="circuit-card-field">
          <label>NFB</label>
          <select
            value={circuit.breaker.ratedCurrent}
            onChange={e => {
              const opt = BREAKER_OPTIONS.find(o => o.breaker.ratedCurrent === Number(e.target.value));
              if (opt) onChangeBreaker(circuit.id, opt.breaker);
            }}
          >
            {BREAKER_OPTIONS.map(opt => (
              <option key={opt.label} value={opt.breaker.ratedCurrent}>
                {opt.label} (${NFB_COSTS[opt.breaker.ratedCurrent]})
              </option>
            ))}
          </select>
        </div>

        <div className="circuit-card-field">
          <label>線材</label>
          <select
            value={circuit.selectedWire?.crossSection ?? ''}
            onChange={e => {
              const wire = DEFAULT_WIRES.find(w => w.crossSection === Number(e.target.value));
              if (wire) onSelectWire(circuit.id, wire);
            }}
          >
            <option value="" disabled>選擇線材</option>
            {DEFAULT_WIRES.map(w => (
              <option key={w.crossSection} value={w.crossSection}>
                {w.crossSection}mm² ({w.maxCurrent}A) ${w.costPerMeter * DEFAULT_WIRE_LENGTH}
              </option>
            ))}
          </select>
        </div>
      </div>

      {circuit.assignedAppliances.length > 0 && (
        <div className="circuit-card-appliances">
          <label>已指派電器</label>
          <ul>
            {circuit.assignedAppliances.map((a, i) => (
              <li key={i} className="circuit-card-appliance" onClick={() => onUnassignAppliance(circuit.id, i)}>
                <span>{a.appliance.name}</span>
                <span className="appliance-current">{(a.appliance.power / a.appliance.voltage).toFixed(1)}A</span>
                <span className="remove-hint" title="點擊移除">✕</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="circuit-card-footer">
        <span className="circuit-current" style={{ color: currentColor }}>
          {totalCurrent.toFixed(1)}A{circuit.selectedWire ? ` / ${wireCapacity}A` : ''}
        </span>
        <span className="circuit-cost">${circuitCost}</span>
      </div>
    </div>
  );
}
