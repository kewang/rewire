## ADDED Requirements

### Requirement: Room drop zone detection
FloorPlanView SHALL accept wire drops on room rectangles. When a wire is dragged over a room, the system SHALL determine the target room and map it to the corresponding circuit via `circuitAssignments`.

#### Scenario: Drop wire on assigned room
- **WHEN** player drops a dragged wire on a room that is assigned to circuit C1
- **THEN** the system SHALL identify circuitId=C1 as the target
- **AND** trigger the wiring flow for circuit C1

#### Scenario: Drop wire on unassigned room
- **WHEN** player drops a dragged wire on a room that has no circuit assignment
- **THEN** the drop SHALL be rejected (no wiring occurs)
- **AND** visual state SHALL revert to pre-drag

#### Scenario: Drop wire outside any room
- **WHEN** player releases the drag outside all room rectangles
- **THEN** the drag SHALL cancel with no state change

### Requirement: Room hover highlight during drag
When a wire drag is active, hovering over a room SHALL show a highlight effect to indicate it is a valid drop target.

#### Scenario: Hover over assigned room during drag
- **WHEN** a wire drag is active and the cursor moves over a room assigned to a circuit
- **THEN** the room rect SHALL display a brighter border glow in the circuit's color
- **AND** the room fill SHALL become slightly more opaque

#### Scenario: Hover over unassigned room during drag
- **WHEN** a wire drag is active and the cursor moves over an unassigned room
- **THEN** the room SHALL show a subtle red/gray indicator (invalid target)

#### Scenario: No highlight when drag is inactive
- **WHEN** no wire drag is active
- **THEN** rooms SHALL NOT show any hover highlight effect

### Requirement: Routing strategy selection for multi-room circuits
When a wire is dropped on a circuit that spans multiple rooms, the system SHALL display a RoutingStrategyPicker showing star and daisy-chain candidates. The player SHALL select one strategy to complete the wiring.

#### Scenario: Single-room circuit auto-selects direct routing
- **WHEN** a wire is dropped on a circuit with exactly 1 room
- **THEN** the system SHALL automatically use 'direct' routing (shortest path panel→outlet)
- **AND** no RoutingStrategyPicker is shown
- **AND** the wiring proceeds immediately (or to crimp if requiresCrimp)

#### Scenario: Multi-room circuit shows strategy picker
- **WHEN** a wire is dropped on a circuit with 2+ rooms
- **THEN** a RoutingStrategyPicker overlay SHALL appear
- **AND** FloorPlanView SHALL display both star and daisy-chain candidate paths simultaneously (as candidatePaths)

#### Scenario: Player selects star routing
- **WHEN** player clicks the star strategy card in RoutingStrategyPicker
- **THEN** the star routing paths SHALL be stored as the selected routing for that circuit
- **AND** candidatePaths SHALL be cleared
- **AND** connectedPaths SHALL be updated with the star paths
- **AND** the RoutingStrategyPicker SHALL close

#### Scenario: Player selects daisy-chain routing
- **WHEN** player clicks the daisy-chain strategy card in RoutingStrategyPicker
- **THEN** the daisy-chain routing paths SHALL be stored as the selected routing
- **AND** connectedPaths SHALL be updated with the daisy-chain path

#### Scenario: Player cancels strategy selection
- **WHEN** player clicks cancel on the RoutingStrategyPicker
- **THEN** the wiring attempt SHALL be cancelled
- **AND** candidatePaths SHALL be cleared
- **AND** no routing or wire is stored for that circuit

### Requirement: RoutingStrategyPicker displays distance and cost
Each strategy card SHALL display the strategy name, total distance, estimated wire cost, and a small schematic icon.

#### Scenario: Star strategy card content
- **WHEN** RoutingStrategyPicker is shown for a 3-room circuit with 2.0mm wire
- **THEN** the star card SHALL display: label "星形 / Star", total distance (sum of all star paths), cost = distance × wire.costPerMeter, and a star-topology icon

#### Scenario: Daisy-chain strategy card content
- **WHEN** RoutingStrategyPicker is shown for a 3-room circuit with 2.0mm wire
- **THEN** the daisy-chain card SHALL display: label "串聯 / Daisy Chain", total distance, cost = distance × wire.costPerMeter, and a chain-topology icon

### Requirement: Route distance drives wire cost
Wire cost for a circuit with a floor plan SHALL be calculated as `wire.costPerMeter × routeDistance` instead of the fixed `DEFAULT_WIRE_LENGTH`.

#### Scenario: Cost with route distance
- **WHEN** a circuit uses 2.0mm wire (costPerMeter=$3) and the selected route distance is 8.5m
- **THEN** the wire cost for that circuit SHALL be $3 × 8.5 = $25.5

#### Scenario: Fallback to default wire length
- **WHEN** a circuit has no floor plan routing (legacy level without floorPlan)
- **THEN** the wire cost SHALL use `costPerMeter × DEFAULT_WIRE_LENGTH` as before

### Requirement: Connected paths reflect wiring state
FloorPlanView connectedPaths SHALL be derived from the actual circuitWires and circuitRoutePaths state, showing only circuits that have completed wiring.

#### Scenario: No wiring yet
- **WHEN** no circuits have been wired
- **THEN** connectedPaths SHALL be empty (no solid lines on floor plan)

#### Scenario: One circuit wired with star routing
- **WHEN** circuit C1 is wired with 2.0mm wire and star routing selected
- **THEN** connectedPaths SHALL contain one ConnectedPathGroup with C1's star paths and wireColor=#86efac (green)

#### Scenario: Wire replacement updates paths
- **WHEN** a circuit already has wiring and the player drops a new wire on it
- **THEN** the existing routing SHALL be cleared
- **AND** a new strategy selection SHALL be triggered (for multi-room)
- **AND** connectedPaths SHALL update to reflect the new wire color

### Requirement: Crimp occurs after routing strategy selection
For requiresCrimp levels, the crimp mini-game SHALL be triggered AFTER the routing strategy is selected (or auto-selected for single-room), not before.

#### Scenario: Multi-room circuit with crimp
- **WHEN** a wire is dropped on a multi-room circuit in a requiresCrimp level
- **THEN** the RoutingStrategyPicker SHALL appear first
- **AND** after strategy selection, the crimp mini-game SHALL trigger
- **AND** wiring is only marked complete after crimp completion

#### Scenario: Single-room circuit with crimp
- **WHEN** a wire is dropped on a single-room circuit in a requiresCrimp level
- **THEN** routing is auto-selected (direct)
- **AND** the crimp mini-game SHALL trigger immediately
