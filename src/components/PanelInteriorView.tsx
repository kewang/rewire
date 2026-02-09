import { useRef, useCallback, useState, useMemo } from 'react';
import type { CircuitId, CircuitConfig, Wire } from '../types/game';

/** Map wire cross-section to a distinct color */
function wireGaugeColor(crossSection: number): string {
  if (crossSection <= 1.6) return '#93c5fd';
  if (crossSection <= 2.0) return '#86efac';
  if (crossSection <= 3.5) return '#fde047';
  if (crossSection <= 5.5) return '#fdba74';
  if (crossSection <= 8) return '#f87171';
  return '#a855f7';
}

// ── Layout constants ──────────────────────────────────────────
const LANE_WIDTH = 64;
const PANEL_PADDING = 36;
const BUSBAR_Y = 70;
const BUSBAR_GAP = 20;       // gap between R / T / N bars
const BUSBAR_H = 8;          // bar thickness
const ROUTING_TOP = BUSBAR_Y + 3 * BUSBAR_GAP + 20;
const ROUTING_HEIGHT = 170;
const NFB_ZONE_Y = ROUTING_TOP + ROUTING_HEIGHT + 10;
const NFB_H = 36;
const NFB_W = 32;
const LABEL_Y = NFB_ZONE_Y + NFB_H + 22;
const TOTAL_HEIGHT = LABEL_Y + 20;

const DRAG_THRESHOLD = 8;

// ── Crossing info ──────────────────────────────────────────────
interface CrossingPair {
  idA: CircuitId;
  idB: CircuitId;
  /** SVG coordinate of the crossing intersection */
  x: number;
  y: number;
}

/** Compute wire start-X based on phase / voltage */
function wireStartX(
  config: CircuitConfig,
  phase: 'R' | 'T' | undefined,
  busbarLeft: number,
  busbarRight: number,
): number {
  if (config.voltage === 220) {
    return (busbarLeft + busbarRight) / 2;
  }
  const p = phase ?? config.phase ?? 'R';
  if (p === 'R') return busbarLeft + (busbarRight - busbarLeft) * 0.2;
  return busbarLeft + (busbarRight - busbarLeft) * 0.8;
}

/** NFB (destination) X — fixed by config index */
function nfbX(index: number): number {
  return PANEL_PADDING + LANE_WIDTH / 2 + index * LANE_WIDTH;
}

/** Lane center X — by lane slot */
function laneX(slot: number): number {
  return PANEL_PADDING + LANE_WIDTH / 2 + slot * LANE_WIDTH;
}

/** Busbar Y for a given phase row (0=R, 1=T, 2=N) */
function busbarRowY(row: number): number {
  return BUSBAR_Y + row * BUSBAR_GAP;
}

interface WirePathData {
  cId: CircuitId;
  d: string;
  color: string;
  strokeWidth: number;
  isCrossing: boolean;
  isDragging: boolean;
}

// ── Props ─────────────────────────────────────────────────────
export interface PanelInteriorViewProps {
  circuitConfigs: readonly CircuitConfig[];
  circuitWires: Record<CircuitId, Wire>;
  phases: Record<CircuitId, 'R' | 'T'>;
  lanes: CircuitId[];
  onLanesChange: (newLanes: CircuitId[]) => void;
  onClose: () => void;
}

// ── Crossing detection ────────────────────────────────────────
function detectCrossings(
  lanes: CircuitId[],
  configIndex: Record<CircuitId, number>,
  startXMap: Record<CircuitId, number>,
): CrossingPair[] {
  const pairs: CrossingPair[] = [];
  for (let i = 0; i < lanes.length; i++) {
    for (let j = i + 1; j < lanes.length; j++) {
      const idA = lanes[i];
      const idB = lanes[j];
      const startA = startXMap[idA];
      const startB = startXMap[idB];
      const endA = nfbX(configIndex[idA]);
      const endB = nfbX(configIndex[idB]);

      const lnA = laneX(i);
      const lnB = laneX(j);
      // Two wires cross if their vertical segments' horizontal positions vs destinations create inversions
      const topInversion = (startA - startB) * (lnA - lnB) < 0;
      const bottomInversion = (lnA - lnB) * (endA - endB) < 0;

      if (topInversion || bottomInversion) {
        // Approximate crossing point
        const cx = (lnA + lnB) / 2;
        const cy = topInversion
          ? ROUTING_TOP + 20
          : ROUTING_TOP + ROUTING_HEIGHT - 30;
        pairs.push({ idA, idB, x: cx, y: cy });
      }
    }
  }
  return pairs;
}

