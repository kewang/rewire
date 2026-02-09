import { useRef, useCallback, useState, useEffect } from 'react';
import type { Circuit, CircuitId, CircuitState, MultiCircuitState, WiringState, CrimpResult } from '../types/game';

interface CircuitDiagramProps {
  circuits: readonly Circuit[];
  multiState: MultiCircuitState;
  isPowered: boolean;
  wiring: WiringState;
  onPowerToggle?: () => void;
  leverDisabled?: boolean;
  leverTooltip?: string;
  onTargetCircuitChange?: (circuitId: CircuitId | null) => void;
  phases?: Record<CircuitId, 'R' | 'T'>;
  phaseMode?: 'auto' | 'manual';
  onTogglePhase?: (circuitId: CircuitId) => void;
  circuitCrimps?: Record<CircuitId, CrimpResult>;
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

function glowFilterId(status: CircuitState['status']): string {
  if (status === 'warning') return 'url(#glow-warning)';
  if (status === 'burned') return 'url(#glow-burned)';
  return 'none';
}

/** Map wire cross-section to a distinct color for preview */
function wireGaugeColor(crossSection: number): string {
  if (crossSection <= 1.6) return '#93c5fd'; // blue-300
  if (crossSection <= 2.0) return '#86efac'; // green-300
  if (crossSection <= 3.5) return '#fde047'; // yellow-300
  if (crossSection <= 5.5) return '#fdba74'; // orange-300
  if (crossSection <= 8) return '#f87171'; // red-400
  return '#a855f7'; // purple-500 (14mm²)
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

// Layout constants
const CIRCUIT_WIDTH = 200;
const CIRCUIT_HEIGHT = 300;
const LEVER_TRACK_W = 18;
const LEVER_TRACK_H = 32;
const LEVER_HANDLE_W = 14;
const LEVER_HANDLE_H = 14;
const LEVER_DRAG_THRESHOLD = 8;

/** Single circuit SVG sub-component (renders within parent SVG at given x offset) */
function SingleCircuitSVG({
  circuit,
  circuitState,
  isPowered,
  isWired,
  connectedWire,
  isDragging,
  isOverDropZone,
  showPreview,
  previewY,
  dragWire,
  flashActive,
  xOffset,
  showLabel,
  showVoltageLabel,
  phase,
  phaseMode,
  onTogglePhase,
  crimpResult,
}: {
  circuit: Circuit;
  circuitState: CircuitState;
  isPowered: boolean;
  isWired: boolean;
  connectedWire: Circuit['wire'] | null;
  isDragging: boolean;
  isOverDropZone: boolean;
  showPreview: boolean;
  previewY: number;
  dragWire: Circuit['wire'] | null;
  flashActive: boolean;
  xOffset: number;
  showLabel: boolean;
  showVoltageLabel: boolean;
  phase?: 'R' | 'T';
  phaseMode?: 'auto' | 'manual';
  onTogglePhase?: () => void;
  crimpResult?: CrimpResult;
}) {
  const cx = xOffset + 100; // center x of this circuit
  const wireColor = heatToColor(circuitState.wireHeat);
  const isWarning = circuitState.status === 'warning';
  const isBurned = circuitState.status === 'burned';
  const isElcbTripped = circuitState.status === 'elcb-tripped';
  const isLeakage = circuitState.status === 'leakage';
  const is220V = circuit.voltage === 220;

  // Dual-line offset for 220V (lines at cx±2)
  const DUAL_OFFSET = 3;

  const showWire = isWired && !isDragging;
  const showPlaceholder = !isWired && !(isDragging && isOverDropZone);
  const showPreviewLine = isDragging && isOverDropZone && showPreview;

  const previewColor = dragWire ? wireGaugeColor(dragWire.crossSection) : '#888';
  const connectedColor = connectedWire ? wireGaugeColor(connectedWire.crossSection) : '#888';

  // NFB layout for this circuit
  const leverTrackX = xOffset + 138;
  const leverTrackY = 14;
  const leverOnY = leverTrackY + 2;
  const leverOffY = leverTrackY + LEVER_TRACK_H - LEVER_HANDLE_H - 2;
  const leverHandleY = isPowered ? leverOnY : leverOffY;
  const leverHandleX = leverTrackX + (LEVER_TRACK_W - LEVER_HANDLE_W) / 2;

  // NFB sizing: 2P is wider
  const nfbWidth = is220V ? 110 : 100;
  const nfbX = is220V ? xOffset + 55 : xOffset + 60;
  const poleLabel = is220V ? '2P' : '1P';

  return (
    <g>
      {/* Circuit label + voltage tag */}
      {showLabel && (
        <text x={cx} y={286} textAnchor="middle" fontSize="9"
          fontFamily="var(--font-mono)">
          <tspan fill="#8a96a6">{circuit.label}</tspan>
          {showVoltageLabel && (
            <tspan fill={is220V ? '#f87171' : '#4ade80'} fontSize="8"> {circuit.voltage}V</tspan>
          )}
        </text>
      )}

      {/* NFB Breaker body */}
      <rect x={nfbX} y={10} width={nfbWidth} height={40} rx={4}
        fill="#2a2a2a" stroke={is220V ? '#744' : '#555'} strokeWidth={1.5} />
      <text x={xOffset + 85} y={28} textAnchor="middle" fill="#aaa"
        fontSize={10} fontWeight="bold" fontFamily="var(--font-mono)">
        NFB
      </text>
      <text x={xOffset + 85} y={42} textAnchor="middle" fill="#777"
        fontSize={9} fontFamily="var(--font-mono)">
        {circuit.breaker.ratedCurrent}A
      </text>
      {/* Pole type label */}
      <text x={xOffset + 110} y={28} textAnchor="middle"
        fill={is220V ? '#f87171' : '#777'} fontSize={8} fontWeight="bold"
        fontFamily="var(--font-mono)">
        {poleLabel}
      </text>

      {/* Lever track */}
      <rect x={leverTrackX} y={leverTrackY} width={LEVER_TRACK_W} height={LEVER_TRACK_H}
        rx={3} fill="#111" stroke="#444" strokeWidth={1} />
      <text x={leverTrackX + LEVER_TRACK_W / 2} y={leverTrackY + 10}
        textAnchor="middle" fill="#4ade80" fontSize={6} fontWeight="bold"
        fontFamily="var(--font-mono)">ON</text>
      <text x={leverTrackX + LEVER_TRACK_W / 2} y={leverTrackY + LEVER_TRACK_H - 3}
        textAnchor="middle" fill="#888" fontSize={6} fontWeight="bold"
        fontFamily="var(--font-mono)">OFF</text>

      {/* Lever handle (non-interactive in per-circuit, main lever is global) */}
      <rect
        x={leverHandleX} y={leverHandleY}
        width={LEVER_HANDLE_W} height={LEVER_HANDLE_H}
        rx={2}
        fill={isPowered ? '#22c55e' : '#555'}
        stroke={isPowered ? '#4ade80' : '#777'}
        strokeWidth={1.5}
        style={{ pointerEvents: 'none' }}
      />
      <line x1={leverHandleX + 3} y1={leverHandleY + LEVER_HANDLE_H / 2 - 2}
        x2={leverHandleX + LEVER_HANDLE_W - 3} y2={leverHandleY + LEVER_HANDLE_H / 2 - 2}
        stroke={isPowered ? '#000' : '#999'} strokeWidth={0.8} strokeLinecap="round"
        style={{ pointerEvents: 'none' }} />
      <line x1={leverHandleX + 3} y1={leverHandleY + LEVER_HANDLE_H / 2 + 2}
        x2={leverHandleX + LEVER_HANDLE_W - 3} y2={leverHandleY + LEVER_HANDLE_H / 2 + 2}
        stroke={isPowered ? '#000' : '#999'} strokeWidth={0.8} strokeLinecap="round"
        style={{ pointerEvents: 'none' }} />

      {/* Phase label and toggle */}
      {phase && (
        <g>
          {/* Phase badge */}
          <rect x={xOffset + 10} y={14} width={38} height={18} rx={3}
            fill={phase === 'R' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)'}
            stroke={phase === 'R' ? '#ef4444' : '#3b82f6'} strokeWidth={1} />
          <text x={xOffset + 29} y={27} textAnchor="middle"
            fill={phase === 'R' ? '#f87171' : '#60a5fa'} fontSize={10}
            fontWeight="bold" fontFamily="var(--font-mono)">
            {phase === 'R' ? 'R相' : 'T相'}
          </text>
          {/* Toggle button (manual mode only, not powered) */}
          {phaseMode === 'manual' && !isPowered && (
            <g className="phase-toggle-btn" style={{ cursor: 'pointer' }}
              onClick={onTogglePhase}>
              <rect x={xOffset + 10} y={35} width={38} height={14} rx={2}
                fill="rgba(255,255,255,0.05)" stroke="#555" strokeWidth={0.8} />
              <text x={xOffset + 29} y={45} textAnchor="middle"
                fill="#8a96a6" fontSize={7} fontFamily="var(--font-mono)">
                切換
              </text>
            </g>
          )}
        </g>
      )}

      {/* Crimp terminal icon at NFB bottom connection point */}
      {crimpResult && isWired && (
        (() => {
          const termColor =
            crimpResult.quality === 'excellent' ? '#22c55e' :
            crimpResult.quality === 'good' ? '#84cc16' :
            crimpResult.quality === 'poor' ? '#f97316' :
            '#ef4444';
          const ty = 53; // just below NFB body
          return crimpResult.terminalType === 'o-ring' ? (
            <g>
              <circle cx={cx} cy={ty} r={5} fill="none" stroke={termColor} strokeWidth={1.5} />
              <circle cx={cx} cy={ty} r={2} fill="none" stroke={termColor} strokeWidth={1} opacity={0.6} />
            </g>
          ) : (
            <g>
              <line x1={cx - 4} y1={ty + 4} x2={cx} y2={ty - 3} stroke={termColor} strokeWidth={1.5} strokeLinecap="round" />
              <line x1={cx + 4} y1={ty + 4} x2={cx} y2={ty - 3} stroke={termColor} strokeWidth={1.5} strokeLinecap="round" />
            </g>
          );
        })()
      )}

      {/* === Wiring states === */}

      {/* Placeholder: grey dashed line(s) when not wired */}
      {showPlaceholder && (
        <>
          {is220V ? (
            <>
              <line x1={cx - DUAL_OFFSET} y1={50} x2={cx - DUAL_OFFSET} y2={200}
                stroke="#555" strokeWidth={2} strokeDasharray="8 6"
                strokeLinecap="round" opacity={0.5} />
              <line x1={cx + DUAL_OFFSET} y1={50} x2={cx + DUAL_OFFSET} y2={200}
                stroke="#555" strokeWidth={2} strokeDasharray="8 6"
                strokeLinecap="round" opacity={0.5} />
            </>
          ) : (
            <line x1={cx} y1={50} x2={cx} y2={200}
              stroke="#555" strokeWidth={3} strokeDasharray="8 6"
              strokeLinecap="round" opacity={0.5} />
          )}
          <text x={cx} y={140} textAnchor="middle" fill="#888" fontSize={10}
            fontFamily="var(--font-mono)">
            拖曳線材
          </text>
          <text x={cx} y={155} textAnchor="middle" fill="#888" fontSize={10}
            fontFamily="var(--font-mono)">
            到此處接線
          </text>
        </>
      )}

      {/* Preview: dashed colored line(s) following cursor during drag */}
      {showPreviewLine && (
        <>
          {is220V ? (
            <>
              <line x1={cx - DUAL_OFFSET} y1={50} x2={cx - DUAL_OFFSET} y2={previewY}
                stroke="#ef4444" strokeWidth={3} strokeDasharray="10 5"
                strokeLinecap="round" opacity={0.8} />
              <line x1={cx + DUAL_OFFSET} y1={50} x2={cx + DUAL_OFFSET} y2={previewY}
                stroke="#222" strokeWidth={3} strokeDasharray="10 5"
                strokeLinecap="round" opacity={0.8} />
            </>
          ) : (
            <line x1={cx} y1={50} x2={cx} y2={previewY}
              stroke={previewColor} strokeWidth={4} strokeDasharray="10 5"
              strokeLinecap="round" opacity={0.8} />
          )}
          {previewY > 80 && (
            <circle cx={cx} cy={previewY} r={4} fill={is220V ? '#ef4444' : previewColor} opacity={0.8} />
          )}
        </>
      )}

      {/* Connected wire: solid line(s) with color based on wire gauge */}
      {showWire && !isPowered && !isBurned && (
        is220V ? (
          <>
            <line x1={cx - DUAL_OFFSET} y1={50} x2={cx - DUAL_OFFSET} y2={120}
              stroke="#ef4444" strokeWidth={3} strokeLinecap="round"
              className={flashActive ? 'wire-flash' : 'wire-connected'} />
            <line x1={cx + DUAL_OFFSET} y1={50} x2={cx + DUAL_OFFSET} y2={120}
              stroke="#333" strokeWidth={3} strokeLinecap="round"
              className={flashActive ? 'wire-flash' : 'wire-connected'} />
            <circle cx={cx} cy={120} r={5} fill={connectedColor}
              className={flashActive ? 'junction-flash' : ''} />
            <line x1={cx - DUAL_OFFSET} y1={120} x2={cx - DUAL_OFFSET} y2={200}
              stroke="#ef4444" strokeWidth={3} strokeLinecap="round"
              className={flashActive ? 'wire-flash' : 'wire-connected'} />
            <line x1={cx + DUAL_OFFSET} y1={120} x2={cx + DUAL_OFFSET} y2={200}
              stroke="#333" strokeWidth={3} strokeLinecap="round"
              className={flashActive ? 'wire-flash' : 'wire-connected'} />
          </>
        ) : (
          <>
            <line x1={cx} y1={50} x2={cx} y2={120}
              stroke={connectedColor} strokeWidth={4} strokeLinecap="round"
              className={flashActive ? 'wire-flash' : 'wire-connected'} />
            <circle cx={cx} cy={120} r={5} fill={connectedColor}
              className={flashActive ? 'junction-flash' : ''} />
            <line x1={cx} y1={120} x2={cx} y2={200}
              stroke={connectedColor} strokeWidth={4} strokeLinecap="round"
              className={flashActive ? 'wire-flash' : 'wire-connected'} />
          </>
        )
      )}

      {/* Powered wire: uses heat color */}
      {showWire && isPowered && !isBurned && (
        is220V ? (
          <>
            <line x1={cx - DUAL_OFFSET} y1={50} x2={cx - DUAL_OFFSET} y2={120}
              stroke={wireColor} strokeWidth={3} strokeLinecap="round"
              filter={glowFilterId(circuitState.status)} />
            <line x1={cx + DUAL_OFFSET} y1={50} x2={cx + DUAL_OFFSET} y2={120}
              stroke={wireColor} strokeWidth={3} strokeLinecap="round"
              filter={glowFilterId(circuitState.status)} />
            <circle cx={cx} cy={120} r={5} fill={wireColor}
              filter={glowFilterId(circuitState.status)} />
            <line x1={cx - DUAL_OFFSET} y1={120} x2={cx - DUAL_OFFSET} y2={200}
              stroke={wireColor} strokeWidth={3} strokeLinecap="round"
              filter={glowFilterId(circuitState.status)} />
            <line x1={cx + DUAL_OFFSET} y1={120} x2={cx + DUAL_OFFSET} y2={200}
              stroke={wireColor} strokeWidth={3} strokeLinecap="round"
              filter={glowFilterId(circuitState.status)} />
          </>
        ) : (
          <>
            <line x1={cx} y1={50} x2={cx} y2={120}
              stroke={wireColor} strokeWidth={4} strokeLinecap="round"
              filter={glowFilterId(circuitState.status)} />
            <circle cx={cx} cy={120} r={5} fill={wireColor}
              filter={glowFilterId(circuitState.status)} />
            <line x1={cx} y1={120} x2={cx} y2={200}
              stroke={wireColor} strokeWidth={4} strokeLinecap="round"
              filter={glowFilterId(circuitState.status)} />
          </>
        )
      )}

      {/* Burned wire */}
      {isBurned && (
        is220V ? (
          <>
            <line x1={cx - DUAL_OFFSET} y1={50} x2={cx - DUAL_OFFSET} y2={113}
              stroke={wireColor} strokeWidth={3} strokeLinecap="round"
              filter={glowFilterId(circuitState.status)} />
            <line x1={cx + DUAL_OFFSET} y1={50} x2={cx + DUAL_OFFSET} y2={113}
              stroke={wireColor} strokeWidth={3} strokeLinecap="round"
              filter={glowFilterId(circuitState.status)} />
            <line x1={cx - DUAL_OFFSET} y1={127} x2={cx - DUAL_OFFSET} y2={200}
              stroke={wireColor} strokeWidth={3} strokeLinecap="round"
              filter={glowFilterId(circuitState.status)} />
            <line x1={cx + DUAL_OFFSET} y1={127} x2={cx + DUAL_OFFSET} y2={200}
              stroke={wireColor} strokeWidth={3} strokeLinecap="round"
              filter={glowFilterId(circuitState.status)} />
          </>
        ) : (
          <>
            <line x1={cx} y1={50} x2={cx} y2={113}
              stroke={wireColor} strokeWidth={4} strokeLinecap="round"
              filter={glowFilterId(circuitState.status)} />
            <line x1={cx} y1={127} x2={cx} y2={200}
              stroke={wireColor} strokeWidth={4} strokeLinecap="round"
              filter={glowFilterId(circuitState.status)} />
          </>
        )
      )}

      {/* Outlet: T-type for 220V, standard dual-flat for 110V */}
      <rect x={xOffset + 70} y={200} width={60} height={50} rx={6}
        fill="#222"
        stroke={isOverDropZone ? '#eab308' : (is220V ? '#744' : '#666')}
        strokeWidth={isOverDropZone ? 3 : 2}
        filter={isOverDropZone ? 'url(#glow-drop)' : 'none'} />
      {is220V ? (
        <>
          {/* T-type outlet: horizontal bar + vertical pin */}
          <rect x={xOffset + 83} y={215} width={34} height={6} rx={2} fill="#555" />
          <rect x={xOffset + 96} y={221} width={8} height={16} rx={2} fill="#555" />
        </>
      ) : (
        <>
          {/* Standard dual-flat outlet */}
          <rect x={xOffset + 85} y={215} width={8} height={20} rx={2} fill="#444" />
          <rect x={xOffset + 107} y={215} width={8} height={20} rx={2} fill="#444" />
        </>
      )}

      {/* Burned: exposed copper core + peeled insulation */}
      {isBurned && (
        <>
          <line x1={cx} y1={115} x2={cx} y2={125} stroke="#d97706" strokeWidth={3} strokeLinecap="round" />
          <polygon points={`${cx - 2},113 ${cx - 6},108 ${cx},113`} fill="#1a1a1a" />
          <polygon points={`${cx + 2},113 ${cx + 6},108 ${cx},113`} fill="#1a1a1a" />
          <polygon points={`${cx - 2},127 ${cx - 6},132 ${cx},127`} fill="#1a1a1a" />
          <polygon points={`${cx + 2},127 ${cx + 6},132 ${cx},127`} fill="#1a1a1a" />
        </>
      )}

      {/* Warning smoke particles */}
      {isWarning && circuitState.wireHeat >= 0.3 && (
        <>
          {(() => {
            const opacity = circuitState.wireHeat >= 0.7 ? 0.6 : 0.2 + (circuitState.wireHeat - 0.3) * 1.0;
            const r = circuitState.wireHeat >= 0.7 ? 5 : 4;
            return (
              <>
                <circle className="smoke-particle warning-smoke-1" cx={cx - 6} cy={116} r={r}
                  fill={`rgba(180,180,180,${opacity})`} />
                <circle className="smoke-particle warning-smoke-2" cx={cx + 6} cy={110} r={r}
                  fill={`rgba(180,180,180,${opacity * 0.8})`} />
                {circuitState.wireHeat >= 0.7 && (
                  <circle className="smoke-particle warning-smoke-3" cx={cx} cy={104} r={r}
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
          <circle className="fire-particle fire-1" cx={cx - 4} cy={118} r={4} fill="rgba(255,120,20,0.8)" />
          <circle className="fire-particle fire-2" cx={cx + 4} cy={116} r={3} fill="rgba(255,80,10,0.7)" />
          <circle className="fire-particle fire-3" cx={cx} cy={114} r={5} fill="rgba(255,160,40,0.9)" />
          <circle className="fire-particle fire-4" cx={cx - 2} cy={120} r={3} fill="rgba(255,60,0,0.6)" />
          <circle className="smoke-particle smoke-1" cx={cx - 5} cy={108} r={3} fill="rgba(100,100,100,0.6)" />
          <circle className="smoke-particle smoke-2" cx={cx + 5} cy={104} r={4} fill="rgba(80,80,80,0.5)" />
          <circle className="smoke-particle smoke-3" cx={cx} cy={100} r={3} fill="rgba(60,60,60,0.4)" />
        </>
      )}

      {/* Flash effect on successful connection */}
      {flashActive && (
        <circle cx={cx} cy={120} r={12} fill="rgba(234,179,8,0.6)"
          filter="url(#flash-glow)" className="connection-flash" />
      )}

      {/* ELCB tripped visual: dashed grey wire + ELCB badge */}
      {isElcbTripped && (
        <>
          {is220V ? (
            <>
              <line x1={cx - DUAL_OFFSET} y1={50} x2={cx - DUAL_OFFSET} y2={200}
                stroke="#555" strokeWidth={3} strokeDasharray="6 4" strokeLinecap="round" opacity={0.5} />
              <line x1={cx + DUAL_OFFSET} y1={50} x2={cx + DUAL_OFFSET} y2={200}
                stroke="#555" strokeWidth={3} strokeDasharray="6 4" strokeLinecap="round" opacity={0.5} />
            </>
          ) : (
            <line x1={cx} y1={50} x2={cx} y2={200}
              stroke="#555" strokeWidth={4} strokeDasharray="6 4" strokeLinecap="round" opacity={0.5} />
          )}
          <rect x={cx - 22} y={108} width={44} height={20} rx={3}
            fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth={1} />
          <text x={cx} y={122} textAnchor="middle" fill="#60a5fa" fontSize={9}
            fontWeight="bold" fontFamily="var(--font-mono)">
            ELCB
          </text>
        </>
      )}

      {/* Leakage visual: red flash + danger symbol */}
      {isLeakage && (
        <>
          {is220V ? (
            <>
              <line x1={cx - DUAL_OFFSET} y1={50} x2={cx - DUAL_OFFSET} y2={200}
                stroke="#ef4444" strokeWidth={3} strokeLinecap="round" filter="url(#glow-burned)" />
              <line x1={cx + DUAL_OFFSET} y1={50} x2={cx + DUAL_OFFSET} y2={200}
                stroke="#ef4444" strokeWidth={3} strokeLinecap="round" filter="url(#glow-burned)" />
            </>
          ) : (
            <line x1={cx} y1={50} x2={cx} y2={200}
              stroke="#ef4444" strokeWidth={4} strokeLinecap="round" filter="url(#glow-burned)" />
          )}
          <text x={cx} y={125} textAnchor="middle" fill="#ef4444" fontSize={14}
            fontWeight="bold" fontFamily="var(--font-mono)">
            ⚡
          </text>
        </>
      )}

      {/* Status text */}
      <text x={cx} y={272} textAnchor="middle"
        fill={isElcbTripped ? '#3b82f6' : isLeakage ? '#ef4444' : '#888'}
        fontSize={11} fontFamily="var(--font-mono)">
        {isElcbTripped ? 'ELCB 跳脫' : isLeakage ? '漏電！' : isPowered ? '送電中' : isWired ? '已接線' : '未接線'}
      </text>
    </g>
  );
}

export default function CircuitDiagram({ circuits, multiState, isPowered, wiring, onPowerToggle, leverDisabled, leverTooltip, onTargetCircuitChange, phases, phaseMode, onTogglePhase, circuitCrimps }: CircuitDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [overCircuitId, setOverCircuitId] = useState<CircuitId | null>(null);
  const [flashCircuitId, setFlashCircuitId] = useState<CircuitId | null>(null);
  const [previewY, setPreviewY] = useState(120);
  const [prevWiringCircuits, setPrevWiringCircuits] = useState(wiring.circuits);

  const n = circuits.length;
  const svgWidth = n * CIRCUIT_WIDTH;
  const isSingle = n === 1;

  // Show voltage labels only when there are mixed voltages
  const hasMixedVoltage = n > 1 && new Set(circuits.map(c => c.voltage)).size > 1;

  // Lever drag state (global lever)
  const leverDragging = useRef(false);
  const leverStartY = useRef(0);

  // Detect flash when a circuit's wiring completes (render-time state adjustment)
  if (wiring.circuits !== prevWiringCircuits) {
    setPrevWiringCircuits(wiring.circuits);
    for (const c of circuits) {
      if (wiring.circuits[c.id]?.isWired && !prevWiringCircuits[c.id]?.isWired) {
        setFlashCircuitId(c.id);
      }
    }
  }

  // Clear flash after animation
  useEffect(() => {
    if (flashCircuitId !== null) {
      const timer = setTimeout(() => setFlashCircuitId(null), 400);
      return () => clearTimeout(timer);
    }
  }, [flashCircuitId]);

  // Clear overCircuitId when not dragging (render-time state adjustment)
  if (!wiring.isDragging && overCircuitId !== null) {
    setOverCircuitId(null);
  }

  // Notify parent when drag ends
  useEffect(() => {
    if (!wiring.isDragging) {
      onTargetCircuitChange?.(null);
    }
  }, [wiring.isDragging, onTargetCircuitChange]);

  // Determine which circuit the cursor is over during drag
  useEffect(() => {
    if (!wiring.isDragging || !wiring.cursorPos || !containerRef.current || !svgRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = wiring.cursorPos.x;
    const cy = wiring.cursorPos.y;
    let newOverId: CircuitId | null = null;
    let newPreviewY = 120;
    if (cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom) {
      const svgPt = clientToSvg(svgRef.current, cx, cy);
      newPreviewY = Math.max(50, Math.min(250, svgPt.y));
      const circuitIndex = Math.floor(svgPt.x / CIRCUIT_WIDTH);
      if (circuitIndex >= 0 && circuitIndex < n) {
        newOverId = circuits[circuitIndex].id;
      }
    }
    // Defer state updates to a rAF callback (avoids synchronous setState in effect)
    const rafId = requestAnimationFrame(() => {
      setPreviewY(newPreviewY);
      setOverCircuitId(newOverId);
      onTargetCircuitChange?.(newOverId);
    });
    return () => cancelAnimationFrame(rafId);
  }, [wiring.isDragging, wiring.cursorPos, n, circuits, onTargetCircuitChange]);

  const handlePointerEnter = useCallback(() => {
    // handled by effect
  }, []);

  const handlePointerLeave = useCallback(() => {
    setOverCircuitId(null);
  }, []);

  // Global lever pointer handlers
  const handleLeverPointerDown = useCallback((e: React.PointerEvent) => {
    if (leverDisabled || !onPowerToggle) return;
    e.stopPropagation();
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const svgPt = clientToSvg(svg, e.clientX, e.clientY);
    leverDragging.current = false;
    leverStartY.current = svgPt.y;
    (e.target as Element).setPointerCapture(e.pointerId);
  }, [leverDisabled, onPowerToggle]);

  const handleLeverPointerMove = useCallback((e: React.PointerEvent) => {
    if (leverDisabled || !onPowerToggle) return;
    const svg = svgRef.current;
    if (!svg) return;
    const svgPt = clientToSvg(svg, e.clientX, e.clientY);
    const dy = svgPt.y - leverStartY.current;
    if (Math.abs(dy) > LEVER_DRAG_THRESHOLD) {
      leverDragging.current = true;
      if (!isPowered && dy < -LEVER_DRAG_THRESHOLD) {
        onPowerToggle();
        leverStartY.current = svgPt.y;
      } else if (isPowered && dy > LEVER_DRAG_THRESHOLD) {
        onPowerToggle();
        leverStartY.current = svgPt.y;
      }
    }
  }, [leverDisabled, onPowerToggle, isPowered]);

  const handleLeverPointerUp = useCallback((e: React.PointerEvent) => {
    if (leverDisabled || !onPowerToggle) return;
    if (!leverDragging.current) {
      onPowerToggle();
    }
    leverDragging.current = false;
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch { /* already released */ }
  }, [leverDisabled, onPowerToggle]);

  // For single circuit, use first circuit's lever directly (keep identical look)
  // For multi circuit, render a global power lever at a fixed position

  // Overall status classes for container
  const hasWarning = Object.values(multiState.circuitStates).some(cs => cs.status === 'warning');
  const hasBurned = Object.values(multiState.circuitStates).some(cs => cs.status === 'burned');

  return (
    <div
      ref={containerRef}
      className={`circuit-diagram ${hasWarning ? 'warning-pulse' : ''} ${hasBurned ? 'burned-smoke' : ''} ${overCircuitId ? 'drop-zone-active' : ''}`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <svg ref={svgRef} viewBox={`0 0 ${svgWidth} ${CIRCUIT_HEIGHT}`} width="100%" style={{ maxWidth: isSingle ? 260 : n * 260 }}>
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

        {circuits.map((circuit, i) => {
          const cId = circuit.id;
          const cs = multiState.circuitStates[cId] ?? { status: 'normal' as const, totalCurrent: 0, wireHeat: 0, breakerTripTimer: 0 };
          const cw = wiring.circuits[cId];
          const isWired = cw?.isWired ?? false;
          const connectedWire = cw?.connectedWire ?? null;
          const isOver = overCircuitId === cId;

          return (
            <SingleCircuitSVG
              key={cId}
              circuit={circuit}
              circuitState={cs}
              isPowered={isPowered}
              isWired={isWired}
              connectedWire={connectedWire}
              isDragging={wiring.isDragging}
              isOverDropZone={isOver}
              showPreview={isOver}
              previewY={previewY}
              dragWire={wiring.dragWire}
              flashActive={flashCircuitId === cId}
              xOffset={i * CIRCUIT_WIDTH}
              showLabel={!isSingle}
              showVoltageLabel={hasMixedVoltage}
              phase={phases?.[cId]}
              phaseMode={phaseMode}
              onTogglePhase={onTogglePhase ? () => onTogglePhase(cId) : undefined}
              crimpResult={circuitCrimps?.[cId]}
            />
          );
        })}

        {/* Global power lever - interactive overlays on all circuits' NFBs (all toggle the same global power) */}
        {circuits.map((_, i) => (
          <rect
            key={`lever-${i}`}
            x={i * CIRCUIT_WIDTH + 138 + (LEVER_TRACK_W - LEVER_HANDLE_W) / 2}
            y={isPowered ? 14 + 2 : 14 + LEVER_TRACK_H - LEVER_HANDLE_H - 2}
            width={LEVER_HANDLE_W} height={LEVER_HANDLE_H}
            rx={2}
            fill="transparent"
            className={`nfb-lever-handle ${leverDisabled ? 'disabled' : ''}`}
            style={{ cursor: leverDisabled ? 'not-allowed' : 'pointer', touchAction: 'none' }}
            onPointerDown={handleLeverPointerDown}
            onPointerMove={handleLeverPointerMove}
            onPointerUp={handleLeverPointerUp}
          />
        ))}

        {/* Lever disabled tooltip */}
        {leverDisabled && leverTooltip && (
          <text x={svgWidth / 2} y={CIRCUIT_HEIGHT - 8} textAnchor="middle"
            fill="#eab308" fontSize={10} fontFamily="var(--font-mono)">
            {leverTooltip}
          </text>
        )}
      </svg>
    </div>
  );
}
