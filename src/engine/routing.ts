import type { FloorPlan, RoutingGraph } from '../types/floorPlan';

// ─── Types ────────────────────────────────────────────────────

/** A single path through the routing graph */
export interface RoutePath {
  /** Ordered sequence of node IDs from source to destination */
  readonly nodeIds: string[];
  /** Total distance in meters */
  readonly distance: number;
}

/** A routing strategy candidate for a circuit */
export interface RouteCandidate {
  /** Routing strategy */
  readonly strategy: 'direct' | 'star' | 'daisy-chain';
  /** Per-room paths (roomId → path from previous hop to that room's outlet) */
  readonly paths: Map<string, RoutePath>;
  /** Total wire distance in meters */
  readonly totalDistance: number;
}

/** Collection of routing candidates for a circuit */
export interface RouteCandidates {
  readonly candidates: RouteCandidate[];
}

// ─── Node ID helpers ──────────────────────────────────────────

/** Get the RoutingGraph node ID for a room's outlet */
export function getOutletNodeId(roomId: string): string {
  return `outlet-${roomId}`;
}

/** Get the RoutingGraph node ID for the panel */
export function getPanelNodeId(): string {
  return 'panel';
}

// ─── Dijkstra shortest path ──────────────────────────────────

type AdjList = Map<string, Array<{ neighbor: string; distance: number }>>;

function buildAdjacencyList(graph: RoutingGraph): AdjList {
  const adj: AdjList = new Map();
  for (const node of graph.nodes) {
    adj.set(node.id, []);
  }
  for (const edge of graph.edges) {
    adj.get(edge.from)?.push({ neighbor: edge.to, distance: edge.distance });
    adj.get(edge.to)?.push({ neighbor: edge.from, distance: edge.distance });
  }
  return adj;
}

/**
 * Calculate the shortest path between two nodes using Dijkstra's algorithm.
 * Returns null if no path exists or if either node is not in the graph.
 */
export function findShortestPath(
  graph: RoutingGraph,
  fromNodeId: string,
  toNodeId: string,
): RoutePath | null {
  // Same node
  if (fromNodeId === toNodeId) {
    const exists = graph.nodes.some(n => n.id === fromNodeId);
    return exists ? { nodeIds: [fromNodeId], distance: 0 } : null;
  }

  const adj = buildAdjacencyList(graph);

  // Check both nodes exist
  if (!adj.has(fromNodeId) || !adj.has(toNodeId)) {
    return null;
  }

  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();

  for (const node of graph.nodes) {
    dist.set(node.id, Infinity);
    prev.set(node.id, null);
  }
  dist.set(fromNodeId, 0);

  while (true) {
    // Find unvisited node with smallest distance (linear scan — fine for <30 nodes)
    let current: string | null = null;
    let minDist = Infinity;
    for (const [nodeId, d] of dist) {
      if (!visited.has(nodeId) && d < minDist) {
        minDist = d;
        current = nodeId;
      }
    }

    if (current === null || current === toNodeId) break;

    visited.add(current);
    const neighbors = adj.get(current) ?? [];
    for (const { neighbor, distance } of neighbors) {
      if (visited.has(neighbor)) continue;
      const newDist = minDist + distance;
      if (newDist < (dist.get(neighbor) ?? Infinity)) {
        dist.set(neighbor, newDist);
        prev.set(neighbor, current);
      }
    }
  }

  const totalDist = dist.get(toNodeId) ?? Infinity;
  if (totalDist === Infinity) return null;

  // Reconstruct path
  const nodeIds: string[] = [];
  let node: string | null | undefined = toNodeId;
  while (node != null) {
    nodeIds.unshift(node);
    node = prev.get(node);
  }

  return {
    nodeIds,
    distance: Math.round(totalDist * 10) / 10,
  };
}

// ─── Route candidates ─────────────────────────────────────────

/**
 * Calculate routing candidates for a circuit serving the given rooms.
 * - Single room: returns one 'direct' candidate
 * - Multiple rooms: returns 'star' and 'daisy-chain' candidates
 */
export function calcRouteCandidates(
  floorPlan: FloorPlan,
  roomIds: string[],
): RouteCandidates {
  if (roomIds.length === 0) {
    return { candidates: [] };
  }

  const panelNodeId = getPanelNodeId();

  if (roomIds.length === 1) {
    const roomId = roomIds[0];
    const outletNodeId = getOutletNodeId(roomId);
    const path = findShortestPath(floorPlan.routingGraph, panelNodeId, outletNodeId);
    if (!path) {
      return { candidates: [] };
    }
    const paths = new Map<string, RoutePath>();
    paths.set(roomId, path);
    return {
      candidates: [{
        strategy: 'direct',
        paths,
        totalDistance: path.distance,
      }],
    };
  }

  // Multi-room: compute star and daisy-chain
  const candidates: RouteCandidate[] = [];

  // --- Star (home-run) ---
  const starPaths = new Map<string, RoutePath>();
  let starTotal = 0;
  let starValid = true;
  for (const roomId of roomIds) {
    const outletNodeId = getOutletNodeId(roomId);
    const path = findShortestPath(floorPlan.routingGraph, panelNodeId, outletNodeId);
    if (!path) {
      starValid = false;
      break;
    }
    starPaths.set(roomId, path);
    starTotal += path.distance;
  }
  if (starValid) {
    candidates.push({
      strategy: 'star',
      paths: starPaths,
      totalDistance: Math.round(starTotal * 10) / 10,
    });
  }

  // --- Daisy-chain (nearest neighbor greedy) ---
  const daisyPaths = new Map<string, RoutePath>();
  let daisyTotal = 0;
  let daisyValid = true;
  const remaining = new Set(roomIds);
  let currentNodeId = panelNodeId;

  while (remaining.size > 0) {
    let nearestRoom: string | null = null;
    let nearestPath: RoutePath | null = null;
    let nearestDist = Infinity;

    for (const roomId of remaining) {
      const outletNodeId = getOutletNodeId(roomId);
      const path = findShortestPath(floorPlan.routingGraph, currentNodeId, outletNodeId);
      if (path && path.distance < nearestDist) {
        nearestRoom = roomId;
        nearestPath = path;
        nearestDist = path.distance;
      }
    }

    if (!nearestRoom || !nearestPath) {
      daisyValid = false;
      break;
    }

    daisyPaths.set(nearestRoom, nearestPath);
    daisyTotal += nearestPath.distance;
    currentNodeId = getOutletNodeId(nearestRoom);
    remaining.delete(nearestRoom);
  }

  if (daisyValid) {
    candidates.push({
      strategy: 'daisy-chain',
      paths: daisyPaths,
      totalDistance: Math.round(daisyTotal * 10) / 10,
    });
  }

  return { candidates };
}

/**
 * Calculate total wire distance for a given routing strategy.
 * Convenience wrapper around calcRouteCandidates.
 */
export function calcRouteDistance(
  floorPlan: FloorPlan,
  roomIds: string[],
  strategy: 'direct' | 'star' | 'daisy-chain',
): number {
  const { candidates } = calcRouteCandidates(floorPlan, roomIds);
  const match = candidates.find(c => c.strategy === strategy);
  if (match) return match.totalDistance;

  // Fallback: if 'direct' requested for single room but calcRouteCandidates returned it,
  // or if strategy not found, return first candidate's distance or 0
  if (candidates.length > 0) return candidates[0].totalDistance;
  return 0;
}
