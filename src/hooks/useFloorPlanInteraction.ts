import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Wire, Level, CircuitId, CrimpResult, WiringState, MultiCircuitState, SimulationStatus, OldHouseProblemType } from '../types/game';
import { isFixedCircuitLevel, isFreeCircuitLevel } from '../types/helpers';
import { calcRouteCandidates } from '../engine/routing';
import type { RoutePath, RouteCandidate } from '../engine/routing';
import type { CircuitAssignment, ConnectedPathGroup } from '../components/FloorPlanView';
import { tApplianceName } from '../i18nHelpers';
import { useTranslation } from 'react-i18next';

export interface UseFloorPlanInteractionParams {
  currentLevel: Level | null;
  circuitIds: CircuitId[];
  circuitWires: Record<CircuitId, Wire>;
  wiring: WiringState;
  multiState: MultiCircuitState;
  roomToCircuitMap: Map<string, CircuitId>;
  currentFloorPlan: Level['floorPlan'];
  isPowered: boolean;
  problemCircuits: Set<CircuitId>;
  setCircuitWires: React.Dispatch<React.SetStateAction<Record<CircuitId, Wire>>>;
  setCircuitCrimps: React.Dispatch<React.SetStateAction<Record<CircuitId, CrimpResult>>>;
  setWiring: React.Dispatch<React.SetStateAction<WiringState>>;
  setPendingCrimpCircuitId: React.Dispatch<React.SetStateAction<CircuitId | null>>;
  setPendingCrimpWire: React.Dispatch<React.SetStateAction<Wire | null>>;
  requiresCrimp: boolean;
  // Shared refs owned by GameBoard, updated by this hook
  circuitRouteDistancesRef: React.MutableRefObject<Record<CircuitId, number>>;
  floorPlanHighlightedRoomRef: React.MutableRefObject<string | null>;
}

export interface UseFloorPlanInteractionReturn {
  circuitRouteDistances: Record<CircuitId, number>;
  setCircuitRouteDistances: React.Dispatch<React.SetStateAction<Record<CircuitId, number>>>;
  circuitRoutePaths: Record<CircuitId, RoutePath[]>;
  setCircuitRoutePaths: React.Dispatch<React.SetStateAction<Record<CircuitId, RoutePath[]>>>;
  pendingRoutingCircuit: { circuitId: CircuitId; wire: Wire } | null;
  candidateRoutes: readonly RouteCandidate[];
  floorPlanHighlightedRoom: string | null;
  setFloorPlanHighlightedRoom: React.Dispatch<React.SetStateAction<string | null>>;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  roomPopoverDismiss: () => void;
  // Derived useMemo values
  floorPlanCircuitAssignments: Map<string, CircuitAssignment>;
  floorPlanConnectedPaths: readonly ConnectedPathGroup[];
  floorPlanCandidatePaths: readonly RouteCandidate[];
  floorPlanSimulationState: { isPowered: boolean; circuitStates: Record<CircuitId, { status: SimulationStatus; wireHeat: number; totalCurrent: number }>; mainTripped: boolean } | undefined;
  floorPlanProblemRooms: Map<string, OldHouseProblemType[]> | undefined;
  floorPlanRoomCircuitMap: Record<string, CircuitId> | undefined;
  floorPlanApplianceCounts: Map<string, number> | undefined;
  floorPlanApplianceDetails: Map<string, string[]> | undefined;
  // Handlers
  handleFloorPlanRoomHover: (roomId: string | null) => void;
  handleSelectRoutingStrategy: (strategy: 'star' | 'daisy-chain') => void;
  handleCancelRoutingStrategy: () => void;
  completeFloorPlanWiring: (circuitId: CircuitId, wire: Wire, strategy: 'direct' | 'star' | 'daisy-chain', routePaths: RoutePath[], totalDistance: number) => void;
  initiateFloorPlanWiring: (circuitId: CircuitId, wire: Wire) => void;
  reset: () => void;
}

