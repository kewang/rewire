import { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './PanelInteriorView.css';
import type { CircuitId, CircuitConfig, Wire, CableTieQuality } from '../types/game';
import { detectCrossings, getCrossingPairIndices, countUnbundledPairs } from '../engine/aesthetics';
import { LANE_WIDTH, PANEL_PADDING, ROUTING_TOP, ROUTING_HEIGHT, wireStartX } from './panelLayout';
import { CABLE_TIE_BAR_SPEED } from '../data/constants';
import { tTieQuality, tRoomName } from '../i18nHelpers';

/** Map wire cross-section to a distinct color */
function wireGaugeColor(crossSection: number): string {
  if (crossSection <= 1.6) return '#93c5fd';
  if (crossSection <= 2.0) return '#86efac';
  if (crossSection <= 3.5) return '#fde047';
  if (crossSection <= 5.5) return '#fdba74';
  if (crossSection <= 8) return '#f87171';
  return '#c084fc'; // 14mm² — shifted to avoid clash with 220V purple
}

/** Map circuit phase/voltage to phase display color */
function phaseColor(voltage: number, phase?: 'R' | 'T'): string {
  if (voltage === 220) return '#a855f7';
  return (phase ?? 'R') === 'R' ? '#ef4444' : '#60a5fa';
}

/** Determine cable tie quality from bar position (0-1) */
function getCableTieQuality(pos: number): CableTieQuality {
  if (pos >= 0.45 && pos <= 0.55) return 'tight';
  if (pos >= 0.30 && pos <= 0.70) return 'good';
  if (pos < 0.30) return 'loose';
  return 'over-tight';
}

function tieQualityColor(quality: CableTieQuality): string {
  switch (quality) {
    case 'tight': return '#22c55e';
    case 'good': return '#84cc16';
    case 'loose': return '#f97316';
    case 'over-tight': return '#ef4444';
  }
}

// ── Layout constants (derived from shared) ────────────────────
const BUSBAR_Y = 70;
const BUSBAR_GAP = 20;
const BUSBAR_H = 8;
const NFB_ZONE_Y = ROUTING_TOP + ROUTING_HEIGHT + 10;
const NFB_H = 36;
const NFB_W = 32;
const LABEL_Y = NFB_ZONE_Y + NFB_H + 22;
const TOTAL_HEIGHT = LABEL_Y + 20;

const DRAG_THRESHOLD = 8;

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
  dFull: string;     // full path for shadow
  dUpper: string;    // busbar → routing top (phase color)
  dMiddle: string;   // routing zone (gradient)
  dLower: string;    // routing bottom → NFB (gauge color)
  phaseCol: string;
  gaugeCol: string;
  gradientId: string;
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
  cableTies: Map<number, CableTieQuality>;
  onToggleCableTie: (pairIndex: number, quality?: CableTieQuality) => void;
  aestheticsScore: number;
}

