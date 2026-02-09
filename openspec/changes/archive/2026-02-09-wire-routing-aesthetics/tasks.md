## 1. Constants & Types

- [x] 1.1 Add CROSSING_PENALTY=20 and UNBUNDLED_PENALTY=5 to constants.ts
- [x] 1.2 Add requiresRouting?: boolean to Level type in game.ts

## 2. Aesthetics Engine

- [x] 2.1 Create src/engine/aesthetics.ts with detectCrossings (extracted from PanelInteriorView)
- [x] 2.2 Add countUnbundledPairs function to aesthetics.ts
- [x] 2.3 Add calcAestheticsScore function to aesthetics.ts
- [x] 2.4 Update PanelInteriorView to import detectCrossings from aesthetics.ts instead of local

## 3. Cable Tie UI

- [x] 3.1 Add cableTies and onToggleCableTie props to PanelInteriorView
- [x] 3.2 Render cable tie placement points between adjacent lanes in SVG
- [x] 3.3 Implement cable tie visual states (available/placed/disabled-crossing)
- [x] 3.4 Add cable tie toggle click handler with crossing check
- [x] 3.5 Add aestheticsScore prop and update score bar display

## 4. GameBoard Routing Flow

- [x] 4.1 Add routing state to GameBoard (circuitLanes, cableTies, routingCompleted, showRoutingOverlay)
- [x] 4.2 Initialize circuitLanes in handleSelectLevel for requiresRouting levels
- [x] 4.3 Add "整線" button visibility logic (all wired + crimped → show button)
- [x] 4.4 Wire up PanelInteriorView overlay open/close with showRoutingOverlay state
- [x] 4.5 Implement onLanesChange callback (update lanes + clear cable ties)
- [x] 4.6 Implement onToggleCableTie callback (toggle Set entry)
- [x] 4.7 Calculate aestheticsScore and pass to PanelInteriorView
- [x] 4.8 Handle "完成整線" → set routingCompleted=true, close overlay

## 5. Power-on & Results

- [x] 5.1 Update canPowerOn condition: add (!requiresRouting || routingCompleted) check
- [x] 5.2 Update leverTooltip: add "請先完成整線" message
- [x] 5.3 Add aestheticsScore prop to ResultPanel
- [x] 5.4 Render aesthetics score display with color coding (≥80 green, ≥50 yellow, <50 red)
- [x] 5.5 Pass aestheticsScore from GameBoard to ResultPanel on win

## 6. Star Rating Extension

- [x] 6.1 Add aestheticsScore?: number to CalcStarsInput interface in scoring.ts
- [x] 6.2 Pass aestheticsScore to calcStars call in GameBoard

## 7. CSS Styling

- [x] 7.1 Add cable tie visual styles (available/placed/disabled) to App.css
- [x] 7.2 Add "整線" button styles to App.css
- [x] 7.3 Add ResultPanel aesthetics score display styles

## 8. Build & Verify

- [x] 8.1 Run npm run build — verify no TypeScript errors
- [x] 8.2 Run npm run lint — verify no ESLint errors
- [x] 8.3 Verify L01-L20 are unaffected (requiresRouting undefined → no routing UI)
