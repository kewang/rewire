import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FloorPlan, FloorPlanRoom, FloorPlanOutlet, RoutingNode } from '../types/floorPlan';
import type { RoutePath, RouteCandidate } from '../engine/routing';
import type { CircuitId, SimulationStatus, OldHouseProblemType } from '../types/game';
import { tRoomName } from '../i18nHelpers';

// ─── Constants ────────────────────────────────────────────

/** Pixels per grid unit */
const CELL_SIZE = 80;
/** Gap between adjacent rooms (pixels) — creates internal wall appearance */
const ROOM_GAP = 3;
/** Padding around the entire floor plan (pixels) */
const WALL_PADDING = 4;
/** External wall stroke width (pixels) */
const WALL_THICKNESS = 5;
/** Perpendicular offset step for overlapping path segments (pixels) */
const PATH_OFFSET_STEP = 4;
/** Panel icon half-size (pixels) */
const PANEL_HALF = 12;

/** 8 distinct circuit colors for room assignment visualization on dark backgrounds */
export const CIRCUIT_COLORS = [
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
] as const;

// ─── Exported Types ──────────────────────────────────────

export interface CircuitAssignment {
  circuitIndex: number;
  color: string;
}

export interface ConnectedPathGroup {
  circuitIndex: number;
  wireColor: string;
  paths: ReadonlyMap<string, RoutePath>;
}

/** Simulation state passed from GameBoard for live visual feedback on floor plan */
export interface FloorPlanSimulationState {
  isPowered: boolean;
  circuitStates: Record<CircuitId, {
    status: SimulationStatus;
    wireHeat: number;
    totalCurrent: number;
  }>;
  mainTripped: boolean;
}

export interface FloorPlanViewProps {
  floorPlan: FloorPlan;
  /** Room ID → circuit assignment (for coloring rooms and outlets) */
  circuitAssignments?: ReadonlyMap<string, CircuitAssignment>;
  /** Candidate routing paths to display as dashed lines with distance labels */
  candidatePaths?: readonly RouteCandidate[];
  /** Connected (selected) wiring paths to display as solid lines in wire color */
  connectedPaths?: readonly ConnectedPathGroup[];
  /** Called when user clicks the panel (配電箱) icon */
  onPanelClick?: () => void;
  /** Called when user clicks on a room */
  onRoomClick?: (roomId: string) => void;
  /** Called when pointer enters/leaves a room (null = left all rooms) */
  onRoomHover?: (roomId: string | null) => void;
  /** Currently highlighted room ID (hover/drag target) */
  highlightedRoomId?: string | null;
  /** Whether a wire drag is currently active */
  dragActive?: boolean;
  /** Live simulation state for visual feedback during power-on */
  simulationState?: FloorPlanSimulationState;
  /** Room ID → problem types (old house mode) */
  problemRooms?: ReadonlyMap<string, readonly OldHouseProblemType[]>;
  /** Room ID → CircuitId mapping for state lookup */
  roomCircuitMap?: Record<string, CircuitId>;
  /** Room ID → appliance count (for badge display) */
  applianceCounts?: ReadonlyMap<string, number>;
  /** Room ID → appliance detail strings (for tooltip) */
  applianceDetails?: ReadonlyMap<string, readonly string[]>;
}

// ─── Coordinate Helpers ──────────────────────────────────

/** Convert grid coordinates to pixel coordinates */
function gridToPixel(gx: number, gy: number): [number, number] {
  return [gx * CELL_SIZE + WALL_PADDING, gy * CELL_SIZE + WALL_PADDING];
}

/** Calculate pixel rect for a room, with ROOM_GAP inset for wall separation */
function roomPixelRect(room: FloorPlanRoom) {
  return {
    x: room.x * CELL_SIZE + WALL_PADDING + ROOM_GAP / 2,
    y: room.y * CELL_SIZE + WALL_PADDING + ROOM_GAP / 2,
    w: room.width * CELL_SIZE - ROOM_GAP,
    h: room.height * CELL_SIZE - ROOM_GAP,
  };
}

/** Convert outlet proportional position to pixel coordinates within a room */
function outletPixel(room: FloorPlanRoom, outlet: FloorPlanOutlet): [number, number] {
  return [
    (room.x + outlet.x * room.width) * CELL_SIZE + WALL_PADDING,
    (room.y + outlet.y * room.height) * CELL_SIZE + WALL_PADDING,
  ];
}

