import { useState, useRef, useCallback, useEffect } from 'react';
import type { Wire, Appliance, SimulationState } from '../types/game';
import { DEFAULT_WIRES, DEFAULT_APPLIANCES, DEFAULT_BREAKER } from '../data/constants';
import { createInitialState, step } from '../engine/simulation';
import WireSelector from './WireSelector';
import AppliancePanel from './AppliancePanel';
import StatusDisplay from './StatusDisplay';
import ResultPanel from './ResultPanel';

export default function GameBoard() {
  const [selectedWire, setSelectedWire] = useState<Wire>(DEFAULT_WIRES[0]);
  const [pluggedAppliances, setPluggedAppliances] = useState<Appliance[]>([]);
  const [simState, setSimState] = useState<SimulationState>(createInitialState());
  const [isPowered, setIsPowered] = useState(false);

  const rafRef = useRef<number>(0);
  const prevTimeRef = useRef<number>(0);
  const simStateRef = useRef<SimulationState>(simState);

  // Keep ref in sync with state
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

  // rAF simulation loop
  const tick = useCallback((timestamp: number) => {
    if (prevTimeRef.current === 0) {
      prevTimeRef.current = timestamp;
    }
    const dt = Math.min((timestamp - prevTimeRef.current) / 1000, 0.1); // cap dt at 100ms
    prevTimeRef.current = timestamp;

    const newState = step(circuitRef.current, simStateRef.current, dt);
    setSimState(newState);

    // Stop on terminal state
    if (newState.status === 'tripped' || newState.status === 'burned') {
      setIsPowered(false);
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const handlePowerToggle = useCallback(() => {
    if (isPowered) {
      // Power off: stop loop and reset
      cancelAnimationFrame(rafRef.current);
      prevTimeRef.current = 0;
      setIsPowered(false);
      setSimState(createInitialState());
    } else {
      // Power on
      if (pluggedAppliances.length === 0) return;
      setSimState(createInitialState());
      prevTimeRef.current = 0;
      setIsPowered(true);
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [isPowered, pluggedAppliances.length, tick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleRetry = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    prevTimeRef.current = 0;
    setIsPowered(false);
    setSimState(createInitialState());
  }, []);

  const handleAddAppliance = useCallback((a: Appliance) => {
    setPluggedAppliances((prev) => [...prev, a]);
  }, []);

  const handleRemoveAppliance = useCallback((index: number) => {
    setPluggedAppliances((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="game-board">
      <header className="game-header">
        <h1>Project Rewire</h1>
        <StatusDisplay
          state={simState}
          wireMaxCurrent={selectedWire.maxCurrent}
          breakerRated={DEFAULT_BREAKER.ratedCurrent}
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
            available={DEFAULT_APPLIANCES}
            plugged={pluggedAppliances}
            onAdd={handleAddAppliance}
            onRemove={handleRemoveAppliance}
            disabled={isPowered}
          />
        </section>
      </main>

      <ResultPanel
        state={simState}
        wire={selectedWire}
        breaker={DEFAULT_BREAKER}
        onRetry={handleRetry}
      />
    </div>
  );
}
