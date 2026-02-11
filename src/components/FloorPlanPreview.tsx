import FloorPlanView, { CIRCUIT_COLORS, type CircuitAssignment, type ConnectedPathGroup } from './FloorPlanView';
import { FLOOR_PLAN_S, FLOOR_PLAN_M, FLOOR_PLAN_L, FLOOR_PLAN_XL } from '../data/floorPlans';
import { calcRouteCandidates } from '../engine/routing';
import type { FloorPlan } from '../types/floorPlan';
import type { RoutePath } from '../engine/routing';

/** Demo: create circuit assignments for first N rooms */
function demoAssignments(plan: FloorPlan, count: number): Map<string, CircuitAssignment> {
  const m = new Map<string, CircuitAssignment>();
  for (let i = 0; i < Math.min(count, plan.rooms.length); i++) {
    m.set(plan.rooms[i].id, {
      circuitIndex: i,
      color: CIRCUIT_COLORS[i % CIRCUIT_COLORS.length],
    });
  }
  return m;
}

/** Demo: create connected paths for assigned rooms */
function demoConnectedPaths(plan: FloorPlan, assignments: Map<string, CircuitAssignment>): ConnectedPathGroup[] {
  const groups: ConnectedPathGroup[] = [];
  for (const [roomId, asgn] of assignments) {
    const cands = calcRouteCandidates(plan, [roomId]);
    if (cands.candidates.length > 0) {
      const paths = new Map<string, RoutePath>();
      const firstCand = cands.candidates[0];
      const path = firstCand.paths.get(roomId);
      if (path) paths.set(roomId, path);
      groups.push({
        circuitIndex: asgn.circuitIndex,
        wireColor: asgn.color,
        paths,
      });
    }
  }
  return groups;
}

const PLANS = [
  { label: 'S — 套房 (4×4)', plan: FLOOR_PLAN_S, assignCount: 2 },
  { label: 'M — 兩房 (6×4)', plan: FLOOR_PLAN_M, assignCount: 3 },
  { label: 'L — 三房 (8×6)', plan: FLOOR_PLAN_L, assignCount: 4 },
  { label: 'XL — 豪宅 (10×6)', plan: FLOOR_PLAN_XL, assignCount: 5 },
] as const;

/** Development preview: renders all 4 floor plan sizes for visual verification */
export default function FloorPlanPreview() {
  return (
    <div className="floor-plan-preview">
      <h3>Floor Plan Preview</h3>
      <div className="floor-plan-preview-grid">
        {PLANS.map(({ label, plan, assignCount }) => {
          const assignments = demoAssignments(plan, assignCount);
          const connected = demoConnectedPaths(plan, assignments);
          // Show candidates for unassigned rooms
          const unassignedRooms = plan.rooms
            .filter(r => !assignments.has(r.id))
            .slice(0, 2)
            .map(r => r.id);
          const candidates = unassignedRooms.length > 0
            ? calcRouteCandidates(plan, unassignedRooms).candidates
            : [];
          return (
            <div key={label} className="floor-plan-preview-item">
              <h4>{label}</h4>
              <FloorPlanView
                floorPlan={plan}
                circuitAssignments={assignments}
                connectedPaths={connected}
                candidatePaths={candidates}
                onPanelClick={() => console.log(`Panel clicked: ${label}`)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
