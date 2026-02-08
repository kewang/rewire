import { useRef, useCallback, useState, useEffect } from 'react';
import type { SimulationState, WiringState } from '../types/game';

interface CircuitDiagramProps {
  state: SimulationState;
  isPowered: boolean;
  breakerRated: number;
  wiring: WiringState;
}

/** wireHeat 0→1 對應 白→黃→紅→黑 */
function heatToColor(heat: number): string {
  if (heat <= 0) return 'hsl(0, 0%, 85%)';
  if (heat <= 0.3) {
    const t = heat / 0.3;
    const h = 45 * t;
    const s = 100 * t;
    const l = 85 - 35 * t;
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  if (heat <= 0.7) {
    const t = (heat - 0.3) / 0.4;
    const h = 45 - 45 * t;
    const l = 50 - 5 * t;
    return `hsl(${h}, 100%, ${l}%)`;
  }
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

/** Map wire cross-section to a distinct color for preview */
function wireGaugeColor(crossSection: number): string {
  if (crossSection <= 1.6) return '#93c5fd'; // blue-300
  if (crossSection <= 2.0) return '#86efac'; // green-300
  if (crossSection <= 3.5) return '#fde047'; // yellow-300
  if (crossSection <= 5.5) return '#fdba74'; // orange-300
  return '#f87171'; // red-400
}

function clientToSvg(svgEl: SVGSVGElement, clientX: number, clientY: number): { x: number; y: number } {
  const pt = svgEl.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svgEl.getScreenCTM();
  if (!ctm) return { x: 100, y: 120 };
  const svgPt = pt.matrixTransform(ctm.inverse());
  return { x: svgPt.x, y: svgPt.y };
}

export default function CircuitDiagram({ state, isPowered, breakerRated, wiring }: CircuitDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const prevIsWired = useRef(wiring.isWired);

  const wireColor = heatToColor(state.wireHeat);
  const isWarning = state.status === 'warning';
  const isBurned = state.status === 'burned';

  // Trigger flash when wiring completes (isWired: false → true)
  useEffect(() => {
    if (wiring.isWired && !prevIsWired.current) {
      setFlashActive(true);
      setTimeout(() => setFlashActive(false), 400);
    }
    prevIsWired.current = wiring.isWired;
  }, [wiring.isWired]);

  // Reset drop zone highlight when drag ends
  useEffect(() => {
    if (!wiring.isDragging) {
      setIsOverDropZone(false);
    }
  }, [wiring.isDragging]);

  // Track cursor entering/leaving this element during drag via global pointermove
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!wiring.isDragging || !wiring.cursorPos) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const inside =
      wiring.cursorPos.x >= rect.left &&
      wiring.cursorPos.x <= rect.right &&
      wiring.cursorPos.y >= rect.top &&
      wiring.cursorPos.y <= rect.bottom;
    setIsOverDropZone(inside);
  }, [wiring.isDragging, wiring.cursorPos]);

  const showWire = wiring.isWired && !wiring.isDragging;
  // Show placeholder when not wired — even during drag if cursor isn't over drop zone
  const showPlaceholder = !wiring.isWired && !(wiring.isDragging && isOverDropZone);
  // Only show preview when dragging AND cursor is inside the diagram
  const showPreview = wiring.isDragging && isOverDropZone;

  // Convert drag cursor to SVG coords for preview line
  let previewY = 120;
  if (showPreview && wiring.cursorPos && svgRef.current) {
    const svgPt = clientToSvg(svgRef.current, wiring.cursorPos.x, wiring.cursorPos.y);
    previewY = Math.max(50, Math.min(250, svgPt.y));
  }

  const handlePointerEnter = useCallback(() => {
    if (wiring.isDragging) setIsOverDropZone(true);
  }, [wiring.isDragging]);

  const handlePointerLeave = useCallback(() => {
    setIsOverDropZone(false);
  }, []);

  const previewColor = wiring.dragWire ? wireGaugeColor(wiring.dragWire.crossSection) : '#888';
  const connectedColor = wiring.connectedWire ? wireGaugeColor(wiring.connectedWire.crossSection) : '#888';

  return (
    <div
      ref={containerRef}
      className={`circuit-diagram ${isWarning ? 'warning-pulse' : ''} ${isBurned ? 'burned-smoke' : ''} ${isOverDropZone ? 'drop-zone-active' : ''}`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <svg ref={svgRef} viewBox="0 0 200 280" width="100%" style={{ maxWidth: 260 }}>
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
          <filter id="glow-drop">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="flash-glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
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

        {/* === Wiring states === */}

        {/* Placeholder: grey dashed line when not wired */}
        {showPlaceholder && (
          <>
            <line x1="100" y1="50" x2="100" y2="200"
              stroke="#555" strokeWidth="3" strokeDasharray="8 6"
              strokeLinecap="round" opacity="0.5" />
            <text x="100" y="140" textAnchor="middle" fill="#888" fontSize="10"
              fontFamily="var(--font-mono)">
              拖曳線材
            </text>
            <text x="100" y="155" textAnchor="middle" fill="#888" fontSize="10"
              fontFamily="var(--font-mono)">
              到此處接線
            </text>
          </>
        )}

        {/* Preview: dashed colored line following cursor during drag */}
        {showPreview && (
          <>
            <line x1="100" y1="50" x2="100" y2={previewY}
              stroke={previewColor} strokeWidth="4" strokeDasharray="10 5"
              strokeLinecap="round" opacity="0.8" />
            {previewY > 80 && (
              <circle cx="100" cy={previewY} r="4" fill={previewColor} opacity="0.8" />
            )}
          </>
        )}

        {/* Connected wire: solid line with color based on wire gauge */}
        {showWire && !isPowered && !isBurned && (
          <>
            <line x1="100" y1="50" x2="100" y2="120"
              stroke={connectedColor} strokeWidth="4" strokeLinecap="round"
              className={flashActive ? 'wire-flash' : 'wire-connected'} />
            <circle cx="100" cy="120" r="5" fill={connectedColor}
              className={flashActive ? 'junction-flash' : ''} />
            <line x1="100" y1="120" x2="100" y2="200"
              stroke={connectedColor} strokeWidth="4" strokeLinecap="round"
              className={flashActive ? 'wire-flash' : 'wire-connected'} />
          </>
        )}

        {/* Powered wire: uses heat color as before */}
        {showWire && isPowered && !isBurned && (
          <>
            <line x1="100" y1="50" x2="100" y2="120"
              stroke={wireColor} strokeWidth="4" strokeLinecap="round"
              filter={glowFilter(state)} />
            <circle cx="100" cy="120" r="5" fill={wireColor}
              filter={glowFilter(state)} />
            <line x1="100" y1="120" x2="100" y2="200"
              stroke={wireColor} strokeWidth="4" strokeLinecap="round"
              filter={glowFilter(state)} />
          </>
        )}

        {/* Burned wire */}
        {isBurned && (
          <>
            <line x1="100" y1="50" x2="100" y2="113"
              stroke={wireColor} strokeWidth="4" strokeLinecap="round"
              filter={glowFilter(state)} />
            <line x1="100" y1="127" x2="100" y2="200"
              stroke={wireColor} strokeWidth="4" strokeLinecap="round"
              filter={glowFilter(state)} />
          </>
        )}

        {/* Outlet (highlight when dragging over) */}
        <rect x="70" y="200" width="60" height="50" rx="6"
          fill="#222"
          stroke={isOverDropZone ? '#eab308' : '#666'}
          strokeWidth={isOverDropZone ? 3 : 2}
          filter={isOverDropZone ? 'url(#glow-drop)' : 'none'} />
        {/* Outlet slots */}
        <rect x="85" y="215" width="8" height="20" rx="2" fill="#444" />
        <rect x="107" y="215" width="8" height="20" rx="2" fill="#444" />

        {/* Burned: exposed copper core + peeled insulation */}
        {isBurned && (
          <>
            <line x1="100" y1="115" x2="100" y2="125" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
            <polygon points="98,113 94,108 100,113" fill="#1a1a1a" />
            <polygon points="102,113 106,108 100,113" fill="#1a1a1a" />
            <polygon points="98,127 94,132 100,127" fill="#1a1a1a" />
            <polygon points="102,127 106,132 100,127" fill="#1a1a1a" />
          </>
        )}

        {/* Warning smoke particles */}
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
            <circle className="fire-particle fire-1" cx="96" cy="118" r="4" fill="rgba(255,120,20,0.8)" />
            <circle className="fire-particle fire-2" cx="104" cy="116" r="3" fill="rgba(255,80,10,0.7)" />
            <circle className="fire-particle fire-3" cx="100" cy="114" r="5" fill="rgba(255,160,40,0.9)" />
            <circle className="fire-particle fire-4" cx="98" cy="120" r="3" fill="rgba(255,60,0,0.6)" />
            <circle className="smoke-particle smoke-1" cx="95" cy="108" r="3" fill="rgba(100,100,100,0.6)" />
            <circle className="smoke-particle smoke-2" cx="105" cy="104" r="4" fill="rgba(80,80,80,0.5)" />
            <circle className="smoke-particle smoke-3" cx="100" cy="100" r="3" fill="rgba(60,60,60,0.4)" />
          </>
        )}

        {/* Flash effect on successful connection */}
        {flashActive && (
          <circle cx="100" cy="120" r="12" fill="rgba(234,179,8,0.6)"
            filter="url(#flash-glow)" className="connection-flash" />
        )}

        {/* Status text */}
        <text x="100" y="272" textAnchor="middle" fill="#888" fontSize="11">
          {isPowered ? '送電中' : wiring.isWired ? '已接線' : '未接線'}
        </text>
      </svg>
    </div>
  );
}
