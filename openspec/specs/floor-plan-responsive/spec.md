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
The FloorPlanView SHALL use responsive viewBox scaling so the floor plan fits within its container at any screen size without horizontal scrolling. The SVG SHALL NOT have max-height constraint, rendering at natural 1:1 scale with the parent fp-center providing scroll when needed.

#### Scenario: Small screen floor plan visible
- **WHEN** FloorPlanView renders in a container narrower than the floor plan's natural pixel width
- **THEN** the SVG scales down proportionally via viewBox, maintaining aspect ratio and keeping all rooms/paths visible

### Requirement: Mobile sidebar auto-collapse
The CircuitPlannerSidebar SHALL default to collapsed state on mobile viewports (≤640px), rendering as an overlay with backdrop when expanded.

#### Scenario: Mobile sidebar default collapsed
- **WHEN** viewport width is ≤640px and a floor plan level loads
- **THEN** the sidebar starts in collapsed state (48px strip) instead of expanded

#### Scenario: Mobile sidebar overlay
- **WHEN** sidebar is expanded on mobile
- **THEN** it renders as fixed overlay (z-index:200) with backdrop (rgba(0,0,0,0.5)), not pushing the floor plan

### Requirement: Mobile header layout optimization
The game header `.header-top` SHALL use flex-wrap and reduced gaps on mobile (≤640px) to prevent title truncation.

#### Scenario: Mobile header with long level name
- **WHEN** viewport is ≤640px and level title is long (e.g. "L31 終極豪宅")
- **THEN** header wraps gracefully with gap: var(--space-xs), level-goal at 0.75rem, back-button at min-height 36px and 0.8rem font

### Requirement: Global root font size
The project SHALL set `html { font-size: 18px }` in index.css, scaling all rem-based values by 12.5% for improved readability across the application.

#### Scenario: All rem values scaled
- **WHEN** a CSS property uses rem units (e.g. 0.875rem)
- **THEN** the computed value is based on 18px root (e.g. 0.875rem = 15.75px)
