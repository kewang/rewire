import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { Wire, Appliance, Circuit, Level, MultiCircuitState, WiringState, CircuitId, CircuitConfig } from '../types/game';
import { DEFAULT_WIRES, DEFAULT_WIRE_LENGTH, ELCB_COST } from '../data/constants';
import { LEVELS } from '../data/levels';
import { createInitialMultiState, stepMulti } from '../engine/simulation';
import { playPowerOn, playTripped, playBurned, playWin, startBuzzing, updateBuzzingVolume, stopBuzzing, startApplianceSounds, stopApplianceSounds } from '../engine/audio';
import WireSelector from './WireSelector';
import AppliancePanel from './AppliancePanel';
import StatusDisplay from './StatusDisplay';
import ResultPanel from './ResultPanel';
import LevelSelect from './LevelSelect';
import CircuitDiagram from './CircuitDiagram';

type GameResult = 'none' | 'tripped' | 'burned' | 'neutral-burned' | 'won' | 'over-budget';

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

  // Build Circuit[] from circuitConfigs + circuitWires + circuitAppliances
  const circuits: Circuit[] = useMemo(() =>
    circuitConfigs.map(config => ({
      id: config.id,
      label: config.label,
      voltage: config.voltage,
      breaker: config.breaker,
      wire: circuitWires[config.id] ?? DEFAULT_WIRES[0],
      appliances: circuitAppliances[config.id] ?? [],
    })),
    [circuitConfigs, circuitWires, circuitAppliances]
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

  // rAF simulation loop
  const tick = useCallback((timestamp: number) => {
    if (prevTimeRef.current === 0) {
      prevTimeRef.current = timestamp;
    }
    const dt = Math.min((timestamp - prevTimeRef.current) / 1000, 0.1);
    prevTimeRef.current = timestamp;

    const phases = Object.keys(circuitPhasesRef.current).length > 0 ? circuitPhasesRef.current : undefined;
    const newMultiState = stepMulti(circuitsRef.current, multiStateRef.current, dt, phases);
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

    // Terminal state: tripped, burned, or neutral-burned (use overallStatus)
    if (newMultiState.overallStatus === 'tripped' || newMultiState.overallStatus === 'burned' || newMultiState.overallStatus === 'neutral-burned') {
      setIsPowered(false);
      stopApplianceSounds();
      setResult(newMultiState.overallStatus);
      if (newMultiState.overallStatus === 'tripped') playTripped();
      else playBurned(); // burned and neutral-burned share same sound
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
      if (!hasAnyAppliance || !allWired) return;
      setMultiState(createInitialMultiState(circuitIds));
      setResult('none');
      prevTimeRef.current = 0;
      setIsPowered(true);
      playPowerOn();
      startApplianceSounds(allAppliances);
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [isPowered, hasAnyAppliance, allWired, circuitIds, allAppliances, tick]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleRetry = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    prevTimeRef.current = 0;
    stopBuzzing();
    stopApplianceSounds();
    buzzingRef.current = false;
    setIsPowered(false);
    setMultiState(createInitialMultiState(circuitIds));
    setResult('none');
    setWiring(createInitialWiring(circuitIds));
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
  }, []);

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
            leverDisabled={(!hasAnyAppliance || !allWired) && !isPowered}
            onTargetCircuitChange={handleTargetCircuitChange}
            phases={Object.keys(circuitPhases).length > 0 ? circuitPhases : undefined}
            phaseMode={currentLevel?.phaseMode}
            onTogglePhase={handleTogglePhase}
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
    </div>
  );
}
