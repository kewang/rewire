## ADDED Requirements

### Requirement: WireToolbar integrates as drag source for floor plan wiring
The WireToolbar SHALL serve as the drag source for wiring in floor plan levels, replacing WireSelector. Drag interactions from WireToolbar SHALL trigger the same onDragStart/onDragMove/onDragEnd flow as WireSelector.

#### Scenario: Drag from WireToolbar to floor plan room
- **WHEN** player drags a wire card from WireToolbar toward the FloorPlanView
- **THEN** FloorPlanView receives dragActive=true and highlights valid drop targets (assigned rooms)

#### Scenario: Drop on valid room triggers routing
- **WHEN** player drops a wire on an assigned room
- **THEN** the existing routing flow is triggered (single-room auto-direct or multi-room RoutingStrategyPicker)

### Requirement: Power button moved to WireToolbar
The power button SHALL be rendered inside WireToolbar instead of inside FloorPlanView's panel-left area. The button uses the same enable/disable logic and callbacks.

#### Scenario: Power button in toolbar
- **WHEN** floor plan level is active
- **THEN** the power button renders at the right end of WireToolbar, not inside FloorPlanView SVG
