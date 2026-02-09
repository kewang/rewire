import type { CircuitId } from '../types/game';
import { CROSSING_PENALTY, UNBUNDLED_PENALTY } from '../data/constants';

/** Crossing pair info */
export interface CrossingPair {
  idA: CircuitId;
  idB: CircuitId;
  x: number;
  y: number;
}

/** NFB (destination) X — fixed by config index */
function nfbX(index: number, panelPadding: number, laneWidth: number): number {
  return panelPadding + laneWidth / 2 + index * laneWidth;
}

/** Lane center X — by lane slot */
function laneX(slot: number, panelPadding: number, laneWidth: number): number {
  return panelPadding + laneWidth / 2 + slot * laneWidth;
}

/**
 * Detect crossing wire pairs in the panel interior view.
 * Extracted from PanelInteriorView for shared use.
 */
export function detectCrossings(
  lanes: CircuitId[],
  configIndex: Record<CircuitId, number>,
  startXMap: Record<CircuitId, number>,
  panelPadding: number,
  laneWidth: number,
  routingTop: number,
  routingHeight: number,
): CrossingPair[] {
  const pairs: CrossingPair[] = [];
  for (let i = 0; i < lanes.length; i++) {
    for (let j = i + 1; j < lanes.length; j++) {
      const idA = lanes[i];
      const idB = lanes[j];
      const startA = startXMap[idA];
      const startB = startXMap[idB];
      const endA = nfbX(configIndex[idA], panelPadding, laneWidth);
      const endB = nfbX(configIndex[idB], panelPadding, laneWidth);

      const lnA = laneX(i, panelPadding, laneWidth);
      const lnB = laneX(j, panelPadding, laneWidth);
      const topInversion = (startA - startB) * (lnA - lnB) < 0;
      const bottomInversion = (lnA - lnB) * (endA - endB) < 0;

      if (topInversion || bottomInversion) {
        const cx = (lnA + lnB) / 2;
        const cy = topInversion
          ? routingTop + 20
          : routingTop + routingHeight - 30;
        pairs.push({ idA, idB, x: cx, y: cy });
      }
    }
  }
  return pairs;
}

/**
 * Get the set of pair indices (between adjacent lanes) that have crossings.
 * A pair index i represents the pair (lanes[i], lanes[i+1]).
 */
export function getCrossingPairIndices(
  lanes: CircuitId[],
  configIndex: Record<CircuitId, number>,
  startXMap: Record<CircuitId, number>,
  panelPadding: number,
  laneWidth: number,
): Set<number> {
  const result = new Set<number>();
  for (let i = 0; i < lanes.length - 1; i++) {
    const idA = lanes[i];
    const idB = lanes[i + 1];
    const startA = startXMap[idA];
    const startB = startXMap[idB];
    const endA = nfbX(configIndex[idA], panelPadding, laneWidth);
    const endB = nfbX(configIndex[idB], panelPadding, laneWidth);

    const lnA = laneX(i, panelPadding, laneWidth);
    const lnB = laneX(i + 1, panelPadding, laneWidth);
    const topInversion = (startA - startB) * (lnA - lnB) < 0;
    const bottomInversion = (lnA - lnB) * (endA - endB) < 0;

    if (topInversion || bottomInversion) {
      result.add(i);
    }
  }
  return result;
}

/**
 * Count adjacent parallel pairs that are not bundled with cable ties.
 * Crossing pairs are excluded (cannot be bundled).
 */
export function countUnbundledPairs(
  lanes: CircuitId[],
  cableTies: Set<number>,
  crossingPairIndices: Set<number>,
): number {
  let count = 0;
  for (let i = 0; i < lanes.length - 1; i++) {
    if (!crossingPairIndices.has(i) && !cableTies.has(i)) count++;
  }
  return count;
}

/**
 * Calculate aesthetics score (0-100).
 * score = clamp(0, 100, 100 - crossings × CROSSING_PENALTY - unbundledPairs × UNBUNDLED_PENALTY)
 */
export function calcAestheticsScore(crossings: number, unbundledPairs: number): number {
  return Math.max(0, Math.min(100,
    100 - crossings * CROSSING_PENALTY - unbundledPairs * UNBUNDLED_PENALTY,
  ));
}

