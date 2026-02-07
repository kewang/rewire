import { useState, useRef, useCallback, useEffect } from 'react';
import type { Wire, Appliance, Level, SimulationState } from '../types/game';
import { DEFAULT_WIRES, DEFAULT_BREAKER, DEFAULT_WIRE_LENGTH } from '../data/constants';
import { LEVELS } from '../data/levels';
import { createInitialState, step } from '../engine/simulation';
import WireSelector from './WireSelector';
import AppliancePanel from './AppliancePanel';
import StatusDisplay from './StatusDisplay';
import ResultPanel from './ResultPanel';
import LevelSelect from './LevelSelect';

type GameResult = 'none' | 'tripped' | 'burned' | 'won' | 'over-budget';

export default function GameBoard() {
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [selectedWire, setSelectedWire] = useState<Wire>(DEFAULT_WIRES[0]);
  const [pluggedAppliances, setPluggedAppliances] = useState<Appliance[]>([]);
  const [simState, setSimState] = useState<SimulationState>(createInitialState());
  const [isPowered, setIsPowered] = useState(false);
  const [result, setResult] = useState<GameResult>('none');

  const rafRef = useRef<number>(0);
  const prevTimeRef = useRef<number>(0);
  const simStateRef = useRef<SimulationState>(simState);

  useEffect(() => {
    simStateRef.current = simState;
  }, [simState]);

  const circuit = {
    breaker: DEFAULT_BREAKER,
    wire: selectedWire,
    appliances: pluggedAppliances,
  };
  const circuitRef = useRef(circuit);
  circuitRef.current = circuit;

  const currentLevelRef = useRef(currentLevel);
  currentLevelRef.current = currentLevel;

  const selectedWireRef = useRef(selectedWire);
  selectedWireRef.current = selectedWire;

  const cost = selectedWire.costPerMeter * DEFAULT_WIRE_LENGTH;

  // rAF simulation loop
  const tick = useCallback((timestamp: number) => {
    if (prevTimeRef.current === 0) {
      prevTimeRef.current = timestamp;
    }
    const dt = Math.min((timestamp - prevTimeRef.current) / 1000, 0.1);
    prevTimeRef.current = timestamp;

    const newState = step(circuitRef.current, simStateRef.current, dt);
    setSimState(newState);

    // Terminal state: tripped or burned
    if (newState.status === 'tripped' || newState.status === 'burned') {
      setIsPowered(false);
      setResult(newState.status);
      return;
    }

    // Win condition check
    const level = currentLevelRef.current;
    if (level && newState.elapsed >= level.survivalTime) {
      setIsPowered(false);
      const wireCost = selectedWireRef.current.costPerMeter * DEFAULT_WIRE_LENGTH;
      setResult(wireCost > level.budget ? 'over-budget' : 'won');
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const handlePowerToggle = useCallback(() => {
    if (isPowered) {
      cancelAnimationFrame(rafRef.current);
      prevTimeRef.current = 0;
      setIsPowered(false);
      setSimState(createInitialState());
      setResult('none');
    } else {
      if (pluggedAppliances.length === 0) return;
      setSimState(createInitialState());
      setResult('none');
      prevTimeRef.current = 0;
      setIsPowered(true);
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [isPowered, pluggedAppliances.length, tick]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleRetry = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    prevTimeRef.current = 0;
    setIsPowered(false);
    setSimState(createInitialState());
    setResult('none');
  }, []);

  const handleBackToLevels = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    prevTimeRef.current = 0;
    setIsPowered(false);
    setSimState(createInitialState());
    setResult('none');
    setPluggedAppliances([]);
    setSelectedWire(DEFAULT_WIRES[0]);
    setCurrentLevel(null);
  }, []);

  const handleSelectLevel = useCallback((level: Level) => {
    setCurrentLevel(level);
    setPluggedAppliances([...level.requiredAppliances]);
    setSelectedWire(DEFAULT_WIRES[0]);
    setSimState(createInitialState());
    setResult('none');
  }, []);

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
        />
      </header>

      <main className="game-main">
        <section className="panel-left">
          <WireSelector
            wires={DEFAULT_WIRES}
            selected={selectedWire}
            onSelect={setSelectedWire}
            disabled={isPowered}
          />
        </section>

        <section className="panel-center">
          <div className="nfb-control">
            <h3>NFB 斷路器（{DEFAULT_BREAKER.ratedCurrent}A）</h3>
            <button
              className={`nfb-switch ${isPowered ? 'on' : 'off'}`}
              onClick={handlePowerToggle}
              disabled={pluggedAppliances.length === 0 && !isPowered}
            >
              {isPowered ? 'ON — 送電中' : 'OFF — 斷電'}
            </button>
          </div>
        </section>

        <section className="panel-right">
          <AppliancePanel
            available={currentLevel.requiredAppliances}
            plugged={pluggedAppliances}
            onAdd={handleAddAppliance}
            onRemove={handleRemoveAppliance}
            disabled={isPowered}
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
