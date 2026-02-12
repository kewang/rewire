# gameboard-hooks Specification

## Purpose
TBD - created by archiving change gameboard-refactor. Update Purpose after archive.
## Requirements
### Requirement: useSimulationLoop hook
The system SHALL provide a `useSimulationLoop` hook in `src/hooks/useSimulationLoop.ts` that encapsulates the rAF simulation loop, leakage event processing, buzzing management, terminal state detection, win condition evaluation, and star rating calculation.

The hook SHALL accept parameters including: circuits array, circuit phases, circuit ELCB states, resolved configs, current level, preWiredCircuitIds ref, circuit wires ref, circuit route distances ref, circuit crimps ref, and aesthetics score ref.

The hook SHALL return: multiState, isPowered, result (GameResult), starResult, handlePowerToggle callback, and a reset function.

The hook SHALL maintain internal refs for: rafRef, prevTimeRef, multiStateRef, buzzingRef, hasWarningRef, hasTripRef, firedLeakageEventsRef, resolvedLeakageEventsRef, tickRef.

#### Scenario: rAF loop drives simulation
- **WHEN** isPowered is true
- **THEN** the hook SHALL run requestAnimationFrame loop calling stepMulti with circuits, phases, and mainBreakerRating, and update multiState each frame

#### Scenario: Leakage event processing
- **WHEN** current level has leakageMode 'scripted' or 'random'
- **THEN** the hook SHALL process leakage events within the tick function, updating circuit states to 'elcb-tripped' (with ELCB) or 'leakage' (without ELCB)

#### Scenario: Terminal state detection
- **WHEN** overallStatus reaches tripped/burned/neutral-burned/leakage/main-tripped
- **THEN** the hook SHALL stop the rAF loop, set isPowered=false, stop sounds, and set result accordingly

#### Scenario: Win condition
- **WHEN** elapsed time >= survivalTime
- **THEN** the hook SHALL calculate final cost, star rating, save results to localStorage, and set result to 'won' or 'over-budget'

#### Scenario: Power toggle
- **WHEN** handlePowerToggle is called
- **THEN** the hook SHALL start or stop the simulation loop, manage audio (powerOn/buzzing/applianceSounds), and reset tracking refs

#### Scenario: Reset
- **WHEN** reset is called
- **THEN** the hook SHALL cancel rAF, stop all sounds, reset all internal refs and state to initial values

### Requirement: useCircuitState hook
The system SHALL provide a `useCircuitState` hook in `src/hooks/useCircuitState.ts` that manages per-circuit wiring state including wire selection, appliance assignment, crimp results, ELCB toggles, phase toggles, and drag-and-drop wiring operations.

The hook SHALL accept parameters including: resolvedConfigs, currentLevel, circuitIds, and floor plan wiring callbacks.

The hook SHALL return: circuitWires, circuitAppliances, circuitCrimps, wiring, circuitElcb, circuitPhases, circuits (derived Circuit[]), pendingCrimpCircuitId, pendingCrimpWire, and all handler callbacks (handleDragStart/Move/End, handleCrimpComplete, handleTargetCircuitChange, handleToggleElcb, handleTogglePhase, handleAddAppliance, handleRemoveAppliance), plus a reset function.

The hook SHALL contain the `createInitialWiring` and `createInitialCircuitWires` utility functions.

#### Scenario: Wire drag and drop on legacy circuit diagram
- **WHEN** handleDragEnd is called with dropped=true and a valid targetCircuitId
- **THEN** the hook SHALL update wiring state for that circuit, set connectedWire, and trigger crimp flow if requiresCrimp

#### Scenario: Wire drag and drop on floor plan room
- **WHEN** handleDragEnd is called with a highlighted floor plan room
- **THEN** the hook SHALL delegate to the floor plan wiring callback (initiateFloorPlanWiring)

#### Scenario: Crimp completion
- **WHEN** handleCrimpComplete is called with a CrimpResult
- **THEN** the hook SHALL store the crimp result, update wiring state to isWired, and clear pending crimp state

#### Scenario: ELCB toggle
- **WHEN** handleToggleElcb is called for a circuit
- **THEN** the hook SHALL toggle the ELCB state for that circuit

#### Scenario: Phase toggle
- **WHEN** handleTogglePhase is called for a circuit
- **THEN** the hook SHALL toggle between 'R' and 'T' phase for that circuit

