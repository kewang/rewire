import { useTranslation } from 'react-i18next';
import type { Wire, Breaker, PlannerCircuit } from '../types/game';
import { DEFAULT_WIRES, BREAKER_15A, BREAKER_20A, BREAKER_30A, DEFAULT_WIRE_LENGTH, NFB_COSTS, ELCB_COST } from '../data/constants';
import { tApplianceName } from '../i18nHelpers';

interface CircuitCardProps {
  readonly circuit: PlannerCircuit;
  readonly index: number;
  readonly phaseMode?: 'auto' | 'manual';
  readonly hasWetAreaAppliance: boolean;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
  readonly onDelete: (id: string) => void;
  readonly onChangeVoltage: (id: string, voltage: 110 | 220) => void;
  readonly onChangeBreaker: (id: string, breaker: Breaker) => void;
  readonly onSelectWire: (id: string, wire: Wire) => void;
  readonly onUnassignAppliance: (circuitId: string, applianceIndex: number) => void;
  readonly onChangePhase?: (id: string, phase: 'R' | 'T') => void;
  readonly onChangeElcb?: (id: string, enabled: boolean) => void;
}

const BREAKER_OPTIONS: { breaker: Breaker; label: string }[] = [
  { breaker: BREAKER_15A, label: '15A' },
  { breaker: BREAKER_20A, label: '20A' },
  { breaker: BREAKER_30A, label: '30A' },
];

export default function CircuitCard({
  circuit,
  index,
  phaseMode,
  hasWetAreaAppliance,
  isSelected,
  onSelect,
  onDelete,
  onChangeVoltage,
  onChangeBreaker,
  onSelectWire,
  onUnassignAppliance,
  onChangePhase,
  onChangeElcb,
}: CircuitCardProps) {
  const { t } = useTranslation();
  const totalCurrent = circuit.assignedAppliances.reduce((sum, a) => {
    if (a.appliance.voltage !== circuit.voltage) return sum;
    return sum + a.appliance.power / a.appliance.voltage;
  }, 0);

  const wireCapacity = circuit.selectedWire?.maxCurrent ?? 0;
  const loadRatio = wireCapacity > 0 ? totalCurrent / wireCapacity : 0;
  const currentColor = loadRatio >= 1 ? 'var(--color-danger)' : loadRatio >= 0.8 ? 'var(--color-warning)' : 'var(--color-safe)';

  const wireCost = circuit.selectedWire ? circuit.selectedWire.costPerMeter * DEFAULT_WIRE_LENGTH : 0;
  const nfbCost = NFB_COSTS[circuit.breaker.ratedCurrent] ?? 0;
  const elcbCost = circuit.elcbEnabled ? ELCB_COST : 0;
  const circuitCost = wireCost + nfbCost + elcbCost;

  const showPhaseSelector = phaseMode != null && circuit.voltage === 110;
  const phaseDisabled = phaseMode === 'auto';

  return (
    <div className={`circuit-card voltage-${circuit.voltage}${isSelected ? ' circuit-card-selected' : ''}`} onClick={onSelect}>
      <div className="circuit-card-header">
        <span className="circuit-card-number">{t('planner.circuitNum', { num: index + 1 })}</span>
        <button className="circuit-card-delete" onClick={e => { e.stopPropagation(); onDelete(circuit.id); }} title={t('planner.deleteCircuit')}>✕</button>
      </div>

      <div className={`circuit-card-controls${showPhaseSelector ? ' has-phase' : ''}`}>
        <div className="circuit-card-field">
          <label>{t('planner.voltage')}</label>
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

        {showPhaseSelector && (
          <div className="circuit-card-field">
            <label>{t('planner.phase')}</label>
            <div className="phase-toggle">
              <button
                className={circuit.phase === 'R' ? 'active phase-r' : ''}
                onClick={() => onChangePhase?.(circuit.id, 'R')}
                disabled={phaseDisabled}
              >R</button>
              <button
                className={circuit.phase === 'T' ? 'active phase-t' : ''}
                onClick={() => onChangePhase?.(circuit.id, 'T')}
                disabled={phaseDisabled}
              >T</button>
            </div>
          </div>
        )}

        <div className="circuit-card-field">
          <label>{t('planner.nfb')}</label>
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
          <label>{t('planner.wireLabel')}</label>
          <select
            value={circuit.selectedWire?.crossSection ?? ''}
            onChange={e => {
              const wire = DEFAULT_WIRES.find(w => w.crossSection === Number(e.target.value));
              if (wire) onSelectWire(circuit.id, wire);
            }}
          >
            <option value="" disabled>{t('planner.selectWire')}</option>
            {DEFAULT_WIRES.map(w => (
              <option key={w.crossSection} value={w.crossSection}>
                {w.crossSection}mm² ({w.maxCurrent}A) ${w.costPerMeter * DEFAULT_WIRE_LENGTH}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasWetAreaAppliance && (
        <label className="elcb-toggle-planner">
          <input
            type="checkbox"
            checked={!!circuit.elcbEnabled}
            onChange={e => onChangeElcb?.(circuit.id, e.target.checked)}
          />
          <span>{t('elcb.label')}</span>
          <span className="elcb-cost-tag">${ELCB_COST}</span>
        </label>
      )}

      {circuit.assignedAppliances.length > 0 && (
        <div className="circuit-card-appliances">
          <label>{t('planner.assignedAppliances')}</label>
          <ul>
            {circuit.assignedAppliances.map((a, i) => (
              <li key={i} className="circuit-card-appliance" onClick={() => onUnassignAppliance(circuit.id, i)}>
                <span>{tApplianceName(t, a.appliance.name)}</span>
                <span className="appliance-current">{(a.appliance.power / a.appliance.voltage).toFixed(1)}A</span>
                <span className="remove-hint" title={t('planner.removeHint')}>✕</span>
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
