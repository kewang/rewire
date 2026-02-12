import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Wire, Appliance, Breaker, Level, Circuit, CircuitConfig, WiringState, CircuitId, CrimpResult } from '../types/game';
import { DEFAULT_WIRES } from '../data/constants';
import { isFixedCircuitLevel, isFreeCircuitLevel } from '../types/helpers';
import { tRoomName } from '../i18nHelpers';

export function createInitialWiring(circuitIds: CircuitId[]): WiringState {
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

export function createInitialCircuitWires(circuitIds: CircuitId[]): Record<CircuitId, Wire> {
  const result: Record<CircuitId, Wire> = {};
  for (const id of circuitIds) {
    result[id] = DEFAULT_WIRES[0];
  }
  return result;
}

export interface UseCircuitStateParams {
  currentLevel: Level | null;
  circuitConfigs: CircuitConfig[];
  circuitBreakers: Record<CircuitId, Breaker>;
  // Refs that get updated later to break circular dependency
  initiateFloorPlanWiringRef: React.RefObject<(circuitId: CircuitId, wire: Wire) => void>;
  floorPlanHighlightedRoomRef: React.RefObject<string | null>;
  currentFloorPlan: Level['floorPlan'];
  roomToCircuitMap: Map<string, CircuitId>;
}

export interface UseCircuitStateReturn {
  circuits: Circuit[];
  circuitsRef: React.RefObject<Circuit[]>;
  circuitWires: Record<CircuitId, Wire>;
  setCircuitWires: React.Dispatch<React.SetStateAction<Record<CircuitId, Wire>>>;
  circuitAppliances: Record<CircuitId, Appliance[]>;
  setCircuitAppliances: React.Dispatch<React.SetStateAction<Record<CircuitId, Appliance[]>>>;
  circuitCrimps: Record<CircuitId, CrimpResult>;
  setCircuitCrimps: React.Dispatch<React.SetStateAction<Record<CircuitId, CrimpResult>>>;
  wiring: WiringState;
  setWiring: React.Dispatch<React.SetStateAction<WiringState>>;
  circuitElcb: Record<CircuitId, boolean>;
  setCircuitElcb: React.Dispatch<React.SetStateAction<Record<CircuitId, boolean>>>;
  circuitPhases: Record<CircuitId, 'R' | 'T'>;
  setCircuitPhases: React.Dispatch<React.SetStateAction<Record<CircuitId, 'R' | 'T'>>>;
  pendingCrimpCircuitId: CircuitId | null;
  pendingCrimpWire: Wire | null;
  setPendingCrimpCircuitId: React.Dispatch<React.SetStateAction<CircuitId | null>>;
  setPendingCrimpWire: React.Dispatch<React.SetStateAction<Wire | null>>;
  handleDragStart: (wire: Wire) => void;
  handleDragMove: (pos: { x: number; y: number } | null) => void;
  handleDragEnd: (dropped: boolean) => void;
  handleCrimpComplete: (result: CrimpResult) => void;
  handleTargetCircuitChange: (circuitId: CircuitId | null) => void;
  handleToggleElcb: (circuitId: CircuitId) => void;
  handleTogglePhase: (circuitId: CircuitId) => void;
  handleAddAppliance: (circuitId: CircuitId, a: Appliance) => void;
  handleRemoveAppliance: (circuitId: CircuitId, index: number) => void;
  // Refs for simulation loop
  circuitWiresRef: React.RefObject<Record<CircuitId, Wire>>;
  circuitElcbRef: React.RefObject<Record<CircuitId, boolean>>;
  circuitPhasesRef: React.RefObject<Record<CircuitId, 'R' | 'T'>>;
  circuitCrimpsRef: React.RefObject<Record<CircuitId, CrimpResult>>;
  reset: (circuitIds: CircuitId[], level: Level | null) => void;
}

export function useCircuitState({
  currentLevel,
  circuitConfigs,
  circuitBreakers,
  initiateFloorPlanWiringRef,
  floorPlanHighlightedRoomRef,
  currentFloorPlan,
  roomToCircuitMap,
}: UseCircuitStateParams): UseCircuitStateReturn {
  const { t } = useTranslation();
  const [circuitWires, setCircuitWires] = useState<Record<CircuitId, Wire>>({});
  const [circuitAppliances, setCircuitAppliances] = useState<Record<CircuitId, Appliance[]>>({});
  const [circuitCrimps, setCircuitCrimps] = useState<Record<CircuitId, CrimpResult>>({});
  const [wiring, setWiring] = useState<WiringState>(createInitialWiring([]));
  const [circuitElcb, setCircuitElcb] = useState<Record<CircuitId, boolean>>({});
  const [circuitPhases, setCircuitPhases] = useState<Record<CircuitId, 'R' | 'T'>>({});
  const [pendingCrimpCircuitId, setPendingCrimpCircuitId] = useState<CircuitId | null>(null);
  const [pendingCrimpWire, setPendingCrimpWire] = useState<Wire | null>(null);

  // Refs for simulation loop access
  const circuitWiresRef = useRef(circuitWires);
  useEffect(() => { circuitWiresRef.current = circuitWires; }, [circuitWires]);

  const circuitElcbRef = useRef(circuitElcb);
  useEffect(() => { circuitElcbRef.current = circuitElcb; }, [circuitElcb]);

  const circuitPhasesRef = useRef(circuitPhases);
  useEffect(() => { circuitPhasesRef.current = circuitPhases; }, [circuitPhases]);

  const circuitCrimpsRef = useRef(circuitCrimps);
  useEffect(() => { circuitCrimpsRef.current = circuitCrimps; }, [circuitCrimps]);

  // Derive circuits from configs + per-circuit state
  const circuits = useMemo(() =>
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

  const circuitsRef = useRef(circuits);
  useEffect(() => { circuitsRef.current = circuits; }, [circuits]);

  // Sync connectedWire -> circuitWires per circuit (render-time state adjustment)
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

  // Wiring drag callbacks
  const handleDragStart = useCallback((wire: Wire) => {
    setWiring(prev => ({ ...prev, isDragging: true, dragWire: wire }));
  }, []);

  const handleDragMove = useCallback((pos: { x: number; y: number } | null) => {
    setWiring(prev => ({ ...prev, cursorPos: pos }));
  }, []);

  const handleDragEnd = useCallback((dropped: boolean) => {
    // Floor plan mode: use highlighted room ref to resolve target circuit (avoid stale closure)
    const highlightedRoom = floorPlanHighlightedRoomRef.current;
    if (currentFloorPlan && dropped && wiring.dragWire && highlightedRoom) {
      const cid = roomToCircuitMap.get(highlightedRoom);
      if (cid) {
        initiateFloorPlanWiringRef.current(cid, wiring.dragWire);
      }
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
          setCircuitWires(w => ({ ...w, [tid]: prev.dragWire! }));
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
  }, [currentLevel?.requiresCrimp, currentFloorPlan, wiring.dragWire, roomToCircuitMap, initiateFloorPlanWiringRef, floorPlanHighlightedRoomRef]);

  const handleCrimpComplete = useCallback((result: CrimpResult) => {
    const cid = pendingCrimpCircuitId;
    if (!cid) return;
    setCircuitCrimps(prev => ({ ...prev, [cid]: result }));
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
    setPendingCrimpCircuitId(null);
    setPendingCrimpWire(null);
  }, [pendingCrimpCircuitId, pendingCrimpWire]);

  const handleTargetCircuitChange = useCallback((circuitId: CircuitId | null) => {
    setWiring(prev => ({ ...prev, targetCircuitId: circuitId }));
  }, []);

  const handleToggleElcb = useCallback((circuitId: CircuitId) => {
    setCircuitElcb(prev => ({ ...prev, [circuitId]: !prev[circuitId] }));
  }, []);

  // Note: isPowered guard is applied by GameBoard before calling this
  const handleTogglePhase = useCallback((circuitId: CircuitId) => {
    if (currentLevel?.phaseMode !== 'manual') return;
    setCircuitPhases(prev => ({
      ...prev,
      [circuitId]: prev[circuitId] === 'R' ? 'T' : 'R',
    }));
  }, [currentLevel?.phaseMode]);

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

  const reset = useCallback((newCircuitIds: CircuitId[], level: Level | null) => {
    setPendingCrimpCircuitId(null);
    setPendingCrimpWire(null);

    if (level && isFreeCircuitLevel(level)) {
      setCircuitWires({});
      setCircuitAppliances({});
      setCircuitCrimps({});
      setWiring(createInitialWiring([]));
      setCircuitPhases({});
      setCircuitElcb({});
    } else if (level && isFixedCircuitLevel(level) && level.oldHouse) {
      // Old house re-init handled by oldHouseLogic.initOldHouse
      // This reset just clears phases; oldHouse init sets the rest
      const phases: Record<CircuitId, 'R' | 'T'> = {};
      for (const config of level.circuitConfigs) {
        if (config.phase) phases[config.id] = config.phase;
      }
      setCircuitPhases(phases);
    } else if (level && isFixedCircuitLevel(level)) {
      // Normal fixed level
      const ids = level.circuitConfigs.map(c => c.id);
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
      setCircuitElcb({});
      const phases: Record<CircuitId, 'R' | 'T'> = {};
      for (const config of level.circuitConfigs) {
        if (config.phase) phases[config.id] = config.phase;
      }
      setCircuitPhases(phases);
    } else {
      // Back to levels or no level
      setCircuitWires({});
      setCircuitAppliances({});
      setCircuitCrimps({});
      setWiring(createInitialWiring(newCircuitIds));
      setCircuitPhases({});
      setCircuitElcb({});
    }
  }, []);

  return {
    circuits,
    circuitsRef,
    circuitWires,
    setCircuitWires,
    circuitAppliances,
    setCircuitAppliances,
    circuitCrimps,
    setCircuitCrimps,
    wiring,
    setWiring,
    circuitElcb,
    setCircuitElcb,
    circuitPhases,
    setCircuitPhases,
    pendingCrimpCircuitId,
    pendingCrimpWire,
    setPendingCrimpCircuitId,
    setPendingCrimpWire,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleCrimpComplete,
    handleTargetCircuitChange,
    handleToggleElcb,
    handleTogglePhase,
    handleAddAppliance,
    handleRemoveAppliance,
    circuitWiresRef,
    circuitElcbRef,
    circuitPhasesRef,
    circuitCrimpsRef,
    reset,
  };
}
