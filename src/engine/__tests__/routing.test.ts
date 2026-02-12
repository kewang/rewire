import { describe, it, expect } from 'vitest';
import { findShortestPath, calcRouteCandidates, calcRouteDistance, getOutletNodeId, getPanelNodeId } from '../routing';
import type { RoutingGraph, FloorPlan } from '../../types/floorPlan';

// ─── Test helpers ──────────────────────────────────────────────

/** Simple diamond graph: A --1-- B --2-- D, A --4-- C --1-- D */
function makeDiamondGraph(): RoutingGraph {
  return {
    nodes: [
      { id: 'A', x: 0, y: 0 },
      { id: 'B', x: 1, y: 0 },
      { id: 'C', x: 0, y: 1 },
      { id: 'D', x: 1, y: 1 },
    ],
    edges: [
      { from: 'A', to: 'B', distance: 1 },
      { from: 'B', to: 'D', distance: 2 },
      { from: 'A', to: 'C', distance: 4 },
      { from: 'C', to: 'D', distance: 1 },
    ],
  };
}

/** Graph with disconnected node */
function makeDisconnectedGraph(): RoutingGraph {
  return {
    nodes: [
      { id: 'A', x: 0, y: 0 },
      { id: 'B', x: 1, y: 0 },
      { id: 'Z', x: 5, y: 5 }, // isolated
    ],
    edges: [
      { from: 'A', to: 'B', distance: 3 },
    ],
  };
}

/** Minimal floor plan with panel + 2 rooms for route candidate testing */
function makeTestFloorPlan(): FloorPlan {
  return {
    width: 6,
    height: 4,
    rooms: [
      { id: 'room-a', label: 'Room A', x: 0, y: 0, width: 2, height: 2, outlets: [{ x: 1, y: 1, type: 'power' }] },
      { id: 'room-b', label: 'Room B', x: 3, y: 0, width: 2, height: 2, outlets: [{ x: 4, y: 1, type: 'power' }] },
    ],
    panel: { x: 0, y: 0, roomId: 'room-a' },
    routingGraph: {
      nodes: [
        { id: 'panel', x: 0, y: 0 },
        { id: 'outlet-room-a', x: 1, y: 1 },
        { id: 'outlet-room-b', x: 4, y: 1 },
        { id: 'junction-1', x: 2, y: 0 },
      ],
      edges: [
        { from: 'panel', to: 'outlet-room-a', distance: 2 },
        { from: 'panel', to: 'junction-1', distance: 3 },
        { from: 'junction-1', to: 'outlet-room-b', distance: 2 },
        { from: 'outlet-room-a', to: 'outlet-room-b', distance: 4 },
      ],
    },
    scale: 1.5,
  };
}

// ─── Node ID helpers ───────────────────────────────────────────

describe('node ID helpers', () => {
  it('getOutletNodeId returns outlet-{roomId}', () => {
    expect(getOutletNodeId('living-room')).toBe('outlet-living-room');
  });

  it('getPanelNodeId returns panel', () => {
    expect(getPanelNodeId()).toBe('panel');
  });
});

// ─── findShortestPath ──────────────────────────────────────────

