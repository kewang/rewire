import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Wire, Breaker, Appliance, Level, CircuitId, CircuitConfig, WiringState, PlannerCircuit, ApplianceAssignment, GamePhase } from '../types/game';
import { DEFAULT_WIRE_LENGTH, ELCB_COST, NFB_COSTS, BREAKER_20A } from '../data/constants';
import { isFreeCircuitLevel, isFixedCircuitLevel } from '../types/helpers';

export interface PlannerConfirmResult {
  resolvedConfigs: CircuitConfig[];
  circuitWires: Record<CircuitId, Wire>;
  circuitAppliances: Record<CircuitId, Appliance[]>;
  wiring: WiringState;
  circuitPhases: Record<CircuitId, 'R' | 'T'>;
  circuitElcb: Record<CircuitId, boolean>;
  resolvedLeakageEvents: readonly { time: number; circuitId: CircuitId }[] | null;
  circuitIds: CircuitId[];
}

export interface UsePlannerStateParams {
  currentLevel: Level | null;
  currentFloorPlan: Level['floorPlan'];
}

export interface UsePlannerStateReturn {
  gamePhase: GamePhase;
  setGamePhase: React.Dispatch<React.SetStateAction<GamePhase>>;
  plannerCircuits: PlannerCircuit[];
  roomToCircuitMap: Map<string, CircuitId>;
  selectedPlannerCircuitId: string | null;
  setSelectedPlannerCircuitId: React.Dispatch<React.SetStateAction<string | null>>;
  plannerTotalCost: number;
  plannerAllAssigned: boolean;
  plannerAllWired: boolean;
  plannerWetAreaMissingElcb: boolean;
  plannerCanConfirm: boolean;
  plannerConfirmTooltip: string | undefined;
  handleAddPlannerCircuit: () => void;
  handleDeletePlannerCircuit: (id: string) => void;
  handleChangePlannerVoltage: (id: string, voltage: 110 | 220) => void;
  handleChangePlannerBreaker: (id: string, breaker: Breaker) => void;
  handleSelectPlannerWire: (id: string, wire: Wire) => void;
  handleAssignAppliance: (appliance: Appliance, roomId: string, roomApplianceIndex: number) => void;
  handleUnassignPlannerAppliance: (circuitId: string, applianceIndex: number) => void;
  handleChangePlannerPhase: (id: string, phase: 'R' | 'T') => void;
  handleChangePlannerElcb: (id: string, enabled: boolean) => void;
  handleAssignRoomToCircuit: (roomId: string, circuitId: string) => void;
  handleAddCircuitAndAssignRoom: (roomId: string) => void;
  handleUnassignRoom: (roomId: string) => void;
  handleConfirmPlanning: () => PlannerConfirmResult | null;
  roomPopover: { roomId: string; roomName: string; pos: { x: number; y: number }; currentCircuitId: string | null } | null;
  setRoomPopover: React.Dispatch<React.SetStateAction<{ roomId: string; roomName: string; pos: { x: number; y: number }; currentCircuitId: string | null } | null>>;
  handleFloorPlanRoomClick: (roomId: string) => void;
  reset: (level: Level | null) => void;
}