#### Scenario: Circuits derivation
- **WHEN** resolvedConfigs, circuitWires, circuitAppliances, circuitCrimps, or circuitBreakers change
- **THEN** the hook SHALL recompute the circuits array (Circuit[]) via useMemo

#### Scenario: Reset
- **WHEN** reset is called with circuitIds and optional level context
- **THEN** the hook SHALL reinitialize all state (wires, appliances, crimps, wiring, ELCB, phases) based on level type (free/fixed/old-house)

### Requirement: useOldHouseLogic hook
The system SHALL provide a `useOldHouseLogic` hook in `src/hooks/useOldHouseLogic.ts` that manages old house mode state including problem tracking, pre-wired circuit IDs, breaker replacement, unwiring, and before/after snapshots.

The hook SHALL accept parameters including: currentLevel, circuitWires, circuitCrimps, circuitElcb, circuitBreakers setters, and wiring-related setters.

The hook SHALL return: preWiredCircuitIds, preWiredCircuitIdsRef, circuitBreakers, oldHouseSnapshot, problemCircuits (derived Set), handleUnwire, handleChangeBreaker, initOldHouse (for handleSelectLevel), and a reset function.

#### Scenario: Problem circuits derivation
- **WHEN** current level has oldHouse config and circuit state changes
- **THEN** the hook SHALL compute problemCircuits as a useMemo Set of unresolved problem circuit IDs using isProblemResolved

#### Scenario: Unwire operation
- **WHEN** handleUnwire is called for a pre-wired circuit
- **THEN** the hook SHALL clear wire/crimp/appliances for that circuit, update wiring to unwired, and remove from preWiredCircuitIds

#### Scenario: Breaker change
- **WHEN** handleChangeBreaker is called with a circuit ID and new breaker
- **THEN** the hook SHALL update circuitBreakers for that circuit

#### Scenario: Old house initialization
- **WHEN** initOldHouse is called for a fixed level with oldHouse config
- **THEN** the hook SHALL set up preWiredCircuitIds, circuitBreakers, oldHouseSnapshot, and initial ELCB state

#### Scenario: Reset
- **WHEN** reset is called
- **THEN** the hook SHALL clear all old house state (preWiredCircuitIds, circuitBreakers, oldHouseSnapshot)

### Requirement: useFloorPlanInteraction hook
The system SHALL provide a `useFloorPlanInteraction` hook in `src/hooks/useFloorPlanInteraction.ts` that manages floor plan wiring interaction state including routing strategies, route distances/paths, pending routing, candidate routes, room highlight, sidebar collapse, room popover, and all derived FloorPlanView data (assignments, connected paths, simulation state, problem rooms, room-circuit map, appliance counts/details).

The hook SHALL accept parameters including: currentLevel, circuitIds, circuitConfigs, circuitWires, multiState, roomToCircuitMap, currentFloorPlan, isPowered, circuitRoutePaths (self-managed), and circuitCrimps/wiring setters.

The hook SHALL return: all floor plan state, derived useMemo values (floorPlanCircuitAssignments, floorPlanConnectedPaths, floorPlanCandidatePaths, floorPlanSimulationState, floorPlanProblemRooms, floorPlanRoomCircuitMap, floorPlanApplianceCounts, floorPlanApplianceDetails), handler callbacks (handleFloorPlanRoomClick, handleFloorPlanRoomHover, handleSelectRoutingStrategy, handleCancelRoutingStrategy, completeFloorPlanWiring, initiateFloorPlanWiring), sidebarCollapsed/setSidebarCollapsed, roomPopover/setRoomPopover, and a reset function.

#### Scenario: Room hover highlighting
- **WHEN** handleFloorPlanRoomHover is called with a room ID
- **THEN** the hook SHALL update floorPlanHighlightedRoom and floorPlanHighlightedRoomRef

#### Scenario: Room click for popover
- **WHEN** handleFloorPlanRoomClick is called in planning phase
- **THEN** the hook SHALL open the CircuitAssignmentPopover with room position and current circuit assignment

#### Scenario: Routing strategy selection
- **WHEN** handleSelectRoutingStrategy is called with 'star' or 'daisy-chain'
- **THEN** the hook SHALL store route paths/distances, clear pending routing, and trigger crimp if needed

#### Scenario: Floor plan wiring initiation
- **WHEN** initiateFloorPlanWiring is called for a circuit with rooms
- **THEN** the hook SHALL calculate route candidates and either auto-select direct route or show RoutingStrategyPicker

