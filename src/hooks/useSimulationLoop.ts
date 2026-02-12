import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Wire, Appliance, Level, MultiCircuitState, CircuitId, CircuitConfig, CircuitState, CrimpResult, GameResult, Circuit } from '../types/game';
import { DEFAULT_WIRE_LENGTH, ELCB_COST, LEAKAGE_CHANCE_PER_SECOND, NFB_COSTS } from '../data/constants';
import { LEVELS } from '../data/levels';
import { isFixedCircuitLevel, isFreeCircuitLevel } from '../types/helpers';
import { createInitialMultiState, stepMulti } from '../engine/simulation';
import { calcStars, saveBestStars } from '../engine/scoring';
import { saveRandomCompletion } from '../engine/randomOldHouse';
import type { StarDetail } from '../engine/scoring';
import { playPowerOn, playTripped, playBurned, playWin, startBuzzing, updateBuzzingVolume, stopBuzzing, startApplianceSounds, stopApplianceSounds } from '../engine/audio';

export interface UseSimulationLoopParams {
  circuitsRef: React.RefObject<Circuit[]>;
  circuitPhasesRef: React.RefObject<Record<CircuitId, 'R' | 'T'>>;
  circuitElcbRef: React.RefObject<Record<CircuitId, boolean>>;
  currentLevel: Level | null;
  resolvedConfigs: CircuitConfig[];
  preWiredCircuitIdsRef: React.RefObject<Set<CircuitId>>;
  circuitWiresRef: React.RefObject<Record<CircuitId, Wire>>;
  circuitRouteDistancesRef: React.RefObject<Record<CircuitId, number>>;
  circuitCrimpsRef: React.RefObject<Record<CircuitId, CrimpResult>>;
  aestheticsScoreRef: React.RefObject<number | undefined>;
  canPowerOn: boolean;
  circuitIds: CircuitId[];
  allAppliances: Appliance[];
}

export interface UseSimulationLoopReturn {
  multiState: MultiCircuitState;
  setMultiState: React.Dispatch<React.SetStateAction<MultiCircuitState>>;
  isPowered: boolean;
  setIsPowered: React.Dispatch<React.SetStateAction<boolean>>;
  result: GameResult;
  setResult: React.Dispatch<React.SetStateAction<GameResult>>;
  starResult: { stars: number; details: StarDetail[] } | null;
  setStarResult: React.Dispatch<React.SetStateAction<{ stars: number; details: StarDetail[] } | null>>;
  handlePowerToggle: () => void;
  hasWarningRef: React.RefObject<boolean>;
  hasTripRef: React.RefObject<boolean>;
  firedLeakageEventsRef: React.RefObject<Set<number>>;
  setResolvedLeakageEvents: (events: readonly { time: number; circuitId: CircuitId }[] | null) => void;
  reset: (newCircuitIds: CircuitId[]) => void;
}

