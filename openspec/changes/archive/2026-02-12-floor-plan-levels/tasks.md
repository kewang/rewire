## 1. Imports and Setup

- [x] 1.1 Add FLOOR_PLAN_M, FLOOR_PLAN_L, FLOOR_PLAN_XL imports to `src/data/levels.ts`
- [x] 1.2 Add new appliance destructuring for L29-L31 needs (ensure all 13 appliances accessible)

## 2. L01-L05 Floor Plan Assignment (FLOOR_PLAN_S)

- [x] 2.1 Add `floorPlan: FLOOR_PLAN_S` to L01-L05 and recalibrate budgets based on S routing distances

## 3. L06-L17 Room ID Remapping + Floor Plan (FLOOR_PLAN_M)

- [x] 3.1 Update L07-L10 room IDs to match FLOOR_PLAN_M rooms (living→living-room, bedroom→master-bedroom, laundry→second-bedroom, storage→entrance) and add `floorPlan: FLOOR_PLAN_M`
- [x] 3.2 Update L11-L12 room IDs (living→living-room, ac→master-bedroom, storage→entrance) and add `floorPlan: FLOOR_PLAN_M`
- [x] 3.3 Update L13-L15 room IDs (bedroom→master-bedroom, storage→entrance, living→living-room, ac→master-bedroom) and add `floorPlan: FLOOR_PLAN_M`
- [x] 3.4 Update L16-L17 room IDs (living→living-room, ac→master-bedroom) and add `floorPlan: FLOOR_PLAN_M`

## 4. L18-L20 Floor Plan Assignment (FLOOR_PLAN_L)

- [x] 4.1 Add `floorPlan: FLOOR_PLAN_L` to L18-L20 and recalibrate budgets

## 5. L21-L23 Room ID Remapping + Floor Plan (FLOOR_PLAN_M)

- [x] 5.1 Update L21-L23 room IDs (living→living-room, storage→entrance, balcony→second-bedroom, bedroom→master-bedroom, ac→master-bedroom) and add `floorPlan: FLOOR_PLAN_M`

## 6. L24-L28 Floor Plan Assignment (FLOOR_PLAN_L)

- [x] 6.1 Add `floorPlan: FLOOR_PLAN_L` to L24-L28 and recalibrate budgets

## 7. Budget Recalibration

- [x] 7.1 Write a temporary calculation script to compute minimum wire costs for each level based on actual routing distances, then update all budgets in levels.ts

## 8. New Levels L29-L31 (FLOOR_PLAN_XL)

- [x] 8.1 Add L29 豪宅配電 (FreeCircuitLevel, XL, 12 rooms, phaseMode manual, leakageMode random, requiresCrimp)
- [x] 8.2 Add L30 豪宅翻修 (FixedCircuitLevel, XL, 6 circuits, oldHouse + routing, aesthetics-score bonus)
- [x] 8.3 Add L31 終極豪宅 (FixedCircuitLevel, XL, 7 circuits, all mechanics, under-budget-ratio bonus)

## 9. i18n Translations

- [x] 9.1 Add L29-L31 level name and description translations to all 6 locale files (zh-TW, en, ja, ko, fr, th)

## 10. Verification

- [x] 10.1 Run `npm run build` to verify TypeScript compilation passes
- [x] 10.2 Verify all level room IDs are valid subsets of their assigned floor plan room IDs
