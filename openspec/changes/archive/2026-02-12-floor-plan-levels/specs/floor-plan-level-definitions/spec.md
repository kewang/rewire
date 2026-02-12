## ADDED Requirements

### Requirement: All L01-L28 levels have floorPlan

Every level in LEVELS[0..27] SHALL have a `floorPlan` property assigned according to the PRD mapping:
- L01-L05 (LEVELS[0..4]): `FLOOR_PLAN_S`
- L06-L17 (LEVELS[5..16]): `FLOOR_PLAN_M`
- L18-L20 (LEVELS[17..19]): `FLOOR_PLAN_L`
- L21-L23 (LEVELS[20..22]): `FLOOR_PLAN_M`
- L24-L28 (LEVELS[23..27]): `FLOOR_PLAN_L`

#### Scenario: Every level has floorPlan defined
- **WHEN** iterating LEVELS[0..27]
- **THEN** every level MUST have a non-undefined `floorPlan` property

#### Scenario: Floor plan size matches level range
- **WHEN** reading LEVELS[0..4]
- **THEN** each level's floorPlan.width MUST be 4 and floorPlan.height MUST be 4 (S type)

#### Scenario: L06-L17 use M floor plan
- **WHEN** reading LEVELS[5..16]
- **THEN** each level's floorPlan.width MUST be 6 and floorPlan.height MUST be 4 (M type)

#### Scenario: L18-L20 and L24-L28 use L floor plan
- **WHEN** reading LEVELS[17..19] and LEVELS[23..27]
- **THEN** each level's floorPlan.width MUST be 8 and floorPlan.height MUST be 6 (L type)

### Requirement: L29 豪宅配電

LEVELS[28] SHALL be a FreeCircuitLevel using FLOOR_PLAN_XL with the following definition:
- name: 'L29 豪宅配電'
- 12 rooms using all XL floor plan rooms (master-bedroom, walk-in-closet, master-bathroom, living-room, balcony, study, dining-room, second-bedroom, kids-room, guest-bathroom, entrance, kitchen)
- panel: 8 slots / 100A mainBreaker
- survivalTime: 15s
- phaseMode: 'manual', leakageMode: 'random', requiresCrimp: true
- bonusCondition: { type: 'under-budget-ratio', ratio: 0.8 }
- Appliances per PRD: master-bedroom[除濕機], walk-in-closet[吹風機], master-bathroom[浴室暖風機220V](wetArea), living-room[冷氣220V+電暖器], study[除濕機], dining-room[微波爐], second-bedroom[除濕機], kids-room[除濕機], guest-bathroom[浴室暖風機220V](wetArea), entrance[冰箱], kitchen[快煮壺+烤箱+IH爐220V](wetArea)
- balcony has no appliances (inactive room)

#### Scenario: L29 is FreeCircuitLevel with XL floor plan
- **WHEN** reading LEVELS[28]
- **THEN** 'rooms' in level === true AND floorPlan.width === 10 AND floorPlan.height === 6

#### Scenario: L29 has all XL rooms except balcony with appliances
- **WHEN** reading LEVELS[28].rooms
- **THEN** rooms.length MUST be 11 (balcony excluded as no appliances) AND total appliance count MUST be 14

#### Scenario: L29 wetArea rooms
- **WHEN** reading LEVELS[28].rooms
- **THEN** master-bathroom, guest-bathroom, and kitchen rooms MUST have wetArea: true

### Requirement: L30 豪宅翻修

LEVELS[29] SHALL be a FixedCircuitLevel using FLOOR_PLAN_XL with old house mode:
- name: 'L30 豪宅翻修'
- 6 circuit configs: c1(廚房110V/30A/R), c2(主浴220V/20A/wetArea/elcb), c3(客廳110V/20A/R), c4(客廳冷氣220V/20A), c5(次臥+書房110V/15A/T), c6(主臥110V/15A/T)
- Old house problems: c1(overrated-breaker + wrong-wire-gauge), c2(missing-elcb), c3(oxidized-splice), c5(bare-wire)
- survivalTime: 15s, phaseMode: 'manual', requiresCrimp: true, requiresRouting: true
- bonusCondition: { type: 'aesthetics-score', minScore: 70 }

#### Scenario: L30 is FixedCircuitLevel with XL and oldHouse
- **WHEN** reading LEVELS[29]
- **THEN** 'circuitConfigs' in level === true AND oldHouse MUST be defined AND floorPlan.width === 10

#### Scenario: L30 has 4 old house problems across 4 circuits
- **WHEN** reading LEVELS[29].oldHouse.problems
- **THEN** problems.length MUST be 4 covering c1(overrated-breaker+wrong-wire-gauge combined as 2), c2(missing-elcb), c3(oxidized-splice), c5(bare-wire)

### Requirement: L31 終極豪宅

LEVELS[30] SHALL be a FixedCircuitLevel using FLOOR_PLAN_XL with all mechanics combined:
- name: 'L31 終極豪宅'
- 7 circuit configs covering all major mechanics
- Old house problems: full set of 5 problem types
- survivalTime: 18s
- phaseMode: 'manual', leakageMode: 'random', requiresCrimp: true, requiresRouting: true
- bonusCondition: { type: 'under-budget-ratio', ratio: 0.75 }

#### Scenario: L31 is the v0.9 graduation exam
- **WHEN** reading LEVELS[30]
- **THEN** 'circuitConfigs' in level === true AND circuitConfigs.length MUST be 7
- **AND** phaseMode === 'manual' AND leakageMode === 'random' AND requiresCrimp === true AND requiresRouting === true AND oldHouse MUST be defined

#### Scenario: L31 has all 5 problem types
- **WHEN** reading LEVELS[30].oldHouse.problems
- **THEN** the set of problem types MUST include all 5: bare-wire, wrong-wire-gauge, oxidized-splice, overrated-breaker, missing-elcb

### Requirement: Budget recalibrated for distance-based wire costs

All L01-L31 levels SHALL have budgets recalibrated based on actual routing distances instead of the fixed DEFAULT_WIRE_LENGTH (10m).

#### Scenario: Budget allows completion with optimal strategy
- **WHEN** a player uses the minimum viable wire for each circuit and chooses the cheapest routing strategy
- **THEN** the minimum cost MUST be less than the level's budget (budget provides ~20-30% headroom)

#### Scenario: Budget maintains relative difficulty progression
- **WHEN** comparing budgets across level ranges
- **THEN** later levels MUST generally have higher budgets reflecting more rooms and longer distances

### Requirement: i18n translations for L29-L31

All 6 locale files SHALL include translations for L29-L31 level names and descriptions.

#### Scenario: All locales have L29-L31 translations
- **WHEN** checking zh-TW.json, en.json, ja.json, ko.json, fr.json, th.json
- **THEN** each MUST contain translation keys for L29, L30, L31 names and descriptions under appropriate i18n keys
