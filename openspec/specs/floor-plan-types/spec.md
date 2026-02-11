## ADDED Requirements

### Requirement: FloorPlanOutlet type definition

系統 MUST 定義 `FloorPlanOutlet` interface，描述房間內的出線口位置與類型。

#### Scenario: FloorPlanOutlet 包含必要屬性

- **WHEN** 建立一個 FloorPlanOutlet 物件
- **THEN** 該物件 MUST 包含：
  - `x`（number）— 相對於房間的水平位置（0~1 比例）
  - `y`（number）— 相對於房間的垂直位置（0~1 比例）
  - `type`（'power' | 'network'）— 線路類型

#### Scenario: FloorPlanOutlet 所有屬性為 readonly

- **WHEN** 建立 FloorPlanOutlet 後嘗試修改屬性
- **THEN** TypeScript MUST 在編譯時報錯

### Requirement: FloorPlanRoom type definition

系統 MUST 定義 `FloorPlanRoom` interface，描述平面圖中的一個房間。

#### Scenario: FloorPlanRoom 包含必要屬性

- **WHEN** 建立一個 FloorPlanRoom 物件
- **THEN** 該物件 MUST 包含：
  - `id`（string）— 對應 Room.id 或 CircuitConfig 的房間識別符
  - `label`（string）— 顯示名稱
  - `x`（number）— 格子座標 X（整數）
  - `y`（number）— 格子座標 Y（整數）
  - `width`（number）— 寬度（格子數）
  - `height`（number）— 高度（格子數）
  - `outlets`（readonly FloorPlanOutlet[]）— 出線口位置列表

#### Scenario: FloorPlanRoom 包含可選 wetArea 屬性

- **WHEN** 建立一個潮濕區域的 FloorPlanRoom 物件
- **THEN** MUST 可包含 `wetArea?: boolean` 可選欄位
- **AND** 未指定時預設視為 false

#### Scenario: FloorPlanRoom 所有屬性為 readonly

- **WHEN** 建立 FloorPlanRoom 後嘗試修改屬性
- **THEN** TypeScript MUST 在編譯時報錯

### Requirement: RoutingNode type definition

系統 MUST 定義 `RoutingNode` interface，描述走線路徑圖中的一個節點（牆角/轉彎點/出線口/配電箱）。

#### Scenario: RoutingNode 包含必要屬性

- **WHEN** 建立一個 RoutingNode 物件
- **THEN** 該物件 MUST 包含：
  - `id`（string）— 節點唯一識別符
  - `x`（number）— 格子座標 X
  - `y`（number）— 格子座標 Y

#### Scenario: RoutingNode 所有屬性為 readonly

- **WHEN** 建立 RoutingNode 後嘗試修改屬性
- **THEN** TypeScript MUST 在編譯時報錯

### Requirement: RoutingEdge type definition

系統 MUST 定義 `RoutingEdge` interface，描述走線路徑圖中的一條邊（牆段）。

#### Scenario: RoutingEdge 包含必要屬性

- **WHEN** 建立一個 RoutingEdge 物件
- **THEN** 該物件 MUST 包含：
  - `from`（string）— 起點節點 ID
  - `to`（string）— 終點節點 ID
  - `distance`（number）— 實際距離（公尺），用於成本計算

#### Scenario: RoutingEdge 所有屬性為 readonly

- **WHEN** 建立 RoutingEdge 後嘗試修改屬性
- **THEN** TypeScript MUST 在編譯時報錯

### Requirement: RoutingGraph type definition

系統 MUST 定義 `RoutingGraph` interface，描述完整的走線路徑圖。

#### Scenario: RoutingGraph 包含必要屬性

- **WHEN** 建立一個 RoutingGraph 物件
- **THEN** 該物件 MUST 包含：
  - `nodes`（readonly RoutingNode[]）— 所有節點
  - `edges`（readonly RoutingEdge[]）— 所有邊

#### Scenario: RoutingGraph 邊為雙向

- **WHEN** 存在一條 from=A, to=B 的邊
- **THEN** 路由演算法 MUST 視為 A↔B 雙向可通行（無需重複定義反向邊）

#### Scenario: RoutingGraph 所有屬性為 readonly

- **WHEN** 建立 RoutingGraph 後嘗試修改屬性
- **THEN** TypeScript MUST 在編譯時報錯

### Requirement: FloorPlan type definition

系統 MUST 定義 `FloorPlan` interface，描述完整的平面圖定義。

#### Scenario: FloorPlan 包含必要屬性

- **WHEN** 建立一個 FloorPlan 物件
- **THEN** 該物件 MUST 包含：
  - `width`（number）— 格子總寬度
  - `height`（number）— 格子總高度
  - `rooms`（readonly FloorPlanRoom[]）— 房間列表
  - `panel`（object）— 配電箱位置，包含 `x`（number）、`y`（number）、`roomId`（string）
  - `routingGraph`（RoutingGraph）— 走線路徑圖
  - `scale`（number）— 比例尺（每格 = 幾公尺）

#### Scenario: FloorPlan 所有屬性為 readonly

- **WHEN** 建立 FloorPlan 後嘗試修改屬性
- **THEN** TypeScript MUST 在編譯時報錯

### Requirement: 型別定義位於獨立檔案

所有平面圖相關型別 MUST 定義於 `src/types/floorPlan.ts`，並 export 供其他模組使用。

#### Scenario: import 平面圖型別

- **WHEN** 其他模組需要使用 FloorPlan 型別
- **THEN** MUST 可透過 `import { FloorPlan } from '../types/floorPlan'` 匯入
