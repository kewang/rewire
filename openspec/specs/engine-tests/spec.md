## ADDED Requirements

### Requirement: simulation.ts unit tests
The system SHALL have unit tests for `src/engine/simulation.ts` covering calcTotalCurrent, step, stepMulti, and initial state factories.

#### Scenario: calcTotalCurrent sums appliance currents
- **WHEN** calcTotalCurrent is called with appliances of known power/voltage
- **THEN** it SHALL return the correct total current (power / voltage)

#### Scenario: calcTotalCurrent filters by circuit voltage
- **WHEN** calcTotalCurrent is called with mixed-voltage appliances and a circuitVoltage of 110
- **THEN** it SHALL only sum 110V appliance currents, ignoring 220V appliances

#### Scenario: step heats wire when overloaded
- **WHEN** step is called with totalCurrent exceeding wire maxCurrent
- **THEN** wireHeat SHALL increase toward 1.0 at heatRate

#### Scenario: step cools wire when within capacity
- **WHEN** step is called with totalCurrent below wire maxCurrent
- **THEN** wireHeat SHALL decrease toward 0.0 at coolRate

#### Scenario: step trips NFB at 1.25x rated current
- **WHEN** step is called with totalCurrent > breaker.ratedCurrent × 1.25
- **THEN** status SHALL become 'tripped' after accumulated time

#### Scenario: step burns wire at wireHeat 1.0
- **WHEN** step is called repeatedly until wireHeat reaches 1.0
- **THEN** status SHALL become 'burned'

#### Scenario: stepMulti calculates neutral current
- **WHEN** stepMulti is called with circuits on phases R and T
- **THEN** neutralCurrent SHALL equal |sum_R - sum_T|

#### Scenario: stepMulti triggers neutral-burned
- **WHEN** neutralCurrent exceeds NEUTRAL_MAX_CURRENT and neutralHeat reaches 1.0
- **THEN** overallStatus SHALL become 'neutral-burned'

#### Scenario: stepMulti triggers main-tripped
- **WHEN** totalPanelCurrent exceeds mainBreakerRating × 1.25 for 1.5 seconds
- **THEN** overallStatus SHALL become 'main-tripped'


### Requirement: scoring.ts unit tests
The system SHALL have unit tests for `src/engine/scoring.ts` covering calcStars with all BonusCondition types.

#### Scenario: Failed game gets 0 stars
- **WHEN** calcStars is called with passed=false
- **THEN** stars SHALL be 0

#### Scenario: Passed game gets 1 star
- **WHEN** calcStars is called with passed=true and finalCost > budget
- **THEN** stars SHALL be 1

#### Scenario: Under budget gets 2 stars
- **WHEN** calcStars is called with passed=true and finalCost <= budget
- **THEN** stars SHALL be 2

#### Scenario: Bonus condition met gets 3 stars
- **WHEN** calcStars is called with passed=true, under budget, and bonusCondition satisfied
- **THEN** stars SHALL be 3

#### Scenario: Each bonus condition type evaluates correctly
- **WHEN** calcStars is called with each of the 5 bonusCondition types (no-warning, under-budget-ratio, time-margin, crimp-quality, no-trip)
- **THEN** each SHALL evaluate to the correct boolean result


### Requirement: helpers.ts unit tests
The system SHALL have unit tests for `src/types/helpers.ts` covering isProblemResolved and worstStatus.

#### Scenario: isProblemResolved for bare-wire
- **WHEN** isProblemResolved is called for bare-wire with wire replaced, not pre-wired, and crimp applied
- **THEN** it SHALL return true

#### Scenario: isProblemResolved for wrong-wire-gauge
- **WHEN** isProblemResolved is called for wrong-wire-gauge with wire maxCurrent >= required
- **THEN** it SHALL return true

#### Scenario: isProblemResolved for oxidized-splice
- **WHEN** isProblemResolved is called for oxidized-splice with contactResistance < OXIDIZED threshold
- **THEN** it SHALL return true

#### Scenario: isProblemResolved for overrated-breaker
- **WHEN** isProblemResolved is called for overrated-breaker with breaker ratedCurrent <= wire maxCurrent
- **THEN** it SHALL return true

#### Scenario: isProblemResolved for missing-elcb
- **WHEN** isProblemResolved is called for missing-elcb with elcbEnabled=true
- **THEN** it SHALL return true

#### Scenario: worstStatus returns highest severity
- **WHEN** worstStatus is called with an array of SimulationStatus values
- **THEN** it SHALL return the status with the highest severity (burned > tripped > warning > normal)


### Requirement: routing.ts unit tests
The system SHALL have unit tests for `src/engine/routing.ts` covering findShortestPath and calcRouteCandidates.

#### Scenario: findShortestPath finds shortest route
- **WHEN** findShortestPath is called on a simple graph with known distances
- **THEN** it SHALL return the path with minimum total distance

#### Scenario: findShortestPath returns null for unreachable nodes
- **WHEN** findShortestPath is called with disconnected source and target
- **THEN** it SHALL return null

#### Scenario: calcRouteCandidates returns star and daisy-chain options
- **WHEN** calcRouteCandidates is called with a floor plan and multiple rooms
- **THEN** it SHALL return candidates including 'star' and 'daisy-chain' strategies with correct distances

#### Scenario: calcRouteDistance sums path distances
- **WHEN** calcRouteDistance is called with an array of RoutePaths
- **THEN** it SHALL return the sum of all path distances


### Requirement: aesthetics.ts unit tests
The system SHALL have unit tests for `src/engine/aesthetics.ts` covering detectCrossings and calcAestheticsScore.

#### Scenario: detectCrossings identifies crossing wire pairs
- **WHEN** detectCrossings is called with lanes that have crossing wires
- **THEN** it SHALL return the correct list of crossing pairs

#### Scenario: calcAestheticsScore returns 100 for no crossings and full cable ties
- **WHEN** calcAestheticsScore is called with 0 crossings and 0 unbundled pairs
- **THEN** it SHALL return 100

#### Scenario: calcAestheticsScore deducts for crossings and poor cable ties
- **WHEN** calcAestheticsScore is called with crossings and cable ties of varying quality
- **THEN** it SHALL return a score reduced by crossing penalty and cable tie quality penalty


### Requirement: randomOldHouse.ts unit tests
The system SHALL have unit tests for `src/engine/randomOldHouse.ts` covering generateRandomOldHouse constraint validation.

#### Scenario: Generated level has correct circuit count for difficulty
- **WHEN** generateRandomOldHouse is called with difficulty 1, 2, or 3
- **THEN** the returned level SHALL have circuit count within the expected range (1: 2-3, 2: 3-4, 3: 4-6)

#### Scenario: Generated level is solvable
- **WHEN** generateRandomOldHouse is called
- **THEN** the returned level SHALL have all problems resolvable (budget >= repair cost)

#### Scenario: Generated level has valid floor plan
- **WHEN** generateRandomOldHouse is called with any difficulty
- **THEN** the returned level SHALL have a floorPlan matching the difficulty (1→S, 2→M, 3→L)
