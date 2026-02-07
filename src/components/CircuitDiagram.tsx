import type { SimulationState } from '../types/game';

interface CircuitDiagramProps {
  state: SimulationState;
  isPowered: boolean;
  breakerRated: number;
}

/** wireHeat 0→1 對應 白→黃→紅→黑 */
function heatToColor(heat: number): string {
  if (heat <= 0) return 'hsl(0, 0%, 85%)';
  if (heat <= 0.3) {
    // 白 → 黃
    const t = heat / 0.3;
    const h = 45 * t;
    const s = 100 * t;
    const l = 85 - 35 * t;
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  if (heat <= 0.7) {
    // 黃 → 紅
    const t = (heat - 0.3) / 0.4;
    const h = 45 - 45 * t;
    const l = 50 - 5 * t;
    return `hsl(${h}, 100%, ${l}%)`;
  }
  // 紅 → 黑
  const t = (heat - 0.7) / 0.3;
  const s = 100 - 80 * t;
  const l = 45 - 35 * t;
  return `hsl(0, ${s}%, ${l}%)`;
}

function glowFilter(state: SimulationState): string {
  if (state.status === 'warning') return 'url(#glow-warning)';
  if (state.status === 'burned') return 'url(#glow-burned)';
  return 'none';
}

export default function CircuitDiagram({ state, isPowered, breakerRated }: CircuitDiagramProps) {
  const wireColor = heatToColor(state.wireHeat);
  const isWarning = state.status === 'warning';
  const isBurned = state.status === 'burned';

  return (
    <div className={`circuit-diagram ${isWarning ? 'warning-pulse' : ''} ${isBurned ? 'burned-smoke' : ''}`}>
      <svg viewBox="0 0 200 280" width="200" height="280">
        <defs>
          <filter id="glow-warning">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-burned">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="0.3 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* NFB Breaker */}
        <rect x="70" y="10" width="60" height="40" rx="4"
          fill={isPowered ? '#22c55e' : '#333'} stroke="#666" strokeWidth="2" />
        <text x="100" y="35" textAnchor="middle" fill={isPowered ? '#000' : '#aaa'}
          fontSize="12" fontWeight="bold">
          NFB {breakerRated}A
        </text>

        {/* Wire from NFB to junction (burned: shortened to create gap) */}
        <line x1="100" y1="50" x2="100" y2={isBurned ? 113 : 120}
          stroke={wireColor} strokeWidth="4" strokeLinecap="round"
          filter={glowFilter(state)} />

        {/* Junction point (hidden when burned) */}
        {!isBurned && (
          <circle cx="100" cy="120" r="5" fill={wireColor}
            filter={glowFilter(state)} />
        )}

        {/* Wire to outlet (burned: starts lower to create gap) */}
        <line x1="100" y1={isBurned ? 127 : 120} x2="100" y2="200"
          stroke={wireColor} strokeWidth="4" strokeLinecap="round"
          filter={glowFilter(state)} />

        {/* Outlet */}
        <rect x="70" y="200" width="60" height="50" rx="6"
          fill="#222" stroke="#666" strokeWidth="2" />
        {/* Outlet slots */}
        <rect x="85" y="215" width="8" height="20" rx="2" fill="#444" />
        <rect x="107" y="215" width="8" height="20" rx="2" fill="#444" />

        {/* Burned: exposed copper core + peeled insulation */}
        {isBurned && (
          <>
            {/* Copper core */}
            <line x1="100" y1="115" x2="100" y2="125" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
            {/* Peeled insulation - upper flap */}
            <polygon points="98,113 94,108 100,113" fill="#1a1a1a" />
            <polygon points="102,113 106,108 100,113" fill="#1a1a1a" />
            {/* Peeled insulation - lower flap */}
            <polygon points="98,127 94,132 100,127" fill="#1a1a1a" />
            <polygon points="102,127 106,132 100,127" fill="#1a1a1a" />
          </>
        )}

        {/* Warning smoke particles (wireHeat ≥ 0.3, lighter/smaller/slower than burned) */}
        {isWarning && state.wireHeat >= 0.3 && (
          <>
            {(() => {
              const opacity = state.wireHeat >= 0.7 ? 0.6 : 0.2 + (state.wireHeat - 0.3) * 1.0;
              const r = state.wireHeat >= 0.7 ? 5 : 4;
              return (
                <>
                  <circle className="smoke-particle warning-smoke-1" cx="94" cy="116" r={r}
                    fill={`rgba(180,180,180,${opacity})`} />
                  <circle className="smoke-particle warning-smoke-2" cx="106" cy="110" r={r}
                    fill={`rgba(180,180,180,${opacity * 0.8})`} />
                  {state.wireHeat >= 0.7 && (
                    <circle className="smoke-particle warning-smoke-3" cx="100" cy="104" r={r}
                      fill={`rgba(180,180,180,${opacity * 0.7})`} />
                  )}
                </>
              );
            })()}
          </>
        )}

        {/* Fire + smoke particles when burned */}
        {isBurned && (
          <>
            {/* Fire particles */}
            <circle className="fire-particle fire-1" cx="96" cy="118" r="4" fill="rgba(255,120,20,0.8)" />
            <circle className="fire-particle fire-2" cx="104" cy="116" r="3" fill="rgba(255,80,10,0.7)" />
            <circle className="fire-particle fire-3" cx="100" cy="114" r="5" fill="rgba(255,160,40,0.9)" />
            <circle className="fire-particle fire-4" cx="98" cy="120" r="3" fill="rgba(255,60,0,0.6)" />
            {/* Smoke particles */}
            <circle className="smoke-particle smoke-1" cx="95" cy="108" r="3" fill="rgba(100,100,100,0.6)" />
            <circle className="smoke-particle smoke-2" cx="105" cy="104" r="4" fill="rgba(80,80,80,0.5)" />
            <circle className="smoke-particle smoke-3" cx="100" cy="100" r="3" fill="rgba(60,60,60,0.4)" />
          </>
        )}

        {/* Status text */}
        <text x="100" y="272" textAnchor="middle" fill="#888" fontSize="11">
          {isPowered ? '送電中' : '未送電'}
        </text>
      </svg>
    </div>
  );
}
