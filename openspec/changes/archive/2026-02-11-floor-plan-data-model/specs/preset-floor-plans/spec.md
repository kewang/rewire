## ADDED Requirements

### Requirement: 4 種預設房型常數

系統 MUST 在 `src/data/floorPlans.ts` 中 export 4 種預設房型常數：`FLOOR_PLAN_S`、`FLOOR_PLAN_M`、`FLOOR_PLAN_L`、`FLOOR_PLAN_XL`。

#### Scenario: 每個常數符合 FloorPlan 型別

- **WHEN** 引用任一預設房型常數
- **THEN** 該常數 MUST 滿足 `FloorPlan` interface
- **AND** TypeScript 編譯 MUST 通過無錯誤

### Requirement: 房型 S — 套房（4×4）

`FLOOR_PLAN_S` MUST 定義 4×4 格的套房佈局。

#### Scenario: 房型 S 基本結構

- **WHEN** 讀取 FLOOR_PLAN_S
- **THEN** width MUST 為 4，height MUST 為 4，scale MUST 為 1.0

#### Scenario: 房型 S 包含 4 個房間

- **WHEN** 讀取 FLOOR_PLAN_S.rooms
- **THEN** MUST 包含 4 個房間：臥室(bedroom)、浴室(bathroom, wetArea)、客廳(living-room)、廚房(kitchen, wetArea)

#### Scenario: 房型 S 配電箱位於客廳

- **WHEN** 讀取 FLOOR_PLAN_S.panel
- **THEN** roomId MUST 為 `"living-room"`

#### Scenario: 房型 S 走線路徑圖完整

- **WHEN** 讀取 FLOOR_PLAN_S.routingGraph
- **THEN** MUST 包含配電箱節點（panel）、每個房間的出線口節點、牆角轉彎節點
- **AND** 所有房間 MUST 從配電箱可達（圖為連通圖）

### Requirement: 房型 M — 兩房（6×4）

`FLOOR_PLAN_M` MUST 定義 6×4 格的兩房佈局。

#### Scenario: 房型 M 基本結構

- **WHEN** 讀取 FLOOR_PLAN_M
- **THEN** width MUST 為 6，height MUST 為 4，scale MUST 為 1.0

#### Scenario: 房型 M 包含 6 個房間

- **WHEN** 讀取 FLOOR_PLAN_M.rooms
- **THEN** MUST 包含 6 個房間：主臥(master-bedroom)、次臥(second-bedroom)、浴室(bathroom, wetArea)、客廳(living-room)、玄關(entrance)、廚房(kitchen, wetArea)

#### Scenario: 房型 M 配電箱位於玄關

- **WHEN** 讀取 FLOOR_PLAN_M.panel
- **THEN** roomId MUST 為 `"entrance"`

#### Scenario: 房型 M 走線距離範圍

- **WHEN** 計算 FLOOR_PLAN_M 中各房間出線口到配電箱的最短路徑
- **THEN** 距離範圍 MUST 在 3-8m 之間

### Requirement: 房型 L — 三房（8×6）

`FLOOR_PLAN_L` MUST 定義 8×6 格的三房佈局。

#### Scenario: 房型 L 基本結構

- **WHEN** 讀取 FLOOR_PLAN_L
- **THEN** width MUST 為 8，height MUST 為 6，scale MUST 為 1.0

#### Scenario: 房型 L 包含 10 個房間

- **WHEN** 讀取 FLOOR_PLAN_L.rooms
- **THEN** MUST 包含 10 個房間：主臥(master-bedroom)、書房(study)、次臥(second-bedroom)、主浴(master-bathroom, wetArea)、客廳(living-room)、餐廳(dining-room)、客浴(guest-bathroom, wetArea)、玄關(entrance)、廚房(kitchen, wetArea)、陽台(balcony)

#### Scenario: 房型 L 配電箱位於玄關

- **WHEN** 讀取 FLOOR_PLAN_L.panel
- **THEN** roomId MUST 為 `"entrance"`

#### Scenario: 房型 L 走線距離範圍

- **WHEN** 計算 FLOOR_PLAN_L 中各房間出線口到配電箱的最短路徑
- **THEN** 距離範圍 MUST 在 3-15m 之間

### Requirement: 房型 XL — 豪宅（10×6）

`FLOOR_PLAN_XL` MUST 定義 10×6 格的豪宅佈局。

#### Scenario: 房型 XL 基本結構

- **WHEN** 讀取 FLOOR_PLAN_XL
- **THEN** width MUST 為 10，height MUST 為 6，scale MUST 為 1.0

#### Scenario: 房型 XL 包含 12 個房間

- **WHEN** 讀取 FLOOR_PLAN_XL.rooms
- **THEN** MUST 包含 12 個房間：主臥(master-bedroom)、更衣室(walk-in-closet)、主浴(master-bathroom, wetArea)、客廳(living-room)、陽台(balcony)、書房(study)、餐廳(dining-room)、次臥(second-bedroom)、小孩房(kids-room)、客浴(guest-bathroom, wetArea)、玄關(entrance)、廚房(kitchen, wetArea)

#### Scenario: 房型 XL 配電箱位於玄關

- **WHEN** 讀取 FLOOR_PLAN_XL.panel
- **THEN** roomId MUST 為 `"entrance"`

#### Scenario: 房型 XL 走線距離範圍

- **WHEN** 計算 FLOOR_PLAN_XL 中各房間出線口到配電箱的最短路徑
- **THEN** 距離範圍 MUST 在 3-18m 之間

### Requirement: 每個房間至少一個 power 出線口

所有預設房型中的每個房間 MUST 至少有一個 `type: 'power'` 的出線口。

#### Scenario: 遍歷所有房型的所有房間

- **WHEN** 遍歷 FLOOR_PLAN_S/M/L/XL 的所有房間
- **THEN** 每個房間的 outlets 陣列 MUST 至少包含一個 `type: 'power'` 的 FloorPlanOutlet

### Requirement: 所有房型的 RoutingGraph 為連通圖

所有預設房型的走線路徑圖 MUST 確保從配電箱節點可達所有房間出線口節點。

#### Scenario: 配電箱可達所有出線口

- **WHEN** 對任一預設房型執行圖搜尋（BFS/DFS）從 panel 節點出發
- **THEN** MUST 可到達所有房間出線口對應的節點

### Requirement: RoutingEdge distance 基於幾何距離

所有 RoutingEdge 的 distance MUST 基於兩端節點的格子座標計算，乘以 scale 得到公尺值。

#### Scenario: 相鄰節點的距離計算

- **WHEN** 兩個 RoutingNode 座標為 (2, 0) 和 (4, 0)，scale = 1.0
- **THEN** 連接它們的 RoutingEdge.distance MUST 為 2.0（公尺）

#### Scenario: 斜向節點的距離計算

- **WHEN** 兩個 RoutingNode 座標為 (0, 0) 和 (3, 4)，scale = 1.0
- **THEN** 連接它們的 RoutingEdge.distance MUST 為 5.0（公尺，歐幾里得距離）
