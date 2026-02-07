import type { SimulationState, Wire, Breaker } from '../types/game';

interface ResultPanelProps {
  state: SimulationState;
  wire: Wire;
  breaker: Breaker;
  onRetry: () => void;
}

export default function ResultPanel({ state, wire, breaker, onRetry }: ResultPanelProps) {
  if (state.status !== 'tripped' && state.status !== 'burned') {
    return null;
  }

  const isTripped = state.status === 'tripped';

  return (
    <div className="result-overlay">
      <div className="result-panel">
        <h2 className="result-title" style={{ color: '#ef4444' }}>
          {isTripped ? '⚡ 跳電！' : '🔥 燒線！'}
        </h2>

        <div className="result-details">
          <p><strong>失敗類型：</strong>{isTripped ? '斷路器跳脫' : '線材燒毀'}</p>
          <p><strong>總電流：</strong>{state.totalCurrent.toFixed(1)}A</p>

          {isTripped ? (
            <>
              <p><strong>NFB 額定：</strong>{breaker.ratedCurrent}A</p>
              <p className="result-hint">
                總電流 {state.totalCurrent.toFixed(1)}A 超過 NFB 額定 {breaker.ratedCurrent}A，觸發跳電保護。
              </p>
            </>
          ) : (
            <>
              <p><strong>線材安全電流：</strong>{wire.maxCurrent}A（{wire.crossSection}mm²）</p>
              <p className="result-hint">
                總電流 {state.totalCurrent.toFixed(1)}A 超過 {wire.crossSection}mm² 線材的安全電流 {wire.maxCurrent}A，長時間過載導致燒線。
              </p>
            </>
          )}
        </div>

        <button className="retry-button" onClick={onRetry}>
          重新嘗試
        </button>
      </div>
    </div>
  );
}
