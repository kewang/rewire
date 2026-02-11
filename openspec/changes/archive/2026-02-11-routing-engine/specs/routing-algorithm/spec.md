## ADDED Requirements

### Requirement: Dijkstra shortest path calculation
The system SHALL provide a `findShortestPath(graph, fromNodeId, toNodeId)` function that calculates the shortest path between two nodes in a RoutingGraph using Dijkstra's algorithm. Edges SHALL be treated as bidirectional. The function SHALL return a `RoutePath` containing the ordered node ID sequence and total distance in meters, or `null` if no path exists.

#### Scenario: Shortest path between panel and outlet in floor plan S
- **WHEN** `findShortestPath` is called with FLOOR_PLAN_S.routingGraph, fromNodeId='panel', toNodeId='outlet-bedroom'
- **THEN** the result SHALL contain a `nodeIds` array representing the shortest path from panel to outlet-bedroom, and `distance` SHALL equal the sum of edge distances along that path

#### Scenario: Shortest path to unreachable node
- **WHEN** `findShortestPath` is called with a graph where the target node is not connected to the source
- **THEN** the result SHALL be `null`

#### Scenario: Same source and destination
- **WHEN** `findShortestPath` is called with fromNodeId equal to toNodeId
- **THEN** the result SHALL be `{ nodeIds: [nodeId], distance: 0 }`

### Requirement: Outlet node ID convention
The system SHALL provide a `getOutletNodeId(roomId)` helper that returns `'outlet-' + roomId` as the RoutingGraph node ID for a room's outlet. The system SHALL provide a `getPanelNodeId()` helper that returns `'panel'`.

#### Scenario: Get outlet node ID for bedroom
- **WHEN** `getOutletNodeId('bedroom')` is called
- **THEN** the result SHALL be `'outlet-bedroom'`

#### Scenario: Get panel node ID
- **WHEN** `getPanelNodeId()` is called
- **THEN** the result SHALL be `'panel'`

### Requirement: Star routing candidate
The system SHALL calculate a star (home-run) routing candidate for a circuit serving multiple rooms. For each room, the system SHALL independently calculate the shortest path from the panel to that room's outlet. The total distance SHALL be the sum of all individual path distances.

#### Scenario: Star routing for two rooms
- **WHEN** `calcRouteCandidates` is called with a floorPlan and roomIds=['master-bedroom', 'kitchen']
- **THEN** the result SHALL contain a candidate with strategy='star', paths containing one RoutePath per room (each from panel to that room's outlet), and totalDistance equal to the sum of both path distances

#### Scenario: Star routing for single room
- **WHEN** `calcRouteCandidates` is called with roomIds containing exactly one room
- **THEN** the result SHALL contain exactly one candidate with strategy='direct', with a single path from panel to that room's outlet

### Requirement: Daisy-chain routing candidate
The system SHALL calculate a daisy-chain (串聯) routing candidate using a greedy nearest-neighbor algorithm. Starting from the panel node, the system SHALL repeatedly visit the nearest unvisited room's outlet, accumulating paths. The total distance SHALL be the sum of all hop distances (panel→room1→room2→...→roomN).

#### Scenario: Daisy-chain routing for three rooms
- **WHEN** `calcRouteCandidates` is called with roomIds=['master-bedroom', 'living-room', 'kitchen']
- **THEN** the result SHALL contain a candidate with strategy='daisy-chain', paths containing one RoutePath per room (each representing the hop to reach that room), and totalDistance representing the total chain distance

#### Scenario: Daisy-chain vs star comparison
- **WHEN** `calcRouteCandidates` is called with two or more rooms
- **THEN** the daisy-chain candidate's totalDistance SHALL be less than or equal to the star candidate's totalDistance (串聯 saves wire by sharing path segments)

### Requirement: Route candidates calculation
The system SHALL provide a `calcRouteCandidates(floorPlan, roomIds)` function that returns a `RouteCandidates` object. For single-room circuits, it SHALL return one 'direct' candidate. For multi-room circuits, it SHALL return two candidates: 'star' and 'daisy-chain'.

#### Scenario: Single room returns direct candidate only
- **WHEN** `calcRouteCandidates` is called with roomIds containing one room
- **THEN** candidates SHALL contain exactly one entry with strategy='direct'

#### Scenario: Multiple rooms return star and daisy-chain
- **WHEN** `calcRouteCandidates` is called with roomIds containing two or more rooms
- **THEN** candidates SHALL contain exactly two entries: one with strategy='star' and one with strategy='daisy-chain'

### Requirement: Route distance calculation
The system SHALL provide a `calcRouteDistance(floorPlan, roomIds, strategy)` function that returns the total wire distance in meters for a given routing strategy. This function SHALL be usable for cost calculation: `cost = wire.costPerMeter * calcRouteDistance(...)`.

#### Scenario: Calculate distance with star strategy
- **WHEN** `calcRouteDistance` is called with strategy='star' and two rooms
- **THEN** the result SHALL equal the star candidate's totalDistance from calcRouteCandidates

#### Scenario: Calculate distance with daisy-chain strategy
- **WHEN** `calcRouteDistance` is called with strategy='daisy-chain' and two rooms
- **THEN** the result SHALL equal the daisy-chain candidate's totalDistance from calcRouteCandidates

#### Scenario: Calculate distance with direct strategy for single room
- **WHEN** `calcRouteDistance` is called with strategy='direct' and one room
- **THEN** the result SHALL equal the direct path distance from panel to that room's outlet

### Requirement: RoutePath type definition
The system SHALL export a `RoutePath` type with fields: `nodeIds: string[]` (ordered node sequence) and `distance: number` (total distance in meters).

#### Scenario: RoutePath structure
- **WHEN** a RoutePath is returned from findShortestPath
- **THEN** it SHALL have nodeIds as an array starting with the from node and ending with the to node, and distance as a positive number

### Requirement: RouteCandidate type definition
The system SHALL export a `RouteCandidate` type with fields: `strategy: 'direct' | 'star' | 'daisy-chain'`, `paths: Map<string, RoutePath>` (roomId to path mapping), and `totalDistance: number`.

#### Scenario: RouteCandidate paths mapping
- **WHEN** a RouteCandidate is accessed
- **THEN** paths.get(roomId) SHALL return the RoutePath for that specific room

### Requirement: RouteCandidates type definition
The system SHALL export a `RouteCandidates` type with field: `candidates: RouteCandidate[]`.

#### Scenario: RouteCandidates contains all options
- **WHEN** RouteCandidates is returned from calcRouteCandidates
- **THEN** candidates SHALL contain all available routing options for the given rooms
