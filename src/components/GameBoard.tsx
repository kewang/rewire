import { useState, useRef, useCallback, useEffect } from 'react';
import type { Wire, Appliance, Circuit, Level, MultiCircuitState, WiringState } from '../types/game';
import { toLegacyState } from '../types/helpers';
import { DEFAULT_WIRES, DEFAULT_BREAKER, DEFAULT_WIRE_LENGTH } from '../data/constants';
import { LEVELS } from '../data/levels';
import { createInitialMultiState, stepMulti } from '../engine/simulation';
import { playPowerOn, playTripped, playBurned, playWin, startBuzzing, updateBuzzingVolume, stopBuzzing, startApplianceSounds, stopApplianceSounds } from '../engine/audio';
import WireSelector from './WireSelector';
import AppliancePanel from './AppliancePanel';
import StatusDisplay from './StatusDisplay';
import ResultPanel from './ResultPanel';
import LevelSelect from './LevelSelect';
import CircuitDiagram from './CircuitDiagram';

type GameResult = 'none' | 'tripped' | 'burned' | 'won' | 'over-budget';

const DEFAULT_CIRCUIT_ID = 'c1';

const INITIAL_MULTI_STATE = createInitialMultiState([DEFAULT_CIRCUIT_ID]);

const INITIAL_WIRING: WiringState = {
  isDragging: false,
  dragWire: null,
  cursorPos: null,
  isWired: false,
  connectedWire: null,
  circuits: {},
  targetCircuitId: null,
};

