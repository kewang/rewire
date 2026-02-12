## ADDED Requirements

### Requirement: FloorPlanView accepts simulation state props
FloorPlanView SHALL accept optional props for simulation visualization: `simulationState`, `problemRooms`, and `roomCircuitMap`. When these props are provided and `simulationState.isPowered` is true, the component SHALL apply simulation-driven visual effects to rooms and wiring paths.

#### Scenario: Props are optional for backward compatibility
- **WHEN** FloorPlanView is rendered without simulationState, problemRooms, or roomCircuitMap props
- **THEN** the component SHALL render identically to its pre-integration behavior (no simulation effects)

#### Scenario: Simulation state activates visual effects
- **WHEN** FloorPlanView receives simulationState with isPowered=true
- **THEN** rooms and paths SHALL reflect circuit states (glow, dimming, color changes, animations)

### Requirement: FloorPlanView renders current flow animation overlay
FloorPlanView SHALL render an additional SVG path layer on top of connected paths for the current flow animation effect. This layer SHALL use strokeDasharray and CSS keyframe animation on strokeDashoffset.

#### Scenario: Animation layer renders above connected paths
- **WHEN** simulation is active with connected paths
- **THEN** a semi-transparent bright path (rgba(200, 230, 255, 0.6)) with dasharray="6 20" SHALL overlay each connected path

#### Scenario: Animation layer hidden when not powered
- **WHEN** simulation is not active
- **THEN** the current flow animation layer SHALL not be rendered

### Requirement: FloorPlanView renders problem badges on rooms
FloorPlanView SHALL render ⚠️ badges on rooms that have unresolved old house problems, based on the `problemRooms` prop.

#### Scenario: Badge positioned at room top-right
- **WHEN** a room ID exists in problemRooms map
- **THEN** a ⚠️ text element SHALL be rendered at the top-right corner of the room rect, with orange color and flashing animation

#### Scenario: No badge for rooms without problems
- **WHEN** a room ID does not exist in problemRooms map
- **THEN** no ⚠️ badge SHALL be rendered for that room
