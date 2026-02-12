## ADDED Requirements

### Requirement: Floor plan imports available in levels.ts

`src/data/levels.ts` SHALL import `FLOOR_PLAN_S`, `FLOOR_PLAN_M`, `FLOOR_PLAN_L`, and `FLOOR_PLAN_XL` from `../data/floorPlans` for use in level definitions.

#### Scenario: All 4 floor plan constants imported
- **WHEN** reading src/data/levels.ts import statements
- **THEN** FLOOR_PLAN_S, FLOOR_PLAN_M, FLOOR_PLAN_L, FLOOR_PLAN_XL MUST all be imported from '../data/floorPlans'
