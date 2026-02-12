## Why

All L01-L28 levels currently lack `floorPlan` data (except L06 which has `FLOOR_PLAN_S`), meaning most levels still fall back to the legacy CircuitDiagram view. To deliver the unified floor-plan experience promised in PRD v0.9, every level needs a floor plan assignment with budget recalibrated for distance-based wire costs. Additionally, 3 new XL-house levels (L29-L31) are needed to showcase the full spatial challenge.

## What Changes

- Assign `floorPlan` to all L01-L28 levels (S for L01-L05, M for L06-L17/L21-L23, L for L18-L20/L24-L28) per PRD mapping
- Recalibrate `budget` for every level based on routing-distance wire costs instead of fixed 10m
- Add L29 (豪宅配電), L30 (豪宅翻修), L31 (終極豪宅) using FLOOR_PLAN_XL
- Adjust room IDs in FreeCircuitLevel.rooms to match actual floor plan room IDs (e.g., `living` → `living-room`)
- Import FLOOR_PLAN_M and FLOOR_PLAN_L in levels.ts

## Capabilities

### New Capabilities
- `floor-plan-level-definitions`: All L01-L31 level definitions with floorPlan assignments, budget recalibration, and 3 new XL levels

### Modified Capabilities
- `preset-floor-plans`: May need minor adjustments if room IDs don't match level room references
- `free-circuit-level-definitions`: Room IDs in existing FreeCircuitLevel definitions must align with floor plan room IDs

## Impact

- `src/data/levels.ts` — Major rewrite: all 28 levels get floorPlan + budget changes, 3 new levels added
- `src/data/floorPlans.ts` — Possible minor tweaks if room ID mismatches found
- `src/data/constants.ts` — DEFAULT_WIRE_LENGTH may need deprecation note
- `src/locales/*.json` — New level names/descriptions for L29-L31 (6 languages)
- localStorage `rewire-stars` — Budget changes may invalidate existing star ratings (acceptable per PRD)
