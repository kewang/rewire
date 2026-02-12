import { useState, useRef, useCallback, useMemo } from 'react';
import type { CircuitId, CircuitConfig, CableTieQuality } from '../types/game';
import { LANE_WIDTH, PANEL_PADDING, ROUTING_TOP, ROUTING_HEIGHT, wireStartX } from '../components/panelLayout';
import { detectCrossings, getCrossingPairIndices, countUnbundledPairs, calcAestheticsScore } from '../engine/aesthetics';

export interface UseRoutingOverlayParams {
  circuitConfigs: CircuitConfig[];
  circuitPhases: Record<CircuitId, 'R' | 'T'>;
  requiresRouting: boolean;
}

export interface UseRoutingOverlayReturn {
  circuitLanes: CircuitId[];
  cableTies: Map<number, CableTieQuality>;
  routingCompleted: boolean;
  showRoutingOverlay: boolean;
  setShowRoutingOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  finalAestheticsScore: number | undefined;
  aestheticsScoreRef: React.RefObject<number | undefined>;
  currentAestheticsScore: number;
  handleLanesChange: (newLanes: CircuitId[]) => void;
  handleToggleCableTie: (pairIndex: number, quality?: CableTieQuality) => void;
  handleRoutingDone: () => void;
  reset: (ids: CircuitId[], initialLanes?: readonly CircuitId[]) => void;
}

export function useRoutingOverlay({
  circuitConfigs,
  circuitPhases,
  requiresRouting,
}: UseRoutingOverlayParams): UseRoutingOverlayReturn {
  const [circuitLanes, setCircuitLanes] = useState<CircuitId[]>([]);
  const [cableTies, setCableTies] = useState<Map<number, CableTieQuality>>(new Map());
  const [routingCompleted, setRoutingCompleted] = useState(false);
  const [showRoutingOverlay, setShowRoutingOverlay] = useState(false);
  const [finalAestheticsScore, setFinalAestheticsScore] = useState<number | undefined>(undefined);
  const aestheticsScoreRef = useRef<number | undefined>(undefined);

  // Aesthetics score computation
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
    if (!requiresRouting || circuitLanes.length === 0) return 100;
    const crossingPairs = detectCrossings(circuitLanes, configIndex, startXMap, PANEL_PADDING, LANE_WIDTH, ROUTING_TOP, ROUTING_HEIGHT);
    const crossingPairIndices = getCrossingPairIndices(circuitLanes, configIndex, startXMap, PANEL_PADDING, LANE_WIDTH);
    const unbundled = countUnbundledPairs(circuitLanes, cableTies, crossingPairIndices);
    return calcAestheticsScore(crossingPairs.length, unbundled, cableTies);
  }, [requiresRouting, circuitLanes, configIndex, startXMap, cableTies]);

  const handleLanesChange = useCallback((newLanes: CircuitId[]) => {
    setCircuitLanes(newLanes);
    setCableTies(new Map());
  }, []);

  const handleToggleCableTie = useCallback((pairIndex: number, quality?: CableTieQuality) => {
    setCableTies(prev => {
      const next = new Map(prev);
      if (next.has(pairIndex) && !quality) {
        next.delete(pairIndex);
      } else if (quality) {
        next.set(pairIndex, quality);
      }
      return next;
    });
  }, []);

  const handleRoutingDone = useCallback(() => {
    setShowRoutingOverlay(false);
    setRoutingCompleted(true);
    setFinalAestheticsScore(currentAestheticsScore);
    aestheticsScoreRef.current = currentAestheticsScore;
  }, [currentAestheticsScore]);

  const reset = useCallback((ids: CircuitId[], initialLanes?: readonly CircuitId[]) => {
    setCircuitLanes(initialLanes ? [...initialLanes] : ids);
    setCableTies(new Map());
    setRoutingCompleted(false);
    setShowRoutingOverlay(false);
    setFinalAestheticsScore(undefined);
    aestheticsScoreRef.current = undefined;
  }, []);

  return {
    circuitLanes,
    cableTies,
    routingCompleted,
    showRoutingOverlay,
    setShowRoutingOverlay,
    finalAestheticsScore,
    aestheticsScoreRef,
    currentAestheticsScore,
    handleLanesChange,
    handleToggleCableTie,
    handleRoutingDone,
    reset,
  };
}
