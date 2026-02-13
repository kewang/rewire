## ADDED Requirements

### Requirement: Lazy-loaded overlay components
GameBoard SHALL lazy-load PanelInteriorView, CrimpMiniGame, and RoutingStrategyPicker using React.lazy. These overlay components SHALL be wrapped in Suspense with `fallback={null}`.

#### Scenario: PanelInteriorView loads on demand
- **WHEN** the user triggers the routing overlay (走線整理 phase)
- **THEN** PanelInteriorView chunk is loaded and rendered without visible loading indicator

#### Scenario: CrimpMiniGame loads on demand
- **WHEN** a crimp operation is triggered (pendingCrimpCircuitId is set)
- **THEN** CrimpMiniGame chunk is loaded and rendered without visible loading indicator

#### Scenario: RoutingStrategyPicker loads on demand
- **WHEN** the user drags a wire to a multi-room circuit on the floor plan
- **THEN** RoutingStrategyPicker chunk is loaded and rendered without visible loading indicator

### Requirement: Lazy-loaded CircuitDiagram
GameBoard SHALL lazy-load CircuitDiagram using React.lazy. CircuitDiagram SHALL be wrapped in Suspense with a lightweight loading spinner fallback, since it occupies the main content area.

#### Scenario: CircuitDiagram loads for legacy layout
- **WHEN** a level without floorPlan is selected (legacy layout)
- **THEN** CircuitDiagram chunk is loaded and a loading spinner is shown until ready

#### Scenario: CircuitDiagram not loaded for floor plan layout
- **WHEN** a level with floorPlan is selected
- **THEN** CircuitDiagram chunk SHALL NOT be loaded

### Requirement: Lazy-loaded BeforeAfterView
ResultPanel SHALL lazy-load BeforeAfterView using React.lazy with `fallback={null}`.

#### Scenario: BeforeAfterView loads on old-house win
- **WHEN** the player wins an old-house level and the result panel displays
- **THEN** BeforeAfterView chunk is loaded and rendered below the result panel

### Requirement: Lazy-loaded BreakerSelector
CircuitDiagram SHALL lazy-load BreakerSelector using React.lazy with `fallback={null}`.

#### Scenario: BreakerSelector loads on NFB click
- **WHEN** the player clicks an NFB in an old-house level to change breaker
- **THEN** BreakerSelector chunk is loaded and rendered as a popup

### Requirement: FloorPlanPreview excluded from production
GameBoard SHALL conditionally import and render FloorPlanPreview only when `import.meta.env.DEV` is true. The production build SHALL NOT include FloorPlanPreview code.

#### Scenario: FloorPlanPreview available in development
- **WHEN** running in development mode (`npm run dev`)
- **THEN** FloorPlanPreview renders on the level select screen

#### Scenario: FloorPlanPreview excluded in production
- **WHEN** running a production build (`npm run build`)
- **THEN** FloorPlanPreview code is tree-shaken and not included in any output chunk

### Requirement: Initial bundle size target
The production build initial JS chunk SHALL be less than 350 KB (before gzip).

#### Scenario: Build output verification
- **WHEN** `npm run build` is executed
- **THEN** the main JS chunk size reported by Vite is less than 350 KB

### Requirement: Zero functional regression
All lazy-loaded components SHALL behave identically to their eager-loaded counterparts. No user-visible functionality SHALL change.

#### Scenario: Game flow unchanged
- **WHEN** playing any level (L01-L31 or random old house)
- **THEN** all game mechanics (wiring, simulation, scoring, crimp, routing, old-house repair) work exactly as before
