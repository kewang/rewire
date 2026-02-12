import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Wire, Appliance, Breaker, Circuit, Level, MultiCircuitState, WiringState, CircuitId, CircuitConfig, CircuitState, CrimpResult, CableTieQuality, PlannerCircuit, ApplianceAssignment, OldHouseSnapshot, SimulationStatus, OldHouseProblemType } from '../types/game';
import { DEFAULT_WIRES, DEFAULT_WIRE_LENGTH, ELCB_COST, LEAKAGE_CHANCE_PER_SECOND, CRIMP_QUALITY_MAP, OXIDIZED_CONTACT_RESISTANCE, BREAKER_20A, NFB_COSTS } from '../data/constants';
import { LEVELS } from '../data/levels';
import { isFixedCircuitLevel, isFreeCircuitLevel, isProblemResolved } from '../types/helpers';
import type { ProblemResolutionState } from '../types/helpers';
import { createInitialMultiState, stepMulti } from '../engine/simulation';
import { calcStars, saveBestStars } from '../engine/scoring';
import { saveRandomCompletion } from '../engine/randomOldHouse';
import type { StarDetail } from '../engine/scoring';
import { playPowerOn, playTripped, playBurned, playWin, startBuzzing, updateBuzzingVolume, stopBuzzing, startApplianceSounds, stopApplianceSounds } from '../engine/audio';
import WireSelector from './WireSelector';
import AppliancePanel from './AppliancePanel';
import StatusDisplay from './StatusDisplay';
import ResultPanel from './ResultPanel';
import LevelSelect from './LevelSelect';
import CircuitDiagram from './CircuitDiagram';
import CrimpMiniGame from './CrimpMiniGame';
import PanelInteriorView from './PanelInteriorView';
import FloorPlanPreview from './FloorPlanPreview';
import FloorPlanView from './FloorPlanView';
import type { CircuitAssignment, ConnectedPathGroup } from './FloorPlanView';
import RoutingStrategyPicker from './RoutingStrategyPicker';
import CircuitPlanner from './CircuitPlanner';
import CircuitPlannerSidebar from './CircuitPlannerSidebar';
import WireToolbar from './WireToolbar';
import CircuitAssignmentPopover from './CircuitAssignmentPopover';
import { LANE_WIDTH, PANEL_PADDING, ROUTING_TOP, ROUTING_HEIGHT, wireStartX } from './panelLayout';
import { detectCrossings, getCrossingPairIndices, countUnbundledPairs, calcAestheticsScore } from '../engine/aesthetics';
import { calcRouteCandidates } from '../engine/routing';
import type { RoutePath, RouteCandidate } from '../engine/routing';
import { tLevelName, tLevelDesc, tRoomName, tApplianceName } from '../i18nHelpers';

type GameResult = 'none' | 'tripped' | 'burned' | 'neutral-burned' | 'leakage' | 'main-tripped' | 'won' | 'over-budget';

function createInitialWiring(circuitIds: CircuitId[]): WiringState {
  const circuits: WiringState['circuits'] = {};
  for (const id of circuitIds) {
    circuits[id] = { isWired: false, connectedWire: null };
  }
  return {
    isDragging: false,
    dragWire: null,
    cursorPos: null,
    isWired: false,
    connectedWire: null,
    circuits,
    targetCircuitId: null,
  };
}

function createInitialCircuitWires(circuitIds: CircuitId[]): Record<CircuitId, Wire> {
  const result: Record<CircuitId, Wire> = {};
  for (const id of circuitIds) {
    result[id] = DEFAULT_WIRES[0];
  }
  return result;
}


type GamePhase = 'planning' | 'active';

