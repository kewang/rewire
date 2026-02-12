import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import type { Wire, Appliance, Breaker, Level, CircuitId, CrimpResult, WiringState, OldHouseSnapshot } from '../types/game';
import type { CircuitSnapshot } from '../types/game';
import { DEFAULT_WIRES, CRIMP_QUALITY_MAP, OXIDIZED_CONTACT_RESISTANCE, BREAKER_20A } from '../data/constants';
import { isFixedCircuitLevel, isProblemResolved } from '../types/helpers';
import type { ProblemResolutionState } from '../types/helpers';
import { useTranslation } from 'react-i18next';

export interface UseOldHouseLogicParams {
  currentLevel: Level | null;
  circuitWires: Record<CircuitId, Wire>;
  circuitCrimps: Record<CircuitId, CrimpResult>;
  circuitElcb: Record<CircuitId, boolean>;
  wiring: WiringState;
  setCircuitWires: React.Dispatch<React.SetStateAction<Record<CircuitId, Wire>>>;
  setCircuitCrimps: React.Dispatch<React.SetStateAction<Record<CircuitId, CrimpResult>>>;
  setCircuitAppliances: React.Dispatch<React.SetStateAction<Record<CircuitId, Appliance[]>>>;
  setWiring: React.Dispatch<React.SetStateAction<WiringState>>;
  setCircuitElcb: React.Dispatch<React.SetStateAction<Record<CircuitId, boolean>>>;
}

export interface UseOldHouseLogicReturn {
  preWiredCircuitIds: Set<CircuitId>;
  setPreWiredCircuitIds: React.Dispatch<React.SetStateAction<Set<CircuitId>>>;
  preWiredCircuitIdsRef: React.RefObject<Set<CircuitId>>;
  circuitBreakers: Record<CircuitId, Breaker>;
  setCircuitBreakers: React.Dispatch<React.SetStateAction<Record<CircuitId, Breaker>>>;
  oldHouseSnapshot: OldHouseSnapshot | null;
  setOldHouseSnapshot: React.Dispatch<React.SetStateAction<OldHouseSnapshot | null>>;
  problemCircuits: Set<CircuitId>;
  handleUnwire: (circuitId: CircuitId) => void;
  handleChangeBreaker: (circuitId: CircuitId, breaker: Breaker) => void;
  initOldHouse: (level: Level) => void;
  reset: () => void;
}

export function useOldHouseLogic({
  currentLevel,
  circuitWires,
  circuitCrimps,
  circuitElcb,
  wiring,
  setCircuitWires,
  setCircuitCrimps,
  setCircuitAppliances,
  setWiring,
  setCircuitElcb,
}: UseOldHouseLogicParams): UseOldHouseLogicReturn {
  const { t } = useTranslation();
  const [preWiredCircuitIds, setPreWiredCircuitIds] = useState<Set<CircuitId>>(new Set());
  const preWiredCircuitIdsRef = useRef<Set<CircuitId>>(new Set());
  const [circuitBreakers, setCircuitBreakers] = useState<Record<CircuitId, Breaker>>({});
  const [oldHouseSnapshot, setOldHouseSnapshot] = useState<OldHouseSnapshot | null>(null);

  // Keep ref in sync
  useEffect(() => {
    preWiredCircuitIdsRef.current = preWiredCircuitIds;
  }, [preWiredCircuitIds]);

  // Derive unresolved problem circuits from state
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
  }, [t, setCircuitWires, setCircuitCrimps, setCircuitAppliances, setWiring]);

  const handleChangeBreaker = useCallback((circuitId: CircuitId, breaker: Breaker) => {
    setCircuitBreakers(prev => ({ ...prev, [circuitId]: breaker }));
  }, []);

  const initOldHouse = useCallback((level: Level) => {
    if (!isFixedCircuitLevel(level) || !level.oldHouse) return;
    const oh = level.oldHouse;
    const ids = level.circuitConfigs.map(c => c.id);

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

    const preBreakers: Record<CircuitId, Breaker> = {};
    for (const config of level.circuitConfigs) {
      const pw = oh.preWiredCircuits[config.id];
      preBreakers[config.id] = pw?.breaker ?? config.breaker;
    }
    setCircuitBreakers(preBreakers);

    const initElcb: Record<CircuitId, boolean> = {};
    for (const config of level.circuitConfigs) {
      const hasMissingElcb = oh.problems.some(p => p.circuitId === config.id && p.type === 'missing-elcb');
      if (hasMissingElcb) {
        initElcb[config.id] = false;
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

    // Capture Before snapshot
    const snapshotCircuits: Record<CircuitId, CircuitSnapshot> = {};
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
  }, [setCircuitWires, setCircuitAppliances, setCircuitCrimps, setCircuitElcb, setWiring]);

  const reset = useCallback(() => {
    setPreWiredCircuitIds(new Set());
    preWiredCircuitIdsRef.current = new Set();
    setCircuitBreakers({});
    setOldHouseSnapshot(null);
  }, []);

  return {
    preWiredCircuitIds,
    setPreWiredCircuitIds,
    preWiredCircuitIdsRef,
    circuitBreakers,
    setCircuitBreakers,
    oldHouseSnapshot,
    setOldHouseSnapshot,
    problemCircuits,
    handleUnwire,
    handleChangeBreaker,
    initOldHouse,
    reset,
  };
}
