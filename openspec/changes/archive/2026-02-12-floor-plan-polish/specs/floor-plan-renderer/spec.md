## MODIFIED Requirements

### Requirement: Distance label readability
The FloorPlanView distance labels on wire paths SHALL use a background pill for readability and scale font size based on path length.

#### Scenario: Distance label on short path
- **WHEN** a wire path has a distance label displayed
- **THEN** the label renders with a dark background pill (semi-transparent), white text at 10px font, positioned at the path midpoint without overlapping room names

### Requirement: Wire path overlap visibility
When multiple wire paths share wall segments, the FloorPlanView SHALL use sufficient offset and distinct colors to keep each path visually distinguishable.

#### Scenario: Two paths sharing a wall segment
- **WHEN** two circuit paths share the same wall segment
- **THEN** the paths render with PATH_OFFSET_STEP separation and use their respective CIRCUIT_COLORS, both clearly visible
