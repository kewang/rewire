## 1. Level Data Definition

- [x] 1.1 Add L06 level definition to `src/data/levels.ts`: dual-circuit (c1 廚房 [快煮壺, 微波爐] + c2 客廳 [吹風機]), budget=$120, survivalTime=8s
- [x] 1.2 Add L07 level definition to `src/data/levels.ts`: triple-circuit (c1 廚房 [快煮壺, 廚下加熱器] + c2 臥室 [吹風機] + c3 洗衣間 [烘衣機]), budget=$130, survivalTime=10s
- [x] 1.3 Add L08 level definition to `src/data/levels.ts`: triple-circuit with shared appliance pool (c1 廚房A [快煮壺, 微波爐, 廚下加熱器] + c2 廚房B [快煮壺, 微波爐, 廚下加熱器] + c3 客廳 [吹風機, 烘衣機]), budget=$180, survivalTime=15s

## 2. Verification

- [x] 2.1 Run `npm run build` to verify TypeScript compilation with no errors
- [x] 2.2 Run `npm run lint` to verify no lint errors introduced (all 5 issues are pre-existing)
- [x] 2.3 Manual smoke test: verify L01-L05 still work correctly (regression)
- [x] 2.4 Manual smoke test: verify L06 dual-circuit gameplay — correct appliance assignment, wiring, and pass/fail conditions
- [x] 2.5 Manual smoke test: verify L07 triple-circuit budget constraint — 2.0mm² on c1 passes, 3.5mm² on c1 exceeds budget
- [x] 2.6 Manual smoke test: verify L08 shared appliance pool — appliance exclusivity across c1/c2, balanced distribution passes

## 3. Bug Fixes (discovered during testing)

- [x] 3.1 Fix multi-circuit NFB lever not interactive — global power lever overlay was only rendered for single-circuit (`isSingle`), now renders on ALL circuits' NFBs
- [x] 3.2 Fix multi-circuit appliance auto-assignment — appliances that belong to exactly one circuit are now auto-assigned on level load (covers L06/L07 fully, L08 partially with shared pool left for manual assignment)
- [x] 3.3 Fix multi-circuit NFB too small — grid center column was fixed 280px, added `multi-circuit` class to widen layout (max-width 1280px, flexible center column), SVG maxWidth adjusted to n×260 for consistent scale factor
- [x] 3.4 Fix circuit label text clipped — CIRCUIT_HEIGHT 280→300, circuit label moved from y=278 to y=286 (14px below status text), no longer overlaps or gets cut off by viewBox
