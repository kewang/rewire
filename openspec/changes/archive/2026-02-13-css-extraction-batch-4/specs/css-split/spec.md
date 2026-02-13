## MODIFIED Requirements

### Requirement: Per-component CSS files
Each React component SHALL have its own CSS file co-located in the same directory, imported via side-effect import. All 20 components SHALL have extracted CSS files, with App.css retaining only cross-component shared styles.

#### Scenario: Component imports its own CSS
- **WHEN** a component's styles are extracted from App.css
- **THEN** the component file SHALL contain `import './ComponentName.css'`
- **AND** the CSS file SHALL contain only styles used by that component
- **AND** App.css SHALL no longer contain those styles

#### Scenario: Batch 4 completes all remaining extractions
- **WHEN** the final 12 components are extracted (CircuitDiagram, CrimpMiniGame, PanelInteriorView, CircuitPlanner, RoomPanel, CircuitCard, BreakerSelector, FloorPlanView, CircuitAssignmentPopover, CircuitPlannerSidebar, WireToolbar, RoutingStrategyPicker)
- **THEN** App.css SHALL contain only shared styles (ELCB Panel, Phase Balance, Cards shared, circuit-tabs, voltage-badge, wire-card drag, global responsive layout)
- **AND** App.css SHALL be reduced from ~3693 lines to ~400 lines

#### Scenario: Responsive rules follow component
- **WHEN** a component has associated `@media` responsive rules in App.css
- **THEN** those responsive rules SHALL be moved into the component's CSS file
- **AND** App.css SHALL only retain responsive rules for shared/global layout classes

#### Scenario: Build output unchanged
- **WHEN** the project is built with Vite
- **THEN** the final CSS bundle SHALL contain identical styles as before extraction
- **AND** no visual or functional regression SHALL occur