export default function GameBoard() {
  const { t } = useTranslation();
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('active');
  const [resolvedConfigs, setResolvedConfigs] = useState<CircuitConfig[]>([]);
  const [plannerCircuits, setPlannerCircuits] = useState<PlannerCircuit[]>([]);
  const [plannerNextId, setPlannerNextId] = useState(1);
  const [circuitWires, setCircuitWires] = useState<Record<CircuitId, Wire>>({});
  const [circuitAppliances, setCircuitAppliances] = useState<Record<CircuitId, Appliance[]>>({});
  const [multiState, setMultiState] = useState<MultiCircuitState>(createInitialMultiState([]));
  const [isPowered, setIsPowered] = useState(false);
  const [result, setResult] = useState<GameResult>('none');
  const [wiring, setWiring] = useState<WiringState>(createInitialWiring([]));
  const [circuitElcb, setCircuitElcb] = useState<Record<CircuitId, boolean>>({});
  const [circuitPhases, setCircuitPhases] = useState<Record<CircuitId, 'R' | 'T'>>({});
  const [circuitCrimps, setCircuitCrimps] = useState<Record<CircuitId, CrimpResult>>({});
  const [pendingCrimpCircuitId, setPendingCrimpCircuitId] = useState<CircuitId | null>(null);
  const [pendingCrimpWire, setPendingCrimpWire] = useState<Wire | null>(null);
  const [starResult, setStarResult] = useState<{ stars: number; details: StarDetail[] } | null>(null);
  const [preWiredCircuitIds, setPreWiredCircuitIds] = useState<Set<CircuitId>>(new Set());
  const preWiredCircuitIdsRef = useRef<Set<CircuitId>>(new Set());
  const [circuitLanes, setCircuitLanes] = useState<CircuitId[]>([]);
  const [cableTies, setCableTies] = useState<Map<number, CableTieQuality>>(new Map());
  const [routingCompleted, setRoutingCompleted] = useState(false);
  const [showRoutingOverlay, setShowRoutingOverlay] = useState(false);
  const [finalAestheticsScore, setFinalAestheticsScore] = useState<number | undefined>(undefined);
  const aestheticsScoreRef = useRef<number | undefined>(undefined);
  const [selectedPlannerCircuitId, setSelectedPlannerCircuitId] = useState<string | null>(null);
  const [circuitBreakers, setCircuitBreakers] = useState<Record<CircuitId, Breaker>>({});
  const [oldHouseSnapshot, setOldHouseSnapshot] = useState<OldHouseSnapshot | null>(null);

  // Floor plan sidebar + popover state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [roomPopover, setRoomPopover] = useState<{ roomId: string; roomName: string; pos: { x: number; y: number }; currentCircuitId: string | null } | null>(null);

  // Floor plan wiring interaction state
  const [/* circuitRoutingStrategies */, setCircuitRoutingStrategies] = useState<Record<CircuitId, 'direct' | 'star' | 'daisy-chain'>>({});
  const [circuitRouteDistances, setCircuitRouteDistances] = useState<Record<CircuitId, number>>({});
  const [circuitRoutePaths, setCircuitRoutePaths] = useState<Record<CircuitId, RoutePath[]>>({});
  const [pendingRoutingCircuit, setPendingRoutingCircuit] = useState<{ circuitId: CircuitId; wire: Wire } | null>(null);
  const [candidateRoutes, setCandidateRoutes] = useState<readonly RouteCandidate[]>([]);
  const [floorPlanHighlightedRoom, setFloorPlanHighlightedRoom] = useState<string | null>(null);
  const floorPlanHighlightedRoomRef = useRef<string | null>(null);

  const rafRef = useRef<number>(0);
  const hasWarningRef = useRef(false);
  const hasTripRef = useRef(false);
  const prevTimeRef = useRef<number>(0);
  const multiStateRef = useRef<MultiCircuitState>(multiState);
  const buzzingRef = useRef(false);
  const tickRef = useRef<FrameRequestCallback>(() => {});

  useEffect(() => {
    multiStateRef.current = multiState;
  }, [multiState]);

  useEffect(() => {
    preWiredCircuitIdsRef.current = preWiredCircuitIds;
  }, [preWiredCircuitIds]);

  // Derive circuitIds from resolved configs (set by handleSelectLevel or confirmPlanning)
  const circuitConfigs = resolvedConfigs;
  const circuitIds = useMemo(() => circuitConfigs.map(c => c.id), [circuitConfigs]);

  // Build Circuit[] from circuitConfigs + circuitWires + circuitAppliances + circuitCrimps + circuitBreakers
  const circuits: Circuit[] = useMemo(() =>
    circuitConfigs.map(config => ({
      id: config.id,
      label: tRoomName(t, config.label),
      voltage: config.voltage,
      breaker: circuitBreakers[config.id] ?? config.breaker,
      wire: circuitWires[config.id] ?? DEFAULT_WIRES[0],
      appliances: circuitAppliances[config.id] ?? [],
      contactResistance: circuitCrimps[config.id]?.contactResistance,
    })),
    [circuitConfigs, circuitWires, circuitAppliances, circuitCrimps, circuitBreakers, t]
  );

  const circuitsRef = useRef<Circuit[]>(circuits);
  useEffect(() => { circuitsRef.current = circuits; }, [circuits]);

  const currentLevelRef = useRef(currentLevel);
  useEffect(() => { currentLevelRef.current = currentLevel; }, [currentLevel]);

  const resolvedConfigsRef = useRef(resolvedConfigs);
  useEffect(() => { resolvedConfigsRef.current = resolvedConfigs; }, [resolvedConfigs]);

  const tRef = useRef(t);
  useEffect(() => { tRef.current = t; }, [t]);

  const circuitWiresRef = useRef(circuitWires);
  useEffect(() => { circuitWiresRef.current = circuitWires; }, [circuitWires]);

  const circuitRouteDistancesRef = useRef(circuitRouteDistances);
  useEffect(() => { circuitRouteDistancesRef.current = circuitRouteDistances; }, [circuitRouteDistances]);

  const circuitElcbRef = useRef(circuitElcb);
  useEffect(() => { circuitElcbRef.current = circuitElcb; }, [circuitElcb]);

  const circuitPhasesRef = useRef(circuitPhases);
  useEffect(() => { circuitPhasesRef.current = circuitPhases; }, [circuitPhases]);

  const circuitCrimpsRef = useRef(circuitCrimps);
  useEffect(() => { circuitCrimpsRef.current = circuitCrimps; }, [circuitCrimps]);

  // Is this a free circuit level?
  const isFreeLevel = currentLevel != null && isFreeCircuitLevel(currentLevel);

  // Floor plan: detect if current level has a floorPlan
  const currentFloorPlan = currentLevel?.floorPlan ?? null;

  // Floor plan: room→circuit mapping from plannerCircuits (free levels) or circuitConfigs (fixed levels)
  const roomToCircuitMap = useMemo(() => {
    const map = new Map<string, CircuitId>();
    if (!currentFloorPlan) return map;
    if (isFreeLevel && plannerCircuits.length > 0) {
      plannerCircuits.forEach((pc, idx) => {
        const cid = `c${idx + 1}` as CircuitId;
        for (const a of pc.assignedAppliances) {
          if (!map.has(a.roomId)) map.set(a.roomId, cid);
        }
      });
    } else if (currentLevel && isFixedCircuitLevel(currentLevel)) {
      for (const config of currentLevel.circuitConfigs) {
        const room = currentFloorPlan.rooms.find(r => r.id === config.label || r.label === config.label);
        if (room) map.set(room.id, config.id);
      }
    }
    return map;
  }, [currentFloorPlan, currentLevel, isFreeLevel, plannerCircuits]);

  // Floor plan: circuitAssignments map for FloorPlanView
  const floorPlanCircuitAssignments = useMemo(() => {
    const map = new Map<string, CircuitAssignment>();
    if (!currentFloorPlan) return map;
    const CIRCUIT_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];
    const circuitIdToIndex = new Map<CircuitId, number>();
    circuitIds.forEach((id, idx) => { circuitIdToIndex.set(id, idx); });
    for (const [roomId, cid] of roomToCircuitMap) {
      const idx = circuitIdToIndex.get(cid) ?? 0;
      map.set(roomId, { circuitIndex: idx, color: CIRCUIT_COLORS[idx % CIRCUIT_COLORS.length] });
    }
    return map;
  }, [currentFloorPlan, roomToCircuitMap, circuitIds]);

  // Floor plan: connectedPaths derived from circuitWires + circuitRoutePaths
  const floorPlanConnectedPaths = useMemo((): readonly ConnectedPathGroup[] => {
    if (!currentFloorPlan) return [];
    const CIRCUIT_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];
    const WIRE_COLORS: Record<number, string> = { 1.6: '#60a5fa', 2.0: '#86efac', 3.5: '#fde047', 5.5: '#fb923c', 8: '#f87171', 14: '#c084fc' };
    const groups: ConnectedPathGroup[] = [];
    for (const [idx, cid] of circuitIds.entries()) {
      if (!wiring.circuits[cid]?.isWired) continue;
      const paths = circuitRoutePaths[cid];
      if (!paths || paths.length === 0) continue;
      const wire = circuitWires[cid];
      const wireColor = wire ? (WIRE_COLORS[wire.crossSection] ?? CIRCUIT_COLORS[idx % CIRCUIT_COLORS.length]) : CIRCUIT_COLORS[idx % CIRCUIT_COLORS.length];
      const pathMap = new Map<string, RoutePath>();
      const rooms: string[] = [];
      for (const [roomId, circuitId] of roomToCircuitMap) {
        if (circuitId === cid) rooms.push(roomId);
      }
      rooms.forEach((roomId, i) => {
        if (i < paths.length) pathMap.set(roomId, paths[i]);
      });
      if (pathMap.size > 0) {
        groups.push({ circuitIndex: idx, wireColor, paths: pathMap });
      }
    }
    return groups;
  }, [currentFloorPlan, circuitIds, wiring.circuits, circuitRoutePaths, circuitWires, roomToCircuitMap]);

  // Floor plan: candidate paths for RoutingStrategyPicker display
  const floorPlanCandidatePaths = useMemo((): readonly RouteCandidate[] => {
    if (!pendingRoutingCircuit) return [];
    return candidateRoutes;
  }, [pendingRoutingCircuit, candidateRoutes]);

  // Floor plan: simulation state for visual feedback
  const floorPlanSimulationState = useMemo(() => {
    if (!currentFloorPlan) return undefined;
    const circuitStates: Record<CircuitId, { status: SimulationStatus; wireHeat: number; totalCurrent: number }> = {};
    for (const id of circuitIds) {
      const cs = multiState.circuitStates[id];
      if (cs) {
        circuitStates[id] = { status: cs.status, wireHeat: cs.wireHeat, totalCurrent: cs.totalCurrent };
      }
    }
    return {
      isPowered,
      circuitStates,
      mainTripped: multiState.overallStatus === 'main-tripped',
    };
  }, [currentFloorPlan, isPowered, multiState, circuitIds]);

  // Unified problem resolution: derive unresolved problem circuits from state
  const problemCircuits = useMemo(() => {
    if (!currentLevel || !isFixedCircuitLevel(currentLevel) || !currentLevel.oldHouse) return new Set<CircuitId>();
    const oh = currentLevel.oldHouse;
    if (oh.problems.length === 0) return new Set<CircuitId>();

    const remaining = new Set<CircuitId>();
    for (const problem of oh.problems) {
      const cid = problem.circuitId;
      const wire = circuitWires[cid] ?? DEFAULT_WIRES[0];
      const resState: ProblemResolutionState = {
        isPreWired: preWiredCircuitIds.has(cid),
        isWired: wiring.circuits[cid]?.isWired ?? false,
        crimpResult: circuitCrimps[cid],
        breaker: circuitBreakers[cid] ?? currentLevel.circuitConfigs.find(c => c.id === cid)?.breaker ?? BREAKER_20A,
        wire,
        elcbEnabled: !!circuitElcb[cid],
        requiresCrimp: currentLevel.requiresCrimp === true,
      };
      if (!isProblemResolved(problem, resState)) {
        remaining.add(cid);
      }
    }
    return remaining;
  }, [currentLevel, circuitWires, circuitBreakers, circuitElcb, circuitCrimps, wiring.circuits, preWiredCircuitIds]);

  // Floor plan: problem rooms (old house mode)
  const floorPlanProblemRooms = useMemo(() => {
    if (!currentFloorPlan || problemCircuits.size === 0) return undefined;
    const map = new Map<string, OldHouseProblemType[]>();
    const problems = currentLevel != null && isFixedCircuitLevel(currentLevel) ? currentLevel.oldHouse?.problems : undefined;
    if (!problems) return undefined;
    for (const [roomId, cid] of roomToCircuitMap) {
      if (!problemCircuits.has(cid)) continue;
      const roomProbs = problems.filter(p => p.circuitId === cid).map(p => p.type);
      if (roomProbs.length > 0) map.set(roomId, roomProbs);
    }
    return map.size > 0 ? map : undefined;
  }, [currentFloorPlan, problemCircuits, currentLevel, roomToCircuitMap]);

  // Floor plan: room→circuit map as Record for FloorPlanView prop
  const floorPlanRoomCircuitMap = useMemo(() => {
    if (!currentFloorPlan || roomToCircuitMap.size === 0) return undefined;
    const rec: Record<string, CircuitId> = {};
    for (const [roomId, cid] of roomToCircuitMap) rec[roomId] = cid;
    return rec;
  }, [currentFloorPlan, roomToCircuitMap]);

  // Floor plan: appliance counts per room (for badge display)
  const floorPlanApplianceCounts = useMemo(() => {
    if (!currentFloorPlan) return undefined;
    const map = new Map<string, number>();
    if (currentLevel && isFreeCircuitLevel(currentLevel)) {
      for (const room of currentLevel.rooms) {
        if (room.appliances.length > 0) map.set(room.id, room.appliances.length);
      }
    } else if (currentLevel && isFixedCircuitLevel(currentLevel) && currentFloorPlan) {
      for (const config of currentLevel.circuitConfigs) {
        const room = currentFloorPlan.rooms.find(r => r.id === config.label || r.label === config.label);
        if (room) map.set(room.id, config.availableAppliances.length);
      }
    }
    return map.size > 0 ? map : undefined;
  }, [currentFloorPlan, currentLevel]);

  // Floor plan: appliance details per room (for tooltip)
  const floorPlanApplianceDetails = useMemo(() => {
    if (!currentFloorPlan) return undefined;
    const map = new Map<string, string[]>();
    if (currentLevel && isFreeCircuitLevel(currentLevel)) {
      for (const room of currentLevel.rooms) {
        if (room.appliances.length > 0) {
          map.set(room.id, room.appliances.map(a => `${tApplianceName(t, a.name)} ${a.power}W`));
        }
      }
    } else if (currentLevel && isFixedCircuitLevel(currentLevel) && currentFloorPlan) {
      for (const config of currentLevel.circuitConfigs) {
        const room = currentFloorPlan.rooms.find(r => r.id === config.label || r.label === config.label);
        if (room) {
          map.set(room.id, config.availableAppliances.map(a => `${tApplianceName(t, a.name)} ${a.power}W`));
        }
      }
    }
    return map.size > 0 ? map : undefined;
  }, [currentFloorPlan, currentLevel, t]);

  // Translated level name/description
  const currentLevelIndex = currentLevel ? LEVELS.indexOf(currentLevel) : -1;
  const isRandomLevel = currentLevel && isFixedCircuitLevel(currentLevel) && currentLevel.randomDifficulty != null;
  const DIFFICULTY_NAMES: Record<number, string> = { 1: t('random.beginner'), 2: t('random.intermediate'), 3: t('random.advanced') };
  const translatedLevelName = currentLevel
    ? (isRandomLevel && isFixedCircuitLevel(currentLevel)
      ? t('random.levelName', { difficulty: DIFFICULTY_NAMES[currentLevel.randomDifficulty!] })
      : currentLevelIndex >= 0 ? tLevelName(t, currentLevelIndex) : currentLevel.name)
    : '';
  const translatedLevelDesc = currentLevel
    ? (currentLevelIndex >= 0 ? tLevelDesc(t, currentLevelIndex) : currentLevel.description)
    : '';

  // Total cost: sum of all circuits' wire costs + ELCB costs + NFB costs (free levels only)
  const totalCost = useMemo(() => {
    return circuitIds.reduce((sum, id) => {
      const elcbCost = circuitElcb[id] ? ELCB_COST : 0;
      if (preWiredCircuitIds.has(id)) return sum + elcbCost;
      const wire = circuitWires[id] ?? DEFAULT_WIRES[0];
      // Use route distance if available (floor plan mode), fallback to DEFAULT_WIRE_LENGTH
      const wireLength = circuitRouteDistances[id] ?? DEFAULT_WIRE_LENGTH;
      const wireCost = wire.costPerMeter * wireLength;
      const config = circuitConfigs.find(c => c.id === id);
      const nfbCost = isFreeLevel && config ? (NFB_COSTS[config.breaker.ratedCurrent] ?? 0) : 0;
      return sum + wireCost + elcbCost + nfbCost;
    }, 0);
  }, [circuitIds, circuitWires, circuitElcb, preWiredCircuitIds, circuitConfigs, isFreeLevel, circuitRouteDistances]);

  // All appliances across all circuits (for sound)
  const allAppliances = useMemo(() => {
    return circuitIds.flatMap(id => circuitAppliances[id] ?? []);
  }, [circuitIds, circuitAppliances]);

  // Has at least one appliance across all circuits
  const hasAnyAppliance = allAppliances.length > 0;

  // All circuits are wired
  const allWired = circuitIds.length > 0 && circuitIds.every(id => wiring.circuits[id]?.isWired);

  // wetArea ELCB check: all wetArea circuits must have ELCB installed
  const wetAreaMissingElcb = circuitConfigs.some(c => c.wetArea && !circuitElcb[c.id]);

  // Crimp check: requiresCrimp levels need all circuits crimped
  const crimpMissing = currentLevel?.requiresCrimp === true && !circuitIds.every(id => circuitCrimps[id]);
  const problemsRemaining = problemCircuits.size > 0;
  const routingMissing = currentLevel?.requiresRouting === true && !routingCompleted;
  const canPowerOn = hasAnyAppliance && allWired && !wetAreaMissingElcb && !crimpMissing && !problemsRemaining && !routingMissing;

  // Routing readiness: all wired + crimped (if requiresCrimp) + all problems fixed → show routing button
  const routingReady = currentLevel?.requiresRouting === true && allWired && !crimpMissing && !problemsRemaining;

  // Aesthetics score computation for routing overlay
  const configIndex = useMemo(() => {
    const map: Record<CircuitId, number> = {};
    circuitConfigs.forEach((c, i) => { map[c.id] = i; });
    return map;
  }, [circuitConfigs]);

  const routingTotalWidth = PANEL_PADDING * 2 + circuitConfigs.length * LANE_WIDTH;
  const routingBusbarLeft = PANEL_PADDING + 8;
  const routingBusbarRight = routingTotalWidth - PANEL_PADDING - 8;

  const startXMap = useMemo(() => {
    const map: Record<CircuitId, number> = {};
    circuitConfigs.forEach(c => {
      map[c.id] = wireStartX(c, circuitPhases[c.id], routingBusbarLeft, routingBusbarRight);
    });
    return map;
  }, [circuitConfigs, circuitPhases, routingBusbarLeft, routingBusbarRight]);

  const currentAestheticsScore = useMemo(() => {
    if (!currentLevel?.requiresRouting || circuitLanes.length === 0) return 100;
    const crossingPairs = detectCrossings(circuitLanes, configIndex, startXMap, PANEL_PADDING, LANE_WIDTH, ROUTING_TOP, ROUTING_HEIGHT);
    const crossingPairIndices = getCrossingPairIndices(circuitLanes, configIndex, startXMap, PANEL_PADDING, LANE_WIDTH);
    const unbundled = countUnbundledPairs(circuitLanes, cableTies, crossingPairIndices);
    return calcAestheticsScore(crossingPairs.length, unbundled, cableTies);
  }, [currentLevel?.requiresRouting, circuitLanes, configIndex, startXMap, cableTies]);

  // Track which scripted leakage events have fired
  const firedLeakageEventsRef = useRef<Set<number>>(new Set());
  // Resolved leakage events (for free circuit levels with dynamic circuitId mapping)
  const resolvedLeakageEventsRef = useRef<readonly { time: number; circuitId: CircuitId }[] | null>(null);

  // rAF simulation loop
  const tick = useCallback((timestamp: number) => {
    if (prevTimeRef.current === 0) {
      prevTimeRef.current = timestamp;
    }
    const dt = Math.min((timestamp - prevTimeRef.current) / 1000, 0.1);
    prevTimeRef.current = timestamp;

    const phases = Object.keys(circuitPhasesRef.current).length > 0 ? circuitPhasesRef.current : undefined;
    const curLevelForBreaker = currentLevelRef.current;
    const mainBreakerRating = curLevelForBreaker && isFreeCircuitLevel(curLevelForBreaker) ? curLevelForBreaker.panel.mainBreakerRating : undefined;
    let newMultiState = stepMulti(circuitsRef.current, multiStateRef.current, dt, phases, mainBreakerRating);

    // Leakage event processing
    const curLevel = currentLevelRef.current;
    if (curLevel?.leakageMode) {
      const elcbs = circuitElcbRef.current;
      const wetAreaConfigs = resolvedConfigsRef.current.filter(c => c.wetArea);
      const updatedStates: Record<CircuitId, CircuitState> = { ...newMultiState.circuitStates };

      const effectiveLeakageEvents = resolvedLeakageEventsRef.current ?? curLevel.leakageEvents;
      if (curLevel.leakageMode === 'scripted' && effectiveLeakageEvents) {
        for (let i = 0; i < effectiveLeakageEvents.length; i++) {
          const evt = effectiveLeakageEvents[i];
          if (firedLeakageEventsRef.current.has(i)) continue;
          if (newMultiState.elapsed >= evt.time) {
            firedLeakageEventsRef.current.add(i);
            const cs = updatedStates[evt.circuitId];
            if (cs && (cs.status === 'normal' || cs.status === 'warning')) {
              if (elcbs[evt.circuitId]) {
                updatedStates[evt.circuitId] = { ...cs, status: 'elcb-tripped', totalCurrent: 0 };
              } else {
                updatedStates[evt.circuitId] = { ...cs, status: 'leakage' };
              }
            }
          }
        }
      } else if (curLevel.leakageMode === 'random') {
        for (const config of wetAreaConfigs) {
          const cs = updatedStates[config.id];
          if (!cs || (cs.status !== 'normal' && cs.status !== 'warning')) continue;
          if (Math.random() < LEAKAGE_CHANCE_PER_SECOND * dt) {
            if (elcbs[config.id]) {
              updatedStates[config.id] = { ...cs, status: 'elcb-tripped', totalCurrent: 0 };
            } else {
              updatedStates[config.id] = { ...cs, status: 'leakage' };
            }
          }
        }
      }

      // Check if states actually changed
      let statesChanged = false;
      for (const id of Object.keys(updatedStates)) {
        if (updatedStates[id] !== newMultiState.circuitStates[id]) {
          statesChanged = true;
          break;
        }
      }
      if (statesChanged) {
        // Recalculate overallStatus manually
        const severityMap: Record<string, number> = {
          normal: 0, warning: 1, tripped: 2, 'elcb-tripped': 2,
          burned: 3, 'neutral-burned': 3, leakage: 3,
        };
        let worstSt: string = 'normal';
        for (const cs of Object.values(updatedStates)) {
          if ((severityMap[cs.status] ?? 0) > (severityMap[worstSt] ?? 0)) {
            worstSt = cs.status;
          }
        }
        // Also consider neutral-burned from the original
        if (newMultiState.neutralHeat >= 1.0 && (severityMap['neutral-burned'] ?? 0) > (severityMap[worstSt] ?? 0)) {
          worstSt = 'neutral-burned';
        }
        newMultiState = {
          ...newMultiState,
          circuitStates: updatedStates,
          overallStatus: worstSt as MultiCircuitState['overallStatus'],
        };
      }
    }

    setMultiState(newMultiState);

    // Buzzing management: trigger on any warning circuit, volume = max wireHeat
    let maxWarnHeat = 0;
    let hasWarning = false;
    for (const cs of Object.values(newMultiState.circuitStates)) {
      if (cs.status === 'warning') {
        hasWarning = true;
        if (cs.wireHeat > maxWarnHeat) maxWarnHeat = cs.wireHeat;
      }
    }

    if (hasWarning) {
      hasWarningRef.current = true;
      if (!buzzingRef.current) {
        startBuzzing();
        buzzingRef.current = true;
      }
      updateBuzzingVolume(maxWarnHeat);
    } else if (buzzingRef.current) {
      stopBuzzing();
      buzzingRef.current = false;
    }

    // Track trip events for star rating
    for (const cs of Object.values(newMultiState.circuitStates)) {
      if (cs.status === 'tripped' || cs.status === 'elcb-tripped') {
        hasTripRef.current = true;
        break;
      }
    }

    // Terminal state: tripped, burned, neutral-burned, leakage, or main-tripped (use overallStatus)
    if (newMultiState.overallStatus === 'tripped' || newMultiState.overallStatus === 'burned' || newMultiState.overallStatus === 'neutral-burned' || newMultiState.overallStatus === 'leakage' || newMultiState.overallStatus === 'main-tripped') {
      setIsPowered(false);
      stopApplianceSounds();
      setResult(newMultiState.overallStatus);
      if (newMultiState.overallStatus === 'tripped') playTripped();
      else playBurned(); // burned, neutral-burned, leakage share same sound
      return;
    }

    // Win condition check
    const level = currentLevelRef.current;
    if (level && newMultiState.elapsed >= level.survivalTime) {
      setIsPowered(false);
      stopApplianceSounds();
      // Sum wire + NFB + ELCB costs from all circuits at this moment (skip pre-wired)
      const wires = circuitWiresRef.current;
      const elcbs = circuitElcbRef.current;
      const configs = resolvedConfigsRef.current;
      const isFreeLvl = level != null && isFreeCircuitLevel(level);
      const routeDistances = circuitRouteDistancesRef.current;
      const finalCost = Object.entries(wires).reduce(
        (sum, [id, w]) => {
          const elcbCost = elcbs[id] ? ELCB_COST : 0;
          const config = configs.find(c => c.id === id);
          const nfbCost = isFreeLvl && config ? (NFB_COSTS[config.breaker.ratedCurrent] ?? 0) : 0;
          if (preWiredCircuitIdsRef.current.has(id)) return sum + elcbCost;
          const wireLength = routeDistances[id] ?? DEFAULT_WIRE_LENGTH;
          return sum + w.costPerMeter * wireLength + elcbCost + nfbCost;
        }, 0
      );
      const gameResult = finalCost > level.budget ? 'over-budget' : 'won';
      setResult(gameResult);

      // Calculate star rating
      const passed = gameResult === 'won' || gameResult === 'over-budget';
      const sr = calcStars({
        passed,
        finalCost,
        budget: level.budget,
        bonusCondition: level.bonusCondition,
        hadWarning: hasWarningRef.current,
        hadTrip: hasTripRef.current,
        remainingTime: level.survivalTime - newMultiState.elapsed,
        circuitCrimps: circuitCrimpsRef.current,
        requiresCrimp: level.requiresCrimp === true,
        aestheticsScore: aestheticsScoreRef.current,
      }, tRef.current);
      setStarResult(sr);

      // Save best stars to localStorage
      const levelIndex = LEVELS.indexOf(level);
      if (levelIndex >= 0 && sr.stars > 0) {
        saveBestStars(levelIndex, sr.stars);
      }

      // Save random old house completion
      if (gameResult === 'won' && isFixedCircuitLevel(level) && level.randomDifficulty) {
        saveRandomCompletion(level.randomDifficulty);
      }

      if (gameResult === 'won') playWin();
      return;
    }

    rafRef.current = requestAnimationFrame(tickRef.current);
  }, []);

  useEffect(() => { tickRef.current = tick; }, [tick]);

  const handlePowerToggle = useCallback(() => {
    if (isPowered) {
      cancelAnimationFrame(rafRef.current);
      prevTimeRef.current = 0;
      stopBuzzing();
      stopApplianceSounds();
      buzzingRef.current = false;
      setIsPowered(false);
      setMultiState(createInitialMultiState(circuitIds));
      setResult('none');
      setStarResult(null);
    } else {
      if (!canPowerOn) return;
      setMultiState(createInitialMultiState(circuitIds));
      setResult('none');
      setStarResult(null);
      prevTimeRef.current = 0;
      hasWarningRef.current = false;
      hasTripRef.current = false;
      firedLeakageEventsRef.current = new Set();
      setIsPowered(true);
      playPowerOn();
      startApplianceSounds(allAppliances);
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [isPowered, canPowerOn, circuitIds, allAppliances, tick]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleRetry = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    prevTimeRef.current = 0;
    stopBuzzing();
    stopApplianceSounds();
    buzzingRef.current = false;
    hasWarningRef.current = false;
    hasTripRef.current = false;
    firedLeakageEventsRef.current = new Set();
    resolvedLeakageEventsRef.current = null;
    setIsPowered(false);
    setResult('none');
    setStarResult(null);
    setPendingCrimpCircuitId(null);
    setPendingCrimpWire(null);
    setMultiState(createInitialMultiState(circuitIds));
    const initialLanes = currentLevel && isFixedCircuitLevel(currentLevel) ? currentLevel.initialLanes : undefined;
    setCircuitLanes(initialLanes ? [...initialLanes] : circuitIds);
    setCableTies(new Map());
    setRoutingCompleted(false);
    setShowRoutingOverlay(false);
    setFinalAestheticsScore(undefined);
    // Clear floor plan wiring state
    setCircuitRoutingStrategies({});
    setCircuitRouteDistances({});
    setCircuitRoutePaths({});
    setPendingRoutingCircuit(null);
    setCandidateRoutes([]);
    setFloorPlanHighlightedRoom(null);
    floorPlanHighlightedRoomRef.current = null;

    if (currentLevel && isFreeCircuitLevel(currentLevel)) {
      // Free circuit level: reset to planning phase
      setGamePhase('planning');
      setResolvedConfigs([]);
      setPlannerCircuits([]);
      setPlannerNextId(1);
      setCircuitWires({});
      setCircuitAppliances({});
      setCircuitCrimps({});
      setWiring(createInitialWiring([]));
      setCircuitPhases({});
      setMultiState(createInitialMultiState([]));
      setPreWiredCircuitIds(new Set());
      preWiredCircuitIdsRef.current = new Set();
      setOldHouseSnapshot(null);
    } else if (currentLevel && isFixedCircuitLevel(currentLevel) && currentLevel.oldHouse) {
      // Re-initialize old house pre-wired state
      const oh = currentLevel.oldHouse;
      const ids = currentLevel.circuitConfigs.map(c => c.id);
      const preWires: Record<CircuitId, Wire> = {};
      for (const [id, pw] of Object.entries(oh.preWiredCircuits)) {
        preWires[id] = pw.wire;
      }
      setCircuitWires(preWires);
      const preAppls: Record<CircuitId, Appliance[]> = {};
      for (const config of currentLevel.circuitConfigs) {
        const pw = oh.preWiredCircuits[config.id];
        preAppls[config.id] = pw ? [...pw.appliances] : [];
      }
      setCircuitAppliances(preAppls);
      const preCrimps: Record<CircuitId, CrimpResult> = {};
      for (const [id, pw] of Object.entries(oh.preWiredCircuits)) {
        const isOxidized = oh.problems.some(p => p.circuitId === id && p.type === 'oxidized-splice');
        preCrimps[id] = {
          terminalType: 'o-ring',
          quality: pw.crimpQuality,
          contactResistance: isOxidized ? OXIDIZED_CONTACT_RESISTANCE : CRIMP_QUALITY_MAP[pw.crimpQuality],
        };
      }
      setCircuitCrimps(preCrimps);
      // Re-initialize circuitBreakers
      const preBreakers: Record<CircuitId, Breaker> = {};
      for (const config of currentLevel.circuitConfigs) {
        const pw = oh.preWiredCircuits[config.id];
        preBreakers[config.id] = pw?.breaker ?? config.breaker;
      }
      setCircuitBreakers(preBreakers);
      const wiringCircuits: WiringState['circuits'] = {};
      for (const id of ids) {
        wiringCircuits[id] = { isWired: true, connectedWire: preWires[id] ?? null };
      }
      setWiring({
        isDragging: false, dragWire: null, cursorPos: null,
        isWired: true, connectedWire: null, circuits: wiringCircuits, targetCircuitId: null,
      });
      setPreWiredCircuitIds(new Set(ids));
      preWiredCircuitIdsRef.current = new Set(ids);
      // Re-initialize ELCB state for missing-elcb
      const initElcb: Record<CircuitId, boolean> = {};
      for (const config of currentLevel.circuitConfigs) {
        const hasMissingElcb = oh.problems.some(p => p.circuitId === config.id && p.type === 'missing-elcb');
        if (hasMissingElcb) {
          initElcb[config.id] = false;
        }
      }
      setCircuitElcb(initElcb);
      // Re-capture Before snapshot on retry
      const snapshotCircuits: Record<CircuitId, import('../types/game').CircuitSnapshot> = {};
      for (const config of currentLevel.circuitConfigs) {
        const pw = oh.preWiredCircuits[config.id];
        snapshotCircuits[config.id] = {
          wire: preWires[config.id] ?? DEFAULT_WIRES[0],
          breaker: preBreakers[config.id],
          crimpQuality: pw?.crimpQuality ?? 'none',
          elcbEnabled: !!initElcb[config.id],
          appliances: preAppls[config.id] ?? [],
        };
      }
      setOldHouseSnapshot({ problems: oh.problems, circuits: snapshotCircuits });
    } else {
      setWiring(createInitialWiring(circuitIds));
      setCircuitCrimps({});
    }
  }, [circuitIds, currentLevel]);

  const handleBackToLevels = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    prevTimeRef.current = 0;
    stopBuzzing();
    stopApplianceSounds();
    buzzingRef.current = false;
    hasWarningRef.current = false;
    hasTripRef.current = false;
    resolvedLeakageEventsRef.current = null;
    setIsPowered(false);
    setMultiState(createInitialMultiState([]));
    setResult('none');
    setStarResult(null);
    setCircuitAppliances({});
    setCircuitWires({});
    setCircuitElcb({});
    setCircuitPhases({});
    setCircuitCrimps({});
    setPendingCrimpCircuitId(null);
    setPendingCrimpWire(null);
    setPreWiredCircuitIds(new Set());
    preWiredCircuitIdsRef.current = new Set();
    setCircuitLanes([]);
    setCableTies(new Map());
    setRoutingCompleted(false);
    setShowRoutingOverlay(false);
    setFinalAestheticsScore(undefined);
    setCircuitRoutingStrategies({});
    setCircuitRouteDistances({});
    setCircuitRoutePaths({});
    setPendingRoutingCircuit(null);
    setCandidateRoutes([]);
    setFloorPlanHighlightedRoom(null);
    setGamePhase('active');
    setResolvedConfigs([]);
    setPlannerCircuits([]);
    setPlannerNextId(1);
    setCircuitBreakers({});
    setOldHouseSnapshot(null);
    setCurrentLevel(null);
    setWiring(createInitialWiring([]));
  }, []);

  const handleSelectLevel = useCallback((level: Level) => {
    setCurrentLevel(level);
    setCircuitElcb({});
    setPendingCrimpCircuitId(null);
    setPendingCrimpWire(null);
    setStarResult(null);

    if (isFreeCircuitLevel(level)) {
      // Free circuit level: enter planning phase
      setGamePhase('planning');
      setResolvedConfigs([]);
      setPlannerCircuits([]);
      setPlannerNextId(1);
      setCircuitWires({});
      setCircuitAppliances({});
      setCircuitCrimps({});
      setWiring(createInitialWiring([]));
      setCircuitPhases({});
      setMultiState(createInitialMultiState([]));
      setResult('none');
      setPreWiredCircuitIds(new Set());
      preWiredCircuitIdsRef.current = new Set();
      setCircuitLanes([]);
      setCableTies(new Map());
      setRoutingCompleted(false);
      setShowRoutingOverlay(false);
      setFinalAestheticsScore(undefined);
      setCircuitRoutingStrategies({});
      setCircuitRouteDistances({});
      setCircuitRoutePaths({});
      setPendingRoutingCircuit(null);
      setCandidateRoutes([]);
      setFloorPlanHighlightedRoom(null);
      setOldHouseSnapshot(null);
      return;
    }

    // Fixed circuit level: existing flow
    setGamePhase('active');
    const ids = level.circuitConfigs.map(c => c.id);
    setResolvedConfigs([...level.circuitConfigs]);

    if (level.oldHouse) {
      // Old house mode: initialize pre-wired state
      const oh = level.oldHouse;
      const preWires: Record<CircuitId, Wire> = {};
      for (const [id, pw] of Object.entries(oh.preWiredCircuits)) {
        preWires[id] = pw.wire;
      }
      setCircuitWires(preWires);

      const preAppls: Record<CircuitId, Appliance[]> = {};
      for (const config of level.circuitConfigs) {
        const pw = oh.preWiredCircuits[config.id];
        preAppls[config.id] = pw ? [...pw.appliances] : [];
      }
      setCircuitAppliances(preAppls);

      const preCrimps: Record<CircuitId, CrimpResult> = {};
      for (const [id, pw] of Object.entries(oh.preWiredCircuits)) {
        const isOxidized = oh.problems.some(p => p.circuitId === id && p.type === 'oxidized-splice');
        preCrimps[id] = {
          terminalType: 'o-ring',
          quality: pw.crimpQuality,
          contactResistance: isOxidized ? OXIDIZED_CONTACT_RESISTANCE : CRIMP_QUALITY_MAP[pw.crimpQuality],
        };
      }
      setCircuitCrimps(preCrimps);

      // Initialize circuitBreakers from preWiredCircuit.breaker or config.breaker
      const preBreakers: Record<CircuitId, Breaker> = {};
      for (const config of level.circuitConfigs) {
        const pw = oh.preWiredCircuits[config.id];
        preBreakers[config.id] = pw?.breaker ?? config.breaker;
      }
      setCircuitBreakers(preBreakers);

      // Initialize ELCB state: missing-elcb circuits start with ELCB disabled
      const initElcb: Record<CircuitId, boolean> = {};
      for (const config of level.circuitConfigs) {
        const hasMissingElcb = oh.problems.some(p => p.circuitId === config.id && p.type === 'missing-elcb');
        if (hasMissingElcb) {
          initElcb[config.id] = false; // explicitly uninstalled
        }
      }
      setCircuitElcb(initElcb);

      const wiringCircuits: WiringState['circuits'] = {};
      for (const id of ids) {
        wiringCircuits[id] = { isWired: true, connectedWire: preWires[id] ?? null };
      }
      setWiring({
        isDragging: false, dragWire: null, cursorPos: null,
        isWired: true, connectedWire: null, circuits: wiringCircuits, targetCircuitId: null,
      });

      setPreWiredCircuitIds(new Set(ids));
      preWiredCircuitIdsRef.current = new Set(ids);

      // Capture Before snapshot for Before/After view
      const snapshotCircuits: Record<CircuitId, import('../types/game').CircuitSnapshot> = {};
      for (const config of level.circuitConfigs) {
        const pw = oh.preWiredCircuits[config.id];
        snapshotCircuits[config.id] = {
          wire: preWires[config.id] ?? DEFAULT_WIRES[0],
          breaker: preBreakers[config.id],
          crimpQuality: pw?.crimpQuality ?? 'none',
          elcbEnabled: !!initElcb[config.id],
          appliances: preAppls[config.id] ?? [],
        };
      }
      setOldHouseSnapshot({ problems: oh.problems, circuits: snapshotCircuits });
    } else {
      // Normal mode: auto-assign appliances
      const appls: Record<CircuitId, Appliance[]> = {};
      for (const config of level.circuitConfigs) {
        appls[config.id] = [];
      }
      for (const appliance of level.requiredAppliances) {
        const candidates = level.circuitConfigs.filter(
          config => config.availableAppliances.includes(appliance)
        );
        if (candidates.length === 1) {
          appls[candidates[0].id].push(appliance);
        }
      }
      setCircuitAppliances(appls);
      setCircuitWires(createInitialCircuitWires(ids));
      setCircuitCrimps({});
      setWiring(createInitialWiring(ids));
      setPreWiredCircuitIds(new Set());
      preWiredCircuitIdsRef.current = new Set();
      setOldHouseSnapshot(null);
    }

    // Initialize phase assignments from CircuitConfig.phase
    const phases: Record<CircuitId, 'R' | 'T'> = {};
    for (const config of level.circuitConfigs) {
      if (config.phase) phases[config.id] = config.phase;
    }
    setCircuitPhases(phases);
    setMultiState(createInitialMultiState(ids));
    setResult('none');

    // Initialize routing state
    setCircuitLanes(level.initialLanes ? [...level.initialLanes] : ids);
    setCableTies(new Map());
    setRoutingCompleted(false);
    setShowRoutingOverlay(false);
    setFinalAestheticsScore(undefined);
    setCircuitRoutingStrategies({});
    setCircuitRouteDistances({});
    setCircuitRoutePaths({});
    setPendingRoutingCircuit(null);
    setCandidateRoutes([]);
    setFloorPlanHighlightedRoom(null);
  }, []);

  // === Planner handlers (free circuit levels) ===

  const handleAddPlannerCircuit = useCallback(() => {
    const hasPhaseMode = currentLevel != null && 'phaseMode' in currentLevel && currentLevel.phaseMode != null;
    setPlannerCircuits(prev => {
      // Auto phase for 'auto' mode: alternate R/T
      const autoPhase = hasPhaseMode && currentLevel!.phaseMode === 'auto';
      const existing110Count = prev.filter(c => c.voltage === 110).length;
      const phase = hasPhaseMode ? (autoPhase ? (existing110Count % 2 === 0 ? 'R' : 'T') : 'R') : undefined;
      return [
        ...prev,
        {
          id: `pc-${plannerNextId}`,
          voltage: 110 as const,
          breaker: BREAKER_20A,
          assignedAppliances: [],
          selectedWire: null,
          phase,
        },
      ];
    });
    setPlannerNextId(prev => prev + 1);
  }, [plannerNextId, currentLevel]);

  // Add circuit AND assign room in one batch (used by popover "新增迴路")
  const handleAddCircuitAndAssignRoom = useCallback((roomId: string) => {
    if (!currentLevel || !isFreeCircuitLevel(currentLevel)) return;
    const room = currentLevel.rooms.find(r => r.id === roomId);
    const hasPhaseMode = currentLevel.phaseMode != null;
    setPlannerCircuits(prev => {
      const autoPhase = hasPhaseMode && currentLevel.phaseMode === 'auto';
      const existing110Count = prev.filter(c => c.voltage === 110).length;
      const phase = hasPhaseMode ? (autoPhase ? (existing110Count % 2 === 0 ? 'R' : 'T') : 'R') : undefined;
      const newId = `pc-${plannerNextId}`;
      const voltage = 110 as const;
      const assignments: ApplianceAssignment[] = room
        ? room.appliances
            .map((appliance, idx) => ({ appliance, roomId, roomApplianceIndex: idx }))
            .filter(a => a.appliance.voltage === voltage)
        : [];
      return [
        ...prev,
        {
          id: newId,
          voltage,
          breaker: BREAKER_20A,
          assignedAppliances: assignments,
          selectedWire: null,
          phase,
        },
      ];
    });
    setPlannerNextId(prev => prev + 1);
    setRoomPopover(null);
  }, [plannerNextId, currentLevel]);

  const handleDeletePlannerCircuit = useCallback((id: string) => {
    setPlannerCircuits(prev => prev.filter(c => c.id !== id));
    setSelectedPlannerCircuitId(prev => prev === id ? null : prev);
  }, []);

  const handleChangePlannerVoltage = useCallback((id: string, voltage: 110 | 220) => {
    const hasPhaseMode = currentLevel != null && 'phaseMode' in currentLevel && currentLevel.phaseMode != null;
    setPlannerCircuits(prev => prev.map(c => {
      if (c.id !== id) return c;
      // Remove appliances that don't match new voltage
      const filtered = c.assignedAppliances.filter(a => a.appliance.voltage === voltage);
      // 220V: clear phase; 110V: restore default 'R' if phaseMode
      const phase = voltage === 220 ? undefined : (hasPhaseMode ? 'R' as const : undefined);
      // 220V: clear elcb (will be re-evaluated based on wetArea)
      return { ...c, voltage, assignedAppliances: filtered, phase };
    }));
  }, [currentLevel]);

  const handleChangePlannerBreaker = useCallback((id: string, breaker: Breaker) => {
    setPlannerCircuits(prev => prev.map(c =>
      c.id === id ? { ...c, breaker } : c
    ));
  }, []);

  const handleSelectPlannerWire = useCallback((id: string, wire: Wire) => {
    setPlannerCircuits(prev => prev.map(c =>
      c.id === id ? { ...c, selectedWire: wire } : c
    ));
  }, []);

  const handleAssignAppliance = useCallback((appliance: Appliance, roomId: string, roomApplianceIndex: number) => {
    // Find matching voltage circuits
    const matching = plannerCircuits.filter(c => c.voltage === appliance.voltage);
    if (matching.length === 0) return;

    // Determine target circuit
    let targetId: string | null = null;
    if (selectedPlannerCircuitId) {
      // Selected circuit must match voltage
      const selected = matching.find(c => c.id === selectedPlannerCircuitId);
      if (selected) {
        targetId = selected.id;
      }
      // If selected but voltage mismatch, don't assign
    } else if (matching.length === 1) {
      // Only one matching circuit: auto-assign
      targetId = matching[0].id;
    }
    // If no target (multiple matches, none selected): skip

    if (!targetId) return;
    const assignment: ApplianceAssignment = { appliance, roomId, roomApplianceIndex };
    setPlannerCircuits(prev => prev.map(c =>
      c.id === targetId
        ? { ...c, assignedAppliances: [...c.assignedAppliances, assignment] }
        : c
    ));
  }, [plannerCircuits, selectedPlannerCircuitId]);

  const handleUnassignPlannerAppliance = useCallback((circuitId: string, applianceIndex: number) => {
    setPlannerCircuits(prev => prev.map(c => {
      if (c.id !== circuitId) return c;
      const filtered = c.assignedAppliances.filter((_, i) => i !== applianceIndex);
      // If no remaining wetArea appliances, reset elcbEnabled
      if (currentLevel && isFreeCircuitLevel(currentLevel)) {
        const wetAreaRoomIds = new Set(currentLevel.rooms.filter(r => r.wetArea).map(r => r.id));
        const hasWetArea = filtered.some(a => wetAreaRoomIds.has(a.roomId));
        if (!hasWetArea && c.elcbEnabled) {
          return { ...c, assignedAppliances: filtered, elcbEnabled: false };
        }
      }
      return { ...c, assignedAppliances: filtered };
    }));
  }, [currentLevel]);

  const handleChangePlannerPhase = useCallback((id: string, phase: 'R' | 'T') => {
    setPlannerCircuits(prev => prev.map(c =>
      c.id === id ? { ...c, phase } : c
    ));
  }, []);

  const handleChangePlannerElcb = useCallback((id: string, enabled: boolean) => {
    setPlannerCircuits(prev => prev.map(c =>
      c.id === id ? { ...c, elcbEnabled: enabled } : c
    ));
  }, []);

  // Assign a room's appliances to a circuit
  const handleAssignRoomToCircuit = useCallback((roomId: string, circuitId: string) => {
    if (!currentLevel || !isFreeCircuitLevel(currentLevel)) return;
    const room = currentLevel.rooms.find(r => r.id === roomId);
    if (!room) return;

    // Assign all matching-voltage appliances from this room
    const circuit = plannerCircuits.find(c => c.id === circuitId);
    if (!circuit) return;

    setPlannerCircuits(prev => {
      // First, remove any existing assignments from this room in ALL circuits
      let updated = prev.map(c => ({
        ...c,
        assignedAppliances: c.assignedAppliances.filter(a => a.roomId !== roomId),
      }));
      // Then assign matching appliances to target circuit
      const assignments: ApplianceAssignment[] = [];
      room.appliances.forEach((appliance, idx) => {
        if (appliance.voltage === circuit.voltage) {
          assignments.push({ appliance, roomId, roomApplianceIndex: idx });
        }
      });
      updated = updated.map(c =>
        c.id === circuitId
          ? { ...c, assignedAppliances: [...c.assignedAppliances, ...assignments] }
          : c
      );
      return updated;
    });
    setRoomPopover(null);
  }, [currentLevel, plannerCircuits]);

  // Floor plan room click handler (for circuit assignment during planning)
  const handleFloorPlanRoomClick = useCallback((roomId: string) => {
    if (!currentFloorPlan || !currentLevel) return;

    // During active phase with floor plan: no-op (wiring handled by drag)
    if (gamePhase !== 'planning') return;

    // For free circuit levels in planning phase: circuit assignment
    if (!isFreeCircuitLevel(currentLevel)) return;

    const room = currentFloorPlan.rooms.find(r => r.id === roomId);
    if (!room) return;
    const roomName = room.label;

    // Skip rooms that have no appliances in the level data
    const levelRoom = currentLevel.rooms.find(r => r.id === roomId);
    if (!levelRoom || levelRoom.appliances.length === 0) return;

    // Find if this room is already assigned to a circuit
    let currentCircuitId: string | null = null;
    for (const c of plannerCircuits) {
      if (c.assignedAppliances.some(a => a.roomId === roomId)) {
        currentCircuitId = c.id;
        break;
      }
    }

    // If a circuit is selected in sidebar and room is unassigned, quick-assign
    if (selectedPlannerCircuitId && !currentCircuitId) {
      handleAssignRoomToCircuit(roomId, selectedPlannerCircuitId);
      return;
    }

    // Otherwise show popover
    // Get approximate screen position for the room center
    const svgEl = document.querySelector('.floor-plan-view');
    const roomEl = svgEl?.querySelector(`[data-room-id="${roomId}"]`);
    let pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    if (roomEl) {
      const rect = roomEl.getBoundingClientRect();
      pos = { x: rect.right + 4, y: rect.top };
    }
    setRoomPopover({ roomId, roomName, pos, currentCircuitId });
  }, [currentFloorPlan, currentLevel, gamePhase, plannerCircuits, selectedPlannerCircuitId, handleAssignRoomToCircuit]);

  // Unassign a room from all circuits
  const handleUnassignRoom = useCallback((roomId: string) => {
    setPlannerCircuits(prev => prev.map(c => ({
      ...c,
      assignedAppliances: c.assignedAppliances.filter(a => a.roomId !== roomId),
    })));
    setRoomPopover(null);
  }, []);

  // Planner cost (computed for planning phase display)
  const plannerTotalCost = useMemo(() => {
    return plannerCircuits.reduce((sum, c) => {
      const wireCost = c.selectedWire ? c.selectedWire.costPerMeter * DEFAULT_WIRE_LENGTH : 0;
      const nfbCost = NFB_COSTS[c.breaker.ratedCurrent] ?? 0;
      const elcbCost = c.elcbEnabled ? ELCB_COST : 0;
      return sum + wireCost + nfbCost + elcbCost;
    }, 0);
  }, [plannerCircuits]);

  // Planner validation
  const plannerAllAssigned = useMemo(() => {
    if (!currentLevel || !isFreeCircuitLevel(currentLevel)) return false;
    const totalAppliances = currentLevel.rooms.reduce((sum, r) => sum + r.appliances.length, 0);
    const assignedCount = plannerCircuits.reduce((sum, c) => sum + c.assignedAppliances.length, 0);
    return assignedCount >= totalAppliances;
  }, [currentLevel, plannerCircuits]);

  const plannerAllWired = plannerCircuits.length > 0 && plannerCircuits.every(c => c.selectedWire !== null);

  // Check wetArea ELCB requirement
  const plannerWetAreaMissingElcb = useMemo(() => {
    if (!currentLevel || !isFreeCircuitLevel(currentLevel)) return false;
    const wetAreaRoomIds = new Set(currentLevel.rooms.filter(r => r.wetArea).map(r => r.id));
    if (wetAreaRoomIds.size === 0) return false;
    return plannerCircuits.some(c =>
      c.assignedAppliances.some(a => wetAreaRoomIds.has(a.roomId)) && !c.elcbEnabled
    );
  }, [currentLevel, plannerCircuits]);

  const plannerCanConfirm = plannerAllAssigned && plannerAllWired && !plannerWetAreaMissingElcb;
  const plannerConfirmTooltip = !plannerCanConfirm
    ? (!plannerAllAssigned ? t('planner.assignAllAppliances') : !plannerAllWired ? t('planner.selectAllWires') : plannerWetAreaMissingElcb ? t('planner.wetAreaNeedElcb') : undefined)
    : undefined;

  // Confirm planning: convert PlannerCircuit[] → CircuitConfig[] + game state
  const handleConfirmPlanning = useCallback(() => {
    if (!currentLevel || !isFreeCircuitLevel(currentLevel)) return;
    if (!plannerCanConfirm) return;

    // Build wetArea room IDs for config generation
    const wetAreaRoomIds = new Set(currentLevel.rooms.filter(r => r.wetArea).map(r => r.id));

    const configs: CircuitConfig[] = plannerCircuits.map((pc, idx) => {
      const hasWetArea = pc.assignedAppliances.some(a => wetAreaRoomIds.has(a.roomId));
      return {
        id: `c${idx + 1}` as CircuitId,
        label: t('planner.circuitNum', { num: idx + 1 }),
        voltage: pc.voltage,
        breaker: pc.breaker,
        availableAppliances: pc.assignedAppliances.map(a => a.appliance),
        phase: pc.phase,
        wetArea: hasWetArea || undefined,
        elcbAvailable: pc.elcbEnabled || undefined,
      };
    });

    const wires: Record<CircuitId, Wire> = {};
    const appls: Record<CircuitId, Appliance[]> = {};
    const wiringCircuits: WiringState['circuits'] = {};
    const ids: CircuitId[] = [];
    const phases: Record<CircuitId, 'R' | 'T'> = {};
    const elcbs: Record<CircuitId, boolean> = {};

    for (let i = 0; i < plannerCircuits.length; i++) {
      const pc = plannerCircuits[i];
      const cid = `c${i + 1}` as CircuitId;
      ids.push(cid);
      wires[cid] = pc.selectedWire!;
      appls[cid] = pc.assignedAppliances.map(a => a.appliance);
      if (pc.phase) phases[cid] = pc.phase;
      if (pc.elcbEnabled) elcbs[cid] = true;
      // Floor plan mode or requiresCrimp: leave circuits as not wired (drag-to-room wiring flow)
      if (currentLevel.requiresCrimp || currentLevel.floorPlan) {
        wiringCircuits[cid] = { isWired: false, connectedWire: null };
      } else {
        wiringCircuits[cid] = { isWired: true, connectedWire: pc.selectedWire };
      }
    }

    // Resolve scripted leakageEvent circuitIds: map wetArea events to actual circuit IDs
    if (currentLevel.leakageMode === 'scripted' && currentLevel.leakageEvents) {
      const wetAreaCircuitIds = ids.filter((_id, idx) => {
        const pc = plannerCircuits[idx];
        return pc.assignedAppliances.some(a => wetAreaRoomIds.has(a.roomId));
      });
      // Replace leakageEvent circuitIds with resolved wetArea circuit IDs
      // Store resolved events on the level object is not possible (readonly),
      // so we store them via a ref that the tick loop can access
      const resolvedEvents = currentLevel.leakageEvents.map((evt, evtIdx) => ({
        ...evt,
        circuitId: wetAreaCircuitIds[evtIdx % wetAreaCircuitIds.length] ?? evt.circuitId,
      }));
      resolvedLeakageEventsRef.current = resolvedEvents;
    } else {
      resolvedLeakageEventsRef.current = null;
    }

    setResolvedConfigs(configs);
    setCircuitWires(wires);
    setCircuitAppliances(appls);
    setCircuitCrimps({});
    setWiring({
      isDragging: false,
      dragWire: null,
      cursorPos: null,
      isWired: !currentLevel.requiresCrimp,
      connectedWire: null,
      circuits: wiringCircuits,
      targetCircuitId: null,
    });
    setCircuitPhases(phases);
    setCircuitElcb(elcbs);
    setMultiState(createInitialMultiState(ids));
    setResult('none');
    setCircuitLanes(ids);
    setCableTies(new Map());
    setRoutingCompleted(false);
    setShowRoutingOverlay(false);
    setFinalAestheticsScore(undefined);
    setGamePhase('active');
  }, [currentLevel, plannerCircuits, plannerCanConfirm, t]);

  // Wiring drag callbacks
  const handleDragStart = useCallback((wire: Wire) => {
    setWiring(prev => ({ ...prev, isDragging: true, dragWire: wire }));
  }, []);

  const handleDragMove = useCallback((pos: { x: number; y: number } | null) => {
    setWiring(prev => ({ ...prev, cursorPos: pos }));
  }, []);

  // Helper: complete wiring for a circuit (after routing strategy selection or direct)
  const completeFloorPlanWiring = useCallback((circuitId: CircuitId, wire: Wire, strategy: 'direct' | 'star' | 'daisy-chain', routePaths: RoutePath[], totalDistance: number) => {
    // Store routing info
    setCircuitRoutingStrategies(prev => ({ ...prev, [circuitId]: strategy }));
    setCircuitRouteDistances(prev => ({ ...prev, [circuitId]: totalDistance }));
    setCircuitRoutePaths(prev => ({ ...prev, [circuitId]: routePaths }));
    // Store wire
    setCircuitWires(w => ({ ...w, [circuitId]: wire }));
    // Clear old crimp result
    setCircuitCrimps(c => { const next = { ...c }; delete next[circuitId]; return next; });

    if (currentLevel?.requiresCrimp) {
      // Trigger crimp mini-game (wiring not complete until crimp done)
      setPendingCrimpCircuitId(circuitId);
      setPendingCrimpWire(wire);
    } else {
      // Mark circuit as wired immediately
      setWiring(prev => {
        const newCircuits = { ...prev.circuits };
        newCircuits[circuitId] = { isWired: true, connectedWire: wire };
        const allWired = Object.values(newCircuits).every(c => c.isWired);
        return { ...prev, isWired: allWired, connectedWire: wire, circuits: newCircuits };
      });
    }
  }, [currentLevel?.requiresCrimp]);

  // Floor plan: initiate wiring for a circuit (handles single vs multi room)
  const initiateFloorPlanWiring = useCallback((circuitId: CircuitId, wire: Wire) => {
    if (!currentFloorPlan) return;
    // Find rooms belonging to this circuit
    const rooms: string[] = [];
    for (const [roomId, cid] of roomToCircuitMap) {
      if (cid === circuitId) rooms.push(roomId);
    }
    if (rooms.length === 0) return;

    if (rooms.length === 1) {
      // Single room: auto direct routing
      const { candidates } = calcRouteCandidates(currentFloorPlan, rooms);
      const direct = candidates.find(c => c.strategy === 'direct');
      if (direct) {
        const paths = Array.from(direct.paths.values());
        completeFloorPlanWiring(circuitId, wire, 'direct', paths, direct.totalDistance);
      }
    } else {
      // Multi room: show strategy picker
      const { candidates } = calcRouteCandidates(currentFloorPlan, rooms);
      if (candidates.length > 0) {
        setPendingRoutingCircuit({ circuitId, wire });
        setCandidateRoutes(candidates);
      }
    }
  }, [currentFloorPlan, roomToCircuitMap, completeFloorPlanWiring]);

  // Floor plan: handle routing strategy selection
  const handleSelectRoutingStrategy = useCallback((strategy: 'star' | 'daisy-chain') => {
    if (!pendingRoutingCircuit) return;
    const candidate = candidateRoutes.find(c => c.strategy === strategy);
    if (!candidate) return;
    const paths = Array.from(candidate.paths.values());
    completeFloorPlanWiring(pendingRoutingCircuit.circuitId, pendingRoutingCircuit.wire, strategy, paths, candidate.totalDistance);
    setPendingRoutingCircuit(null);
    setCandidateRoutes([]);
  }, [pendingRoutingCircuit, candidateRoutes, completeFloorPlanWiring]);

  // Floor plan: cancel routing strategy selection
  const handleCancelRoutingStrategy = useCallback(() => {
    setPendingRoutingCircuit(null);
    setCandidateRoutes([]);
  }, []);

  // Floor plan: handle room hover during drag
  const handleFloorPlanRoomHover = useCallback((roomId: string | null) => {
    setFloorPlanHighlightedRoom(roomId);
    floorPlanHighlightedRoomRef.current = roomId;
    // Also update wiring targetCircuitId for compatibility
    if (roomId) {
      const cid = roomToCircuitMap.get(roomId) ?? null;
      setWiring(prev => ({ ...prev, targetCircuitId: cid }));
    } else {
      setWiring(prev => ({ ...prev, targetCircuitId: null }));
    }
  }, [roomToCircuitMap]);

  const handleDragEnd = useCallback((dropped: boolean) => {
    // Floor plan mode: use highlighted room ref to resolve target circuit (avoid stale closure)
    const highlightedRoom = floorPlanHighlightedRoomRef.current;
    if (currentFloorPlan && dropped && wiring.dragWire && highlightedRoom) {
      const cid = roomToCircuitMap.get(highlightedRoom);
      if (cid) {
        initiateFloorPlanWiring(cid, wiring.dragWire);
      }
      setFloorPlanHighlightedRoom(null);
      floorPlanHighlightedRoomRef.current = null;
      setWiring(prev => ({
        ...prev,
        isDragging: false,
        dragWire: null,
        cursorPos: null,
        targetCircuitId: null,
      }));
      return;
    }

    setWiring(prev => {
      const tid = prev.targetCircuitId;
      if (dropped && prev.dragWire && tid) {
        // requiresCrimp: don't mark isWired yet, trigger crimp mini-game
        if (currentLevel?.requiresCrimp) {
          setPendingCrimpCircuitId(tid);
          setPendingCrimpWire(prev.dragWire);
          // Update circuitWires immediately so wire is recorded
          setCircuitWires(w => ({ ...w, [tid]: prev.dragWire! }));
          // Clear old crimp result for this circuit (re-wiring)
          setCircuitCrimps(c => {
            const next = { ...c };
            delete next[tid];
            return next;
          });
          return {
            ...prev,
            isDragging: false,
            dragWire: null,
            cursorPos: null,
            targetCircuitId: null,
          };
        }
        // Non-requiresCrimp: original flow
        const newCircuits = { ...prev.circuits };
        newCircuits[tid] = { isWired: true, connectedWire: prev.dragWire };
        const allCircuitsWired = Object.values(newCircuits).every(c => c.isWired);
        return {
          ...prev,
          isDragging: false,
          dragWire: null,
          cursorPos: null,
          isWired: allCircuitsWired,
          connectedWire: prev.dragWire,
          circuits: newCircuits,
          targetCircuitId: null,
        };
      }
      return { ...prev, isDragging: false, dragWire: null, cursorPos: null, targetCircuitId: null };
    });
  }, [currentLevel?.requiresCrimp, currentFloorPlan, wiring.dragWire, roomToCircuitMap, initiateFloorPlanWiring]);

  // Crimp mini-game complete callback
  const handleCrimpComplete = useCallback((result: CrimpResult) => {
    const cid = pendingCrimpCircuitId;
    if (!cid) return;
    // Save crimp result
    setCircuitCrimps(prev => ({ ...prev, [cid]: result }));
    // Mark circuit as wired
    setWiring(prev => {
      const wire = pendingCrimpWire;
      const newCircuits = { ...prev.circuits };
      newCircuits[cid] = { isWired: true, connectedWire: wire };
      const allCircuitsWired = Object.values(newCircuits).every(c => c.isWired);
      return {
        ...prev,
        isWired: allCircuitsWired,
        connectedWire: wire,
        circuits: newCircuits,
      };
    });
    // Problem repair check is handled by the unified useEffect below
    setPendingCrimpCircuitId(null);
    setPendingCrimpWire(null);
  }, [pendingCrimpCircuitId, pendingCrimpWire]);

  // Called by CircuitDiagram when cursor enters/leaves a circuit's drop zone
  const handleTargetCircuitChange = useCallback((circuitId: CircuitId | null) => {
    setWiring(prev => ({ ...prev, targetCircuitId: circuitId }));
  }, []);

  // Sync connectedWire → circuitWires per circuit (render-time state adjustment)
  const [prevWiringCircuitsSync, setPrevWiringCircuitsSync] = useState(wiring.circuits);
  if (wiring.circuits !== prevWiringCircuitsSync) {
    setPrevWiringCircuitsSync(wiring.circuits);
    const newWires: Record<CircuitId, Wire> = { ...circuitWires };
    let changed = false;
    for (const [id, cw] of Object.entries(wiring.circuits)) {
      if (cw.connectedWire && (!newWires[id] || newWires[id] !== cw.connectedWire)) {
        newWires[id] = cw.connectedWire;
        changed = true;
      }
    }
    if (changed) {
      setCircuitWires(newWires);
    }
  }

  const hasAnyElcbOption = circuitConfigs.some(c => c.elcbAvailable);

  const handleToggleElcb = useCallback((circuitId: CircuitId) => {
    setCircuitElcb(prev => ({ ...prev, [circuitId]: !prev[circuitId] }));
  }, []);


  const handleTogglePhase = useCallback((circuitId: CircuitId) => {
    if (isPowered || currentLevel?.phaseMode !== 'manual') return;
    setCircuitPhases(prev => ({
      ...prev,
      [circuitId]: prev[circuitId] === 'R' ? 'T' : 'R',
    }));
  }, [isPowered, currentLevel?.phaseMode]);

  // Old house mode: change breaker (for overrated-breaker problem)
  const handleChangeBreaker = useCallback((circuitId: CircuitId, breaker: Breaker) => {
    setCircuitBreakers(prev => ({ ...prev, [circuitId]: breaker }));
  }, []);

  // Old house mode: unwire a circuit
  const handleUnwire = useCallback((circuitId: CircuitId) => {
    if (!window.confirm(t('game.unwireConfirm'))) return;
    setCircuitWires(prev => ({ ...prev, [circuitId]: DEFAULT_WIRES[0] }));
    setCircuitCrimps(prev => {
      const next = { ...prev };
      delete next[circuitId];
      return next;
    });
    setCircuitAppliances(prev => ({ ...prev, [circuitId]: [] }));
    setWiring(prev => {
      const newCircuits = { ...prev.circuits };
      newCircuits[circuitId] = { isWired: false, connectedWire: null };
      const allWired = Object.values(newCircuits).every(c => c.isWired);
      return { ...prev, isWired: allWired, circuits: newCircuits };
    });
    const updated = new Set(
      [...preWiredCircuitIdsRef.current].filter(id => id !== circuitId)
    );
    setPreWiredCircuitIds(updated);
    preWiredCircuitIdsRef.current = updated;
  }, [t]);

  // Routing: lane reorder callback
  const handleLanesChange = useCallback((newLanes: CircuitId[]) => {
    setCircuitLanes(newLanes);
    setCableTies(new Map()); // clear cable ties on reorder
  }, []);

  // Routing: cable tie toggle callback
  const handleToggleCableTie = useCallback((pairIndex: number, quality?: CableTieQuality) => {
    setCableTies(prev => {
      const next = new Map(prev);
      if (next.has(pairIndex) && !quality) {
        // Remove existing tie
        next.delete(pairIndex);
      } else if (quality) {
        // Place with quality from mini-game
        next.set(pairIndex, quality);
      }
      return next;
    });
  }, []);

  // Routing: close overlay and mark completed
  const handleRoutingDone = useCallback(() => {
    setShowRoutingOverlay(false);
    setRoutingCompleted(true);
    setFinalAestheticsScore(currentAestheticsScore);
    aestheticsScoreRef.current = currentAestheticsScore;
  }, [currentAestheticsScore]);

  const handleAddAppliance = useCallback((circuitId: CircuitId, a: Appliance) => {
    setCircuitAppliances(prev => ({
      ...prev,
      [circuitId]: [...(prev[circuitId] ?? []), a],
    }));
  }, []);

  const handleRemoveAppliance = useCallback((circuitId: CircuitId, index: number) => {
    setCircuitAppliances(prev => ({
      ...prev,
      [circuitId]: (prev[circuitId] ?? []).filter((_, i) => i !== index),
    }));
  }, []);

  const isOldHouse = currentLevel != null && isFixedCircuitLevel(currentLevel) && !!currentLevel.oldHouse;
  const oldHouseProblems = currentLevel != null && isFixedCircuitLevel(currentLevel) ? currentLevel.oldHouse?.problems : undefined;

  // Level select screen
  if (!currentLevel) {
    return (
      <>
        <LevelSelect levels={LEVELS} onSelect={handleSelectLevel} />
        <FloorPlanPreview />
      </>
    );
  }

  // Planning phase for free circuit levels
  if (gamePhase === 'planning' && isFreeCircuitLevel(currentLevel)) {
    // Floor plan planning: sidebar + floor plan view
    if (currentFloorPlan) {
      return (
        <div className="game-board fp-layout planning-phase">
          <header className="game-header">
            <div className="header-top">
              <button className="back-button" onClick={handleBackToLevels}>← {t('nav.back')}</button>
              <h1>{translatedLevelName}</h1>
              <span className="level-goal">{t('game.powerTimeBudget', { time: currentLevel.survivalTime, budget: currentLevel.budget })}</span>
            </div>
          </header>

          <div className="fp-main">
            <CircuitPlannerSidebar
              level={currentLevel}
              circuits={plannerCircuits}
              totalCost={plannerTotalCost}
              canConfirm={plannerCanConfirm}
              confirmTooltip={plannerConfirmTooltip}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
              selectedCircuitId={selectedPlannerCircuitId}
              onSelectCircuit={setSelectedPlannerCircuitId}
              onAddCircuit={handleAddPlannerCircuit}
              onDeleteCircuit={handleDeletePlannerCircuit}
              onChangeVoltage={handleChangePlannerVoltage}
              onChangeBreaker={handleChangePlannerBreaker}
              onSelectWire={handleSelectPlannerWire}
              onAssignAppliance={handleAssignAppliance}
              onUnassignAppliance={handleUnassignPlannerAppliance}
              onChangePhase={handleChangePlannerPhase}
              onChangeElcb={handleChangePlannerElcb}
              onConfirm={handleConfirmPlanning}
            />

            <div className="fp-center">
              <FloorPlanView
                floorPlan={currentFloorPlan}
                circuitAssignments={floorPlanCircuitAssignments}
                onRoomClick={handleFloorPlanRoomClick}
                applianceCounts={floorPlanApplianceCounts}
                applianceDetails={floorPlanApplianceDetails}
              />
            </div>
          </div>

          <WireToolbar
            wires={DEFAULT_WIRES}
            wiring={wiring}
            disabled={true}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            isPowered={false}
            canPowerOn={false}
            onPowerToggle={handlePowerToggle}
          />

          {roomPopover && (
            <CircuitAssignmentPopover
              roomId={roomPopover.roomId}
              roomName={tRoomName(t, roomPopover.roomName)}
              position={roomPopover.pos}
              circuits={plannerCircuits}
              currentCircuitId={roomPopover.currentCircuitId}
              onAssignToCircuit={(cid) => handleAssignRoomToCircuit(roomPopover.roomId, cid)}
              onUnassign={() => handleUnassignRoom(roomPopover.roomId)}
              onAddCircuit={() => handleAddCircuitAndAssignRoom(roomPopover.roomId)}
              onClose={() => setRoomPopover(null)}
              canAddCircuit={plannerCircuits.length < currentLevel.panel.maxSlots}
            />
          )}
        </div>
      );
    }

    // Non-floor-plan planning: existing CircuitPlanner
    return (
      <div className="game-board planning-phase">
        <header className="game-header">
          <div className="header-top">
            <button className="back-button" onClick={handleBackToLevels}>← {t('nav.back')}</button>
            <h1>{translatedLevelName}</h1>
            <span className="level-goal">{t('game.powerTimeBudget', { time: currentLevel.survivalTime, budget: currentLevel.budget })}</span>
          </div>
          <p className="level-description">{translatedLevelDesc}</p>
        </header>

        <CircuitPlanner
          level={currentLevel}
          circuits={plannerCircuits}
          totalCost={plannerTotalCost}
          canConfirm={plannerCanConfirm}
          confirmTooltip={plannerConfirmTooltip}
          selectedCircuitId={selectedPlannerCircuitId}
          onSelectCircuit={setSelectedPlannerCircuitId}
          onAddCircuit={handleAddPlannerCircuit}
          onDeleteCircuit={handleDeletePlannerCircuit}
          onChangeVoltage={handleChangePlannerVoltage}
          onChangeBreaker={handleChangePlannerBreaker}
          onSelectWire={handleSelectPlannerWire}
          onAssignAppliance={handleAssignAppliance}
          onUnassignAppliance={handleUnassignPlannerAppliance}
          onChangePhase={handleChangePlannerPhase}
          onChangeElcb={handleChangePlannerElcb}
          onConfirm={handleConfirmPlanning}
        />
      </div>
    );
  }

  // Shared power tooltip
  const powerTooltipText = !isPowered && !canPowerOn
    ? (problemsRemaining ? t('oldHouse.problemsRemaining') : wetAreaMissingElcb ? t('oldHouse.wetAreaMissingElcb') : !allWired ? t('oldHouse.allWiresNeeded') : crimpMissing ? t('oldHouse.crimpNeeded') : routingMissing ? t('oldHouse.routingNeeded') : t('oldHouse.appliancesNeeded'))
    : undefined;

  // Shared overlays (PanelInteriorView, RoutingStrategyPicker, CrimpMiniGame, ResultPanel)
  const overlays = (
    <>
      <ResultPanel
        result={result}
        circuits={circuits}
        multiState={multiState}
        cost={totalCost}
        budget={currentLevel.budget}
        onRetry={handleRetry}
        onBackToLevels={handleBackToLevels}
        starResult={starResult}
        aestheticsScore={finalAestheticsScore}
        oldHouseSnapshot={oldHouseSnapshot}
        circuitConfigs={circuitConfigs}
        currentWires={circuitWires}
        currentBreakers={circuitBreakers}
        currentElcb={circuitElcb}
      />

      {showRoutingOverlay && (
        <PanelInteriorView
          circuitConfigs={circuitConfigs}
          circuitWires={circuitWires}
          phases={circuitPhases}
          lanes={circuitLanes}
          onLanesChange={handleLanesChange}
          onClose={handleRoutingDone}
          cableTies={cableTies}
          onToggleCableTie={handleToggleCableTie}
          aestheticsScore={currentAestheticsScore}
        />
      )}

      {pendingRoutingCircuit && candidateRoutes.length > 0 && (
        <RoutingStrategyPicker
          candidates={candidateRoutes}
          wire={pendingRoutingCircuit.wire}
          onSelect={handleSelectRoutingStrategy}
          onCancel={handleCancelRoutingStrategy}
        />
      )}

      {pendingCrimpCircuitId && pendingCrimpWire && (
        <CrimpMiniGame
          wire={pendingCrimpWire}
          circuitLabel={circuitConfigs.find(c => c.id === pendingCrimpCircuitId)?.label ?? pendingCrimpCircuitId}
          onComplete={handleCrimpComplete}
        />
      )}
    </>
  );

  // Active phase — Floor plan layout
  if (currentFloorPlan) {
    return (
      <div className={`game-board fp-layout${circuitConfigs.length > 1 ? ' multi-circuit' : ''}`}>
        <header className="game-header">
          <div className="header-top">
            <button className="back-button" onClick={handleBackToLevels}>← {t('nav.back')}</button>
            <h1>{translatedLevelName}</h1>
            <span className="level-goal">{t('game.powerTime', { time: currentLevel.survivalTime })}</span>
          </div>
          <StatusDisplay
            circuits={circuits}
            multiState={multiState}
            cost={totalCost}
            budget={currentLevel.budget}
            survivalTime={currentLevel.survivalTime}
            phases={Object.keys(circuitPhases).length > 0 ? circuitPhases : undefined}
            mainBreakerRating={isFreeLevel && isFreeCircuitLevel(currentLevel) ? currentLevel.panel.mainBreakerRating : undefined}
          />
        </header>

        <div className="fp-main">
          <div className="sidebar-collapsed" onClick={() => setSidebarCollapsed(prev => !prev)} title={t('sidebar.expand')}>
            <span className="sidebar-collapsed__icon">&#9776;</span>
            <span className="sidebar-collapsed__count">{circuitConfigs.length}</span>
            <span className="sidebar-collapsed__cost">${totalCost}</span>
          </div>

          <div className="fp-center">
            <FloorPlanView
              floorPlan={currentFloorPlan}
              circuitAssignments={floorPlanCircuitAssignments}
              candidatePaths={floorPlanCandidatePaths}
              connectedPaths={floorPlanConnectedPaths}
              onPanelClick={() => setShowRoutingOverlay(true)}
              onRoomHover={wiring.isDragging ? handleFloorPlanRoomHover : undefined}
              highlightedRoomId={floorPlanHighlightedRoom}
              dragActive={wiring.isDragging}
              simulationState={floorPlanSimulationState}
              problemRooms={floorPlanProblemRooms}
              roomCircuitMap={floorPlanRoomCircuitMap}
              applianceCounts={floorPlanApplianceCounts}
              applianceDetails={floorPlanApplianceDetails}
            />
            {routingReady && !isPowered && (
              <button
                className="routing-button"
                onClick={() => setShowRoutingOverlay(true)}
              >
                {routingCompleted ? t('game.rerouting') : t('game.routing')}
              </button>
            )}
          </div>
        </div>

        <WireToolbar
          wires={DEFAULT_WIRES}
          wiring={wiring}
          disabled={isPowered}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          isPowered={isPowered}
          canPowerOn={canPowerOn}
          onPowerToggle={handlePowerToggle}
          powerTooltip={powerTooltipText}
        />

        {overlays}
      </div>
    );
  }

  // Active phase — Legacy three-column layout (no floor plan)
  return (
    <div className={`game-board${circuitConfigs.length > 1 ? ' multi-circuit' : ''}${circuitConfigs.length >= 4 ? ' many-circuits' : ''}`}>
      <header className="game-header">
        <div className="header-top">
          <button className="back-button" onClick={handleBackToLevels}>← {t('nav.back')}</button>
          <h1>{translatedLevelName}</h1>
          <span className="level-goal">{t('game.powerTime', { time: currentLevel.survivalTime })}</span>
        </div>
        <StatusDisplay
          circuits={circuits}
          multiState={multiState}
          cost={totalCost}
          budget={currentLevel.budget}
          survivalTime={currentLevel.survivalTime}
          phases={Object.keys(circuitPhases).length > 0 ? circuitPhases : undefined}
          mainBreakerRating={isFreeLevel && isFreeCircuitLevel(currentLevel) ? currentLevel.panel.mainBreakerRating : undefined}
        />
      </header>

      <main className="game-main">
        <section className="panel-left">
          <WireSelector
            wires={DEFAULT_WIRES}
            wiring={wiring}
            disabled={isPowered}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          />
        </section>

        <section className="panel-center">
          <CircuitDiagram
            circuits={circuits}
            multiState={multiState}
            isPowered={isPowered}
            wiring={wiring}
            onPowerToggle={handlePowerToggle}
            leverDisabled={!canPowerOn && !isPowered}
            leverTooltip={powerTooltipText}
            onTargetCircuitChange={handleTargetCircuitChange}
            phases={Object.keys(circuitPhases).length > 0 ? circuitPhases : undefined}
            phaseMode={currentLevel?.phaseMode}
            onTogglePhase={handleTogglePhase}
            circuitCrimps={Object.keys(circuitCrimps).length > 0 ? circuitCrimps : undefined}
            problemCircuits={problemCircuits}
            preWiredCircuitIds={preWiredCircuitIds}
            onUnwire={handleUnwire}
            isOldHouse={isOldHouse}
            oldHouseProblems={oldHouseProblems}
            onChangeBreaker={isOldHouse ? handleChangeBreaker : undefined}
            circuitWires={isOldHouse ? circuitWires : undefined}
          />
          {routingReady && !isPowered && (
            <button
              className="routing-button"
              onClick={() => setShowRoutingOverlay(true)}
            >
              {routingCompleted ? t('game.rerouting') : t('game.routing')}
            </button>
          )}
        </section>

        <section className="panel-right">
          <AppliancePanel
            circuitConfigs={circuitConfigs}
            circuitAppliances={circuitAppliances}
            onAdd={handleAddAppliance}
            onRemove={handleRemoveAppliance}
            disabled={isPowered}
            isPowered={isPowered}
          />
          {hasAnyElcbOption && (
            <div className="elcb-panel">
              <h3 className="elcb-panel-title">{t('elcb.title', { cost: ELCB_COST })}</h3>
              {circuitConfigs.filter(c => c.elcbAvailable).map(config => (
                <label key={config.id} className="elcb-toggle">
                  <input
                    type="checkbox"
                    checked={!!circuitElcb[config.id]}
                    onChange={() => handleToggleElcb(config.id)}
                    disabled={isPowered}
                  />
                  <span className="elcb-label">{tRoomName(t, config.label)}</span>
                </label>
              ))}
            </div>
          )}
        </section>
      </main>

      {overlays}
    </div>
  );
}