export default function PanelInteriorView({
  circuitConfigs,
  circuitWires,
  phases,
  lanes,
  onLanesChange,
  onClose,
  cableTies,
  onToggleCableTie,
  aestheticsScore,
}: PanelInteriorViewProps) {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hasDragged, setHasDragged] = useState(false);

  // Cable tie mini-game state
  const [tieGame, setTieGame] = useState<{
    pairIndex: number;
    phase: 'playing' | 'result';
    quality: CableTieQuality | null;
  } | null>(null);
  const [tieBarPosition, setTieBarPosition] = useState(0);
  const tieRafRef = useRef(0);
  const tiePrevTimeRef = useRef(0);
  const tieBarRef = useRef(0);
  const tieDirRef = useRef(1);
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
    const newLanes = [...lanes];
    const currentIdx = newLanes.indexOf(dragState.circuitId);
    if (currentIdx === -1) return lanes;
    newLanes.splice(currentIdx, 1);
    newLanes.splice(clamped, 0, dragState.circuitId);
    return newLanes;
  }, [dragState, lanes, n]);

  // Crossings (using shared engine)
  const crossings = useMemo(
    () => detectCrossings(effectiveLanes, configIndex, startXMap, PANEL_PADDING, LANE_WIDTH, ROUTING_TOP, ROUTING_HEIGHT),
    [effectiveLanes, configIndex, startXMap],
  );

  // Crossing set for highlighting wires
  const crossingIds = useMemo(() => {
    const s = new Set<CircuitId>();
    crossings.forEach(c => { s.add(c.idA); s.add(c.idB); });
    return s;
  }, [crossings]);

  // Crossing pair indices (for cable tie disabled state)
  const crossingPairIndices = useMemo(
    () => getCrossingPairIndices(effectiveLanes, configIndex, startXMap, PANEL_PADDING, LANE_WIDTH),
    [effectiveLanes, configIndex, startXMap],
  );

  // Cable tie stats for score bar
  const totalPairs = Math.max(0, n - 1);
  const bundledCount = cableTies.size;
  const unbundledCount = countUnbundledPairs(effectiveLanes, cableTies, crossingPairIndices);

  // Step bar state
  const step1Done = crossings.length === 0;
  const step2Done = step1Done && unbundledCount === 0;
  const activeStep = !step1Done ? 1 : !step2Done ? 2 : 3;

  // ── Cable tie mini-game animation ───────────────────────────
  const tieGamePhase = tieGame?.phase ?? null;
  const tieGamePair = tieGame?.pairIndex ?? -1;
  useEffect(() => {
    if (tieGamePhase !== 'playing') return;

    const animate = (timestamp: number) => {
      if (tiePrevTimeRef.current === 0) tiePrevTimeRef.current = timestamp;
      const dt = (timestamp - tiePrevTimeRef.current) / 1000;
      tiePrevTimeRef.current = timestamp;

      let pos = tieBarRef.current + tieDirRef.current * CABLE_TIE_BAR_SPEED * dt;
      if (pos >= 1) { pos = 1; tieDirRef.current = -1; }
      else if (pos <= 0) { pos = 0; tieDirRef.current = 1; }
      tieBarRef.current = pos;
      setTieBarPosition(pos);
      tieRafRef.current = requestAnimationFrame(animate);
    };

    tieBarRef.current = 0;
    tiePrevTimeRef.current = 0;
    tieDirRef.current = 1;
    tieRafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(tieRafRef.current);
  }, [tieGamePhase, tieGamePair]);

  const handleTiePointClick = useCallback((pairIndex: number) => {
    if (tieGame) return; // ignore while game is active
    if (cableTies.has(pairIndex)) {
      onToggleCableTie(pairIndex); // remove existing tie
      return;
    }
    setTieGame({ pairIndex, phase: 'playing', quality: null });
  }, [tieGame, cableTies, onToggleCableTie]);

  const handleTieStop = useCallback(() => {
    if (!tieGame || tieGame.phase !== 'playing') return;
    cancelAnimationFrame(tieRafRef.current);
    const pos = tieBarRef.current;
    const quality = getCableTieQuality(pos);
    const pairIndex = tieGame.pairIndex;

    setTieGame({ pairIndex, phase: 'result', quality });

    setTimeout(() => {
      onToggleCableTie(pairIndex, quality);
      setTieGame(null);
    }, 800);
  }, [tieGame, onToggleCableTie]);

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
      setHasDragged(true);
    }
    setDragState(null);
  }, [dragState, effectiveLanes, onLanesChange]);

  // ── Build wire paths (3 segments: upper/middle/lower) ──────
  const wirePaths = useMemo(() => {
    return effectiveLanes.map((cId, slot) => {
      const config = circuitConfigs[configIndex[cId]];
      const wire = circuitWires[cId];
      if (!config || !wire) return null;

      const sx = startXMap[cId];
      const lx = laneX(slot);
      const ex = nfbX(configIndex[cId]);
      const is220 = config.voltage === 220;

      const phase = phases[cId] ?? config.phase;
      let tapY: number;
      if (is220) {
        tapY = busbarRowY(0) + BUSBAR_H / 2;
      } else if (phase === 'T') {
        tapY = busbarRowY(1) + BUSBAR_H / 2;
      } else {
        tapY = busbarRowY(0) + BUSBAR_H / 2;
      }

      const routeTop = ROUTING_TOP;
      const routeBottom = ROUTING_TOP + ROUTING_HEIGHT;

      const dFull = [
        `M ${sx} ${tapY + BUSBAR_H / 2}`,
        `L ${sx} ${routeTop}`,
        `L ${lx} ${routeTop + 15}`,
        `L ${lx} ${routeBottom - 10}`,
        `L ${ex} ${routeBottom}`,
        `L ${ex} ${NFB_ZONE_Y}`,
      ].join(' ');

      const dUpper = `M ${sx} ${tapY + BUSBAR_H / 2} L ${sx} ${routeTop}`;

      const dMiddle = `M ${sx} ${routeTop} L ${lx} ${routeTop + 15} L ${lx} ${routeBottom - 10}`;

      const dLower = `M ${lx} ${routeBottom - 10} L ${ex} ${routeBottom} L ${ex} ${NFB_ZONE_Y}`;

      const pCol = phaseColor(config.voltage, phase as 'R' | 'T' | undefined);
      const gCol = wireGaugeColor(wire.crossSection);

      return {
        cId,
        dFull,
        dUpper,
        dMiddle,
        dLower,
        phaseCol: pCol,
        gaugeCol: gCol,
        gradientId: `phase-grad-${cId}`,
        strokeWidth: is220 ? 6 : 4,
        isCrossing: crossingIds.has(cId),
        isDragging: !!(dragState?.active && dragState.circuitId === cId),
      } satisfies WirePathData;
    }).filter((wp): wp is WirePathData => wp !== null);
  }, [effectiveLanes, circuitConfigs, configIndex, circuitWires, startXMap, phases, crossingIds, dragState]);

  // Score color
  const scoreColor = aestheticsScore >= 80 ? '#22c55e' : aestheticsScore >= 50 ? '#eab308' : '#ef4444';

  return (
    <div className="panel-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="panel-container">
        {/* Header */}
        <div className="panel-header">
          <div className="panel-header-tag">WIRE ROUTING</div>
          <h2 className="panel-title">{t('panel.title')}</h2>
          <p className="panel-subtitle">{t('panel.subtitle')}</p>
          <button className="panel-close-btn" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Step bar */}
        <div className="panel-step-bar">
          {[
            { num: 1, label: t('panel.step1Label'), desc: t('panel.step1Desc') },
            { num: 2, label: t('panel.step2Label'), desc: t('panel.step2Desc') },
            { num: 3, label: t('panel.step3Label'), desc: t('panel.step3Desc') },
          ].map(({ num, label, desc }) => {
            const isDone = num < activeStep;
            const isActive = num === activeStep;
            return (
              <div key={num} className={`panel-step ${isDone ? 'step-done' : isActive ? 'step-active' : 'step-pending'}`}>
                <div className="panel-step-indicator">
                  {isDone ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <span className="panel-step-num">{num}</span>
                  )}
                </div>
                <div className="panel-step-text">
                  <span className="panel-step-label">{label}</span>
                  <span className="panel-step-desc">{desc}</span>
                </div>
                {num < 3 && <div className="panel-step-connector" />}
              </div>
            );
          })}
        </div>

        {/* Score bar */}
        <div className="panel-score-bar">
          <div className="panel-score-item">
            <span className="panel-score-label">{t('panel.crossings')}</span>
            <span className={`panel-score-value ${crossings.length === 0 ? 'score-perfect' : 'score-bad'}`}>
              {crossings.length}
            </span>
          </div>
          <div className="panel-score-item">
            <span className="panel-score-label">{t('panel.cableTies')}</span>
            <span className="panel-score-value">{bundledCount}/{totalPairs}</span>
          </div>
          <div className="panel-score-item">
            <span className="panel-score-label">{t('panel.aestheticsScore')}</span>
            <span className="panel-score-value" style={{ color: scoreColor }}>
              {aestheticsScore}
            </span>
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
              <linearGradient id="panel-metal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#222830" />
                <stop offset="30%" stopColor="#1a1f26" />
                <stop offset="70%" stopColor="#16191f" />
                <stop offset="100%" stopColor="#111418" />
              </linearGradient>
              <linearGradient id="copper-bar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8a020" />
                <stop offset="40%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id="din-rail" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#888" />
                <stop offset="50%" stopColor="#aaa" />
                <stop offset="100%" stopColor="#777" />
              </linearGradient>
              <linearGradient id="route-zone-bg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
              </linearGradient>
              <filter id="crossing-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
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
            <rect x={busbarLeft} y={busbarRowY(0)} width={busbarRight - busbarLeft} height={BUSBAR_H}
              rx={2} fill="url(#copper-bar)" />
            <text x={busbarLeft - 6} y={busbarRowY(0) + BUSBAR_H / 2 + 3}
              textAnchor="end" fill="#ef4444" fontSize={9} fontWeight={700}
              fontFamily="var(--font-mono)">R</text>

            <rect x={busbarLeft} y={busbarRowY(1)} width={busbarRight - busbarLeft} height={BUSBAR_H}
              rx={2} fill="url(#copper-bar)" />
            <text x={busbarLeft - 6} y={busbarRowY(1) + BUSBAR_H / 2 + 3}
              textAnchor="end" fill="#60a5fa" fontSize={9} fontWeight={700}
              fontFamily="var(--font-mono)">T</text>

            <rect x={busbarLeft} y={busbarRowY(2)} width={busbarRight - busbarLeft} height={BUSBAR_H}
              rx={2} fill="url(#copper-bar)" opacity={0.7} />
            <text x={busbarLeft - 6} y={busbarRowY(2) + BUSBAR_H / 2 + 3}
              textAnchor="end" fill="#8a96a6" fontSize={9} fontWeight={700}
              fontFamily="var(--font-mono)">N</text>

            {/* Tap points on busbars — phase-colored, enlarged */}
            {circuitConfigs.map(c => {
              const sx = startXMap[c.id];
              const is220 = c.voltage === 220;
              const phase = phases[c.id] ?? c.phase;
              const nfbXPos = nfbX(configIndex[c.id]);
              return (
                <g key={`tap-${c.id}`}>
                  {/* R busbar tap */}
                  {(phase === 'R' || is220) && (
                    <>
                      <circle cx={sx} cy={busbarRowY(0) + BUSBAR_H / 2} r={5}
                        fill={is220 ? '#a855f7' : '#ef4444'} stroke="rgba(255,255,255,0.6)" strokeWidth={0.8} />
                      {!is220 && (
                        <text x={sx} y={busbarRowY(0) - 2}
                          textAnchor="middle" fill="#ef4444" fontSize={7} fontWeight={700}
                          fontFamily="var(--font-mono)">R</text>
                      )}
                    </>
                  )}
                  {/* T busbar tap */}
                  {(phase === 'T' || is220) && (
                    <>
                      <circle cx={sx} cy={busbarRowY(1) + BUSBAR_H / 2} r={5}
                        fill={is220 ? '#a855f7' : '#60a5fa'} stroke="rgba(255,255,255,0.6)" strokeWidth={0.8} />
                      {!is220 && (
                        <text x={sx} y={busbarRowY(1) - 2}
                          textAnchor="middle" fill="#60a5fa" fontSize={7} fontWeight={700}
                          fontFamily="var(--font-mono)">T</text>
                      )}
                    </>
                  )}
                  {/* 220V: dashed line between R and T taps + label */}
                  {is220 && (
                    <>
                      <line x1={sx} y1={busbarRowY(0) + BUSBAR_H / 2}
                        x2={sx} y2={busbarRowY(1) + BUSBAR_H / 2}
                        stroke="#a855f7" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.6} />
                      <text x={sx + 9} y={(busbarRowY(0) + busbarRowY(1)) / 2 + BUSBAR_H / 2 + 3}
                        fill="#a855f7" fontSize={6} fontWeight={700}
                        fontFamily="var(--font-mono)">220V</text>
                    </>
                  )}
                  {/* N busbar tap (110V only) */}
                  {!is220 && (
                    <circle cx={nfbXPos} cy={busbarRowY(2) + BUSBAR_H / 2} r={4}
                      fill="#8a96a6" stroke="rgba(255,255,255,0.4)" strokeWidth={0.6} opacity={0.6} />
                  )}
                </g>
              );
            })}

            {/* ── Routing zone background ── */}
            <rect x={PANEL_PADDING - 4} y={ROUTING_TOP - 6}
              width={n * LANE_WIDTH + 8} height={ROUTING_HEIGHT + 12}
              rx={4} fill="url(#route-zone-bg)" stroke="#1e2630" strokeWidth={0.5} />

            {/* Lane guides */}
            {Array.from({ length: n }).map((_, i) => (
              <line key={`lane-guide-${i}`}
                x1={laneX(i)} y1={ROUTING_TOP}
                x2={laneX(i)} y2={ROUTING_TOP + ROUTING_HEIGHT}
                stroke="#1e2630" strokeWidth={1} strokeDasharray="4 8" />
            ))}

            {/* ── Phase gradients (dynamic per wire) ── */}
            <defs>
              {wirePaths.map(wp => (
                <linearGradient key={`grad-${wp.cId}`} id={wp.gradientId}
                  gradientUnits="userSpaceOnUse" x1="0" y1={ROUTING_TOP} x2="0" y2={ROUTING_TOP + ROUTING_HEIGHT - 10}>
                  <stop offset="0%" stopColor={wp.phaseCol} />
                  <stop offset="100%" stopColor={wp.gaugeCol} />
                </linearGradient>
              ))}
            </defs>

            {/* ── Wire routing paths (3-segment: phase → gradient → gauge) ── */}
            {wirePaths.map(wp => (
              <g key={`wire-${wp.cId}`}
                className={`panel-wire-group ${wp.isDragging ? 'dragging' : ''}`}
                style={{ transition: wp.isDragging ? 'none' : 'transform 150ms ease' }}
              >
                {/* Shadow (full path) */}
                <path d={wp.dFull} fill="none"
                  stroke="rgba(0,0,0,0.5)" strokeWidth={wp.strokeWidth + 2}
                  strokeLinecap="round" strokeLinejoin="round" />
                {/* Upper segment: phase color */}
                <path d={wp.dUpper} fill="none"
                  stroke={wp.isCrossing ? '#ef4444' : wp.phaseCol}
                  strokeWidth={wp.strokeWidth}
                  strokeLinecap="round" strokeLinejoin="round"
                  opacity={wp.isDragging ? 0.9 : (wp.isCrossing ? 0.7 : 0.85)} />
                {/* Middle segment: phase→gauge gradient */}
                <path d={wp.dMiddle} fill="none"
                  stroke={wp.isCrossing ? '#ef4444' : `url(#${wp.gradientId})`}
                  strokeWidth={wp.strokeWidth}
                  strokeLinecap="round" strokeLinejoin="round"
                  opacity={wp.isDragging ? 0.9 : (wp.isCrossing ? 0.7 : 0.85)}
                  filter={wp.isDragging ? 'url(#wire-drag-glow)' : 'none'}
                  className="panel-wire-path" />
                {/* Lower segment: gauge color */}
                <path d={wp.dLower} fill="none"
                  stroke={wp.isCrossing ? '#ef4444' : wp.gaugeCol}
                  strokeWidth={wp.strokeWidth}
                  strokeLinecap="round" strokeLinejoin="round"
                  opacity={wp.isDragging ? 0.9 : (wp.isCrossing ? 0.7 : 0.85)} />
                {/* Crossing glow (middle segment only) */}
                {wp.isCrossing && (
                  <path d={wp.dMiddle} fill="none"
                    stroke="#ef4444" strokeWidth={wp.strokeWidth + 1}
                    strokeLinecap="round" strokeLinejoin="round"
                    opacity={0.15} />
                )}
              </g>
            ))}

            {/* ── Cable tie placement points ── */}
            {Array.from({ length: n - 1 }).map((_, i) => {
              const x1 = laneX(i);
              const x2 = laneX(i + 1);
              const cx = (x1 + x2) / 2;
              const cy = ROUTING_TOP + ROUTING_HEIGHT / 2;
              const isCrossing = crossingPairIndices.has(i);
              const hasTie = cableTies.has(i);

              return (
                <g key={`cable-tie-${i}`}
                  className={`cable-tie-point ${isCrossing ? 'cable-tie-disabled' : hasTie ? 'cable-tie-placed' : 'cable-tie-available'}`}
                  onClick={() => { if (!isCrossing) handleTiePointClick(i); }}
                  style={{ cursor: isCrossing ? 'not-allowed' : 'pointer' }}
                >
                  {/* Tooltip */}
                  <title>{isCrossing ? t('panel.crossingNoTie') : hasTie ? t('panel.removeTie') : t('panel.placeTie')}</title>
                  {/* Hit area */}
                  <rect x={cx - 14} y={cy - 14} width={28} height={28}
                    fill="transparent" />

                  {isCrossing ? (
                    /* Disabled: red semi-transparent circle */
                    <>
                      <circle cx={cx} cy={cy} r={10}
                        fill="rgba(239,68,68,0.1)" stroke="#ef4444" strokeWidth={0.8}
                        opacity={0.4} />
                      <line x1={cx - 5} y1={cy - 5} x2={cx + 5} y2={cy + 5}
                        stroke="#ef4444" strokeWidth={1.5} opacity={0.4} />
                      <line x1={cx + 5} y1={cy - 5} x2={cx - 5} y2={cy + 5}
                        stroke="#ef4444" strokeWidth={1.5} opacity={0.4} />
                    </>
                  ) : hasTie ? (
                    /* Placed: green cable tie bands */
                    <>
                      <rect x={cx - 12} y={cy - 3} width={24} height={6}
                        rx={2} fill="#22c55e" opacity={0.8} />
                      <rect x={cx - 10} y={cy - 1.5} width={20} height={3}
                        rx={1} fill="#4ade80" />
                      {/* Small nub */}
                      <rect x={cx + 10} y={cy - 5} width={3} height={10}
                        rx={1} fill="#22c55e" opacity={0.6} />
                    </>
                  ) : (
                    /* Available: dashed yellow hint */
                    <>
                      <line x1={cx - 10} y1={cy} x2={cx + 10} y2={cy}
                        stroke="#fde047" strokeWidth={2} strokeDasharray="3 3"
                        opacity={0.3} className="cable-tie-hint" />
                      <circle cx={cx} cy={cy} r={8}
                        fill="transparent" stroke="#fde047" strokeWidth={0.8}
                        strokeDasharray="2 4" opacity={0.2} className="cable-tie-hint" />
                    </>
                  )}
                </g>
              );
            })}

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
                  <rect x={cx - NFB_W / 2} y={NFB_ZONE_Y}
                    width={NFB_W} height={NFB_H} rx={3}
                    fill="#222" stroke={is220 ? '#744' : '#444'} strokeWidth={1} />
                  <text x={cx} y={NFB_ZONE_Y + 15} textAnchor="middle"
                    fill="#aaa" fontSize={8} fontWeight={700}
                    fontFamily="var(--font-mono)">
                    {config.breaker.ratedCurrent}A
                  </text>
                  <text x={cx} y={NFB_ZONE_Y + 28} textAnchor="middle"
                    fill={is220 ? '#f87171' : '#666'} fontSize={7} fontWeight={600}
                    fontFamily="var(--font-mono)">
                    {is220 ? '2P' : '1P'}
                  </text>
                  <text x={cx} y={LABEL_Y} textAnchor="middle"
                    fill="#8a96a6" fontSize={8}
                    fontFamily="var(--font-mono)">
                    {tRoomName(t, config.label)}
                  </text>
                  <text x={cx} y={LABEL_Y + 12} textAnchor="middle"
                    fill={is220 ? '#f87171' : '#4ade80'} fontSize={7}
                    fontFamily="var(--font-mono)">
                    {config.voltage}V
                  </text>
                </g>
              );
            })}

            {/* ── Neutral return paths (110V only, ghost dashed lines) ── */}
            {circuitConfigs.map((config, i) => {
              if (config.voltage === 220) return null;
              const cx = nfbX(i);
              const nTapY = busbarRowY(2) + BUSBAR_H / 2;
              return (
                <line key={`n-return-${config.id}`}
                  x1={cx + 8} y1={NFB_ZONE_Y}
                  x2={cx + 8} y2={nTapY}
                  stroke="#8a96a6" strokeWidth={1.5} strokeDasharray="4 4"
                  opacity={0.25} />
              );
            })}

            {/* ── Area labels (right edge, rotated) ── */}
            <text
              x={totalWidth - 10} y={busbarRowY(1)}
              textAnchor="middle" fill="#3a4555" fontSize={7}
              fontFamily="var(--font-mono)" fontWeight={600}
              letterSpacing="0.15em"
              transform={`rotate(-90, ${totalWidth - 10}, ${busbarRowY(1)})`}
              className="panel-area-label"
            >{t('panel.busbar')}</text>
            <text
              x={totalWidth - 10} y={ROUTING_TOP + ROUTING_HEIGHT / 2}
              textAnchor="middle" fill="#3a4555" fontSize={7}
              fontFamily="var(--font-mono)" fontWeight={600}
              letterSpacing="0.15em"
              transform={`rotate(-90, ${totalWidth - 10}, ${ROUTING_TOP + ROUTING_HEIGHT / 2})`}
              className="panel-area-label"
            >{t('panel.routingZone')}</text>
            <text
              x={totalWidth - 10} y={NFB_ZONE_Y + NFB_H / 2}
              textAnchor="middle" fill="#3a4555" fontSize={7}
              fontFamily="var(--font-mono)" fontWeight={600}
              letterSpacing="0.15em"
              transform={`rotate(-90, ${totalWidth - 10}, ${NFB_ZONE_Y + NFB_H / 2})`}
              className="panel-area-label"
            >NFB</text>

            {/* ── Wire labels (mid-route, on each wire) ── */}
            {effectiveLanes.map((cId, slot) => {
              const config = circuitConfigs[configIndex[cId]];
              if (!config) return null;
              const lx = laneX(slot);
              const ly = ROUTING_TOP + ROUTING_HEIGHT / 2 + 4;
              const labelText = tRoomName(t, config.label);
              const labelWidth = labelText.length * 7 + 10;
              return (
                <g key={`wire-label-${cId}`}>
                  <rect
                    x={lx - labelWidth / 2} y={ly - 8}
                    width={labelWidth} height={16} rx={3}
                    fill="rgba(10, 12, 15, 0.85)" stroke="#2e3a4a" strokeWidth={0.5}
                  />
                  <text x={lx} y={ly + 3} textAnchor="middle"
                    fill="#c0c8d4" fontSize={7.5}
                    fontFamily="var(--font-mono)" fontWeight={600}>
                    {labelText}
                  </text>
                </g>
              );
            })}

            {/* ── Drag hint (disappears after first drag) ── */}
            {!hasDragged && (
              <text
                x={PANEL_PADDING + (n * LANE_WIDTH) / 2}
                y={ROUTING_TOP + 10}
                textAnchor="middle"
                fill="#5a6878" fontSize={9}
                fontFamily="var(--font-mono)" fontWeight={600}
                opacity={0.7}
                className="panel-drag-hint"
              >{t('panel.dragHint')}</text>
            )}

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

          {/* ── Cable tie mini-game (inline tension gauge) ── */}
          {tieGame && (
            <div
              className={`cable-tie-game ${tieGame.phase}`}
              onClick={tieGame.phase === 'playing' ? handleTieStop : undefined}
            >
              <div className="cable-tie-game-header">
                <span className="cable-tie-game-tag">CABLE TIE</span>
                <span className="cable-tie-game-label">{t('cableTie.title')}</span>
              </div>

              {tieGame.phase === 'playing' && (
                <>
                  <div className="cable-tie-gauge">
                    <div className="cable-tie-gauge-zones">
                      <div className="cable-tie-zone zone-loose" />
                      <div className="cable-tie-zone zone-good-l" />
                      <div className="cable-tie-zone zone-tight" />
                      <div className="cable-tie-zone zone-good-r" />
                      <div className="cable-tie-zone zone-overtight" />
                    </div>
                    <div className="cable-tie-gauge-track">
                      <div className="cable-tie-needle" style={{ left: `${tieBarPosition * 100}%` }} />
                    </div>
                    <div className="cable-tie-gauge-labels">
                      <span className="tie-label-loose">LOOSE</span>
                      <span className="tie-label-good">GOOD</span>
                      <span className="tie-label-tight">TIGHT</span>
                      <span className="tie-label-good">GOOD</span>
                      <span className="tie-label-overtight">OVER</span>
                    </div>
                  </div>
                  <div className="cable-tie-tap-hint">{t('cableTie.tapToLock')}</div>
                </>
              )}

              {tieGame.phase === 'result' && tieGame.quality && (
                <div
                  className="cable-tie-result"
                  style={{ '--tie-quality-color': tieQualityColor(tieGame.quality) } as React.CSSProperties}
                >
                  <div className="cable-tie-quality-badge">
                    {tTieQuality(t, tieGame.quality)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="panel-footer">
          <button className="panel-done-btn" onClick={onClose}>
            {t('panel.doneBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
