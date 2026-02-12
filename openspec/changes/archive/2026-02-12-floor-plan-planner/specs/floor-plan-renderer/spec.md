## ADDED Requirements

### Requirement: FloorPlanView renders appliance count badge in rooms
Each room on the floor plan SHALL display a small appliance count badge when the room has appliances defined. The badge SHALL show the number of appliances with a ⚡ icon.

#### Scenario: Room with appliances
- **WHEN** a room has appliances and applianceCounts prop is provided
- **THEN** a small SVG text badge (e.g. "3⚡") renders at the room's bottom-right area

#### Scenario: Badge color follows circuit assignment
- **WHEN** a room is assigned to a circuit
- **THEN** the appliance badge uses the circuit's color; unassigned rooms use gray

### Requirement: FloorPlanView supports circuit assignment popover callback
FloorPlanView SHALL accept an `onRoomClick` callback that provides room position information for popover placement.

#### Scenario: Room click provides position
- **WHEN** player clicks a room and onRoomClick is defined
- **THEN** the callback is called with roomId and the click event coordinates for popover positioning

### Requirement: FloorPlanView renders appliance tooltip on room hover
When hovering over a room, FloorPlanView SHALL show a tooltip listing the appliances in that room with their power ratings.

#### Scenario: Hover room with appliances
- **WHEN** player hovers over a room that has appliances and applianceDetails prop is provided
- **THEN** a SVG title element or CSS tooltip shows appliance names and wattages
