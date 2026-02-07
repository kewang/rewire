import { useRef, useEffect } from 'react';
import type { SimulationState, Wire, Breaker } from '../types/game';

type GameResult = 'none' | 'tripped' | 'burned' | 'won' | 'over-budget';

interface ResultPanelProps {
  result: GameResult;
  state: SimulationState;
  wire: Wire;
  breaker: Breaker;
  cost: number;
  budget: number;
  onRetry: () => void;
  onBackToLevels: () => void;
}

export default function ResultPanel({ result, state, wire, breaker, cost, budget, onRetry, onBackToLevels }: ResultPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result !== 'none' && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [result]);

  if (result === 'none') return null;

  return (
    <div
      ref={panelRef}
      className="result-panel"
      style={{ '--result-border-color': result === 'won' ? '#22c55e' : result === 'over-budget' ? '#eab308' : '#ef4444' } as React.CSSProperties}
    >
      {result === 'won' && (
          <>
            <h2 className="result-title" style={{ color: '#22c55e' }}>過關！</h2>
            <div className="result-details">
              <p><strong>通電時間：</strong>{state.elapsed.toFixed(1)}秒</p>
              <p><strong>線材成本：</strong>${cost}</p>
              <p><strong>預算：</strong>${budget}</p>
              <p><strong>剩餘：</strong>${budget - cost}</p>
              <p className="result-hint">
                成功在預算內完成配電！選用 {wire.crossSection}mm² 線材是正確的選擇。
              </p>
            </div>
          </>
        )}

        {result === 'over-budget' && (
          <>
            <h2 className="result-title" style={{ color: '#eab308' }}>超預算！</h2>
            <div className="result-details">
              <p><strong>線材成本：</strong>${cost}</p>
              <p><strong>預算：</strong>${budget}</p>
              <p><strong>超出：</strong>${cost - budget}</p>
              <p className="result-hint">
                電路正常運作，但 {wire.crossSection}mm² 線材成本 ${cost} 超過預算 ${budget}。試試更便宜的線材？
              </p>
            </div>
          </>
        )}

        {result === 'tripped' && (
          <>
            <h2 className="result-title" style={{ color: '#ef4444' }}>跳電！</h2>
            <div className="result-details">
              <p><strong>失敗類型：</strong>斷路器跳脫</p>
              <p><strong>總電流：</strong>{state.totalCurrent.toFixed(1)}A</p>
              <p><strong>NFB 額定：</strong>{breaker.ratedCurrent}A</p>
              <p className="result-hint">
                總電流 {state.totalCurrent.toFixed(1)}A 超過 NFB 額定 {breaker.ratedCurrent}A，觸發跳電保護。
              </p>
            </div>
          </>
        )}

        {result === 'burned' && (
          <>
            <h2 className="result-title" style={{ color: '#ef4444' }}>燒線！</h2>
            <div className="result-details">
              <p><strong>失敗類型：</strong>線材燒毀</p>
              <p><strong>總電流：</strong>{state.totalCurrent.toFixed(1)}A</p>
              <p><strong>線材安全電流：</strong>{wire.maxCurrent}A（{wire.crossSection}mm²）</p>
              <p className="result-hint">
                總電流 {state.totalCurrent.toFixed(1)}A 超過 {wire.crossSection}mm² 線材的安全電流 {wire.maxCurrent}A，長時間過載導致燒線。試試更粗的線材？
              </p>
            </div>
          </>
        )}

      <div className="result-actions">
        <button className="retry-button" onClick={onRetry}>重新嘗試</button>
        <button className="back-button" onClick={onBackToLevels}>返回關卡選擇</button>
      </div>
    </div>
  );
}
