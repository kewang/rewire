## 1. Extract Circuit Diagram & Mini-Game CSS

- [x] 1.1 Extract CircuitDiagram styles (L268-287 NFB + L315-452 + L845-863 old-house) to CircuitDiagram.css
- [x] 1.2 Extract CrimpMiniGame styles (L453-843 + mobile L2171-2191) to CrimpMiniGame.css
- [x] 1.3 Add CSS imports to CircuitDiagram.tsx and CrimpMiniGame.tsx

## 2. Extract Panel & Planner CSS

- [x] 2.1 Extract PanelInteriorView styles (L864-1389 + tablet/mobile responsive) to PanelInteriorView.css
- [x] 2.2 Extract CircuitPlanner styles (L1391-1407 + L1889-2033 + responsive) to CircuitPlanner.css
- [x] 2.3 Extract RoomPanel styles (L1409-1512) to RoomPanel.css
- [x] 2.4 Extract CircuitCard styles (L1513-1888 + mobile) to CircuitCard.css
- [x] 2.5 Add CSS imports to PanelInteriorView.tsx, CircuitPlanner.tsx, RoomPanel.tsx, CircuitCard.tsx

## 3. Extract Selector & Floor Plan CSS

- [x] 3.1 Extract BreakerSelector styles (L2260-2428) to BreakerSelector.css
- [x] 3.2 Extract FloorPlanView styles (L2429-2586 + preview L3399-3431 + mobile) to FloorPlanView.css
- [x] 3.3 Extract CircuitAssignmentPopover styles (L2588-2678) to CircuitAssignmentPopover.css
- [x] 3.4 Add CSS imports to BreakerSelector.tsx, FloorPlanView.tsx, CircuitAssignmentPopover.tsx

## 4. Extract Sidebar & Toolbar CSS

- [x] 4.1 Extract CircuitPlannerSidebar styles (L2679-3228 + mobile/tablet responsive) to CircuitPlannerSidebar.css
- [x] 4.2 Extract WireToolbar styles (L3229-3398 + mobile) to WireToolbar.css
- [x] 4.3 Extract RoutingStrategyPicker styles (L3433-3598) to RoutingStrategyPicker.css
- [x] 4.4 Add CSS imports to CircuitPlannerSidebar.tsx, WireToolbar.tsx, RoutingStrategyPicker.tsx

## 5. Clean Up App.css

- [x] 5.1 Remove all extracted styles from App.css, retaining only shared styles (ELCB Panel, Phase Balance, Cards, circuit-tabs, voltage-badge, wire-card, global responsive layout)
- [x] 5.2 Verify App.css reduced to ~400 lines with only cross-component shared styles

## 6. Verification

- [x] 6.1 Run lint (0 errors/warnings)
- [x] 6.2 Run build (Vite production build succeeds)
- [x] 6.3 Run tests (142/142 pass)
