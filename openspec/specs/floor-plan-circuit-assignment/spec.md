## ADDED Requirements

### Requirement: Room click triggers circuit assignment popover
When a player clicks a room on the floor plan during the planning phase, the system SHALL display a popover near the clicked room showing circuit assignment options.

#### Scenario: Click unassigned room
- **WHEN** player clicks a room not yet assigned to any circuit during planning phase
- **THEN** a popover appears listing existing circuits (color + voltage + name) and an "add new circuit" option

#### Scenario: Click assigned room
- **WHEN** player clicks a room already assigned to a circuit during planning phase
- **THEN** a popover appears showing current assignment with "unassign" option, plus other circuits to reassign to

#### Scenario: Select circuit from popover
- **WHEN** player selects a circuit from the popover
- **THEN** the room is assigned to that circuit, room border changes to circuit color, popover closes

#### Scenario: Click outside popover dismisses it
- **WHEN** popover is open and player clicks outside it
- **THEN** popover closes without changes

### Requirement: Circuit assignment popover with selected circuit shortcut
When a circuit card is selected in the sidebar, clicking an unassigned room SHALL directly assign it to the selected circuit without showing the popover.

#### Scenario: Selected circuit quick-assign
- **WHEN** a circuit card is selected in the sidebar AND player clicks an unassigned room
- **THEN** the room is directly assigned to the selected circuit without popover

#### Scenario: Selected circuit click on already-assigned room
- **WHEN** a circuit card is selected AND player clicks a room assigned to a different circuit
- **THEN** the popover appears with reassignment options (not auto-reassigned)

### Requirement: Room appliance count badge on floor plan
Each room on the floor plan SHALL display a small badge showing the count of appliances in that room (from the level's room definitions). Assigned rooms SHALL show the badge in the circuit's color.

#### Scenario: Room with appliances shows badge
- **WHEN** a room has appliances defined in the level
- **THEN** a small badge (e.g. "3⚡") appears in the room's bottom-right corner

#### Scenario: Room appliance tooltip on hover
- **WHEN** player hovers over a room with appliances
- **THEN** a tooltip shows the list of appliance names and their power ratings

### Requirement: Fixed-circuit levels show pre-assigned rooms
For FixedCircuitLevel with floorPlan, rooms SHALL be pre-assigned to circuits based on the level's circuitConfigs and room definitions. No planning phase is shown.

#### Scenario: Fixed-circuit level room display
- **WHEN** a FixedCircuitLevel with floorPlan is loaded
- **THEN** rooms are automatically colored by their pre-assigned circuits, sidebar is collapsed, and wiring phase starts immediately

### Requirement: Appliance assignment from sidebar to circuit
Players SHALL assign appliances to circuits from the CircuitPlannerSidebar. When a circuit card is expanded, it shows the appliances from all rooms assigned to that circuit. Players can drag or click appliances to assign them.

#### Scenario: Expand circuit card shows room appliances
- **WHEN** player expands a circuit card that has rooms assigned
- **THEN** the card shows appliances from those rooms, grouped by room, with assign/unassign controls

#### Scenario: Assign appliance to circuit
- **WHEN** player clicks an unassigned appliance in the expanded circuit card
- **THEN** the appliance is assigned to that circuit (voltage compatibility checked)

#### Scenario: Voltage mismatch prevents assignment
- **WHEN** player tries to assign a 220V appliance to a 110V circuit (or vice versa)
- **THEN** assignment is rejected and a brief error indication is shown
