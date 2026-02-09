import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { Wire, Appliance, Circuit, Level, MultiCircuitState, WiringState, CircuitId, CircuitConfig, CircuitState, CrimpResult } from '../types/game';
import { DEFAULT_WIRES, DEFAULT_WIRE_LENGTH, ELCB_COST, LEAKAGE_CHANCE_PER_SECOND } from '../data/constants';
import { LEVELS } from '../data/levels';
import { createInitialMultiState, stepMulti } from '../engine/simulation';
import { playPowerOn, playTripped, playBurned, playWin, startBuzzing, updateBuzzingVolume, stopBuzzing, startApplianceSounds, stopApplianceSounds } from '../engine/audio';
import WireSelector from './WireSelector';
import AppliancePanel from './AppliancePanel';
import StatusDisplay from './StatusDisplay';
import ResultPanel from './ResultPanel';
import LevelSelect from './LevelSelect';
import CircuitDiagram from './CircuitDiagram';
import CrimpMiniGame from './CrimpMiniGame';

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

  const rafRef = useRef<number>(0);
  const prevTimeRef = useRef<number>(0);
  const multiStateRef = useRef<MultiCircuitState>(multiState);
  const buzzingRef = useRef(false);
  const tickRef = useRef<FrameRequestCallback>(() => {});

  useEffect(() => {
    multiStateRef.current = multiState;
  }, [multiState]);

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

  // Total cost: sum of all circuits' wire costs + ELCB costs
  const totalCost = useMemo(() => {
    return circuitIds.reduce((sum, id) => {
      const wire = circuitWires[id] ?? DEFAULT_WIRES[0];
      const wireCost = wire.costPerMeter * DEFAULT_WIRE_LENGTH;
      const elcbCost = circuitElcb[id] ? ELCB_COST : 0;
      return sum + wireCost + elcbCost;
    }, 0);
  }, [circuitIds, circuitWires, circuitElcb]);

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
  const canPowerOn = hasAnyAppliance && allWired && !wetAreaMissingElcb && !crimpMissing;

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
      if (!buzzingRef.current) {
        startBuzzing();
        buzzingRef.current = true;
      }
      updateBuzzingVolume(maxWarnHeat);
    } else if (buzzingRef.current) {
      stopBuzzing();
      buzzingRef.current = false;
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
      // Sum wire + ELCB costs from all circuits at this moment
      const wires = circuitWiresRef.current;
      const elcbs = circuitElcbRef.current;
      const finalCost = Object.entries(wires).reduce(
        (sum, [id, w]) => sum + w.costPerMeter * DEFAULT_WIRE_LENGTH + (elcbs[id] ? ELCB_COST : 0), 0
      );
      const gameResult = finalCost > level.budget ? 'over-budget' : 'won';
      setResult(gameResult);
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
    } else {
      if (!canPowerOn) return;
      setMultiState(createInitialMultiState(circuitIds));
      setResult('none');
      prevTimeRef.current = 0;
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
    firedLeakageEventsRef.current = new Set();
    setIsPowered(false);
    setMultiState(createInitialMultiState(circuitIds));
    setResult('none');
    setWiring(createInitialWiring(circuitIds));
    setCircuitCrimps({});
    setPendingCrimpCircuitId(null);
    setPendingCrimpWire(null);
  }, [circuitIds]);

  const handleBackToLevels = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    prevTimeRef.current = 0;
    stopBuzzing();
    stopApplianceSounds();
    buzzingRef.current = false;
    setIsPowered(false);
    setMultiState(createInitialMultiState([]));
    setResult('none');
    setCircuitAppliances({});
    setCircuitWires({});
    setCircuitElcb({});
    setCircuitPhases({});
    setCircuitCrimps({});
    setPendingCrimpCircuitId(null);
    setPendingCrimpWire(null);
    setCurrentLevel(null);
    setWiring(createInitialWiring([]));
  }, []);

  const handleSelectLevel = useCallback((level: Level) => {
    const ids = level.circuitConfigs.map(c => c.id);
    setCurrentLevel(level);
    // Auto-assign appliances that belong to exactly one circuit's availableAppliances
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
    setCircuitElcb({});
    setCircuitCrimps({});
    setPendingCrimpCircuitId(null);
    setPendingCrimpWire(null);
    // Initialize phase assignments from CircuitConfig.phase
    const phases: Record<CircuitId, 'R' | 'T'> = {};
    for (const config of level.circuitConfigs) {
      if (config.phase) phases[config.id] = config.phase;
    }
    setCircuitPhases(phases);
    setMultiState(createInitialMultiState(ids));
    setResult('none');
    setWiring(createInitialWiring(ids));
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
            leverTooltip={!isPowered && !canPowerOn ? (wetAreaMissingElcb ? '潮濕區域迴路需安裝 ELCB' : !allWired ? '請先完成所有迴路接線' : crimpMissing ? '請先完成所有迴路壓接' : '請先分配電器') : undefined}
            onTargetCircuitChange={handleTargetCircuitChange}
            phases={Object.keys(circuitPhases).length > 0 ? circuitPhases : undefined}
            phaseMode={currentLevel?.phaseMode}
            onTogglePhase={handleTogglePhase}
            circuitCrimps={Object.keys(circuitCrimps).length > 0 ? circuitCrimps : undefined}
          />
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
      />

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
