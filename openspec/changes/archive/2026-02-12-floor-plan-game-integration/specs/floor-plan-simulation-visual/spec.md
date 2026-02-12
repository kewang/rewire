## ADDED Requirements

### Requirement: FloorPlanView displays room power status during simulation
FloorPlanView SHALL visually indicate each room's power status based on its circuit's SimulationStatus when `isPowered` is true. Room visual states SHALL be: powered-normal (warm glow), warning (orange pulsing border), tripped/elcb-tripped (dimmed to opacity 0.3), burned/leakage (red pulsing flash), main-tripped (all rooms dimmed).

#### Scenario: Room powered normally
- **WHEN** simulation is active and a room's circuit status is 'normal'
- **THEN** the room rect SHALL have an increased fill brightness and a subtle warm glow effect (e.g., box-shadow or SVG filter)

#### Scenario: Room circuit in warning state
- **WHEN** simulation is active and a room's circuit wireHeat >= 0.3
- **THEN** the room rect border SHALL pulse orange with CSS animation

#### Scenario: Room circuit tripped
- **WHEN** simulation is active and a room's circuit status is 'tripped' or 'elcb-tripped'
- **THEN** the room rect SHALL dim (opacity reduced to 0.3) indicating power loss

#### Scenario: Room circuit burned
- **WHEN** simulation is active and a room's circuit status is 'burned' or 'leakage'
- **THEN** the room rect SHALL flash red with a pulsing animation

#### Scenario: Main breaker tripped dims all rooms
- **WHEN** `mainTripped` is true in simulationState
- **THEN** all rooms SHALL dim to opacity 0.3 regardless of individual circuit status

#### Scenario: Not powered shows default state
- **WHEN** simulation is not active (isPowered = false)
- **THEN** rooms SHALL display their normal assigned/unassigned visual state without power effects

### Requirement: FloorPlanView displays wiring path status during simulation
Connected wiring paths SHALL change color based on circuit wireHeat and status during simulation. The color SHALL transition smoothly using CSS transitions.

#### Scenario: Path normal during simulation
- **WHEN** simulation is active and circuit wireHeat < 0.3
- **THEN** the connected path SHALL remain in its wire gauge color at full opacity

#### Scenario: Path warning state
- **WHEN** simulation is active and circuit wireHeat >= 0.3 and < 0.7
- **THEN** the connected path stroke SHALL transition from wire gauge color toward orange

#### Scenario: Path danger state
- **WHEN** simulation is active and circuit wireHeat >= 0.7
- **THEN** the connected path stroke SHALL transition from orange toward red

#### Scenario: Path burned
- **WHEN** circuit status is 'burned'
- **THEN** the connected path SHALL change to red with reduced opacity (0.2)

#### Scenario: Path tripped
- **WHEN** circuit status is 'tripped' or 'elcb-tripped'
- **THEN** the connected path SHALL change to gray (#6b7280) with reduced opacity (0.3)

#### Scenario: Smooth color transitions
- **WHEN** wireHeat changes during simulation
- **THEN** path stroke color and opacity SHALL transition with CSS `transition: stroke 0.3s, opacity 0.3s`

### Requirement: FloorPlanView displays current flow animation on powered paths
When simulation is active, each connected wiring path SHALL display an animated overlay showing electric current flowing from panel toward rooms.

#### Scenario: Current flow animation appears on power-on
- **WHEN** simulation starts (isPowered becomes true)
- **THEN** each connected path SHALL display a moving dashed overlay (bright dots traveling along the path)

#### Scenario: Current flow animation direction
- **WHEN** current flow animation is active
- **THEN** the animated dots SHALL move from the panel end of the path toward the room end

#### Scenario: Current flow animation uses CSS keyframes
- **WHEN** current flow animation is rendered
- **THEN** it SHALL use SVG strokeDasharray with CSS `@keyframes` animating strokeDashoffset for performance

#### Scenario: Current flow stops on circuit failure
- **WHEN** a circuit status becomes 'tripped', 'burned', 'elcb-tripped', or 'leakage'
- **THEN** the current flow animation on that circuit's paths SHALL fade out (opacity → 0)

#### Scenario: Current flow stops on main breaker trip
- **WHEN** mainTripped is true
- **THEN** all current flow animations SHALL fade out

### Requirement: FloorPlanView displays old house problem indicators on rooms
Rooms belonging to circuits with unresolved old house problems SHALL display a ⚠️ badge with orange flashing animation.

#### Scenario: Problem room shows warning badge
- **WHEN** a room belongs to a circuit with unresolved problems and `problemRooms` prop contains that room's id
- **THEN** a ⚠️ emoji SHALL be rendered at the room's top-right corner with an orange flashing animation

#### Scenario: Problem badge has tooltip
- **WHEN** player hovers over a ⚠️ badge on a room
- **THEN** a tooltip SHALL display the problem type description (e.g., "裸線接頭", "線徑不足")

#### Scenario: Problem resolved removes badge
- **WHEN** a room's circuit problems are all resolved
- **THEN** the ⚠️ badge SHALL no longer be displayed on that room

### Requirement: FloorPlanView simulation state prop interface
FloorPlanView SHALL accept an optional `simulationState` prop containing circuit states, power status, and main breaker status. FloorPlanView SHALL also accept an optional `problemRooms` prop for old house problem indicators. FloorPlanView SHALL accept a `roomCircuitMap` prop to map room IDs to circuit IDs for state lookup.

#### Scenario: simulationState prop structure
- **WHEN** GameBoard passes simulationState to FloorPlanView
- **THEN** simulationState SHALL contain: `isPowered: boolean`, `circuitStates: Record<CircuitId, { status, wireHeat, totalCurrent }>`, `mainTripped: boolean`

#### Scenario: problemRooms prop structure
- **WHEN** GameBoard passes problemRooms to FloorPlanView
- **THEN** problemRooms SHALL be a `Map<string, OldHouseProblemType[]>` mapping room IDs to their problem types

#### Scenario: roomCircuitMap prop structure
- **WHEN** GameBoard passes roomCircuitMap to FloorPlanView
- **THEN** roomCircuitMap SHALL be a `Record<string, CircuitId>` mapping room IDs to their assigned circuit IDs
