## Context

v0.9 floor-plan-planner (change 6) is complete. L06 already has `floorPlan: FLOOR_PLAN_S` as proof of concept. All other levels (L01-L05, L07-L28) still lack floor plans, falling back to legacy CircuitDiagram. This change completes the floor plan coverage for all levels and adds 3 new XL levels (L29-L31).

Key constraint: FreeCircuitLevel.rooms[].id MUST match FloorPlan.rooms[].id for the CircuitAssignmentPopover to correctly map appliances to physical rooms. Several existing levels use conceptual room IDs (`living`, `storage`, `ac`, `laundry`, `balcony`) that don't exist in any floor plan.

## Goals / Non-Goals

**Goals:**
- Assign floorPlan to all L01-L28 levels per PRD mapping (S/M/L/XL)
- Remap FreeCircuitLevel room IDs to match physical floor plan room IDs
- Recalibrate budgets based on distance-based wire costs
- Add L29-L31 using FLOOR_PLAN_XL
- Add i18n translations for L29-L31 names/descriptions (6 languages)

**Non-Goals:**
- Modifying floor plan definitions (floorPlans.ts stays as-is)
- Changing simulation engine or scoring logic
- Touching GameBoard code (already handles floorPlan conditionally)
- Modifying routing engine

## Decisions

### 1. Room ID remapping strategy

**Decision:** Change FreeCircuitLevel room IDs to match physical floor plan rooms. The room `name` (display label) can differ from FloorPlanRoom.label — the circuit planner shows Level.rooms[].name while the floor plan shows FloorPlanRoom.label.

Remapping table for M floor plan (master-bedroom, bathroom, living-room, second-bedroom, entrance, kitchen):

| Old room ID | New room ID | Rationale |
|-------------|-------------|-----------|
| `living` | `living-room` | Direct match |
| `bedroom` | `master-bedroom` | Primary bedroom |
| `storage` | `entrance` | Storage near entrance area |
| `laundry` | `second-bedroom` | Repurpose as utility space |
| `ac` | `master-bedroom` | Split AC commonly in bedroom |
| `balcony` | `second-bedroom` | Dryer in second room |

When a level needs both `living-room` appliances AND `ac` appliances, merge them into separate rooms:
- L11: kitchen + living-room + master-bedroom(AC)
- L12: kitchen + living-room + entrance(fridge) + master-bedroom(AC)
- L15: kitchen + living-room + bathroom + master-bedroom(AC)
- L22: kitchen + living-room + second-bedroom(dryer) + entrance(fridge) + master-bedroom(dehumidifier)

**Alternative considered:** Adding rooms to floor plans (e.g., laundry room in M). Rejected — would require RoutingGraph changes, excessive scope.

### 2. Budget recalibration approach

**Decision:** Calculate per-level optimal wire distance using the routing engine, then set budget = optimal cost × 1.2-1.3 headroom factor.

Steps:
1. For each level, identify which rooms have appliances
2. Calculate shortest path distance from panel to each room's outlet
3. For multi-room circuits, use minimum of star vs daisy-chain distance
4. Calculate minimum wire cost = Σ (cheapest viable wire × route distance)
5. Add NFB + ELCB costs
6. Set budget = minimum cost × 1.25 (±5% tuning)

Fixed circuit levels (L01-L05, L18-L28): wire costs change but NFB/ELCB costs don't.
Free circuit levels (L06-L17, L21-L23): total costs include wire + NFB + ELCB.

**Note:** Exact budget numbers need playtest verification. Initial values use calculated estimates.

### 3. Fixed circuit levels and floor plan rooms

For FixedCircuitLevel (L01-L05, L18-L28), circuitConfigs have labels like "廚房", "客廳" etc. These labels are display-only and don't directly reference floor plan room IDs. The floor plan provides spatial context:
- Routing distance calculation uses the circuit label to infer room mapping
- FloorPlanView shows all rooms but only highlights the ones involved in the level
- The game board uses a mapping from circuit IDs to floor plan rooms for simulation visuals

For L01-L05 (FLOOR_PLAN_S), mapping:
- c1 "主迴路" → entire flat (single circuit covers all rooms)

For L18-L28 (FLOOR_PLAN_L), the circuit labels map to physical rooms for visualization.

### 4. L29-L31 design

Following PRD v0.9 FR-J-G specifications:
- L29: FreeCircuitLevel, XL, 12 rooms, full spatial challenge
- L30: FixedCircuitLevel, XL, 6 circuits, old house + routing
- L31: FixedCircuitLevel, XL, 7 circuits, all mechanics combined

All three use FLOOR_PLAN_XL.

## Risks / Trade-offs

- **[Budget invalidation]** → Changing budgets may invalidate existing star ratings in localStorage. Mitigation: Acceptable per PRD, budget changes improve game balance.
- **[Room ID mismatch]** → Conceptual rooms (laundry, storage, ac) mapped to physical rooms may feel semantically odd. Mitigation: Room `name` in level data still says the conceptual name; only `id` changes for technical matching.
- **[Distance calculation accuracy]** → Budget estimates depend on routing engine distances which may vary from manual estimates. Mitigation: Calculate actual distances in implementation, then tune budgets.
- **[Large diff]** → levels.ts rewrite affects all 28 levels + 3 new = significant change. Mitigation: Purely data changes, no logic changes.
