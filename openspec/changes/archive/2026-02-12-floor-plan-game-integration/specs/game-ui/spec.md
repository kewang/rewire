## ADDED Requirements

### Requirement: Floor plan mode power button in toolbar
When a floor plan is active (`currentFloorPlan` exists), a power toggle button SHALL be rendered in the bottom toolbar area (alongside wire selectors). This button replaces the CircuitDiagram NFB lever for floor plan mode.

#### Scenario: Power button shows "送電" when not powered
- **WHEN** floor plan mode is active and isPowered is false
- **THEN** a button with text "⚡ 送電" SHALL be displayed in the toolbar
- **AND** the button SHALL be styled consistently with the existing toolbar theme

#### Scenario: Power button disabled when conditions not met
- **WHEN** canPowerOn is false (not all circuits wired, or problems unresolved, or routing incomplete)
- **THEN** the power button SHALL be disabled with reduced opacity
- **AND** a tooltip SHALL indicate what conditions are missing

#### Scenario: Power button activates simulation
- **WHEN** player clicks the enabled power button
- **THEN** `handlePowerToggle()` SHALL be invoked, starting the simulation

#### Scenario: Power button shows "斷電" when powered
- **WHEN** simulation is active (isPowered is true)
- **THEN** the button text SHALL change to "⏹ 斷電"
- **AND** clicking SHALL stop the simulation

#### Scenario: Power button only in floor plan mode
- **WHEN** currentFloorPlan is null (no floor plan for this level)
- **THEN** the power button SHALL NOT be rendered (CircuitDiagram NFB lever is used instead)

### Requirement: GameBoard passes simulation state to FloorPlanView
GameBoard SHALL compute and pass a `simulationState` object to FloorPlanView containing the current simulation status of all circuits, derived from `multiState`.

#### Scenario: Simulation state computed from multiState
- **WHEN** GameBoard renders FloorPlanView during active simulation
- **THEN** GameBoard SHALL pass simulationState with: isPowered=true, circuitStates derived from multiState.circuitStates (status, wireHeat, totalCurrent per circuit), and mainTripped from multiState overallStatus

#### Scenario: Simulation state when not powered
- **WHEN** GameBoard renders FloorPlanView before simulation starts
- **THEN** GameBoard SHALL pass simulationState with isPowered=false and empty circuitStates

### Requirement: GameBoard passes problemRooms to FloorPlanView
GameBoard SHALL compute and pass a `problemRooms` map to FloorPlanView, derived from `problemCircuits` and `roomToCircuitMap`.

#### Scenario: Problem circuits mapped to rooms
- **WHEN** an old house level has problemCircuits with unresolved problems
- **THEN** GameBoard SHALL compute which rooms belong to problem circuits and pass `problemRooms` map to FloorPlanView

#### Scenario: No problem rooms for non-old-house levels
- **WHEN** the current level has no oldHouse configuration
- **THEN** GameBoard SHALL not pass problemRooms (or pass undefined) to FloorPlanView

### Requirement: GameBoard passes roomCircuitMap to FloorPlanView
GameBoard SHALL pass the existing `roomToCircuitMap` to FloorPlanView as a prop so FloorPlanView can look up circuit states per room.

#### Scenario: roomCircuitMap derived from existing state
- **WHEN** GameBoard renders FloorPlanView
- **THEN** GameBoard SHALL pass roomCircuitMap containing the mapping from room IDs to CircuitIds

#### Scenario: roomCircuitMap updates on circuit assignment changes
- **WHEN** circuit assignments change (e.g., during planning phase)
- **THEN** the roomCircuitMap prop SHALL reflect the updated assignments
