## MODIFIED Requirements

### Requirement: Mobile auto-collapse sidebar
The CircuitPlannerSidebar SHALL default to collapsed state on mobile viewports (≤640px).

#### Scenario: Mobile viewport opens level with floor plan
- **WHEN** a floor plan level is selected on a device with viewport ≤640px
- **THEN** the sidebar starts in collapsed state (48px strip)

### Requirement: Mobile sidebar overlay mode
On mobile, the expanded sidebar SHALL render as an overlay on top of the FloorPlanView rather than pushing the layout.

#### Scenario: Mobile user expands sidebar
- **WHEN** user taps the expand button on mobile (≤640px)
- **THEN** the sidebar expands as a fixed overlay (z-index above FloorPlan) with a semi-transparent backdrop behind it
- **AND** tapping the backdrop collapses the sidebar