export function useFloorPlanInteraction({
  currentLevel,
  circuitIds,
  circuitWires,
  wiring,
  multiState,
  roomToCircuitMap,
  currentFloorPlan,
  isPowered,
  problemCircuits,
  setCircuitWires,
  setCircuitCrimps,
  setWiring,
  setPendingCrimpCircuitId,
  setPendingCrimpWire,
  requiresCrimp,
  circuitRouteDistancesRef,
  floorPlanHighlightedRoomRef,
}: UseFloorPlanInteractionParams): UseFloorPlanInteractionReturn {
  const { t } = useTranslation();
  const [, setCircuitRoutingStrategies] = useState<Record<CircuitId, 'direct' | 'star' | 'daisy-chain'>>({});
  const [circuitRouteDistances, setCircuitRouteDistances] = useState<Record<CircuitId, number>>({});
  const [circuitRoutePaths, setCircuitRoutePaths] = useState<Record<CircuitId, RoutePath[]>>({});
  const [pendingRoutingCircuit, setPendingRoutingCircuit] = useState<{ circuitId: CircuitId; wire: Wire } | null>(null);
  const [candidateRoutes, setCandidateRoutes] = useState<readonly RouteCandidate[]>([]);
  const [floorPlanHighlightedRoom, setFloorPlanHighlightedRoom] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth <= 640);

  // Keep the shared ref in sync with local state
  useEffect(() => {
    circuitRouteDistancesRef.current = circuitRouteDistances;
  }, [circuitRouteDistances, circuitRouteDistancesRef]);

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

  // Floor plan: room->circuit map as Record for FloorPlanView prop
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

  // Helper: complete wiring for a circuit (after routing strategy selection or direct)
  const completeFloorPlanWiring = useCallback((circuitId: CircuitId, wire: Wire, strategy: 'direct' | 'star' | 'daisy-chain', routePaths: RoutePath[], totalDistance: number) => {
    setCircuitRoutingStrategies(prev => ({ ...prev, [circuitId]: strategy }));
    setCircuitRouteDistances(prev => ({ ...prev, [circuitId]: totalDistance }));
    setCircuitRoutePaths(prev => ({ ...prev, [circuitId]: routePaths }));
    setCircuitWires(w => ({ ...w, [circuitId]: wire }));
    setCircuitCrimps(c => { const next = { ...c }; delete next[circuitId]; return next; });

    if (requiresCrimp) {
      setPendingCrimpCircuitId(circuitId);
      setPendingCrimpWire(wire);
    } else {
      setWiring(prev => {
        const newCircuits = { ...prev.circuits };
        newCircuits[circuitId] = { isWired: true, connectedWire: wire };
        const allWired = Object.values(newCircuits).every(c => c.isWired);
        return { ...prev, isWired: allWired, connectedWire: wire, circuits: newCircuits };
      });
    }
  }, [requiresCrimp, setCircuitWires, setCircuitCrimps, setWiring, setPendingCrimpCircuitId, setPendingCrimpWire]);

  // Floor plan: initiate wiring for a circuit (handles single vs multi room)
  const initiateFloorPlanWiring = useCallback((circuitId: CircuitId, wire: Wire) => {
    if (!currentFloorPlan) return;
    const rooms: string[] = [];
    for (const [roomId, cid] of roomToCircuitMap) {
      if (cid === circuitId) rooms.push(roomId);
    }
    if (rooms.length === 0) return;

    if (rooms.length === 1) {
      const { candidates } = calcRouteCandidates(currentFloorPlan, rooms);
      const direct = candidates.find(c => c.strategy === 'direct');
      if (direct) {
        const paths = Array.from(direct.paths.values());
        completeFloorPlanWiring(circuitId, wire, 'direct', paths, direct.totalDistance);
      }
    } else {
      const { candidates } = calcRouteCandidates(currentFloorPlan, rooms);
      if (candidates.length > 0) {
        setPendingRoutingCircuit({ circuitId, wire });
        setCandidateRoutes(candidates);
      }
    }
  }, [currentFloorPlan, roomToCircuitMap, completeFloorPlanWiring]);

  const handleSelectRoutingStrategy = useCallback((strategy: 'star' | 'daisy-chain') => {
    if (!pendingRoutingCircuit) return;
    const candidate = candidateRoutes.find(c => c.strategy === strategy);
    if (!candidate) return;
    const paths = Array.from(candidate.paths.values());
    completeFloorPlanWiring(pendingRoutingCircuit.circuitId, pendingRoutingCircuit.wire, strategy, paths, candidate.totalDistance);
    setPendingRoutingCircuit(null);
    setCandidateRoutes([]);
  }, [pendingRoutingCircuit, candidateRoutes, completeFloorPlanWiring]);

  const handleCancelRoutingStrategy = useCallback(() => {
    setPendingRoutingCircuit(null);
    setCandidateRoutes([]);
  }, []);

  const handleFloorPlanRoomHover = useCallback((roomId: string | null) => {
    setFloorPlanHighlightedRoom(roomId);
    floorPlanHighlightedRoomRef.current = roomId;
    if (roomId) {
      const cid = roomToCircuitMap.get(roomId) ?? null;
      setWiring(prev => ({ ...prev, targetCircuitId: cid }));
    } else {
      setWiring(prev => ({ ...prev, targetCircuitId: null }));
    }
  }, [roomToCircuitMap, setWiring, floorPlanHighlightedRoomRef]);

  const roomPopoverDismiss = useCallback(() => {
    // handled by planner hook
  }, []);

  const reset = useCallback(() => {
    setCircuitRoutingStrategies({});
    setCircuitRouteDistances({});
    setCircuitRoutePaths({});
    setPendingRoutingCircuit(null);
    setCandidateRoutes([]);
    setFloorPlanHighlightedRoom(null);
    floorPlanHighlightedRoomRef.current = null;
    setSidebarCollapsed(window.innerWidth <= 640);
  }, [floorPlanHighlightedRoomRef]);

  return {
    circuitRouteDistances,
    setCircuitRouteDistances,
    circuitRoutePaths,
    setCircuitRoutePaths,
    pendingRoutingCircuit,
    candidateRoutes,
    floorPlanHighlightedRoom,
    setFloorPlanHighlightedRoom,
    sidebarCollapsed,
    setSidebarCollapsed,
    roomPopoverDismiss,
    floorPlanCircuitAssignments,
    floorPlanConnectedPaths,
    floorPlanCandidatePaths,
    floorPlanSimulationState,
    floorPlanProblemRooms,
    floorPlanRoomCircuitMap,
    floorPlanApplianceCounts,
    floorPlanApplianceDetails,
    handleFloorPlanRoomHover,
    handleSelectRoutingStrategy,
    handleCancelRoutingStrategy,
    completeFloorPlanWiring,
    initiateFloorPlanWiring,
    reset,
  };
}
