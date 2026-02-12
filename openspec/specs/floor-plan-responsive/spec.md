### Requirement: fp-layout mobile vertical stack
The fp-layout SHALL switch to vertical stack layout on screens ≤640px: sidebar full-width collapsed strip at top, FloorPlanView filling remaining space, WireToolbar fixed at bottom.

#### Scenario: Mobile viewport renders vertical stack
- **WHEN** viewport width is ≤640px and a floor plan level is active
- **THEN** the layout displays as a vertical column: collapsed sidebar strip (full-width, 48px height), FloorPlanView centered below, and WireToolbar fixed at the bottom

### Requirement: fp-layout tablet two-column
The fp-layout SHALL use a narrower sidebar (220px) on tablet screens (641-1024px) while maintaining the horizontal layout structure.

#### Scenario: Tablet viewport adjusts sidebar width
- **WHEN** viewport width is between 641px and 1024px
- **THEN** the sidebar renders at 220px width (instead of 280px desktop) and FloorPlanView scales to fill remaining space

### Requirement: FloorPlanView scales to container
The FloorPlanView SHALL use responsive viewBox scaling so the floor plan fits within its container at any screen size without horizontal scrolling.

#### Scenario: Small screen floor plan visible
- **WHEN** FloorPlanView renders in a container narrower than the floor plan's natural pixel width
- **THEN** the SVG scales down proportionally via viewBox, maintaining aspect ratio and keeping all rooms/paths visible