// ─── Path Helpers ────────────────────────────────────────

function buildNodeMap(nodes: readonly RoutingNode[]): Map<string, RoutingNode> {
  const m = new Map<string, RoutingNode>();
  for (const n of nodes) m.set(n.id, n);
  return m;
}

/** Resolve node IDs to pixel coordinate array */
function resolvePoints(
  nodeIds: readonly string[],
  nodeMap: Map<string, RoutingNode>,
): [number, number][] {
  return nodeIds
    .map(id => nodeMap.get(id))
    .filter((n): n is RoutingNode => n != null)
    .map(n => gridToPixel(n.x, n.y));
}

/** Convert coordinate array to SVG polyline points string */
function toPolylineStr(pts: [number, number][]): string {
  return pts.map(([x, y]) => `${x},${y}`).join(' ');
}

/** Find the midpoint of the longest segment in a polyline */
function longestSegMid(pts: [number, number][]): [number, number] | null {
  if (pts.length < 2) return null;
  let best = 0, mx = 0, my = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    if (d > best) {
      best = d;
      mx = (pts[i][0] + pts[i + 1][0]) / 2;
      my = (pts[i][1] + pts[i + 1][1]) / 2;
    }
  }
  return [mx, my];
}

// ─── Segment Sharing (for path offset) ───────────────────

/** Normalize segment key so A|B === B|A */
function segKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

interface SegInfo {
  total: number;
  indices: Map<string, number>;
}

/** Count how many paths share each segment, assign each an index per segment */
function buildSegSharing(
  paths: { id: string; nodeIds: readonly string[] }[],
): Map<string, SegInfo> {
  const m = new Map<string, SegInfo>();
  for (const { id, nodeIds } of paths) {
    for (let i = 0; i < nodeIds.length - 1; i++) {
      const k = segKey(nodeIds[i], nodeIds[i + 1]);
      let e = m.get(k);
      if (!e) { e = { total: 0, indices: new Map() }; m.set(k, e); }
      if (!e.indices.has(id)) { e.indices.set(id, e.total); e.total++; }
    }
  }
  return m;
}

/**
 * Build SVG path string with per-segment perpendicular offset.
 * Each segment that shares a wall edge with other paths gets offset
 * ±PATH_OFFSET_STEP pixels to avoid visual overlap.
 */
function buildOffsetPath(
  pts: [number, number][],
  nodeIds: readonly string[],
  pathId: string,
  sharing: Map<string, SegInfo>,
): string {
  if (pts.length < 2) return '';
  const segs: string[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const k = segKey(nodeIds[i], nodeIds[i + 1]);
    const info = sharing.get(k);
    let ox = 0, oy = 0;
    if (info && info.total > 1) {
      const idx = info.indices.get(pathId) ?? 0;
      const off = (idx - (info.total - 1) / 2) * PATH_OFFSET_STEP;
      const dx = pts[i + 1][0] - pts[i][0];
      const dy = pts[i + 1][1] - pts[i][1];
      const len = Math.hypot(dx, dy);
      if (len > 0) { ox = (-dy / len) * off; oy = (dx / len) * off; }
    }
    segs.push(`M${pts[i][0] + ox},${pts[i][1] + oy} L${pts[i + 1][0] + ox},${pts[i + 1][1] + oy}`);
  }
  return segs.join(' ');
}

// ─── Simulation Visual Helpers ──────────────────────────

/** Interpolate between two hex colors. t=0→a, t=1→b */
function lerpColor(a: string, b: string, t: number): string {
  const parse = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}

/** Map wireHeat (0-1) + status to path stroke color */
function heatToPathColor(wireColor: string, wireHeat: number, status: SimulationStatus): { stroke: string; opacity: number } {
  if (status === 'burned' || status === 'leakage') return { stroke: '#ef4444', opacity: 0.2 };
  if (status === 'tripped' || status === 'elcb-tripped' || status === 'main-tripped') return { stroke: '#6b7280', opacity: 0.3 };
  if (wireHeat < 0.3) return { stroke: wireColor, opacity: 0.8 };
  if (wireHeat < 0.7) return { stroke: lerpColor(wireColor, '#f97316', (wireHeat - 0.3) / 0.4), opacity: 0.8 };
  return { stroke: lerpColor('#f97316', '#ef4444', (wireHeat - 0.7) / 0.3), opacity: 0.8 };
}

