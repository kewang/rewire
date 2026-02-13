## MODIFIED Requirements

### Requirement: fp-layout mobile vertical stack
The fp-layout SHALL switch to vertical stack layout on screens ≤640px: sidebar full-width collapsed strip at top, FloorPlanView filling remaining space, WireToolbar fixed at bottom. **The sidebar SHALL default to collapsed state on mobile** to maximize floor plan visibility.

#### Scenario: Mobile sidebar defaults to collapsed
- **WHEN** viewport width is ≤640px and a free-circuit floor plan level is loaded
- **THEN** the sidebar starts in collapsed state (48px strip) instead of expanded

#### Scenario: Mobile sidebar expanded as overlay
- **WHEN** the sidebar is expanded on mobile (≤640px)
- **THEN** it renders as a fixed overlay with backdrop, NOT pushing the floor plan aside

### Requirement: Game header mobile layout
The game header SHALL maintain single-line layout on mobile by reducing font sizes and gaps when viewport is narrow.

#### Scenario: Mobile header no title wrapping
- **WHEN** viewport width is ≤640px and a long level title is displayed (e.g. "L18 老屋驚魂：初診")
- **THEN** the header SHALL use smaller font-size and reduced gaps to keep title on one or two lines maximum without excessive wrapping

### Requirement: Back button touch target
The back button (← 返回) SHALL have min-height 40px and adequate padding for touch interaction.

#### Scenario: Back button sizing
- **WHEN** the back button is rendered in game header
- **THEN** the button has min-height ≥ 36px, padding ≥ 8px 16px, font-size ≥ 0.85rem

### Requirement: Status display label readability
The status display labels SHALL have sufficient font size for readability.

#### Scenario: Status label font size
- **WHEN** StatusDisplay renders label/value pairs
- **THEN** `.status-label` has font-size ≥ 0.85rem (was 0.82rem)

### Requirement: Level card description readability
The level selection cards SHALL have adequate description text size.

#### Scenario: Card detail font size
- **WHEN** LevelSelect renders level cards
- **THEN** `.card-detail` has font-size ≥ 0.875rem (was 0.82rem)
