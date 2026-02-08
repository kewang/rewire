import type { Circuit, MultiCircuitState, SimulationStatus } from '../types/game';

interface StatusDisplayProps {
  circuits: readonly Circuit[];
  multiState: MultiCircuitState;
  cost: number;
  budget: number;
  survivalTime: number;
}

const STATUS_LABELS: Record<SimulationStatus, string> = {
  normal: '正常',
  warning: '過載預警',
  tripped: '跳電',
  burned: '燒毀',
};

const STATUS_COLORS: Record<SimulationStatus, string> = {
  normal: '#22c55e',
  warning: '#eab308',
  tripped: '#ef4444',
  burned: '#ef4444',
};

export default function StatusDisplay({ circuits, multiState, cost, budget, survivalTime }: StatusDisplayProps) {
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
            <span className="status-label">{circuit.label}</span>
            <span className="status-value" style={{ color: STATUS_COLORS[cs.status] }}>
              {STATUS_LABELS[cs.status]} {cs.totalCurrent.toFixed(1)}A
            </span>
          </div>
        );
      })}
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
