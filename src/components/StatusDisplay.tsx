import type { Circuit, CircuitId, MultiCircuitState, SimulationStatus } from '../types/game';
import { NEUTRAL_MAX_CURRENT } from '../data/constants';

interface StatusDisplayProps {
  circuits: readonly Circuit[];
  multiState: MultiCircuitState;
  cost: number;
  budget: number;
  survivalTime: number;
  phases?: Record<CircuitId, 'R' | 'T'>;
}

const STATUS_LABELS: Record<SimulationStatus, string> = {
  normal: '正常',
  warning: '過載預警',
  tripped: '跳電',
  burned: '燒毀',
  'neutral-burned': '中性線燒毀',
  'elcb-tripped': 'ELCB 跳脫',
  leakage: '漏電！',
  'main-tripped': '主開關跳脫',
};

const STATUS_COLORS: Record<SimulationStatus, string> = {
  normal: '#22c55e',
  warning: '#eab308',
  tripped: '#ef4444',
  burned: '#ef4444',
  'neutral-burned': '#ef4444',
  'elcb-tripped': '#3b82f6',
  leakage: '#ef4444',
  'main-tripped': '#ef4444',
};

export default function StatusDisplay({ circuits, multiState, cost, budget, survivalTime, phases }: StatusDisplayProps) {
  const overBudget = cost > budget;
  const remainingTime = Math.max(0, survivalTime - multiState.elapsed);
  const isSingle = circuits.length === 1;

  // Single circuit: show exactly like before
  if (isSingle) {
    const circuit = circuits[0];
    const cs = multiState.circuitStates[circuit.id];
    if (!cs) return null;
    return (
      <div className="status-display">
        <div className="status-row">
          <span className="status-label">狀態</span>
          <span className="status-value" style={{ color: STATUS_COLORS[cs.status] }}>
            {STATUS_LABELS[cs.status]}
          </span>
        </div>
        <div className="status-row">
          <span className="status-label">總電流</span>
          <span className="status-value">{cs.totalCurrent.toFixed(1)}A / {circuit.breaker.ratedCurrent}A (NFB)</span>
        </div>
        <div className="status-row">
          <span className="status-label">線材負載</span>
          <span className="status-value">{cs.totalCurrent.toFixed(1)}A / {circuit.wire.maxCurrent}A</span>
        </div>
        <div className="status-row">
          <span className="status-label">線材熱度</span>
          <div className="heat-bar">
            <div
              className="heat-fill"
              style={{
                width: `${cs.wireHeat * 100}%`,
                backgroundColor: cs.wireHeat > 0.7 ? '#ef4444' : cs.wireHeat > 0.3 ? '#eab308' : '#22c55e',
              }}
            />
          </div>
          <span className="status-value">{(cs.wireHeat * 100).toFixed(0)}%</span>
        </div>
        <div className="status-row">
          <span className="status-label">剩餘時間</span>
          <span className="status-value">{remainingTime.toFixed(1)}s</span>
        </div>
        <div className="status-row">
          <span className="status-label">成本/預算</span>
          <span className="status-value" style={{ color: overBudget ? '#ef4444' : '#22c55e' }}>
            ${cost} / ${budget}{overBudget ? ' (超預算！)' : ''}
          </span>
        </div>
      </div>
    );
  }

  // Multi circuit: overall + per-circuit summaries
  const hasMixedVoltage = new Set(circuits.map(c => c.voltage)).size > 1;
  const hasPhases = phases && Object.keys(phases).length > 0;

  // Calculate per-phase currents
  let sumR = 0;
  let sumT = 0;
  if (hasPhases) {
    for (const circuit of circuits) {
      const phase = phases[circuit.id];
      if (!phase) continue;
      const cs = multiState.circuitStates[circuit.id];
      if (!cs) continue;
      if (phase === 'R') sumR += cs.totalCurrent;
      else sumT += cs.totalCurrent;
    }
  }

  const neutralColor = multiState.neutralHeat >= 1.0
    ? '#ef4444'
    : multiState.neutralCurrent > NEUTRAL_MAX_CURRENT
      ? '#eab308'
      : '#22c55e';

  return (
    <div className="status-display">
      <div className="status-row">
        <span className="status-label">整體狀態</span>
        <span className="status-value" style={{ color: STATUS_COLORS[multiState.overallStatus] }}>
          {STATUS_LABELS[multiState.overallStatus]}
        </span>
      </div>
      {circuits.map(circuit => {
        const cs = multiState.circuitStates[circuit.id];
        if (!cs) return null;
        return (
          <div key={circuit.id} className="status-row">
            <span className="status-label">
              {circuit.label}
              {hasMixedVoltage && <span style={{ color: circuit.voltage === 220 ? '#f87171' : '#4ade80', fontSize: '0.75em', marginLeft: '4px' }}>{circuit.voltage}V</span>}
              {hasPhases && phases[circuit.id] && <span className={`phase-badge phase-${phases[circuit.id]}`}>{phases[circuit.id]}</span>}
            </span>
            <span className="status-value" style={{ color: STATUS_COLORS[cs.status] }}>
              {STATUS_LABELS[cs.status]} {cs.totalCurrent.toFixed(1)}A
            </span>
          </div>
        );
      })}
      {hasPhases && (
        <div className="phase-balance-indicator">
          <div className="status-row">
            <span className="status-label"><span className="phase-badge phase-R">R</span> 紅相電流</span>
            <span className="status-value">{sumR.toFixed(1)}A</span>
          </div>
          <div className="status-row">
            <span className="status-label"><span className="phase-badge phase-T">T</span> 黑相電流</span>
            <span className="status-value">{sumT.toFixed(1)}A</span>
          </div>
          <div className="status-row">
            <span className="status-label"><span className="phase-badge phase-N">N</span> 中性線電流</span>
            <span className="status-value" style={{ color: neutralColor }}>
              {multiState.neutralCurrent.toFixed(1)}A / {NEUTRAL_MAX_CURRENT}A
            </span>
          </div>
          <div className="status-row">
            <span className="status-label">中性線熱度</span>
            <div className="heat-bar">
              <div
                className="heat-fill"
                style={{
                  width: `${multiState.neutralHeat * 100}%`,
                  backgroundColor: multiState.neutralHeat > 0.7 ? '#ef4444' : multiState.neutralHeat > 0.3 ? '#eab308' : '#22c55e',
                }}
              />
            </div>
            <span className="status-value">{(multiState.neutralHeat * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}
      <div className="status-row">
        <span className="status-label">剩餘時間</span>
        <span className="status-value">{remainingTime.toFixed(1)}s</span>
      </div>
      <div className="status-row">
        <span className="status-label">成本/預算</span>
        <span className="status-value" style={{ color: overBudget ? '#ef4444' : '#22c55e' }}>
          ${cost} / ${budget}{overBudget ? ' (超預算！)' : ''}
        </span>
      </div>
    </div>
  );
}
