import { useRef, useEffect } from 'react';
import type { Circuit, MultiCircuitState } from '../types/game';
import type { StarDetail } from '../engine/scoring';

type GameResult = 'none' | 'tripped' | 'burned' | 'neutral-burned' | 'leakage' | 'won' | 'over-budget';

interface ResultPanelProps {
  result: GameResult;
  circuits: readonly Circuit[];
  multiState: MultiCircuitState;
  cost: number;
  budget: number;
  onRetry: () => void;
  onBackToLevels: () => void;
  starResult?: { stars: number; details: StarDetail[] } | null;
}

export default function ResultPanel({ result, circuits, multiState, cost, budget, onRetry, onBackToLevels, starResult }: ResultPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result !== 'none' && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [result]);

  if (result === 'none') return null;

  // Find the failed circuit (first tripped, burned, or leakage)
  const failedCircuit = circuits.find(c => {
    const cs = multiState.circuitStates[c.id];
    return cs && (cs.status === 'tripped' || cs.status === 'burned' || cs.status === 'leakage');
  });
  const failedState = failedCircuit ? multiState.circuitStates[failedCircuit.id] : null;
  const isSingle = circuits.length === 1;

  return (
    <div
      ref={panelRef}
      className="result-panel"
      style={{ '--result-border-color': result === 'won' ? '#22c55e' : result === 'over-budget' ? '#eab308' : '#ef4444' } as React.CSSProperties}
    >
      {result === 'won' && (
        <>
          <h2 className="result-title" style={{ color: '#22c55e' }}>過關！</h2>
          {starResult && starResult.stars > 0 && (
            <div className="star-rating-section">
              <div className="star-icons">
                {[1, 2, 3].map(i => (
                  <span key={i} className={`star-icon ${i <= starResult.stars ? 'star-lit' : 'star-dim'}`}>&#9733;</span>
                ))}
              </div>
              <ul className="star-conditions">
                {starResult.details.map(d => (
                  <li key={d.star} className={d.achieved ? 'star-achieved' : 'star-missed'}>
                    <span className="star-check">{d.achieved ? '\u2714' : '\u2716'}</span> {d.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="result-details">
            <p><strong>通電時間：</strong>{multiState.elapsed.toFixed(1)}秒</p>
            <p><strong>線材成本：</strong>${cost}</p>
            <p><strong>預算：</strong>${budget}</p>
            <p><strong>剩餘：</strong>${budget - cost}</p>
            <p className="result-hint">
              成功在預算內完成配電！
            </p>
          </div>
        </>
      )}

      {result === 'over-budget' && (
        <>
          <h2 className="result-title" style={{ color: '#eab308' }}>超預算！</h2>
          {starResult && starResult.stars > 0 && (
            <div className="star-rating-section">
              <div className="star-icons">
                {[1, 2, 3].map(i => (
                  <span key={i} className={`star-icon ${i <= starResult.stars ? 'star-lit' : 'star-dim'}`}>&#9733;</span>
                ))}
              </div>
              <ul className="star-conditions">
                {starResult.details.map(d => (
                  <li key={d.star} className={d.achieved ? 'star-achieved' : 'star-missed'}>
                    <span className="star-check">{d.achieved ? '\u2714' : '\u2716'}</span> {d.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="result-details">
            <p><strong>線材成本：</strong>${cost}</p>
            <p><strong>預算：</strong>${budget}</p>
            <p><strong>超出：</strong>${cost - budget}</p>
            <p className="result-hint">
              電路正常運作，但線材成本 ${cost} 超過預算 ${budget}。試試更便宜的線材？
            </p>
          </div>
        </>
      )}

      {result === 'tripped' && failedCircuit && failedState && (
        <>
          <h2 className="result-title" style={{ color: '#ef4444' }}>跳電！</h2>
          <div className="result-details">
            <p><strong>失敗類型：</strong>斷路器跳脫</p>
            {!isSingle && <p><strong>失敗迴路：</strong>{failedCircuit.label}</p>}
            <p><strong>總電流：</strong>{failedState.totalCurrent.toFixed(1)}A</p>
            <p><strong>NFB 額定：</strong>{failedCircuit.breaker.ratedCurrent}A</p>
            <p className="result-hint">
              {!isSingle ? `${failedCircuit.label}的` : ''}總電流 {failedState.totalCurrent.toFixed(1)}A 超過 NFB 額定 {failedCircuit.breaker.ratedCurrent}A，觸發跳電保護。
            </p>
          </div>
        </>
      )}

      {result === 'burned' && failedCircuit && failedState && (
        <>
          <h2 className="result-title" style={{ color: '#ef4444' }}>燒線！</h2>
          <div className="result-details">
            <p><strong>失敗類型：</strong>線材燒毀</p>
            {!isSingle && <p><strong>失敗迴路：</strong>{failedCircuit.label}</p>}
            <p><strong>總電流：</strong>{failedState.totalCurrent.toFixed(1)}A</p>
            <p><strong>線材安全電流：</strong>{failedCircuit.wire.maxCurrent}A（{failedCircuit.wire.crossSection}mm²）</p>
            <p className="result-hint">
              {!isSingle ? `${failedCircuit.label}的` : ''}總電流 {failedState.totalCurrent.toFixed(1)}A 超過 {failedCircuit.wire.crossSection}mm² 線材的安全電流 {failedCircuit.wire.maxCurrent}A，長時間過載導致燒線。試試更粗的線材？
            </p>
          </div>
        </>
      )}

      {result === 'neutral-burned' && (
        <>
          <h2 className="result-title" style={{ color: '#ef4444' }}>中性線燒毀！</h2>
          <div className="result-details">
            <p><strong>失敗類型：</strong>中性線過載燒毀</p>
            <p><strong>中性線電流：</strong>{multiState.neutralCurrent.toFixed(1)}A</p>
            <p><strong>中性線容量：</strong>30A</p>
            <p className="result-hint">
              紅相(R)與黑相(T)負載嚴重不平衡，中性線電流超過 30A 安全容量導致燒毀。試著平衡兩相的負載分配！
            </p>
          </div>
        </>
      )}

      {result === 'leakage' && failedCircuit && (
        <>
          <h2 className="result-title" style={{ color: '#ef4444' }}>漏電觸電！</h2>
          <div className="result-details">
            <p><strong>失敗類型：</strong>漏電觸電危險</p>
            {!isSingle && <p><strong>失敗迴路：</strong>{failedCircuit.label}</p>}
            <p className="result-hint">
              {!isSingle ? `${failedCircuit.label}` : '迴路'}發生漏電，但未安裝 ELCB 漏電斷路器，造成觸電危險！潮濕區域迴路務必安裝 ELCB。
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
