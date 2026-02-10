## ADDED Requirements

### Requirement: CircuitPlanner component renders planning UI

系統 MUST 提供 `CircuitPlanner` 元件，作為自由配迴路的規劃主容器。顯示房間電器清單、已建迴路列表、配電箱狀態摘要。

#### Scenario: CircuitPlanner 顯示房間列表與已建迴路

- **WHEN** CircuitPlanner 收到 rooms 和 plannerCircuits props
- **THEN** MUST 渲染 RoomPanel（顯示所有房間及其電器）
- **AND** MUST 渲染所有已建迴路的 CircuitCard
- **AND** MUST 顯示「＋新增迴路」按鈕

#### Scenario: CircuitPlanner 顯示配電箱摘要

- **WHEN** CircuitPlanner 渲染
- **THEN** MUST 顯示插槽使用量（「N / M 插槽」）
- **AND** MUST 顯示目前總成本與預算（「$X / $Y」）
- **AND** MUST 顯示送電前置條件狀態（哪些條件未滿足）

### Requirement: Player can create a new circuit

玩家 MUST 能透過「＋新增迴路」按鈕建立新迴路。

#### Scenario: 建立新迴路（插槽未滿）

- **WHEN** 玩家點擊「＋新增迴路」且目前迴路數 < panel.maxSlots
- **THEN** MUST 新增一條迴路，預設電壓 110V、NFB 20A
- **AND** 新迴路 MUST 出現在迴路列表中

#### Scenario: 建立新迴路（插槽已滿）

- **WHEN** 玩家點擊「＋新增迴路」且目前迴路數 >= panel.maxSlots
- **THEN** 按鈕 MUST 為 disabled 狀態
- **AND** MUST 不建立新迴路

### Requirement: Player can delete a circuit

玩家 MUST 能刪除已建立的迴路。

#### Scenario: 刪除迴路

- **WHEN** 玩家點擊迴路卡片上的刪除按鈕
- **THEN** 該迴路 MUST 從迴路列表中移除
- **AND** 該迴路上的所有已指派電器 MUST 回到未指派狀態

### Requirement: Player can change circuit voltage

玩家 MUST 能切換迴路的電壓（110V / 220V）。

#### Scenario: 切換電壓

- **WHEN** 玩家在迴路卡片上切換電壓
- **THEN** 迴路電壓 MUST 更新
- **AND** 所有不匹配新電壓的已指派電器 MUST 自動移除回未指派狀態

### Requirement: Player can change circuit NFB

玩家 MUST 能選擇迴路的 NFB 規格（15A / 20A / 30A）。

#### Scenario: 選擇 NFB 規格

- **WHEN** 玩家在迴路卡片上選擇 NFB 規格
- **THEN** 迴路的 breaker MUST 更新為對應的 BREAKER_15A / BREAKER_20A / BREAKER_30A

### Requirement: RoomPanel displays rooms and appliances

系統 MUST 提供 `RoomPanel` 元件，顯示所有房間及其電器。

#### Scenario: 顯示房間電器清單

- **WHEN** RoomPanel 收到 rooms props
- **THEN** 每個房間 MUST 顯示名稱
- **AND** 每個房間的每台電器 MUST 顯示名稱、功率、電壓、電流
- **AND** wetArea 房間 MUST 顯示潮濕區域標示

#### Scenario: 未指派電器高亮

- **WHEN** 電器尚未指派到任何迴路
- **THEN** 該電器 MUST 以高亮樣式顯示

#### Scenario: 已指派電器灰化

- **WHEN** 電器已指派到某條迴路
- **THEN** 該電器 MUST 以灰化樣式顯示
- **AND** MUST 顯示已指派的迴路標識

### Requirement: Player can assign appliances to circuits

玩家 MUST 能將未指派的電器指派到已建立的迴路。

#### Scenario: 點擊未指派電器進行指派

- **WHEN** 玩家點擊一台未指派的電器
- **AND** 存在至少一條電壓匹配的迴路
- **THEN** MUST 顯示目標迴路選單供選擇（或僅一條匹配時直接指派）
- **AND** 指派後電器 MUST 出現在目標迴路的 CircuitCard 中

#### Scenario: 電壓不匹配的迴路不可選

- **WHEN** 玩家嘗試指派電器
- **THEN** 電壓不匹配的迴路 MUST 不出現在選單中

#### Scenario: 移除已指派電器

- **WHEN** 玩家在 CircuitCard 中點擊已指派的電器
- **THEN** 該電器 MUST 從迴路中移除，回到未指派狀態

### Requirement: CircuitCard displays circuit details

系統 MUST 提供 `CircuitCard` 元件，顯示單條迴路的詳細資訊。

#### Scenario: CircuitCard 顯示基本資訊

- **WHEN** CircuitCard 渲染
- **THEN** MUST 顯示迴路編號、電壓、NFB 規格
- **AND** MUST 顯示已指派電器列表
- **AND** MUST 顯示預估電流 vs 線材安全容量（若已選線材）

#### Scenario: CircuitCard 的電流安全指示

- **WHEN** 迴路預估電流 < 線材安全容量的 80%
- **THEN** 電流指示 MUST 為綠色

- **WHEN** 迴路預估電流 >= 線材安全容量的 80% 且 < 100%
- **THEN** 電流指示 MUST 為黃色

- **WHEN** 迴路預估電流 >= 線材安全容量
- **THEN** 電流指示 MUST 為紅色

### Requirement: Player can select wire for each circuit in planner

玩家 MUST 能為每條自建迴路選擇線材。

#### Scenario: 線材選擇

- **WHEN** 玩家在 CircuitCard 中選擇線材（從下拉選單或拖曳）
- **THEN** 該迴路的線材 MUST 更新
- **AND** 成本 MUST 即時重新計算

### Requirement: Cost calculation includes NFB cost for free circuit levels

自由配迴路的成本計算 MUST 包含 NFB 費用。

#### Scenario: 成本計算公式

- **WHEN** 計算自由配迴路的總成本
- **THEN** 每條迴路成本 MUST = wire.costPerMeter × DEFAULT_WIRE_LENGTH + NFB_COSTS[breaker.ratedCurrent]
- **AND** 總成本 = Σ 各迴路成本
