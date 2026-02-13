## MODIFIED Requirements

### Requirement: FloorPlanView renders rooms as colored rectangles
FloorPlanView SHALL render each `FloorPlanRoom` as an SVG rounded rectangle (`<rect rx="4">`), positioned by grid coordinates × cellSize. Each room SHALL display its translated name (`tRoomName`) centered as SVG text at **fontSize=14** (was 12). Each room SHALL have pointer event handlers for click and hover interactions when callbacks are provided.

#### Scenario: Room name font size
- **WHEN** FloorPlanView renders room names
- **THEN** each room name `<text>` element SHALL have fontSize=14 (constant `ROOM_NAME_FONT_SIZE`)

### Requirement: FloorPlanView renders appliance count badge in rooms
Each room on the floor plan SHALL display a small appliance count badge when the room has appliances defined. The badge SHALL show the number of appliances with a ⚡ icon at **fontSize=12** (was 9).

#### Scenario: Badge font size
- **WHEN** a room has appliances and applianceCounts prop is provided
- **THEN** the appliance badge `<text>` element SHALL have fontSize=12 (constant `BADGE_FONT_SIZE`)

### Requirement: Distance label readability
The FloorPlanView distance labels on wire paths SHALL use a background pill for readability and scale font size. Labels SHALL use **fontSize=11** (was 10).

#### Scenario: Distance label sizing
- **WHEN** a wire path has a distance label displayed
- **THEN** the label renders at fontSize=11 with dark background pill
