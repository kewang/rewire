## ADDED Requirements

### Requirement: CircuitPlanner preserved for non-floor-plan levels
The existing CircuitPlanner component SHALL continue to be used for FreeCircuitLevel levels that do not have a floorPlan property. No changes to its behavior or interface.

#### Scenario: Non-floor-plan free circuit level
- **WHEN** a FreeCircuitLevel without floorPlan is loaded
- **THEN** the existing CircuitPlanner renders as before (full-screen planning UI)

#### Scenario: Floor-plan free circuit level uses sidebar
- **WHEN** a FreeCircuitLevel with floorPlan is loaded
- **THEN** CircuitPlannerSidebar is used instead of CircuitPlanner