#### Scenario: Simulation state derivation
- **WHEN** multiState or isPowered changes
- **THEN** the hook SHALL recompute floorPlanSimulationState with circuit statuses and mainTripped flag

#### Scenario: Reset
- **WHEN** reset is called
- **THEN** the hook SHALL clear all routing/interaction state and reset sidebar to default

### Requirement: usePlannerState hook
The system SHALL provide a `usePlannerState` hook in `src/hooks/usePlannerState.ts` that manages the circuit planner state for free circuit levels including planner circuits CRUD, phase/ELCB toggles, appliance assignment/unassignment, room-to-circuit assignment, planning confirmation, and derived validation/cost values.

The hook SHALL accept parameters including: currentLevel and t (i18n translation function).

The hook SHALL return: gamePhase, plannerCircuits, plannerNextId, selectedPlannerCircuitId, plannerTotalCost, plannerAllAssigned, plannerAllWired, plannerWetAreaMissingElcb, plannerCanConfirm, plannerConfirmTooltip, and all handler callbacks (handleAddPlannerCircuit, handleDeletePlannerCircuit, handleChangePlannerVoltage, handleChangePlannerBreaker, handleSelectPlannerWire, handleAssignAppliance, handleUnassignPlannerAppliance, handleChangePlannerPhase, handleChangePlannerElcb, handleAssignRoomToCircuit, handleAddCircuitAndAssignRoom, handleUnassignRoom, handleConfirmPlanning, setSelectedPlannerCircuitId, setGamePhase), and a reset function.

The hook SHALL emit confirmation results (resolvedConfigs, circuitWires, circuitAppliances, wiring, circuitPhases, circuitElcb, resolvedLeakageEvents) via a callback or return value when handleConfirmPlanning is called.

#### Scenario: Add planner circuit
- **WHEN** handleAddPlannerCircuit is called
- **THEN** the hook SHALL add a new PlannerCircuit with auto-incremented ID, default voltage 110V, default breaker 20A, and auto-assigned phase (if phaseMode exists)

#### Scenario: Assign appliance to circuit
- **WHEN** handleAssignAppliance is called with an appliance
- **THEN** the hook SHALL assign it to the selected circuit (if voltage matches) or auto-assign to the single matching circuit

#### Scenario: Confirm planning
- **WHEN** handleConfirmPlanning is called and plannerCanConfirm is true
- **THEN** the hook SHALL convert plannerCircuits to CircuitConfig[], generate wiring/wire/appliance/phase/ELCB state, resolve leakage events, set gamePhase to 'active', and emit results

#### Scenario: Cost calculation
- **WHEN** plannerCircuits change
- **THEN** the hook SHALL recompute plannerTotalCost as sum of wire cost + NFB cost + ELCB cost

#### Scenario: Validation
- **WHEN** plannerCircuits change
- **THEN** the hook SHALL recompute plannerAllAssigned, plannerAllWired, plannerWetAreaMissingElcb, and plannerCanConfirm

#### Scenario: Reset
- **WHEN** reset is called
- **THEN** the hook SHALL clear all planner state and set gamePhase to 'planning' (for free levels) or 'active' (for fixed levels)

### Requirement: GameBoard composition
GameBoard.tsx SHALL import and compose all 5 hooks, passing outputs of one hook as inputs to others where cross-hook data is needed. GameBoard SHALL retain handleSelectLevel, handleRetry, and handleBackToLevels (which call each hook's reset method). GameBoard SHALL retain all JSX rendering.

GameBoard.tsx SHALL be < 500 lines after refactoring.

#### Scenario: Hook composition in GameBoard
- **WHEN** GameBoard renders
- **THEN** it SHALL call all 5 hooks with appropriate parameters and wire their outputs together

#### Scenario: Level selection resets all hooks
- **WHEN** handleSelectLevel is called
- **THEN** GameBoard SHALL call reset/init methods on all relevant hooks

#### Scenario: Retry resets all hooks
- **WHEN** handleRetry is called
- **THEN** GameBoard SHALL call reset methods on all hooks and reinitialize state based on level type

#### Scenario: Zero functional change
- **WHEN** the refactoring is complete
- **THEN** all game behaviors (wiring, simulation, scoring, old house, floor plan, planner) SHALL be identical to pre-refactoring