describe('findShortestPath', () => {
  it('finds shortest path in diamond graph (A→D via B, distance 3)', () => {
    const graph = makeDiamondGraph();
    const result = findShortestPath(graph, 'A', 'D');
    expect(result).not.toBeNull();
    expect(result!.distance).toBe(3); // A→B(1) + B→D(2) = 3
    expect(result!.nodeIds[0]).toBe('A');
    expect(result!.nodeIds[result!.nodeIds.length - 1]).toBe('D');
  });

  it('returns distance 0 for same node', () => {
    const graph = makeDiamondGraph();
    const result = findShortestPath(graph, 'A', 'A');
    expect(result).not.toBeNull();
    expect(result!.distance).toBe(0);
    expect(result!.nodeIds).toEqual(['A']);
  });

  it('returns null for unreachable node', () => {
    const graph = makeDisconnectedGraph();
    const result = findShortestPath(graph, 'A', 'Z');
    expect(result).toBeNull();
  });

  it('returns null for non-existent node', () => {
    const graph = makeDiamondGraph();
    expect(findShortestPath(graph, 'A', 'X')).toBeNull();
    expect(findShortestPath(graph, 'X', 'A')).toBeNull();
  });

  it('finds direct path between adjacent nodes', () => {
    const graph = makeDiamondGraph();
    const result = findShortestPath(graph, 'A', 'B');
    expect(result).not.toBeNull();
    expect(result!.distance).toBe(1);
    expect(result!.nodeIds).toEqual(['A', 'B']);
  });

  it('path is bidirectional', () => {
    const graph = makeDiamondGraph();
    const forward = findShortestPath(graph, 'A', 'D');
    const backward = findShortestPath(graph, 'D', 'A');
    expect(forward!.distance).toBe(backward!.distance);
  });
});

// ─── calcRouteCandidates ───────────────────────────────────────

describe('calcRouteCandidates', () => {
  it('returns empty for empty roomIds', () => {
    const fp = makeTestFloorPlan();
    const result = calcRouteCandidates(fp, []);
    expect(result.candidates).toHaveLength(0);
  });

  it('returns single direct candidate for one room', () => {
    const fp = makeTestFloorPlan();
    const result = calcRouteCandidates(fp, ['room-a']);
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].strategy).toBe('direct');
    expect(result.candidates[0].totalDistance).toBe(2); // panel→outlet-room-a
    expect(result.candidates[0].paths.has('room-a')).toBe(true);
  });

  it('returns star and daisy-chain for multiple rooms', () => {
    const fp = makeTestFloorPlan();
    const result = calcRouteCandidates(fp, ['room-a', 'room-b']);
    expect(result.candidates.length).toBeGreaterThanOrEqual(2);

    const strategies = result.candidates.map(c => c.strategy);
    expect(strategies).toContain('star');
    expect(strategies).toContain('daisy-chain');
  });

  it('star strategy has individual paths from panel to each room', () => {
    const fp = makeTestFloorPlan();
    const result = calcRouteCandidates(fp, ['room-a', 'room-b']);
    const star = result.candidates.find(c => c.strategy === 'star')!;
    expect(star.paths.has('room-a')).toBe(true);
    expect(star.paths.has('room-b')).toBe(true);
    // Star total = panel→room-a (2) + panel→room-b (via junction, 3+2=5) = 7
    expect(star.totalDistance).toBe(7);
  });

  it('daisy-chain visits rooms in nearest-neighbor order', () => {
    const fp = makeTestFloorPlan();
    const result = calcRouteCandidates(fp, ['room-a', 'room-b']);
    const daisy = result.candidates.find(c => c.strategy === 'daisy-chain')!;
    expect(daisy.paths.has('room-a')).toBe(true);
    expect(daisy.paths.has('room-b')).toBe(true);
    // Daisy: panel→room-a (2) + room-a→room-b (4) = 6
    expect(daisy.totalDistance).toBe(6);
  });
});

// ─── calcRouteDistance ──────────────────────────────────────────

describe('calcRouteDistance', () => {
  it('returns distance for matching strategy', () => {
    const fp = makeTestFloorPlan();
    const dist = calcRouteDistance(fp, ['room-a'], 'direct');
    expect(dist).toBe(2);
  });

  it('returns first candidate distance for non-matching strategy', () => {
    const fp = makeTestFloorPlan();
    // Single room only has 'direct', requesting 'star' falls back
    const dist = calcRouteDistance(fp, ['room-a'], 'star');
    expect(dist).toBe(2); // fallback to first candidate
  });

  it('returns 0 for empty rooms', () => {
    const fp = makeTestFloorPlan();
    expect(calcRouteDistance(fp, [], 'direct')).toBe(0);
  });
});
