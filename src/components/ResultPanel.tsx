import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './ResultPanel.css';
import type { Circuit, MultiCircuitState, OldHouseSnapshot, CircuitId, CircuitConfig, Wire, Breaker } from '../types/game';
import type { StarDetail } from '../engine/scoring';
import BeforeAfterView from './BeforeAfterView';

type GameResult = 'none' | 'tripped' | 'burned' | 'neutral-burned' | 'leakage' | 'main-tripped' | 'won' | 'over-budget';

interface ResultPanelProps {
  result: GameResult;
  circuits: readonly Circuit[];
  multiState: MultiCircuitState;
  cost: number;
  budget: number;
  onRetry: () => void;
  onBackToLevels: () => void;
  starResult?: { stars: number; details: StarDetail[] } | null;
  aestheticsScore?: number;
  oldHouseSnapshot?: OldHouseSnapshot | null;
  circuitConfigs?: readonly CircuitConfig[];
  currentWires?: Record<CircuitId, Wire>;
  currentBreakers?: Record<CircuitId, Breaker>;
  currentElcb?: Record<CircuitId, boolean>;
}

export default function ResultPanel({ result, circuits, multiState, cost, budget, onRetry, onBackToLevels, starResult, aestheticsScore, oldHouseSnapshot, circuitConfigs, currentWires, currentBreakers, currentElcb }: ResultPanelProps) {
  const { t } = useTranslation();
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

  const showBeforeAfter = (result === 'won' || result === 'over-budget')
    && oldHouseSnapshot && circuitConfigs && currentWires && currentBreakers && currentElcb;

  return (
    <div
      ref={panelRef}
      className="result-panel"
      style={{ '--result-border-color': result === 'won' ? '#22c55e' : result === 'over-budget' ? '#eab308' : '#ef4444' } as React.CSSProperties}
    >
      {result === 'won' && (
        <>
          <h2 className="result-title" style={{ color: '#22c55e' }}>{t('result.passed')}</h2>
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
            <p><strong>{t('result.powerTime')}:</strong> {multiState.elapsed.toFixed(1)}s</p>
            <p><strong>{t('result.wireCost')}:</strong> ${cost}</p>
            <p><strong>{t('result.budgetLabel')}:</strong> ${budget}</p>
            <p><strong>{t('result.remaining')}:</strong> ${budget - cost}</p>
            <p className="result-hint">{t('result.passedHint')}</p>
            {aestheticsScore != null && (
              <p className="aesthetics-score-line">
                <strong>{t('result.aestheticsScore')}:</strong>
                <span className={`aesthetics-score-value ${aestheticsScore >= 80 ? 'score-green' : aestheticsScore >= 50 ? 'score-yellow' : 'score-red'}`}>
                  {aestheticsScore} / 100
                </span>
              </p>
            )}
          </div>
        </>
      )}

      {result === 'over-budget' && (
        <>
          <h2 className="result-title" style={{ color: '#eab308' }}>{t('result.overBudget')}</h2>
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
            <p><strong>{t('result.wireCost')}:</strong> ${cost}</p>
            <p><strong>{t('result.budgetLabel')}:</strong> ${budget}</p>
            <p><strong>{t('result.exceeded')}:</strong> ${cost - budget}</p>
            <p className="result-hint">{t('result.overBudgetHint', { cost, budget })}</p>
          </div>
        </>
      )}

      {result === 'tripped' && failedCircuit && failedState && (
        <>
          <h2 className="result-title" style={{ color: '#ef4444' }}>{t('result.tripped')}</h2>
          <div className="result-details">
            <p><strong>{t('result.failType')}:</strong> {t('result.breakerTrip')}</p>
            {!isSingle && <p><strong>{t('result.failedCircuit')}:</strong> {failedCircuit.label}</p>}
            <p><strong>{t('status.totalCurrent')}:</strong> {failedState.totalCurrent.toFixed(1)}A</p>
            <p><strong>{t('result.nfbRating')}:</strong> {failedCircuit.breaker.ratedCurrent}A</p>
            <p className="result-hint">
              {t('result.trippedHint', {
                prefix: !isSingle ? t('result.trippedHintPrefix', { label: failedCircuit.label }) : '',
                current: failedState.totalCurrent.toFixed(1),
                rated: failedCircuit.breaker.ratedCurrent,
              })}
            </p>
          </div>
        </>
      )}

      {result === 'burned' && failedCircuit && failedState && (
        <>
          <h2 className="result-title" style={{ color: '#ef4444' }}>{t('result.burned')}</h2>
          <div className="result-details">
            <p><strong>{t('result.failType')}:</strong> {t('result.wireBurn')}</p>
            {!isSingle && <p><strong>{t('result.failedCircuit')}:</strong> {failedCircuit.label}</p>}
            <p><strong>{t('status.totalCurrent')}:</strong> {failedState.totalCurrent.toFixed(1)}A</p>
            <p><strong>{t('result.wireMaxCurrent')}:</strong> {failedCircuit.wire.maxCurrent}A ({failedCircuit.wire.crossSection}mm²)</p>
            <p className="result-hint">
              {t('result.burnedHint', {
                prefix: !isSingle ? t('result.trippedHintPrefix', { label: failedCircuit.label }) : '',
                current: failedState.totalCurrent.toFixed(1),
                crossSection: failedCircuit.wire.crossSection,
                maxCurrent: failedCircuit.wire.maxCurrent,
              })}
            </p>
          </div>
        </>
      )}

      {result === 'neutral-burned' && (
        <>
          <h2 className="result-title" style={{ color: '#ef4444' }}>{t('result.neutralBurned')}</h2>
          <div className="result-details">
            <p><strong>{t('result.failType')}:</strong> {t('result.neutralOverload')}</p>
            <p><strong>{t('status.neutralCurrent')}:</strong> {multiState.neutralCurrent.toFixed(1)}A</p>
            <p><strong>{t('result.neutralCapacity')}:</strong> 30A</p>
            <p className="result-hint">{t('result.neutralBurnedHint')}</p>
          </div>
        </>
      )}

      {result === 'main-tripped' && (
        <>
          <h2 className="result-title" style={{ color: '#ef4444' }}>{t('result.mainTripped')}</h2>
          <div className="result-details">
            <p><strong>{t('result.failType')}:</strong> {t('result.mainOverload')}</p>
            <p className="result-hint">{t('result.mainTrippedHint')}</p>
          </div>
        </>
      )}

      {result === 'leakage' && failedCircuit && (
        <>
          <h2 className="result-title" style={{ color: '#ef4444' }}>{t('result.leakage')}</h2>
          <div className="result-details">
            <p><strong>{t('result.failType')}:</strong> {t('result.leakageDanger')}</p>
            {!isSingle && <p><strong>{t('result.failedCircuit')}:</strong> {failedCircuit.label}</p>}
            <p className="result-hint">
              {t('result.leakageHint', {
                label: !isSingle ? failedCircuit.label : t('result.leakageHintDefault'),
              })}
            </p>
          </div>
        </>
      )}

      {showBeforeAfter && (
        <BeforeAfterView
          snapshot={oldHouseSnapshot}
          circuitConfigs={circuitConfigs}
          currentWires={currentWires}
          currentBreakers={currentBreakers}
        />
      )}

      <div className="result-actions">
        <button className="retry-button" onClick={onRetry}>{t('nav.retry')}</button>
        <button className="back-button" onClick={onBackToLevels}>{t('nav.backToLevels')}</button>
      </div>
    </div>
  );
}
