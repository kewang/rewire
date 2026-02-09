import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { Wire, Appliance, Circuit, Level, MultiCircuitState, WiringState, CircuitId, CircuitConfig, CircuitState, CrimpResult, CableTieQuality } from '../types/game';
import { DEFAULT_WIRES, DEFAULT_WIRE_LENGTH, ELCB_COST, LEAKAGE_CHANCE_PER_SECOND, CRIMP_QUALITY_MAP, OXIDIZED_CONTACT_RESISTANCE } from '../data/constants';
import { LEVELS } from '../data/levels';
import { createInitialMultiState, stepMulti } from '../engine/simulation';
import { calcStars, saveBestStars } from '../engine/scoring';
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
import { LANE_WIDTH, PANEL_PADDING, ROUTING_TOP, ROUTING_HEIGHT, wireStartX } from './panelLayout';
import { detectCrossings, getCrossingPairIndices, countUnbundledPairs, calcAestheticsScore } from '../engine/aesthetics';

type GameResult = 'none' | 'tripped' | 'burned' | 'neutral-burned' | 'leakage' | 'won' | 'over-budget';

const EMPTY_CONFIGS: CircuitConfig[] = [];

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


export default function GameBoard() {
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
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
  const [problemCircuits, setProblemCircuits] = useState<Set<CircuitId>>(new Set());
  const [preWiredCircuitIds, setPreWiredCircuitIds] = useState<Set<CircuitId>>(new Set());
  const preWiredCircuitIdsRef = useRef<Set<CircuitId>>(new Set());
  const [circuitLanes, setCircuitLanes] = useState<CircuitId[]>([]);
  const [cableTies, setCableTies] = useState<Map<number, CableTieQuality>>(new Map());
  const [routingCompleted, setRoutingCompleted] = useState(false);
  const [showRoutingOverlay, setShowRoutingOverlay] = useState(false);
  const [finalAestheticsScore, setFinalAestheticsScore] = useState<number | undefined>(undefined);
  const aestheticsScoreRef = useRef<number | undefined>(undefined);

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

  // Derive circuitIds from current level
  const circuitConfigs = currentLevel?.circuitConfigs ?? EMPTY_CONFIGS;
  const circuitIds = useMemo(() => circuitConfigs.map(c => c.id), [circuitConfigs]);

  // Build Circuit[] from circuitConfigs + circuitWires + circuitAppliances + circuitCrimps
  const circuits: Circuit[] = useMemo(() =>
    circuitConfigs.map(config => ({
      id: config.id,
      label: config.label,
      voltage: config.voltage,
      breaker: config.breaker,
      wire: circuitWires[config.id] ?? DEFAULT_WIRES[0],
      appliances: circuitAppliances[config.id] ?? [],
      contactResistance: circuitCrimps[config.id]?.contactResistance,
    })),
    [circuitConfigs, circuitWires, circuitAppliances, circuitCrimps]
  );

  const circuitsRef = useRef<Circuit[]>(circuits);
  useEffect(() => { circuitsRef.current = circuits; }, [circuits]);

  const currentLevelRef = useRef(currentLevel);
  useEffect(() => { currentLevelRef.current = currentLevel; }, [currentLevel]);

  const circuitWiresRef = useRef(circuitWires);
  useEffect(() => { circuitWiresRef.current = circuitWires; }, [circuitWires]);

  const circuitElcbRef = useRef(circuitElcb);
  useEffect(() => { circuitElcbRef.current = circuitElcb; }, [circuitElcb]);

  const circuitPhasesRef = useRef(circuitPhases);
  useEffect(() => { circuitPhasesRef.current = circuitPhases; }, [circuitPhases]);

  const circuitCrimpsRef = useRef(circuitCrimps);
  useEffect(() => { circuitCrimpsRef.current = circuitCrimps; }, [circuitCrimps]);

  // Total cost: sum of all circuits' wire costs + ELCB costs (skip pre-wired circuits in old house mode)
  const totalCost = useMemo(() => {
    return circuitIds.reduce((sum, id) => {
      const elcbCost = circuitElcb[id] ? ELCB_COST : 0;
      if (preWiredCircuitIds.has(id)) return sum + elcbCost;
      const wire = circuitWires[id] ?? DEFAULT_WIRES[0];
      const wireCost = wire.costPerMeter * DEFAULT_WIRE_LENGTH;
      return sum + wireCost + elcbCost;
    }, 0);
  }, [circuitIds, circuitWires, circuitElcb, preWiredCircuitIds]);

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

  // Routing readiness: all wired + crimped (if requiresCrimp) → show routing button
  const routingReady = currentLevel?.requiresRouting === true && allWired && !crimpMissing;

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

  // rAF simulation loop
  const tick = useCallback((timestamp: number) => {
    if (prevTimeRef.current === 0) {
      prevTimeRef.current = timestamp;
    }
    const dt = Math.min((timestamp - prevTimeRef.current) / 1000, 0.1);
    prevTimeRef.current = timestamp;

    const phases = Object.keys(circuitPhasesRef.current).length > 0 ? circuitPhasesRef.current : undefined;
    let newMultiState = stepMulti(circuitsRef.current, multiStateRef.current, dt, phases);

    // Leakage event processing
    const curLevel = currentLevelRef.current;
    if (curLevel?.leakageMode) {
      const elcbs = circuitElcbRef.current;
      const wetAreaConfigs = curLevel.circuitConfigs.filter(c => c.wetArea);
      const updatedStates: Record<CircuitId, CircuitState> = { ...newMultiState.circuitStates };

      if (curLevel.leakageMode === 'scripted' && curLevel.leakageEvents) {
        for (let i = 0; i < curLevel.leakageEvents.length; i++) {
          const evt = curLevel.leakageEvents[i];
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

    // Terminal state: tripped, burned, neutral-burned, or leakage (use overallStatus)
    if (newMultiState.overallStatus === 'tripped' || newMultiState.overallStatus === 'burned' || newMultiState.overallStatus === 'neutral-burned' || newMultiState.overallStatus === 'leakage') {
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
      // Sum wire + ELCB costs from all circuits at this moment (skip pre-wired)
      const wires = circuitWiresRef.current;
      const elcbs = circuitElcbRef.current;
      const finalCost = Object.entries(wires).reduce(
        (sum, [id, w]) => {
          const elcbCost = elcbs[id] ? ELCB_COST : 0;
          if (preWiredCircuitIdsRef.current.has(id)) return sum + elcbCost;
          return sum + w.costPerMeter * DEFAULT_WIRE_LENGTH + elcbCost;
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
      });
      setStarResult(sr);

      // Save best stars to localStorage
      const levelIndex = LEVELS.indexOf(level);
      if (levelIndex >= 0 && sr.stars > 0) {
        saveBestStars(levelIndex, sr.stars);
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
    setIsPowered(false);
    setResult('none');
    setStarResult(null);
    setPendingCrimpCircuitId(null);
    setPendingCrimpWire(null);
    setMultiState(createInitialMultiState(circuitIds));
    setCircuitLanes(currentLevel?.initialLanes ? [...currentLevel.initialLanes] : circuitIds);
    setCableTies(new Map());
    setRoutingCompleted(false);
    setShowRoutingOverlay(false);
    setFinalAestheticsScore(undefined);

    if (currentLevel?.oldHouse) {
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
      const wiringCircuits: WiringState['circuits'] = {};
      for (const id of ids) {
        wiringCircuits[id] = { isWired: true, connectedWire: preWires[id] ?? null };
      }
      setWiring({
        isDragging: false, dragWire: null, cursorPos: null,
        isWired: true, connectedWire: null, circuits: wiringCircuits, targetCircuitId: null,
      });
      setProblemCircuits(new Set(oh.problems.map(p => p.circuitId)));
      setPreWiredCircuitIds(new Set(ids));
      preWiredCircuitIdsRef.current = new Set(ids);
      setCircuitElcb({});
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
    setProblemCircuits(new Set());
    setPreWiredCircuitIds(new Set());
    preWiredCircuitIdsRef.current = new Set();
    setCircuitLanes([]);
    setCableTies(new Map());
    setRoutingCompleted(false);
    setShowRoutingOverlay(false);
    setFinalAestheticsScore(undefined);
    setCurrentLevel(null);
    setWiring(createInitialWiring([]));
  }, []);

  const handleSelectLevel = useCallback((level: Level) => {
    const ids = level.circuitConfigs.map(c => c.id);
    setCurrentLevel(level);
    setCircuitElcb({});
    setPendingCrimpCircuitId(null);
    setPendingCrimpWire(null);
    setStarResult(null);

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

      const wiringCircuits: WiringState['circuits'] = {};
      for (const id of ids) {
        wiringCircuits[id] = { isWired: true, connectedWire: preWires[id] ?? null };
      }
      setWiring({
        isDragging: false, dragWire: null, cursorPos: null,
        isWired: true, connectedWire: null, circuits: wiringCircuits, targetCircuitId: null,
      });

      setProblemCircuits(new Set(oh.problems.map(p => p.circuitId)));
      setPreWiredCircuitIds(new Set(ids));
      preWiredCircuitIdsRef.current = new Set(ids);
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
      setProblemCircuits(new Set());
      setPreWiredCircuitIds(new Set());
    preWiredCircuitIdsRef.current = new Set();
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
  }, []);

  // Wiring drag callbacks
  const handleDragStart = useCallback((wire: Wire) => {
    setWiring(prev => ({ ...prev, isDragging: true, dragWire: wire }));
  }, []);

  const handleDragMove = useCallback((pos: { x: number; y: number } | null) => {
    setWiring(prev => ({ ...prev, cursorPos: pos }));
  }, []);

  const handleDragEnd = useCallback((dropped: boolean) => {
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
  }, [currentLevel?.requiresCrimp]);

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
    // Check if this repairs a problem circuit (must have been unwired first = not in preWiredCircuitIds)
    setProblemCircuits(prev => {
      if (prev.has(cid) && !preWiredCircuitIdsRef.current.has(cid)) {
        const next = new Set(prev);
        next.delete(cid);
        return next;
      }
      return prev;
    });
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

  // Old house mode: unwire a circuit
  const handleUnwire = useCallback((circuitId: CircuitId) => {
    if (!window.confirm('確定要拆除此迴路的線材嗎？舊線材將被丟棄。')) return;
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
  }, []);

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

  // Level select screen
  if (!currentLevel) {
    return <LevelSelect levels={LEVELS} onSelect={handleSelectLevel} />;
  }

  return (
    <div className={`game-board${circuitConfigs.length > 1 ? ' multi-circuit' : ''}`}>
      <header className="game-header">
        <div className="header-top">
          <button className="back-button" onClick={handleBackToLevels}>← 返回</button>
          <h1>{currentLevel.name}</h1>
          <span className="level-goal">通電 {currentLevel.survivalTime}秒</span>
        </div>
        <StatusDisplay
          circuits={circuits}
          multiState={multiState}
          cost={totalCost}
          budget={currentLevel.budget}
          survivalTime={currentLevel.survivalTime}
          phases={Object.keys(circuitPhases).length > 0 ? circuitPhases : undefined}
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
            leverTooltip={!isPowered && !canPowerOn ? (problemsRemaining ? '請先修復所有問題迴路' : wetAreaMissingElcb ? '潮濕區域迴路需安裝 ELCB' : !allWired ? '請先完成所有迴路接線' : crimpMissing ? '請先完成所有迴路壓接' : routingMissing ? '請先完成整線' : '請先分配電器') : undefined}
            onTargetCircuitChange={handleTargetCircuitChange}
            phases={Object.keys(circuitPhases).length > 0 ? circuitPhases : undefined}
            phaseMode={currentLevel?.phaseMode}
            onTogglePhase={handleTogglePhase}
            circuitCrimps={Object.keys(circuitCrimps).length > 0 ? circuitCrimps : undefined}
            problemCircuits={problemCircuits}
            preWiredCircuitIds={preWiredCircuitIds}
            onUnwire={handleUnwire}
            isOldHouse={!!currentLevel?.oldHouse}
            oldHouseProblems={currentLevel?.oldHouse?.problems}
          />
          {routingReady && !isPowered && (
            <button
              className="routing-button"
              onClick={() => setShowRoutingOverlay(true)}
            >
              {routingCompleted ? '重新整線' : '整線'}
            </button>
          )}
        </section>

        <section className="panel-right">
          <AppliancePanel
            circuitConfigs={currentLevel.circuitConfigs}
            circuitAppliances={circuitAppliances}
            onAdd={handleAddAppliance}
            onRemove={handleRemoveAppliance}
            disabled={isPowered}
            isPowered={isPowered}
          />
          {hasAnyElcbOption && (
            <div className="elcb-panel">
              <h3 className="elcb-panel-title">ELCB 漏電斷路器 (${ELCB_COST}/迴路)</h3>
              {circuitConfigs.filter(c => c.elcbAvailable).map(config => (
                <label key={config.id} className="elcb-toggle">
                  <input
                    type="checkbox"
                    checked={!!circuitElcb[config.id]}
                    onChange={() => handleToggleElcb(config.id)}
                    disabled={isPowered}
                  />
                  <span className="elcb-label">{config.label}</span>
                </label>
              ))}
            </div>
          )}
        </section>
      </main>

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

      {pendingCrimpCircuitId && pendingCrimpWire && (
        <CrimpMiniGame
          wire={pendingCrimpWire}
          circuitLabel={circuitConfigs.find(c => c.id === pendingCrimpCircuitId)?.label ?? pendingCrimpCircuitId}
          onComplete={handleCrimpComplete}
        />
      )}
    </div>
  );
}
