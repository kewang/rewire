## ADDED Requirements

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

### Requirement: FloorPlanView marks wet areas
Rooms with `wetArea: true` SHALL display a water droplet indicator (💧) and a subtle blue tint on the fill color.

#### Scenario: Bathroom is wet area
- **WHEN** a room has `wetArea: true`
- **THEN** a 💧 emoji is rendered near the room name, and the room fill has a blue tint (`rgba(59, 130, 246, 0.08)`)

### Requirement: FloorPlanView renders outlet markers
Each `FloorPlanOutlet` within a room SHALL be rendered as a small circle (r=4) at the outlet's proportional position within the room.

#### Scenario: Outlet position calculation
- **WHEN** an outlet has position (x=0.1, y=0.25) in a room at grid (0,0) with size (2,2)
- **THEN** the outlet circle is rendered at pixel position `(0*cellSize + 0.1*2*cellSize, 0*cellSize + 0.25*2*cellSize)`

#### Scenario: Unconnected outlet color
- **WHEN** an outlet's room is not connected to any circuit
- **THEN** the outlet circle has fill `#4a5568` (gray)

#### Scenario: Connected outlet color
- **WHEN** an outlet's room is connected to a circuit with a specific color
- **THEN** the outlet circle has fill matching the circuit's color

### Requirement: FloorPlanView renders panel icon
The panel (配電箱) SHALL be rendered as a small rectangle with ⚡ text at the `FloorPlan.panel` coordinates. Hovering SHALL show a glow effect. Clicking SHALL invoke `onPanelClick` callback.

#### Scenario: Panel rendered at correct position
- **WHEN** FloorPlanView receives a FloorPlan with panel at (0.3, 3.7)
- **THEN** the panel icon is rendered at pixel position `(0.3*cellSize, 3.7*cellSize)`

#### Scenario: Panel hover glow
- **WHEN** user hovers over the panel icon
- **THEN** a glow/shadow effect is applied via SVG filter or CSS

#### Scenario: Panel click triggers callback
- **WHEN** user clicks the panel icon
- **THEN** the `onPanelClick` prop callback is invoked

### Requirement: FloorPlanView renders candidate wiring paths
Candidate routing paths SHALL be rendered as semi-transparent dashed polylines along RoutingGraph nodes, with a distance label at the midpoint.

#### Scenario: Candidate path rendering
- **WHEN** `candidatePaths` prop contains a RouteCandidate with strategy='star' and paths for 2 rooms
- **THEN** 2 dashed polylines are drawn from panel through corner nodes to each outlet, with opacity=0.4

#### Scenario: Distance label on candidate path
- **WHEN** a candidate path has distance=5.2m
- **THEN** a text label "5.2m" is displayed at the midpoint of the longest path segment, with a semi-transparent background rect for readability

### Requirement: FloorPlanView renders connected wiring paths
Connected (selected) wiring paths SHALL be rendered as solid polylines in the wire gauge color, with opacity=0.8.

#### Scenario: Connected path with 2.0mm wire
- **WHEN** `connectedPaths` prop contains a path for a circuit using 2.0mm² wire (green)
- **THEN** a solid polyline is drawn in green (`#86efac`) at opacity=0.8 along the RoutingGraph nodes

#### Scenario: Multiple paths on same wall segment
- **WHEN** two connected paths share the same RoutingGraph edge (wall segment)
- **THEN** the paths are offset by ±2px to avoid complete overlap

### Requirement: FloorPlanView uses responsive SVG viewBox
The SVG SHALL use `viewBox="0 0 {width*cellSize} {height*cellSize}"` with `width="100%"` to scale responsively within its container.

#### Scenario: SVG scales to container width
- **WHEN** FloorPlanView is placed in a 600px wide container with FLOOR_PLAN_S (4×4, cellSize=80)
- **THEN** the SVG renders at 600px wide and scales proportionally (maintaining aspect ratio)

### Requirement: FloorPlanView integrates i18n for room names
Room names SHALL be rendered using the `tRoomName` helper function from `i18nHelpers.ts`, supporting all 6 languages.

#### Scenario: Room name in English
- **WHEN** language is set to 'en' and room id is 'bedroom'
- **THEN** the room label displays "Bedroom" (not "臥室")

### Requirement: FloorPlanView renders external walls
The FloorPlan perimeter SHALL be rendered with a thicker border (WALL_THICKNESS=5px) to distinguish external walls from internal room separators.

#### Scenario: External wall rendering
- **WHEN** FloorPlanView renders a floor plan
- **THEN** the outer perimeter has a thick border in dark color (`#1e293b`), visually heavier than internal room gaps
