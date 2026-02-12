## MODIFIED Requirements

### Requirement: L06 自由配迴路入門

LEVELS[5] SHALL be a FreeCircuitLevel with room IDs matching FLOOR_PLAN_S:
- name: 'L06 自由配迴路入門'
- description: '第一次體驗自由配迴路！兩個房間、三台電器，你來決定怎麼分。'
- rooms: living-room(客廳) [吹風機]、kitchen(廚房) [快煮壺, 冰箱]
- panel: 4 slots / 35A mainBreaker
- budget: recalibrated for FLOOR_PLAN_S distances
- survivalTime: 8s
- bonusCondition: { type: 'under-budget-ratio', ratio: 0.85 }
- floorPlan: FLOOR_PLAN_S

#### Scenario: L06 room IDs match FLOOR_PLAN_S
- **WHEN** reading LEVELS[5].rooms
- **THEN** all room IDs MUST exist in FLOOR_PLAN_S.rooms (living-room, kitchen)

### Requirement: L07 高功率初體驗

LEVELS[6] SHALL be a FreeCircuitLevel with room ID matching FLOOR_PLAN_M:
- rooms: living-room(客廳) [電暖器, 冰箱] — changed from `living`
- floorPlan: FLOOR_PLAN_M
- budget: recalibrated for FLOOR_PLAN_M distances

#### Scenario: L07 room ID updated
- **WHEN** reading LEVELS[6].rooms[0].id
- **THEN** id MUST be 'living-room' (not 'living')

### Requirement: L08 廚房分迴路

LEVELS[7] SHALL be a FreeCircuitLevel with room IDs matching FLOOR_PLAN_M:
- rooms: kitchen(廚房) [快煮壺, 微波爐]、living-room(客廳) [電暖器] — changed from `living`
- floorPlan: FLOOR_PLAN_M
- budget: recalibrated

#### Scenario: L08 room IDs match FLOOR_PLAN_M
- **WHEN** reading LEVELS[7].rooms
- **THEN** room IDs MUST be 'kitchen' and 'living-room'

### Requirement: L09 混合電壓

LEVELS[8] SHALL be a FreeCircuitLevel with room IDs matching FLOOR_PLAN_M:
- rooms: kitchen(廚房) [快煮壺, 烤箱]、second-bedroom(洗衣間) [烘衣機(220V)] — changed from `laundry` to `second-bedroom`
- floorPlan: FLOOR_PLAN_M
- budget: recalibrated

#### Scenario: L09 laundry mapped to second-bedroom
- **WHEN** reading LEVELS[8].rooms
- **THEN** room with dryer MUST have id 'second-bedroom' (mapped from conceptual laundry room)

### Requirement: L10 全屋配電

LEVELS[9] SHALL be a FreeCircuitLevel with room IDs matching FLOOR_PLAN_M:
- rooms: kitchen(廚房) [快煮壺, 微波爐]、living-room(客廳) [電暖器, 吹風機]、master-bedroom(臥室) [除濕機]、second-bedroom(洗衣間) [烘衣機(220V)]、entrance(儲藏室) [冰箱]
- Remapping: living→living-room, bedroom→master-bedroom, laundry→second-bedroom, storage→entrance
- floorPlan: FLOOR_PLAN_M
- budget: recalibrated

#### Scenario: L10 all 5 rooms map to FLOOR_PLAN_M rooms
- **WHEN** reading LEVELS[9].rooms
- **THEN** all room IDs MUST exist in FLOOR_PLAN_M.rooms

### Requirement: L11 相位平衡入門（自由配）

LEVELS[10] SHALL be a FreeCircuitLevel with room IDs matching FLOOR_PLAN_M:
- rooms: kitchen(廚房) [快煮壺, 冰箱]、living-room(客廳) [吹風機, 除濕機]、master-bedroom(冷氣間) [冷氣(220V)]
- Remapping: living→living-room, ac→master-bedroom
- floorPlan: FLOOR_PLAN_M
- budget: recalibrated

#### Scenario: L11 ac room mapped to master-bedroom
- **WHEN** reading LEVELS[10].rooms
- **THEN** room with airCon MUST have id 'master-bedroom'

### Requirement: L12 相位平衡進階（自由配）

LEVELS[11] SHALL be a FreeCircuitLevel with room IDs matching FLOOR_PLAN_M:
- rooms: kitchen(廚房) [快煮壺, 微波爐, 烤箱]、living-room(客廳) [電暖器, 吹風機]、entrance(儲藏室) [冰箱]、master-bedroom(冷氣間) [冷氣(220V)]
- Remapping: living→living-room, storage→entrance, ac→master-bedroom
- floorPlan: FLOOR_PLAN_M
- budget: recalibrated

#### Scenario: L12 room IDs match FLOOR_PLAN_M
- **WHEN** reading LEVELS[11].rooms
- **THEN** all room IDs MUST exist in FLOOR_PLAN_M.rooms

### Requirement: L13 ELCB 入門（自由配）

LEVELS[12] SHALL be a FreeCircuitLevel with room IDs matching FLOOR_PLAN_M:
- rooms: bathroom(浴室) [浴室暖風機(220V)] (wetArea)、master-bedroom(臥室) [吹風機]
- Remapping: bedroom→master-bedroom
- floorPlan: FLOOR_PLAN_M
- budget: recalibrated

