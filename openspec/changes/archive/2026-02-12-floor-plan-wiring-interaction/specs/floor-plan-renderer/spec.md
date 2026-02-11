## MODIFIED Requirements

### Requirement: FloorPlanView renders rooms as colored rectangles
FloorPlanView SHALL render each `FloorPlanRoom` as an SVG rounded rectangle (`<rect rx="4">`), positioned by grid coordinates × cellSize. Each room SHALL display its translated name (`tRoomName`) centered as SVG text. Each room SHALL have pointer event handlers for click and hover interactions when callbacks are provided.

#### Scenario: Render 4-room floor plan (S layout)
- **WHEN** FloorPlanView receives FLOOR_PLAN_S (4 rooms: bedroom, bathroom, living-room, kitchen)
- **THEN** 4 rounded rectangles are rendered at correct grid positions with room names centered inside

#### Scenario: Rooms have wall gaps between them
- **WHEN** adjacent rooms are rendered
- **THEN** a gap of ROOM_GAP (3px) is visible between rooms, creating a wall-like visual separation

#### Scenario: Room click triggers onRoomClick callback
- **WHEN** `onRoomClick` prop is provided and player clicks on a room
- **THEN** `onRoomClick(roomId)` SHALL be invoked with the clicked room's id

#### Scenario: Room hover triggers onRoomHover callback
- **WHEN** `onRoomHover` prop is provided and player's pointer enters a room during drag
- **THEN** `onRoomHover(roomId)` SHALL be invoked
- **AND** when pointer leaves the room, `onRoomHover(null)` SHALL be invoked

### Requirement: FloorPlanView renders unassigned vs assigned room states
Unassigned rooms SHALL have dark fill (`#1a1f2e`) with gray dashed border. Assigned rooms SHALL have slightly lighter fill with a solid border in the circuit's assigned color. When `highlightedRoomId` matches a room, that room SHALL display an enhanced highlight effect.

#### Scenario: Room with no circuit assignment
- **WHEN** a room is not in the `circuitAssignments` map
- **THEN** the room rect has fill `#1a1f2e`, stroke `#374151`, and strokeDasharray="4 2"

#### Scenario: Room assigned to circuit index 0
- **WHEN** a room is in `circuitAssignments` with circuitIndex=0
- **THEN** the room rect has a lighter fill and a solid border in that circuit's color

#### Scenario: Room highlighted during drag
- **WHEN** `highlightedRoomId` matches a room's id and `dragActive` is true
- **THEN** the room rect SHALL have an enhanced glow border (brighter stroke, increased strokeWidth, optional SVG filter glow)
- **AND** the fill opacity SHALL increase slightly to indicate active target

#### Scenario: Invalid drop target highlight
- **WHEN** `highlightedRoomId` matches an unassigned room during drag
- **THEN** the room rect SHALL show a subtle red-tinted border indicating invalid target
