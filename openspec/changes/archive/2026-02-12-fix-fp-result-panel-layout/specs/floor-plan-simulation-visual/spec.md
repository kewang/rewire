## ADDED Requirements

### Requirement: ResultPanel renders inside fp-center scrollable area in floor plan layout
In floor plan layout mode, ResultPanel SHALL render inside the `.fp-center` container (below FloorPlanView), NOT as a direct flex child of `.game-board.fp-layout`. This ensures ResultPanel does not compete for flex space with `.fp-main`, and FloorPlanView maintains its intended size. FloorPlanView SHALL use `margin-top: auto; margin-bottom: auto` for vertical centering when no ResultPanel is present, and `flex-shrink: 0` to prevent compression.

#### Scenario: Floor plan layout result panel placement
- **WHEN** game completes (result !== 'none') in a level with floorPlan
- **THEN** ResultPanel SHALL render inside `.fp-center` below FloorPlanView, and FloorPlanView SHALL maintain its natural size via `flex-shrink: 0`

#### Scenario: Legacy layout result panel placement unchanged
- **WHEN** game completes (result !== 'none') in a level without floorPlan
- **THEN** ResultPanel SHALL render in its original position as a direct child of `.game-board`, same as current behavior

#### Scenario: Floor plan scrolls to result on completion
- **WHEN** ResultPanel appears inside `.fp-center` after game completion
- **THEN** the panel SHALL scrollIntoView within the `.fp-center` scrollable container

#### Scenario: FloorPlanView vertically centered when no result
- **WHEN** no ResultPanel is visible in floor plan layout
- **THEN** FloorPlanView SHALL be vertically centered in `.fp-center` via `margin-top: auto; margin-bottom: auto`