#### Scenario: L13 room IDs match FLOOR_PLAN_M
- **WHEN** reading LEVELS[12].rooms
- **THEN** all room IDs MUST exist in FLOOR_PLAN_M.rooms (bathroom, master-bedroom)

### Requirement: L14 ELCB 預算壓力（自由配）

LEVELS[13] SHALL be a FreeCircuitLevel with room IDs matching FLOOR_PLAN_M:
- rooms: bathroom(浴室) [浴室暖風機(220V)] (wetArea)、kitchen(廚房) [快煮壺, 微波爐]、entrance(儲藏室) [冰箱]
- Remapping: storage→entrance
- floorPlan: FLOOR_PLAN_M
- budget: recalibrated

#### Scenario: L14 room IDs match FLOOR_PLAN_M
- **WHEN** reading LEVELS[13].rooms
- **THEN** all room IDs MUST exist in FLOOR_PLAN_M.rooms

### Requirement: L15 綜合挑戰（自由配）

LEVELS[14] SHALL be a FreeCircuitLevel with room IDs matching FLOOR_PLAN_M:
- rooms: kitchen(廚房) [快煮壺, 微波爐]、living-room(客廳) [電暖器]、bathroom(浴室) [浴室暖風機(220V)] (wetArea)、master-bedroom(冷氣間) [冷氣(220V)]
- Remapping: living→living-room, ac→master-bedroom
- floorPlan: FLOOR_PLAN_M
- budget: recalibrated

#### Scenario: L15 room IDs match FLOOR_PLAN_M
- **WHEN** reading LEVELS[14].rooms
- **THEN** all room IDs MUST exist in FLOOR_PLAN_M.rooms

### Requirement: L16 壓接端子入門（自由配）

LEVELS[15] SHALL be a FreeCircuitLevel with room IDs matching FLOOR_PLAN_M:
- rooms: living-room(客廳) [吹風機, 冰箱]
- Remapping: living→living-room
- floorPlan: FLOOR_PLAN_M
- budget: recalibrated

#### Scenario: L16 room ID matches FLOOR_PLAN_M
- **WHEN** reading LEVELS[15].rooms[0].id
- **THEN** id MUST be 'living-room'

### Requirement: L17 端子品質大考驗（自由配）

LEVELS[16] SHALL be a FreeCircuitLevel with room IDs matching FLOOR_PLAN_M:
- rooms: kitchen(廚房) [快煮壺, 微波爐]、master-bedroom(冷氣間) [IH爐(220V)]
- Remapping: ac→master-bedroom
- floorPlan: FLOOR_PLAN_M
- budget: recalibrated

#### Scenario: L17 room IDs match FLOOR_PLAN_M
- **WHEN** reading LEVELS[16].rooms
- **THEN** all room IDs MUST exist in FLOOR_PLAN_M.rooms

### Requirement: L21 整線入門（自由配）

LEVELS[20] SHALL be a FreeCircuitLevel with room IDs matching FLOOR_PLAN_M:
- rooms: living-room(客廳) [吹風機]、entrance(儲藏室) [冰箱]、kitchen(廚房) [廚下加熱器]
- Remapping: living→living-room, storage→entrance
- floorPlan: FLOOR_PLAN_M
- budget: recalibrated

#### Scenario: L21 room IDs match FLOOR_PLAN_M
- **WHEN** reading LEVELS[20].rooms
- **THEN** all room IDs MUST exist in FLOOR_PLAN_M.rooms

### Requirement: L22 交叉迷宮（自由配）

LEVELS[21] SHALL be a FreeCircuitLevel with room IDs matching FLOOR_PLAN_M:
- rooms: kitchen(廚房) [快煮壺, 微波爐]、living-room(客廳) [電暖器]、second-bedroom(陽台) [烘衣機(220V)]、entrance(儲藏室) [冰箱]、master-bedroom(臥室) [除濕機]
- Remapping: living→living-room, balcony→second-bedroom, storage→entrance, bedroom→master-bedroom
- floorPlan: FLOOR_PLAN_M
- budget: recalibrated

#### Scenario: L22 room IDs match FLOOR_PLAN_M
- **WHEN** reading LEVELS[21].rooms
- **THEN** all 5 room IDs MUST exist in FLOOR_PLAN_M.rooms

### Requirement: L23 完美配電箱（自由配）

LEVELS[22] SHALL be a FreeCircuitLevel with room IDs matching FLOOR_PLAN_M:
- rooms: kitchen(廚房) [快煮壺, 微波爐]、living-room(客廳) [電暖器, 吹風機]、bathroom(浴室) [浴室暖風機(220V)] (wetArea)、master-bedroom(冷氣間) [冷氣(220V)]、entrance(儲藏室) [冰箱]
- Remapping: living→living-room, ac→master-bedroom, storage→entrance
- floorPlan: FLOOR_PLAN_M
- budget: recalibrated

#### Scenario: L23 room IDs match FLOOR_PLAN_M
- **WHEN** reading LEVELS[22].rooms
- **THEN** all 5 room IDs MUST exist in FLOOR_PLAN_M.rooms