export function usePlannerState({ currentLevel, currentFloorPlan }: UsePlannerStateParams): UsePlannerStateReturn {
  const { t } = useTranslation();
  const [gamePhase, setGamePhase] = useState<GamePhase>('active');
  const [plannerCircuits, setPlannerCircuits] = useState<PlannerCircuit[]>([]);
  const [plannerNextId, setPlannerNextId] = useState(1);
  const [selectedPlannerCircuitId, setSelectedPlannerCircuitId] = useState<string | null>(null);
  const [roomPopover, setRoomPopover] = useState<{ roomId: string; roomName: string; pos: { x: number; y: number }; currentCircuitId: string | null } | null>(null);

  const isFreeLevel = currentLevel != null && isFreeCircuitLevel(currentLevel);

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

  const handleAddPlannerCircuit = useCallback(() => {
    const hasPhaseMode = currentLevel != null && 'phaseMode' in currentLevel && currentLevel.phaseMode != null;
    setPlannerCircuits(prev => {
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
      const filtered = c.assignedAppliances.filter(a => a.appliance.voltage === voltage);
      const phase = voltage === 220 ? undefined : (hasPhaseMode ? 'R' as const : undefined);
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
    const matching = plannerCircuits.filter(c => c.voltage === appliance.voltage);
    if (matching.length === 0) return;

    let targetId: string | null = null;
    if (selectedPlannerCircuitId) {
      const selected = matching.find(c => c.id === selectedPlannerCircuitId);
      if (selected) {
        targetId = selected.id;
      }
    } else if (matching.length === 1) {
      targetId = matching[0].id;
    }

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

  const handleAssignRoomToCircuit = useCallback((roomId: string, circuitId: string) => {
    if (!currentLevel || !isFreeCircuitLevel(currentLevel)) return;
    const room = currentLevel.rooms.find(r => r.id === roomId);
    if (!room) return;

    const circuit = plannerCircuits.find(c => c.id === circuitId);
    if (!circuit) return;

    setPlannerCircuits(prev => {
      let updated = prev.map(c => ({
        ...c,
        assignedAppliances: c.assignedAppliances.filter(a => a.roomId !== roomId),
      }));
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

  const handleFloorPlanRoomClick = useCallback((roomId: string) => {
    const currentFloorPlan = currentLevel?.floorPlan ?? null;
    if (!currentFloorPlan || !currentLevel) return;
    if (gamePhase !== 'planning') return;
    if (!isFreeCircuitLevel(currentLevel)) return;

    const room = currentFloorPlan.rooms.find(r => r.id === roomId);
    if (!room) return;
    const roomName = room.label;

    const levelRoom = currentLevel.rooms.find(r => r.id === roomId);
    if (!levelRoom || levelRoom.appliances.length === 0) return;

    let currentCircuitId: string | null = null;
    for (const c of plannerCircuits) {
      if (c.assignedAppliances.some(a => a.roomId === roomId)) {
        currentCircuitId = c.id;
        break;
      }
    }

    if (selectedPlannerCircuitId && !currentCircuitId) {
      handleAssignRoomToCircuit(roomId, selectedPlannerCircuitId);
      return;
    }

    const svgEl = document.querySelector('.floor-plan-view');
    const roomEl = svgEl?.querySelector(`[data-room-id="${roomId}"]`);
    let pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    if (roomEl) {
      const rect = roomEl.getBoundingClientRect();
      pos = { x: rect.right + 4, y: rect.top };
    }
    setRoomPopover({ roomId, roomName, pos, currentCircuitId });
  }, [currentLevel, gamePhase, plannerCircuits, selectedPlannerCircuitId, handleAssignRoomToCircuit]);

  const handleUnassignRoom = useCallback((roomId: string) => {
    setPlannerCircuits(prev => prev.map(c => ({
      ...c,
      assignedAppliances: c.assignedAppliances.filter(a => a.roomId !== roomId),
    })));
    setRoomPopover(null);
  }, []);

  // Planner cost
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
  const handleConfirmPlanning = useCallback((): PlannerConfirmResult | null => {
    if (!currentLevel || !isFreeCircuitLevel(currentLevel)) return null;
    if (!plannerCanConfirm) return null;

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
      if (currentLevel.requiresCrimp || currentLevel.floorPlan) {
        wiringCircuits[cid] = { isWired: false, connectedWire: null };
      } else {
        wiringCircuits[cid] = { isWired: true, connectedWire: pc.selectedWire };
      }
    }

    // Resolve scripted leakageEvent circuitIds
    let resolvedLeakageEvents: readonly { time: number; circuitId: CircuitId }[] | null = null;
    if (currentLevel.leakageMode === 'scripted' && currentLevel.leakageEvents) {
      const wetAreaCircuitIds = ids.filter((_id, idx) => {
        const pc = plannerCircuits[idx];
        return pc.assignedAppliances.some(a => wetAreaRoomIds.has(a.roomId));
      });
      resolvedLeakageEvents = currentLevel.leakageEvents.map((evt, evtIdx) => ({
        ...evt,
        circuitId: wetAreaCircuitIds[evtIdx % wetAreaCircuitIds.length] ?? evt.circuitId,
      }));
    }

    const newWiring: WiringState = {
      isDragging: false,
      dragWire: null,
      cursorPos: null,
      isWired: !currentLevel.requiresCrimp,
      connectedWire: null,
      circuits: wiringCircuits,
      targetCircuitId: null,
    };

    setGamePhase('active');

    return {
      resolvedConfigs: configs,
      circuitWires: wires,
      circuitAppliances: appls,
      wiring: newWiring,
      circuitPhases: phases,
      circuitElcb: elcbs,
      resolvedLeakageEvents,
      circuitIds: ids,
    };
  }, [currentLevel, plannerCircuits, plannerCanConfirm, t]);

  const reset = useCallback((level: Level | null) => {
    if (level && isFreeCircuitLevel(level)) {
      setGamePhase('planning');
    } else {
      setGamePhase('active');
    }
    setPlannerCircuits([]);
    setPlannerNextId(1);
    setSelectedPlannerCircuitId(null);
    setRoomPopover(null);
  }, []);

  return {
    gamePhase,
    setGamePhase,
    plannerCircuits,
    roomToCircuitMap,
    selectedPlannerCircuitId,
    setSelectedPlannerCircuitId,
    plannerTotalCost,
    plannerAllAssigned,
    plannerAllWired,
    plannerWetAreaMissingElcb,
    plannerCanConfirm,
    plannerConfirmTooltip,
    handleAddPlannerCircuit,
    handleDeletePlannerCircuit,
    handleChangePlannerVoltage,
    handleChangePlannerBreaker,
    handleSelectPlannerWire,
    handleAssignAppliance,
    handleUnassignPlannerAppliance,
    handleChangePlannerPhase,
    handleChangePlannerElcb,
    handleAssignRoomToCircuit,
    handleAddCircuitAndAssignRoom,
    handleUnassignRoom,
    handleConfirmPlanning,
    roomPopover,
    setRoomPopover,
    handleFloorPlanRoomClick,
    reset,
  };
}
