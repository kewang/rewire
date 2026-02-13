import { useTranslation } from 'react-i18next';
import './RoutingStrategyPicker.css';
import type { RouteCandidate } from '../engine/routing';
import type { Wire } from '../types/game';

interface RoutingStrategyPickerProps {
  candidates: readonly RouteCandidate[];
  wire: Wire;
  onSelect: (strategy: 'star' | 'daisy-chain') => void;
  onCancel: () => void;
}

/** Inline SVG icon: star (home-run) topology — lines radiating from center to endpoints */
function StarIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="routing-strategy-icon">
      {/* Panel node (center-left) */}
      <circle cx="8" cy="24" r="3.5" fill="#f59e0b" />
      {/* Outlet nodes (right side, spread vertically) */}
      <circle cx="40" cy="10" r="2.5" fill="#8a96a6" />
      <circle cx="40" cy="24" r="2.5" fill="#8a96a6" />
      <circle cx="40" cy="38" r="2.5" fill="#8a96a6" />
      {/* Radiating lines from panel to each outlet */}
      <line x1="11" y1="24" x2="37" y2="10" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <line x1="11" y1="24" x2="37" y2="24" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <line x1="11" y1="24" x2="37" y2="38" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

/** Inline SVG icon: daisy-chain topology — sequential line through intermediates */
function DaisyChainIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="routing-strategy-icon">
      {/* Panel node (left) */}
      <circle cx="6" cy="24" r="3.5" fill="#38bdf8" />
      {/* Intermediate outlets (chained) */}
      <circle cx="18" cy="14" r="2.5" fill="#8a96a6" />
      <circle cx="30" cy="34" r="2.5" fill="#8a96a6" />
      <circle cx="42" cy="18" r="2.5" fill="#8a96a6" />
      {/* Chain path: panel → A → B → C */}
      <polyline
        points="9,24 18,14 30,34 42,18"
        stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        fill="none" opacity="0.8"
      />
    </svg>
  );
}

export default function RoutingStrategyPicker({ candidates, wire, onSelect, onCancel }: RoutingStrategyPickerProps) {
  const { t } = useTranslation();

  const starCandidate = candidates.find(c => c.strategy === 'star');
  const daisyCandidate = candidates.find(c => c.strategy === 'daisy-chain');

  return (
    <div className="routing-strategy-backdrop" onClick={onCancel}>
      <div className="routing-strategy-picker" onClick={e => e.stopPropagation()}>
        <div className="routing-strategy-header">
          <span className="routing-strategy-title">{t('routing.selectStrategy')}</span>
        </div>

        <div className="routing-strategy-cards">
          {starCandidate && (
            <button
              className="routing-strategy-card routing-strategy-card--star"
              onClick={() => onSelect('star')}
            >
              <StarIcon />
              <span className="routing-strategy-name">{t('routing.star')}</span>
              <div className="routing-strategy-stats">
                <div className="routing-strategy-stat">
                  <span className="routing-strategy-stat-label">{t('routing.distance')}</span>
                  <span className="routing-strategy-stat-value">{starCandidate.totalDistance}m</span>
                </div>
                <div className="routing-strategy-stat">
                  <span className="routing-strategy-stat-label">{t('routing.cost')}</span>
                  <span className="routing-strategy-stat-value routing-strategy-stat-cost">
                    ${Math.round(starCandidate.totalDistance * wire.costPerMeter * 10) / 10}
                  </span>
                </div>
              </div>
            </button>
          )}

          {daisyCandidate && (
            <button
              className="routing-strategy-card routing-strategy-card--daisy"
              onClick={() => onSelect('daisy-chain')}
            >
              <DaisyChainIcon />
              <span className="routing-strategy-name">{t('routing.daisyChain')}</span>
              <div className="routing-strategy-stats">
                <div className="routing-strategy-stat">
                  <span className="routing-strategy-stat-label">{t('routing.distance')}</span>
                  <span className="routing-strategy-stat-value">{daisyCandidate.totalDistance}m</span>
                </div>
                <div className="routing-strategy-stat">
                  <span className="routing-strategy-stat-label">{t('routing.cost')}</span>
                  <span className="routing-strategy-stat-value routing-strategy-stat-cost">
                    ${Math.round(daisyCandidate.totalDistance * wire.costPerMeter * 10) / 10}
                  </span>
                </div>
              </div>
            </button>
          )}
        </div>

        <button className="routing-strategy-cancel" onClick={onCancel}>
          {t('routing.cancel')}
        </button>
      </div>
    </div>
  );
}