/** Determine room visual class based on its circuit's simulation state */
type RoomSimState = 'none' | 'powered' | 'warning' | 'tripped' | 'burned';

function getRoomSimState(
  roomId: string,
  roomCircuitMap: Record<string, CircuitId> | undefined,
  simulationState: FloorPlanSimulationState | undefined,
): RoomSimState {
  if (!simulationState?.isPowered || !roomCircuitMap) return 'none';
  if (simulationState.mainTripped) return 'tripped';
  const cid = roomCircuitMap[roomId];
  if (!cid) return 'none';
  const cs = simulationState.circuitStates[cid];
  if (!cs) return 'none';
  if (cs.status === 'burned' || cs.status === 'leakage') return 'burned';
  if (cs.status === 'tripped' || cs.status === 'elcb-tripped' || cs.status === 'neutral-burned' || cs.status === 'main-tripped') return 'tripped';
  if (cs.status === 'warning' || cs.wireHeat >= 0.3) return 'warning';
  return 'powered';
}

// ─── Component ───────────────────────────────────────────

export default function FloorPlanView({
  floorPlan,
  circuitAssignments,
  candidatePaths,
  connectedPaths,
  onPanelClick,
  onRoomClick,
  onRoomHover,
  highlightedRoomId,
  dragActive,
  simulationState,
  problemRooms,
  roomCircuitMap,
  applianceCounts,
  applianceDetails,
}: FloorPlanViewProps) {
  const { t } = useTranslation();
  const [panelHover, setPanelHover] = useState(false);

  const nodeMap = useMemo(
    () => buildNodeMap(floorPlan.routingGraph.nodes),
    [floorPlan.routingGraph.nodes],
  );

  // Pre-compute segment sharing for connected path offset
  const segSharing = useMemo(() => {
    if (!connectedPaths?.length) return new Map<string, SegInfo>();
    const all: { id: string; nodeIds: readonly string[] }[] = [];
    for (const g of connectedPaths) {
      for (const [roomId, path] of g.paths) {
        all.push({ id: `${g.circuitIndex}-${roomId}`, nodeIds: path.nodeIds });
      }
    }
    return buildSegSharing(all);
  }, [connectedPaths]);

  const svgW = floorPlan.width * CELL_SIZE + WALL_PADDING * 2;
  const svgH = floorPlan.height * CELL_SIZE + WALL_PADDING * 2;
  const [panelPx, panelPy] = gridToPixel(floorPlan.panel.x, floorPlan.panel.y);

  return (
    <svg
      className="floor-plan-view"
      viewBox={`0 0 ${svgW} ${svgH}`}
      width="100%"
      style={{ maxWidth: svgW }}
    >
      {/* ── SVG Defs ─────────────────────────────────── */}
      <defs>
        <filter id="fp-panel-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feFlood floodColor="#f59e0b" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="fp-room-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feFlood floodColor="#f59e0b" floodOpacity="0.5" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="fp-room-invalid" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feFlood floodColor="#ef4444" floodOpacity="0.4" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Powered room warm glow */}
        <filter id="fp-room-powered" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feFlood floodColor="#fbbf24" floodOpacity="0.3" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── External Walls ───────────────────────────── */}
      <rect
        x={WALL_PADDING - WALL_THICKNESS / 2}
        y={WALL_PADDING - WALL_THICKNESS / 2}
        width={floorPlan.width * CELL_SIZE + WALL_THICKNESS}
        height={floorPlan.height * CELL_SIZE + WALL_THICKNESS}
        rx={2}
        fill="none"
        stroke="#1e293b"
        strokeWidth={WALL_THICKNESS}
      />

      {/* ── Rooms ────────────────────────────────────── */}
      {floorPlan.rooms.map(room => {
        const asgn = circuitAssignments?.get(room.id);
        const r = roomPixelRect(room);
        const cx = r.x + r.w / 2;
        const cy = r.y + r.h / 2;
        const assigned = !!asgn;
        const isHighlighted = highlightedRoomId === room.id && dragActive;
        const highlightValid = isHighlighted && assigned;
        const highlightInvalid = isHighlighted && !assigned;
        const roomSimState = getRoomSimState(room.id, roomCircuitMap, simulationState);
        const roomProblems = problemRooms?.get(room.id);

        // Determine stroke and fill based on highlight state + simulation state
        let roomFill = assigned ? `${asgn.color}15` : '#1a1f2e';
        let roomStroke = assigned ? asgn.color : '#374151';
        let roomStrokeWidth = assigned ? 2 : 1;
        let roomFilter: string | undefined;
        let roomOpacity = 1;
        let roomClassName = 'floor-plan-room';

        if (highlightValid) {
          roomFill = `${asgn!.color}30`;
          roomStrokeWidth = 3;
          roomFilter = 'url(#fp-room-glow)';
        } else if (highlightInvalid) {
          roomStroke = '#ef4444';
          roomStrokeWidth = 2;
          roomFilter = 'url(#fp-room-invalid)';
        } else if (roomSimState === 'powered') {
          roomFill = assigned ? `${asgn.color}25` : '#1a1f2e';
          roomFilter = 'url(#fp-room-powered)';
        } else if (roomSimState === 'warning') {
          roomClassName = 'floor-plan-room fp-room-warning';
        } else if (roomSimState === 'tripped') {
          roomOpacity = 0.3;
        } else if (roomSimState === 'burned') {
          roomClassName = 'floor-plan-room fp-room-burned';
        }

        return (
          <g
            key={room.id}
            data-room-id={room.id}
            className={roomClassName}
            onClick={() => onRoomClick?.(room.id)}
            onPointerEnter={dragActive ? () => onRoomHover?.(room.id) : undefined}
            onPointerLeave={dragActive ? () => onRoomHover?.(null) : undefined}
            style={{ cursor: dragActive && assigned ? 'pointer' : undefined, opacity: roomOpacity, transition: 'opacity 0.3s ease' }}
          >
            {/* Room background */}
            <rect
              x={r.x} y={r.y} width={r.w} height={r.h} rx={4}
              fill={roomFill}
              stroke={roomStroke}
              strokeWidth={roomStrokeWidth}
              strokeDasharray={assigned || isHighlighted ? undefined : '4 2'}
              filter={roomFilter}
            />
            {/* Wet area blue tint overlay */}
            {room.wetArea && (
              <rect
                x={r.x} y={r.y} width={r.w} height={r.h} rx={4}
                fill="rgba(59,130,246,0.08)"
                pointerEvents="none"
              />
            )}
            {/* Room name */}
            <text
              x={cx} y={room.wetArea ? cy - 7 : cy}
              textAnchor="middle" dominantBaseline="middle"
              className="fp-room-label"
            >
              {tRoomName(t, room.label)}
            </text>
            {/* Wet area indicator */}
            {room.wetArea && (
              <text
                x={cx} y={cy + 10}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={14} pointerEvents="none"
              >
                💧
              </text>
            )}
            {/* Outlet markers */}
            {room.outlets
              .filter(o => o.type === 'power')
              .map((outlet, oi) => {
                const [ox, oy] = outletPixel(room, outlet);
                return (
                  <circle
                    key={oi}
                    cx={ox} cy={oy} r={4}
                    fill={assigned ? asgn.color : '#4a5568'}
                    stroke="#0f1318" strokeWidth={1}
                    className="fp-outlet"
                  />
                );
              })}
            {/* Problem badge (old house) */}
            {roomProblems && roomProblems.length > 0 && (
              <text
                x={r.x + r.w - 8} y={r.y + 14}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={14}
                className="fp-problem-badge"
              >
                <title>{roomProblems.map(p => t(`oldHouse.problemType.${p}`, p)).join(', ')}</title>
                ⚠️
              </text>
            )}
            {/* Appliance count badge */}
            {applianceCounts && (applianceCounts.get(room.id) ?? 0) > 0 && (
              <g pointerEvents="none">
                <rect
                  x={r.x + r.w - 30} y={r.y + r.h - 18}
                  width={26} height={14} rx={3}
                  fill={assigned ? `${asgn.color}40` : 'rgba(255,255,255,0.08)'}
                  stroke={assigned ? asgn.color : '#4a5568'}
                  strokeWidth={0.5}
                />
                <text
                  x={r.x + r.w - 17} y={r.y + r.h - 11}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={9}
                  fontFamily="var(--font-mono)"
                  fontWeight={600}
                  fill={assigned ? asgn.color : '#8a96a6'}
                >
                  {applianceCounts.get(room.id)}⚡
                </text>
                {applianceDetails?.get(room.id) && (
                  <title>{applianceDetails.get(room.id)!.join('\n')}</title>
                )}
              </g>
            )}
          </g>
        );
      })}

      {/* ── Candidate Paths (dashed) ─────────────────── */}
      {candidatePaths?.map((cand, ci) => (
        <g key={`cand-${ci}`} className="fp-candidate-paths">
          {Array.from(cand.paths.entries()).map(([roomId, path]) => {
            const pts = resolvePoints(path.nodeIds, nodeMap);
            if (pts.length < 2) return null;
            const mid = longestSegMid(pts);
            return (
              <g key={roomId}>
                <polyline
                  points={toPolylineStr(pts)}
                  fill="none" stroke="#8a96a6" strokeWidth={2}
                  strokeDasharray="6 4" opacity={0.4}
                />
                {mid && (
                  <>
                    <rect
                      x={mid[0] - 18} y={mid[1] - 8}
                      width={36} height={16} rx={3}
                      fill="rgba(0,0,0,0.75)"
                    />
                    <text
                      x={mid[0]} y={mid[1]}
                      textAnchor="middle" dominantBaseline="middle"
                      className="fp-distance-label"
                    >
                      {path.distance}m
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </g>
      ))}

      {/* ── Connected Paths (solid with glow + simulation state) ── */}
      {connectedPaths?.map(group => {
        // Find CircuitId for this path group via the first room in its paths
        const firstRoomId = group.paths.keys().next().value;
        const cid = firstRoomId && roomCircuitMap ? roomCircuitMap[firstRoomId] : undefined;
        const cs = cid && simulationState?.isPowered ? simulationState.circuitStates[cid] : undefined;
        const isMainTripped = simulationState?.mainTripped ?? false;
        const effectiveStatus: SimulationStatus = isMainTripped ? 'main-tripped' : (cs?.status ?? 'normal');
        const wireHeat = cs?.wireHeat ?? 0;
        const pathStyle = simulationState?.isPowered
          ? heatToPathColor(group.wireColor, wireHeat, effectiveStatus)
          : { stroke: group.wireColor, opacity: 0.8 };
        const isFlowing = simulationState?.isPowered && !isMainTripped &&
          effectiveStatus !== 'tripped' && effectiveStatus !== 'burned' &&
          effectiveStatus !== 'elcb-tripped' && effectiveStatus !== 'leakage';

        return (
          <g key={`conn-${group.circuitIndex}`} className="fp-connected-paths">
            {Array.from(group.paths.entries()).map(([roomId, path]) => {
              const pts = resolvePoints(path.nodeIds, nodeMap);
              if (pts.length < 2) return null;
              const pid = `${group.circuitIndex}-${roomId}`;
              const d = buildOffsetPath(pts, path.nodeIds, pid, segSharing);
              return (
                <g key={roomId}>
                  {/* Glow underlay */}
                  <path
                    d={d} fill="none" stroke={pathStyle.stroke}
                    strokeWidth={6} opacity={pathStyle.opacity * 0.2} strokeLinecap="round"
                    style={{ transition: 'stroke 0.3s ease, opacity 0.3s ease' }}
                  />
                  {/* Main wire path */}
                  <path
                    d={d} fill="none" stroke={pathStyle.stroke}
                    strokeWidth={2.5} opacity={pathStyle.opacity} strokeLinecap="round"
                    style={{ transition: 'stroke 0.3s ease, opacity 0.3s ease' }}
                  />
                  {/* Current flow animation overlay */}
                  {isFlowing && (
                    <path
                      d={d} fill="none"
                      stroke="rgba(200,230,255,0.6)"
                      strokeWidth={2} strokeLinecap="round"
                      strokeDasharray="6 20"
                      className="fp-current-flow"
                    />
                  )}
                </g>
              );
            })}
          </g>
        );
      })}

      {/* ── Panel Icon (配電箱) ──────────────────────── */}
      <g
        className="fp-panel-icon"
        onClick={onPanelClick}
        onPointerEnter={() => setPanelHover(true)}
        onPointerLeave={() => setPanelHover(false)}
        filter={panelHover ? 'url(#fp-panel-glow)' : undefined}
      >
        <rect
          x={panelPx - PANEL_HALF} y={panelPy - PANEL_HALF}
          width={PANEL_HALF * 2} height={PANEL_HALF * 2}
          rx={3}
          fill="#1e293b" stroke="#f59e0b" strokeWidth={1.5}
        />
        <text
          x={panelPx} y={panelPy}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={14}
        >
          ⚡
        </text>
      </g>
    </svg>
  );
}
