import type { SimulationState } from '../types/game';

interface StatusDisplayProps {
  state: SimulationState;
  wireMaxCurrent: number;
  breakerRated: number;
  cost: number;
  budget: number;
  survivalTime: number;
}

const STATUS_LABELS: Record<SimulationState['status'], string> = {
  normal: '正常',
  warning: '過載預警',
  tripped: '跳電',
  burned: '燒毀',
};

const STATUS_COLORS: Record<SimulationState['status'], string> = {
  normal: '#22c55e',
  warning: '#eab308',
  tripped: '#ef4444',
  burned: '#ef4444',
};

export default function StatusDisplay({ state, wireMaxCurrent, breakerRated, cost, budget, survivalTime }: StatusDisplayProps) {
  const overBudget = cost > budget;
  const remainingTime = Math.max(0, survivalTime - state.elapsed);

  return (
    <div className="status-display">
      <div className="status-row">
        <span className="status-label">狀態</span>
        <span className="status-value" style={{ color: STATUS_COLORS[state.status] }}>
          {STATUS_LABELS[state.status]}
        </span>
      </div>
      <div className="status-row">
        <span className="status-label">總電流</span>
        <span className="status-value">{state.totalCurrent.toFixed(1)}A / {breakerRated}A (NFB)</span>
      </div>
      <div className="status-row">
        <span className="status-label">線材負載</span>
        <span className="status-value">{state.totalCurrent.toFixed(1)}A / {wireMaxCurrent}A</span>
      </div>
      <div className="status-row">
        <span className="status-label">線材熱度</span>
        <div className="heat-bar">
          <div
            className="heat-fill"
            style={{
              width: `${state.wireHeat * 100}%`,
              backgroundColor: state.wireHeat > 0.7 ? '#ef4444' : state.wireHeat > 0.3 ? '#eab308' : '#22c55e',
            }}
          />
        </div>
        <span className="status-value">{(state.wireHeat * 100).toFixed(0)}%</span>
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
