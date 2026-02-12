## ADDED Requirements

### Requirement: CircuitPlannerSidebar renders as collapsible side panel
The system SHALL render `CircuitPlannerSidebar` as a left-side collapsible panel (default width 280px) that displays circuit cards, panel summary, and a confirm/collapse toggle. When collapsed, it SHALL display as a narrow strip (48px) with an expand icon.

#### Scenario: Sidebar displayed during planning phase
- **WHEN** a FreeCircuitLevel with floorPlan is active and planning is not yet confirmed
- **THEN** CircuitPlannerSidebar renders expanded with circuit cards, panel summary, and confirm button

#### Scenario: Sidebar collapsed after planning confirmed
- **WHEN** planning is confirmed (wiring phase)
- **THEN** CircuitPlannerSidebar collapses to narrow strip showing circuit count and total cost summary

#### Scenario: Sidebar expand/collapse toggle
- **WHEN** player clicks the collapse/expand toggle button
- **THEN** sidebar transitions between expanded (280px) and collapsed (48px) states with CSS transition

### Requirement: CircuitPlannerSidebar displays compact circuit cards
Each circuit card SHALL show: circuit color indicator, voltage badge (110V/220V), NFB rating, wire selection status, assigned appliance count, and current load percentage. Cards SHALL be vertically stacked and scrollable.

#### Scenario: Circuit card displays circuit info
- **WHEN** a circuit exists in the planner
- **THEN** the card shows color dot, voltage, NFB rating (e.g. "20A"), appliance count badge, and load bar

#### Scenario: Circuit card selected state
- **WHEN** player clicks a circuit card
- **THEN** the card highlights with amber border and becomes the active circuit for room assignment on the floor plan

### Requirement: CircuitPlannerSidebar displays panel summary
The sidebar SHALL display a panel summary section at the top showing: slot usage (used/max), main breaker load estimate (current/rating with color coding), and phase balance preview (R/T/N currents).

#### Scenario: Panel summary shows slot usage
- **WHEN** circuits are added to the planner
- **THEN** panel summary shows "X / Y slots" where X is used and Y is maxSlots from PanelConfig

#### Scenario: Panel summary shows main breaker load
- **WHEN** circuits have assigned appliances
- **THEN** panel summary shows estimated total current vs mainBreakerRating, colored green (<80%), orange (80-100%), red (>100%)

#### Scenario: Panel summary shows phase balance
- **WHEN** level has phaseMode and 110V circuits exist
- **THEN** panel summary shows R/T/N current estimates, N current >=30A displays in red

### Requirement: CircuitPlannerSidebar confirm button
The sidebar SHALL have a confirm button at the bottom that finalizes the circuit planning and transitions to wiring phase. The button SHALL be disabled when preconditions are not met (unassigned appliances, missing ELCB on wetArea circuits, etc.).

#### Scenario: Confirm button enabled
- **WHEN** all appliances are assigned, all wetArea circuits have ELCB enabled, and at least one circuit exists
- **THEN** confirm button is enabled

#### Scenario: Confirm button disabled with tooltip
- **WHEN** preconditions are not met
- **THEN** confirm button is disabled and shows tooltip explaining what's missing

### Requirement: CircuitPlannerSidebar circuit management
Players SHALL be able to add new circuits, delete circuits, and modify circuit settings (voltage, NFB, phase, ELCB) from the sidebar. These operations SHALL use the same callbacks as the existing CircuitPlanner.

#### Scenario: Add new circuit
- **WHEN** player clicks "add circuit" button and slots are available
- **THEN** a new circuit is created with default settings (110V, 20A NFB)

#### Scenario: Delete circuit
- **WHEN** player clicks delete on a circuit card
- **THEN** the circuit is removed and its assigned appliances become unassigned

#### Scenario: Modify circuit voltage
- **WHEN** player toggles voltage on a circuit card
- **THEN** voltage changes between 110V and 220V, incompatible appliances are unassigned
