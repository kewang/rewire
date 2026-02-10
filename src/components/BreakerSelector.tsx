import type { Breaker } from '../types/game';
import { BREAKER_15A, BREAKER_20A, BREAKER_30A } from '../data/constants';

interface BreakerSelectorProps {
  currentBreaker: Breaker;
  wireMaxCurrent: number;
  onSelect: (breaker: Breaker) => void;
  onClose: () => void;
}

const BREAKER_OPTIONS: readonly Breaker[] = [BREAKER_15A, BREAKER_20A, BREAKER_30A];

export default function BreakerSelector({ currentBreaker, wireMaxCurrent, onSelect, onClose }: BreakerSelectorProps) {
  return (
    <div className="breaker-selector-backdrop" onClick={onClose}>
      <div className="breaker-selector" onClick={e => e.stopPropagation()}>
        <div className="breaker-selector-header">
          <span className="breaker-selector-title">NFB 更換</span>
          <button className="breaker-selector-close" onClick={onClose}>&times;</button>
        </div>
        <div className="breaker-selector-wire-info">
          線材安全電流 <span className="breaker-selector-wire-value">{wireMaxCurrent}A</span>
        </div>
        <div className="breaker-selector-options">
          {BREAKER_OPTIONS.map(breaker => {
            const isCurrent = breaker.ratedCurrent === currentBreaker.ratedCurrent;
            const isCompatible = breaker.ratedCurrent <= wireMaxCurrent;
            const tripThreshold = breaker.ratedCurrent * 1.25;

            return (
              <button
                key={breaker.ratedCurrent}
                className={`breaker-option ${isCurrent ? 'current' : ''} ${isCompatible ? 'compatible' : 'incompatible'}`}
                disabled={isCurrent}
                onClick={() => onSelect(breaker)}
              >
                <div className="breaker-option-rating">{breaker.ratedCurrent}A</div>
                <div className="breaker-option-trip">
                  {isCurrent ? '目前' : `${isCompatible ? '✓' : '⚠️'}`}
                </div>
                <div className="breaker-option-detail">跳脫 {tripThreshold}A</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
