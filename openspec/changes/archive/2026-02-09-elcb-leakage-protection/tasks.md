## 1. Type System & Constants

- [x] 1.1 Add `wetArea?: boolean` to CircuitConfig in `src/types/game.ts`
- [x] 1.2 Add `leakageMode?: 'scripted' | 'random'` and `leakageEvents?: LeakageEvent[]` to Level type, define LeakageEvent type
- [x] 1.3 Extend SimulationStatus to include `'elcb-tripped'` and `'leakage'`
- [x] 1.4 Update `worstStatus` helper in `src/types/helpers.ts` to handle `elcb-tripped` (severity=2) and `leakage` (severity=3)
- [x] 1.5 Add `LEAKAGE_CHANCE_PER_SECOND = 0.05` constant to `src/data/constants.ts`

## 2. Simulation Engine

- [x] 2.1 Update `step` function in `src/engine/simulation.ts` to treat `elcb-tripped` and `leakage` as terminal states (early return)
- [x] 2.2 Update `stepMulti` to skip elcb-tripped circuits in neutral current calculation

## 3. Game Controller (GameBoard)

- [x] 3.1 Add wetArea ELCB power-on check: disable NFB switch if any wetArea circuit lacks ELCB, show tooltip/hint message
- [x] 3.2 Implement scripted leakage event driver in rAF loop: track triggered events, fire at specified elapsed times
- [x] 3.3 Implement random leakage event driver in rAF loop: per-frame probability check for active wetArea circuits
- [x] 3.4 Implement leakage event handler: set status to `elcb-tripped` (with ELCB) or `leakage` (without ELCB)

## 4. UI Updates

- [x] 4.1 Update CircuitDiagram SVG to show ELCB-tripped visual state (distinct from NFB tripped)
- [x] 4.2 Update StatusDisplay to show ELCB status and leakage event notifications
- [x] 4.3 Update ResultPanel to display `leakage` and `elcb-tripped` failure/status messages
- [x] 4.4 Update power-on button disabled tooltip to include wetArea ELCB requirement message

## 5. Level Data

- [x] 5.1 Define L13 (ELCB 入門) in `src/data/levels.ts` with scripted leakage event at 5s
- [x] 5.2 Define L14 (ELCB 預算壓力) with random leakage mode and 3 circuits
- [x] 5.3 Define L15 (綜合挑戰) with manual phase mode + random leakage + 4 circuits + wetArea

## 6. Integration & Polish

- [x] 6.1 Verify ELCB cost calculation still works correctly with wetArea circuits
- [x] 6.2 Verify existing L01-L12 levels unaffected (no wetArea, no leakage, no regression)
- [x] 6.3 Build check (`npm run build`) — no TypeScript errors
- [x] 6.4 Lint check (`npm run lint`) — no ESLint errors