export default function GameBoard() {
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [selectedWire, setSelectedWire] = useState<Wire>(DEFAULT_WIRES[0]);
  const [pluggedAppliances, setPluggedAppliances] = useState<Appliance[]>([]);
  const [multiState, setMultiState] = useState<MultiCircuitState>(INITIAL_MULTI_STATE);
  const [isPowered, setIsPowered] = useState(false);
  const [result, setResult] = useState<GameResult>('none');
  const [wiring, setWiring] = useState<WiringState>(INITIAL_WIRING);

  const rafRef = useRef<number>(0);
  const prevTimeRef = useRef<number>(0);
  const multiStateRef = useRef<MultiCircuitState>(multiState);
  const buzzingRef = useRef(false);

  useEffect(() => {
    multiStateRef.current = multiState;
  }, [multiState]);

  const circuit: Circuit = {
    id: DEFAULT_CIRCUIT_ID,
    label: '主迴路',
    breaker: DEFAULT_BREAKER,
    wire: selectedWire,
    appliances: pluggedAppliances,
  };
  const circuitsRef = useRef<Circuit[]>([circuit]);
  circuitsRef.current = [circuit];

  const currentLevelRef = useRef(currentLevel);
  currentLevelRef.current = currentLevel;

  const selectedWireRef = useRef(selectedWire);
  selectedWireRef.current = selectedWire;

  const cost = selectedWire.costPerMeter * DEFAULT_WIRE_LENGTH;

  // Bridge: 從 MultiCircuitState 轉出供子元件使用的 SimulationState
  const simState = toLegacyState(multiState, DEFAULT_CIRCUIT_ID);

  // rAF simulation loop
  const tick = useCallback((timestamp: number) => {
    if (prevTimeRef.current === 0) {
      prevTimeRef.current = timestamp;
    }
    const dt = Math.min((timestamp - prevTimeRef.current) / 1000, 0.1);
    prevTimeRef.current = timestamp;

    const newMultiState = stepMulti(circuitsRef.current, multiStateRef.current, dt);
    setMultiState(newMultiState);

    // Bridge for buzzing: 用第一個迴路的狀態
    const cs = newMultiState.circuitStates[DEFAULT_CIRCUIT_ID];

    // Buzzing management
    if (cs.status === 'warning') {
      if (!buzzingRef.current) {
        startBuzzing();
        buzzingRef.current = true;
      }
      updateBuzzingVolume(cs.wireHeat);
    } else if (buzzingRef.current) {
      stopBuzzing();
      buzzingRef.current = false;
    }

    // Terminal state: tripped or burned (use overallStatus)
    if (newMultiState.overallStatus === 'tripped' || newMultiState.overallStatus === 'burned') {
      setIsPowered(false);
      stopApplianceSounds();
      setResult(newMultiState.overallStatus);
      if (newMultiState.overallStatus === 'tripped') playTripped();
      else playBurned();
      return;
    }

    // Win condition check (use elapsed from MultiCircuitState)
    const level = currentLevelRef.current;
    if (level && newMultiState.elapsed >= level.survivalTime) {
      setIsPowered(false);
      stopApplianceSounds();
      const wireCost = selectedWireRef.current.costPerMeter * DEFAULT_WIRE_LENGTH;
      const gameResult = wireCost > level.budget ? 'over-budget' : 'won';
      setResult(gameResult);
      if (gameResult === 'won') playWin();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const handlePowerToggle = useCallback(() => {
    if (isPowered) {
      cancelAnimationFrame(rafRef.current);
      prevTimeRef.current = 0;
      stopBuzzing();
      stopApplianceSounds();
      buzzingRef.current = false;
      setIsPowered(false);
      setMultiState(INITIAL_MULTI_STATE);
      setResult('none');
    } else {
      if (pluggedAppliances.length === 0 || !wiring.isWired) return;
      setMultiState(INITIAL_MULTI_STATE);
      setResult('none');
      prevTimeRef.current = 0;
      setIsPowered(true);
      playPowerOn();
      startApplianceSounds(pluggedAppliances);
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [isPowered, pluggedAppliances, wiring.isWired, tick]);

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
    setMultiState(INITIAL_MULTI_STATE);
    setResult('none');
    setWiring(INITIAL_WIRING);
  }, []);

  const handleBackToLevels = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    prevTimeRef.current = 0;
    stopBuzzing();
    stopApplianceSounds();
    buzzingRef.current = false;
    setIsPowered(false);
    setMultiState(INITIAL_MULTI_STATE);
    setResult('none');
    setPluggedAppliances([]);
    setSelectedWire(DEFAULT_WIRES[0]);
    setCurrentLevel(null);
    setWiring(INITIAL_WIRING);
  }, []);

  const handleSelectLevel = useCallback((level: Level) => {
    setCurrentLevel(level);
    setPluggedAppliances([...level.requiredAppliances]);
    setSelectedWire(DEFAULT_WIRES[0]);
    setMultiState(INITIAL_MULTI_STATE);
    setResult('none');
    setWiring(INITIAL_WIRING);
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
      if (dropped && prev.dragWire) {
        return {
          ...prev,
          isDragging: false,
          dragWire: null,
          cursorPos: null,
          isWired: true,
          connectedWire: prev.dragWire,
        };
      }
      return { ...prev, isDragging: false, dragWire: null, cursorPos: null };
    });
  }, []);

  // Sync connectedWire → selectedWire
  useEffect(() => {
    if (wiring.connectedWire) {
      setSelectedWire(wiring.connectedWire);
    }
  }, [wiring.connectedWire]);

  const handleAddAppliance = useCallback((a: Appliance) => {
    setPluggedAppliances((prev) => [...prev, a]);
  }, []);

  const handleRemoveAppliance = useCallback((index: number) => {
    setPluggedAppliances((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Level select screen
  if (!currentLevel) {
    return <LevelSelect levels={LEVELS} onSelect={handleSelectLevel} />;
  }

  return (
    <div className="game-board">
      <header className="game-header">
        <div className="header-top">
          <button className="back-button" onClick={handleBackToLevels}>← 返回</button>
          <h1>{currentLevel.name}</h1>
          <span className="level-goal">通電 {currentLevel.survivalTime}秒</span>
        </div>
        <StatusDisplay
          state={simState}
          wireMaxCurrent={selectedWire.maxCurrent}
          breakerRated={DEFAULT_BREAKER.ratedCurrent}
          cost={cost}
          budget={currentLevel.budget}
          survivalTime={currentLevel.survivalTime}
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
            state={simState}
            isPowered={isPowered}
            breakerRated={DEFAULT_BREAKER.ratedCurrent}
            wiring={wiring}
            onPowerToggle={handlePowerToggle}
            leverDisabled={(pluggedAppliances.length === 0 || !wiring.isWired) && !isPowered}
          />
        </section>

        <section className="panel-right">
          <AppliancePanel
            available={currentLevel.requiredAppliances}
            plugged={pluggedAppliances}
            onAdd={handleAddAppliance}
            onRemove={handleRemoveAppliance}
            disabled={isPowered}
            isPowered={isPowered}
          />
        </section>
      </main>

      <ResultPanel
        result={result}
        state={simState}
        wire={selectedWire}
        breaker={DEFAULT_BREAKER}
        cost={cost}
        budget={currentLevel.budget}
        onRetry={handleRetry}
        onBackToLevels={handleBackToLevels}
      />
    </div>
  );
}