export function useSimulationLoop({
  circuitsRef,
  circuitPhasesRef,
  circuitElcbRef,
  currentLevel,
  resolvedConfigs,
  preWiredCircuitIdsRef,
  circuitWiresRef,
  circuitRouteDistancesRef,
  circuitCrimpsRef,
  aestheticsScoreRef,
  canPowerOn,
  circuitIds,
  allAppliances,
}: UseSimulationLoopParams): UseSimulationLoopReturn {
  const [multiState, setMultiState] = useState<MultiCircuitState>(createInitialMultiState([]));
  const [isPowered, setIsPowered] = useState(false);
  const [result, setResult] = useState<GameResult>('none');
  const [starResult, setStarResult] = useState<{ stars: number; details: StarDetail[] } | null>(null);

  // Create refs internally for rAF access
  const currentLevelRef = useRef(currentLevel);
  useEffect(() => { currentLevelRef.current = currentLevel; }, [currentLevel]);

  const resolvedConfigsRef = useRef(resolvedConfigs);
  useEffect(() => { resolvedConfigsRef.current = resolvedConfigs; }, [resolvedConfigs]);

  const rafRef = useRef<number>(0);
  const prevTimeRef = useRef<number>(0);
  const multiStateRef = useRef<MultiCircuitState>(multiState);
  const buzzingRef = useRef(false);
  const hasWarningRef = useRef(false);
  const hasTripRef = useRef(false);
  const tickRef = useRef<FrameRequestCallback>(() => {});
  const firedLeakageEventsRef = useRef<Set<number>>(new Set());
  const resolvedLeakageEventsRef = useRef<readonly { time: number; circuitId: CircuitId }[] | null>(null);

  const { t } = useTranslation();
  const tRef = useRef(t);
  useEffect(() => { tRef.current = t; }, [t]);

  useEffect(() => {
    multiStateRef.current = multiState;
  }, [multiState]);

  // rAF simulation loop
  const tick = useCallback((timestamp: number) => {
    if (prevTimeRef.current === 0) {
      prevTimeRef.current = timestamp;
    }
    const dt = Math.min((timestamp - prevTimeRef.current) / 1000, 0.1);
    prevTimeRef.current = timestamp;

    const phases = Object.keys(circuitPhasesRef.current).length > 0 ? circuitPhasesRef.current : undefined;
    const curLevelForBreaker = currentLevelRef.current;
    const mainBreakerRating = curLevelForBreaker && isFreeCircuitLevel(curLevelForBreaker) ? curLevelForBreaker.panel.mainBreakerRating : undefined;
    let newMultiState = stepMulti(circuitsRef.current, multiStateRef.current, dt, phases, mainBreakerRating);

    // Leakage event processing
    const curLevel = currentLevelRef.current;
    if (curLevel?.leakageMode) {
      const elcbs = circuitElcbRef.current;
      const wetAreaConfigs = resolvedConfigsRef.current.filter(c => c.wetArea);
      const updatedStates: Record<CircuitId, CircuitState> = { ...newMultiState.circuitStates };

      const effectiveLeakageEvents = resolvedLeakageEventsRef.current ?? curLevel.leakageEvents;
      if (curLevel.leakageMode === 'scripted' && effectiveLeakageEvents) {
        for (let i = 0; i < effectiveLeakageEvents.length; i++) {
          const evt = effectiveLeakageEvents[i];
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

    // Buzzing management
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

    // Track trip events
    for (const cs of Object.values(newMultiState.circuitStates)) {
      if (cs.status === 'tripped' || cs.status === 'elcb-tripped') {
        hasTripRef.current = true;
        break;
      }
    }

    // Terminal state
    if (newMultiState.overallStatus === 'tripped' || newMultiState.overallStatus === 'burned' || newMultiState.overallStatus === 'neutral-burned' || newMultiState.overallStatus === 'leakage' || newMultiState.overallStatus === 'main-tripped') {
      setIsPowered(false);
      stopApplianceSounds();
      setResult(newMultiState.overallStatus);
      if (newMultiState.overallStatus === 'tripped') playTripped();
      else playBurned();
      return;
    }

    // Win condition
    const level = currentLevelRef.current;
    if (level && newMultiState.elapsed >= level.survivalTime) {
      setIsPowered(false);
      stopApplianceSounds();
      const wires = circuitWiresRef.current;
      const elcbs = circuitElcbRef.current;
      const configs = resolvedConfigsRef.current;
      const isFreeLvl = level != null && isFreeCircuitLevel(level);
      const routeDistances = circuitRouteDistancesRef.current;
      const finalCost = Object.entries(wires).reduce(
        (sum, [id, w]) => {
          const elcbCost = elcbs[id] ? ELCB_COST : 0;
          const config = configs.find(c => c.id === id);
          const nfbCost = isFreeLvl && config ? (NFB_COSTS[config.breaker.ratedCurrent] ?? 0) : 0;
          if (preWiredCircuitIdsRef.current.has(id)) return sum + elcbCost;
          const wireLength = routeDistances[id] ?? DEFAULT_WIRE_LENGTH;
          return sum + w.costPerMeter * wireLength + elcbCost + nfbCost;
        }, 0
      );
      const gameResult = finalCost > level.budget ? 'over-budget' : 'won';
      setResult(gameResult);

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
      }, tRef.current);
      setStarResult(sr);

      const levelIndex = LEVELS.indexOf(level);
      if (levelIndex >= 0 && sr.stars > 0) {
        saveBestStars(levelIndex, sr.stars);
      }

      if (gameResult === 'won' && isFixedCircuitLevel(level) && level.randomDifficulty) {
        saveRandomCompletion(level.randomDifficulty);
      }

      if (gameResult === 'won') playWin();
      return;
    }

    rafRef.current = requestAnimationFrame(tickRef.current);
  }, [circuitsRef, circuitPhasesRef, circuitElcbRef, resolvedConfigsRef, currentLevelRef, preWiredCircuitIdsRef, circuitWiresRef, circuitRouteDistancesRef, circuitCrimpsRef, aestheticsScoreRef]);

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

  const setResolvedLeakageEvents = useCallback((events: readonly { time: number; circuitId: CircuitId }[] | null) => {
    resolvedLeakageEventsRef.current = events;
  }, []);

  const reset = useCallback((newCircuitIds: CircuitId[]) => {
    cancelAnimationFrame(rafRef.current);
    prevTimeRef.current = 0;
    stopBuzzing();
    stopApplianceSounds();
    buzzingRef.current = false;
    hasWarningRef.current = false;
    hasTripRef.current = false;
    firedLeakageEventsRef.current = new Set();
    resolvedLeakageEventsRef.current = null;
    setIsPowered(false);
    setResult('none');
    setStarResult(null);
    setMultiState(createInitialMultiState(newCircuitIds));
  }, []);

  return {
    multiState,
    setMultiState,
    isPowered,
    setIsPowered,
    result,
    setResult,
    starResult,
    setStarResult,
    handlePowerToggle,
    hasWarningRef,
    hasTripRef,
    firedLeakageEventsRef,
    setResolvedLeakageEvents,
    reset,
  };
}
