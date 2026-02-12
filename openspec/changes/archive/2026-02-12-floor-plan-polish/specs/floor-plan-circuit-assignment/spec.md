## MODIFIED Requirements

### Requirement: Popover viewport clamping on small screens
The CircuitAssignmentPopover SHALL ensure it never renders outside the visible viewport on any screen size, with safe margins from edges.

#### Scenario: Room near right edge on mobile
- **WHEN** user taps a room near the right edge of the screen on a mobile device
- **THEN** the popover positions itself within viewport bounds with at least 8px margin from all edges

#### Scenario: Room near bottom edge
- **WHEN** user taps a room near the bottom of the visible area
- **THEN** the popover flips to appear above the tap point if it would otherwise extend below the viewport