export default function PanelInteriorView({
  circuitConfigs,
  circuitWires,
  phases,
  lanes,
  onLanesChange,
  onClose,
}: PanelInteriorViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragState, setDragState] = useState<{
    circuitId: CircuitId;
    originSlot: number;
    startClientX: number;
    currentClientX: number;
    active: boolean;
    svgScale: number;
  } | null>(null);

  const n = circuitConfigs.length;
  const totalWidth = PANEL_PADDING * 2 + n * LANE_WIDTH;

  // Index lookup: circuitId → original config index (= NFB position)
  const configIndex = useMemo(() => {
    const map: Record<CircuitId, number> = {};
    circuitConfigs.forEach((c, i) => { map[c.id] = i; });
    return map;
  }, [circuitConfigs]);

  // Busbar extent
  const busbarLeft = PANEL_PADDING + 8;
  const busbarRight = totalWidth - PANEL_PADDING - 8;

  // Start-X for each circuit
  const startXMap = useMemo(() => {
    const map: Record<CircuitId, number> = {};
    circuitConfigs.forEach(c => {
      map[c.id] = wireStartX(c, phases[c.id], busbarLeft, busbarRight);
    });
    return map;
  }, [circuitConfigs, phases, busbarLeft, busbarRight]);

  // Current lane arrangement (may be temporarily modified during drag)
  const effectiveLanes = useMemo(() => {
    if (!dragState?.active) return lanes;
    const dx = dragState.currentClientX - dragState.startClientX;
    const svgDx = dx / dragState.svgScale;
    const targetSlot = Math.round(dragState.originSlot + svgDx / LANE_WIDTH);
    const clamped = Math.max(0, Math.min(n - 1, targetSlot));
    if (clamped === dragState.originSlot) return lanes;
    // Move the dragged item to the target slot
    const newLanes = [...lanes];
    const currentIdx = newLanes.indexOf(dragState.circuitId);
    if (currentIdx === -1) return lanes;
    newLanes.splice(currentIdx, 1);
    newLanes.splice(clamped, 0, dragState.circuitId);
    return newLanes;
  }, [dragState, lanes, n]);

  // Crossings
  const crossings = useMemo(
    () => detectCrossings(effectiveLanes, configIndex, startXMap),
    [effectiveLanes, configIndex, startXMap],
  );

  // Crossing set for highlighting wires
  const crossingIds = useMemo(() => {
    const s = new Set<CircuitId>();
    crossings.forEach(c => { s.add(c.idA); s.add(c.idB); });
    return s;
  }, [crossings]);

  // ── Pointer handlers ──────────────────────────────────────────
  const handlePointerDown = useCallback((circuitId: CircuitId, e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    const slot = effectiveLanes.indexOf(circuitId);
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    const svgScale = ctm ? ctm.a : 1;
    setDragState({
      circuitId,
      originSlot: slot,
      startClientX: e.clientX,
      currentClientX: e.clientX,
      active: false,
      svgScale,
    });
  }, [effectiveLanes]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState) return;
    const dx = Math.abs(e.clientX - dragState.startClientX);
    if (!dragState.active && dx < DRAG_THRESHOLD) return;
    setDragState(prev => prev ? { ...prev, currentClientX: e.clientX, active: true } : null);
  }, [dragState]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragState) return;
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch { /* ok */ }
    if (dragState.active) {
      onLanesChange(effectiveLanes);
    }
    setDragState(null);
  }, [dragState, effectiveLanes, onLanesChange]);

  // ── Build wire paths ────────────────────────────────────────
  const wirePaths = useMemo(() => {
    return effectiveLanes.map((cId, slot) => {
      const config = circuitConfigs[configIndex[cId]];
      const wire = circuitWires[cId];
      if (!config || !wire) return null;

      const sx = startXMap[cId];
      const lx = laneX(slot);
      const ex = nfbX(configIndex[cId]);
      const is220 = config.voltage === 220;

      // Busbar row for tap point
      const phase = phases[cId] ?? config.phase;
      let tapY: number;
      if (is220) {
        // Taps both R and T
        tapY = busbarRowY(0) + BUSBAR_H / 2;
      } else if (phase === 'T') {
        tapY = busbarRowY(1) + BUSBAR_H / 2;
      } else {
        tapY = busbarRowY(0) + BUSBAR_H / 2;
      }

      const routeTop = ROUTING_TOP;
      const routeBottom = ROUTING_TOP + ROUTING_HEIGHT;

      // Path: tap → down to route top → horizontal to lane → vertical to route bottom → horizontal to NFB
      const d = [
        `M ${sx} ${tapY + BUSBAR_H / 2}`,
        `L ${sx} ${routeTop}`,
        `L ${lx} ${routeTop + 15}`,
        `L ${lx} ${routeBottom - 10}`,
        `L ${ex} ${routeBottom}`,
        `L ${ex} ${NFB_ZONE_Y}`,
      ].join(' ');

      return {
        cId,
        d,
        color: wireGaugeColor(wire.crossSection),
        strokeWidth: is220 ? 6 : 4,
        isCrossing: crossingIds.has(cId),
        isDragging: !!(dragState?.active && dragState.circuitId === cId),
      } satisfies WirePathData;
    }).filter((wp): wp is WirePathData => wp !== null);
  }, [effectiveLanes, circuitConfigs, configIndex, circuitWires, startXMap, phases, crossingIds, dragState]);

  return (
    <div className="panel-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="panel-container">
        {/* Header */}
        <div className="panel-header">
          <div className="panel-header-tag">WIRE ROUTING</div>
          <h2 className="panel-title">配電箱內部</h2>
          <p className="panel-subtitle">拖曳線材重新排列車道，消除交叉</p>
          <button className="panel-close-btn" onClick={onClose} aria-label="關閉">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Crossing counter */}
        <div className="panel-score-bar">
          <div className="panel-score-item">
            <span className="panel-score-label">交叉數</span>
            <span className={`panel-score-value ${crossings.length === 0 ? 'score-perfect' : 'score-bad'}`}>
              {crossings.length}
            </span>
          </div>
          <div className="panel-score-item">
            <span className="panel-score-label">迴路</span>
            <span className="panel-score-value">{n}</span>
          </div>
        </div>

        {/* SVG Panel Interior */}
        <div className="panel-svg-wrap">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${totalWidth} ${TOTAL_HEIGHT}`}
            width="100%"
            style={{ maxWidth: Math.max(400, totalWidth * 1.2) }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <defs>
              {/* Metal gradient for panel body */}
              <linearGradient id="panel-metal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#222830" />
                <stop offset="30%" stopColor="#1a1f26" />
                <stop offset="70%" stopColor="#16191f" />
                <stop offset="100%" stopColor="#111418" />
              </linearGradient>
              {/* Copper gradient for busbars */}
              <linearGradient id="copper-bar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8a020" />
                <stop offset="40%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              {/* DIN rail gradient */}
              <linearGradient id="din-rail" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#888" />
                <stop offset="50%" stopColor="#aaa" />
                <stop offset="100%" stopColor="#777" />
              </linearGradient>
              {/* Routing zone subtle background */}
              <linearGradient id="route-zone-bg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
              </linearGradient>
              {/* Crossing glow */}
              <filter id="crossing-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Wire glow for dragging */}
              <filter id="wire-drag-glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ── Panel enclosure ── */}
            <rect x={2} y={2} width={totalWidth - 4} height={TOTAL_HEIGHT - 4}
              rx={8} fill="url(#panel-metal)"
              stroke="#2e3a4a" strokeWidth={1.5} />
            {/* Inner frame line */}
            <rect x={10} y={10} width={totalWidth - 20} height={TOTAL_HEIGHT - 20}
              rx={4} fill="none" stroke="#1e2630" strokeWidth={1} />

            {/* Corner screws */}
            {[[18, 18], [totalWidth - 18, 18], [18, TOTAL_HEIGHT - 18], [totalWidth - 18, TOTAL_HEIGHT - 18]].map(([cx, cy], i) => (
              <g key={`screw-${i}`}>
                <circle cx={cx} cy={cy} r={5} fill="#1a1e24" stroke="#333" strokeWidth={1} />
                <line x1={cx - 2.5} y1={cy - 2.5} x2={cx + 2.5} y2={cy + 2.5} stroke="#444" strokeWidth={0.8} />
                <line x1={cx + 2.5} y1={cy - 2.5} x2={cx - 2.5} y2={cy + 2.5} stroke="#444" strokeWidth={0.8} />
              </g>
            ))}

            {/* Brand label */}
            <text x={totalWidth / 2} y={38} textAnchor="middle"
              fill="#3a4555" fontSize={9} fontFamily="var(--font-display)"
              fontWeight={700} letterSpacing="0.3em">
              REWIRE PANEL
            </text>
            <text x={totalWidth / 2} y={50} textAnchor="middle"
              fill="#2a3444" fontSize={7} fontFamily="var(--font-mono)">
              DISTRIBUTION BOARD — {n} CIRCUITS
            </text>

            {/* ── Busbar area ── */}
            {/* R phase bar */}
            <rect x={busbarLeft} y={busbarRowY(0)} width={busbarRight - busbarLeft} height={BUSBAR_H}
              rx={2} fill="url(#copper-bar)" />
            <text x={busbarLeft - 6} y={busbarRowY(0) + BUSBAR_H / 2 + 3}
              textAnchor="end" fill="#ef4444" fontSize={9} fontWeight={700}
              fontFamily="var(--font-mono)">R</text>

            {/* T phase bar */}
            <rect x={busbarLeft} y={busbarRowY(1)} width={busbarRight - busbarLeft} height={BUSBAR_H}
              rx={2} fill="url(#copper-bar)" />
            <text x={busbarLeft - 6} y={busbarRowY(1) + BUSBAR_H / 2 + 3}
              textAnchor="end" fill="#60a5fa" fontSize={9} fontWeight={700}
              fontFamily="var(--font-mono)">T</text>

            {/* N neutral bar */}
            <rect x={busbarLeft} y={busbarRowY(2)} width={busbarRight - busbarLeft} height={BUSBAR_H}
              rx={2} fill="url(#copper-bar)" opacity={0.7} />
            <text x={busbarLeft - 6} y={busbarRowY(2) + BUSBAR_H / 2 + 3}
              textAnchor="end" fill="#8a96a6" fontSize={9} fontWeight={700}
              fontFamily="var(--font-mono)">N</text>

            {/* Tap points on busbars */}
            {circuitConfigs.map(c => {
              const sx = startXMap[c.id];
              const is220 = c.voltage === 220;
              const phase = phases[c.id] ?? c.phase;
              return (
                <g key={`tap-${c.id}`}>
                  {/* R bar tap */}
                  {(phase === 'R' || is220) && (
                    <circle cx={sx} cy={busbarRowY(0) + BUSBAR_H / 2} r={3}
                      fill="#fbbf24" stroke="#b45309" strokeWidth={0.8} />
                  )}
                  {/* T bar tap */}
                  {(phase === 'T' || is220) && (
                    <circle cx={is220 ? sx : sx} cy={busbarRowY(1) + BUSBAR_H / 2} r={3}
                      fill="#fbbf24" stroke="#b45309" strokeWidth={0.8} />
                  )}
                  {/* N bar tap (all circuits) */}
                  <circle cx={nfbX(configIndex[c.id])} cy={busbarRowY(2) + BUSBAR_H / 2} r={2.5}
                    fill="#fbbf24" stroke="#b45309" strokeWidth={0.6} opacity={0.6} />
                </g>
              );
            })}

            {/* ── Routing zone background ── */}
            <rect x={PANEL_PADDING - 4} y={ROUTING_TOP - 6}
              width={n * LANE_WIDTH + 8} height={ROUTING_HEIGHT + 12}
              rx={4} fill="url(#route-zone-bg)" stroke="#1e2630" strokeWidth={0.5} />

            {/* Lane guides (subtle vertical dashed lines) */}
            {Array.from({ length: n }).map((_, i) => (
              <line key={`lane-guide-${i}`}
                x1={laneX(i)} y1={ROUTING_TOP}
                x2={laneX(i)} y2={ROUTING_TOP + ROUTING_HEIGHT}
                stroke="#1e2630" strokeWidth={1} strokeDasharray="4 8" />
            ))}

            {/* ── Wire routing paths ── */}
            {wirePaths.map(wp => (
              <g key={`wire-${wp.cId}`}
                className={`panel-wire-group ${wp.isDragging ? 'dragging' : ''}`}
                style={{ transition: wp.isDragging ? 'none' : 'transform 150ms ease' }}
              >
                {/* Shadow / outline for depth */}
                <path d={wp.d} fill="none"
                  stroke="rgba(0,0,0,0.5)" strokeWidth={wp.strokeWidth + 2}
                  strokeLinecap="round" strokeLinejoin="round" />
                {/* Main wire */}
                <path d={wp.d} fill="none"
                  stroke={wp.isCrossing ? '#ef4444' : wp.color}
                  strokeWidth={wp.strokeWidth}
                  strokeLinecap="round" strokeLinejoin="round"
                  opacity={wp.isDragging ? 0.9 : (wp.isCrossing ? 0.7 : 0.85)}
                  filter={wp.isDragging ? 'url(#wire-drag-glow)' : 'none'}
                  className="panel-wire-path" />
                {/* Highlight overlay for crossing wires */}
                {wp.isCrossing && (
                  <path d={wp.d} fill="none"
                    stroke="#ef4444" strokeWidth={wp.strokeWidth + 1}
                    strokeLinecap="round" strokeLinejoin="round"
                    opacity={0.15} />
                )}
              </g>
            ))}

            {/* ── Crossing markers ── */}
            {crossings.map((c, i) => (
              <g key={`cross-${i}`} filter="url(#crossing-glow)">
                <circle cx={c.x} cy={c.y} r={10}
                  fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth={1} />
                <text x={c.x} y={c.y + 4} textAnchor="middle"
                  fill="#ef4444" fontSize={10} fontWeight={700}
                  fontFamily="var(--font-mono)">✕</text>
              </g>
            ))}

            {/* ── DIN rail ── */}
            <rect x={PANEL_PADDING - 8} y={NFB_ZONE_Y - 4}
              width={n * LANE_WIDTH + 16} height={NFB_H + 8}
              rx={3} fill="url(#din-rail)" opacity={0.25} />
            <line x1={PANEL_PADDING - 8} y1={NFB_ZONE_Y - 4}
              x2={PANEL_PADDING + n * LANE_WIDTH + 8} y2={NFB_ZONE_Y - 4}
              stroke="#666" strokeWidth={1.5} />
            <line x1={PANEL_PADDING - 8} y1={NFB_ZONE_Y + NFB_H + 4}
              x2={PANEL_PADDING + n * LANE_WIDTH + 8} y2={NFB_ZONE_Y + NFB_H + 4}
              stroke="#555" strokeWidth={1} />

            {/* ── NFB modules ── */}
            {circuitConfigs.map((config, i) => {
              const cx = nfbX(i);
              const is220 = config.voltage === 220;
              return (
                <g key={`nfb-${config.id}`}>
                  {/* NFB body */}
                  <rect x={cx - NFB_W / 2} y={NFB_ZONE_Y}
                    width={NFB_W} height={NFB_H} rx={3}
                    fill="#222" stroke={is220 ? '#744' : '#444'} strokeWidth={1} />
                  {/* Rating label */}
                  <text x={cx} y={NFB_ZONE_Y + 15} textAnchor="middle"
                    fill="#aaa" fontSize={8} fontWeight={700}
                    fontFamily="var(--font-mono)">
                    {config.breaker.ratedCurrent}A
                  </text>
                  {/* Pole type */}
                  <text x={cx} y={NFB_ZONE_Y + 28} textAnchor="middle"
                    fill={is220 ? '#f87171' : '#666'} fontSize={7} fontWeight={600}
                    fontFamily="var(--font-mono)">
                    {is220 ? '2P' : '1P'}
                  </text>
                  {/* Circuit label */}
                  <text x={cx} y={LABEL_Y} textAnchor="middle"
                    fill="#8a96a6" fontSize={8}
                    fontFamily="var(--font-mono)">
                    {config.label}
                  </text>
                  {/* Voltage tag */}
                  <text x={cx} y={LABEL_Y + 12} textAnchor="middle"
                    fill={is220 ? '#f87171' : '#4ade80'} fontSize={7}
                    fontFamily="var(--font-mono)">
                    {config.voltage}V
                  </text>
                </g>
              );
            })}

            {/* ── Drag handle zones (invisible, on top) ── */}
            {effectiveLanes.map((cId, slot) => (
              <rect key={`drag-${cId}`}
                x={laneX(slot) - LANE_WIDTH / 2 + 4}
                y={ROUTING_TOP - 4}
                width={LANE_WIDTH - 8}
                height={ROUTING_HEIGHT + 8}
                fill="transparent"
                style={{ cursor: dragState?.active ? 'grabbing' : 'grab', touchAction: 'none' }}
                onPointerDown={(e) => handlePointerDown(cId, e)}
              />
            ))}
          </svg>
        </div>

        {/* Footer */}
        <div className="panel-footer">
          <button className="panel-done-btn" onClick={onClose}>
            完成整線
          </button>
        </div>
      </div>
    </div>
  );
}
