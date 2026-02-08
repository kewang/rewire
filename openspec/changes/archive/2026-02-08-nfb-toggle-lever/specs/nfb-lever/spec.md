## ADDED Requirements

### Requirement: NFB lever visual

NFB MUST 以撥桿造型呈現在 CircuitDiagram SVG 內，取代獨立的按鈕元素。

#### Scenario: OFF 狀態外觀

- **WHEN** isPowered = false 且撥桿可操作（已接線且有電器）
- **THEN** 撥桿把手 MUST 位於軌道下方（OFF 位置）
- **AND** 把手顏色 MUST 為暗色調
- **AND** NFB 標籤 MUST 顯示「OFF」

#### Scenario: ON 狀態外觀

- **WHEN** isPowered = true
- **THEN** 撥桿把手 MUST 位於軌道上方（ON 位置）
- **AND** 把手顏色 MUST 為綠色
- **AND** NFB 標籤 MUST 顯示「ON」

#### Scenario: 禁用狀態外觀

- **WHEN** 未接線（isWired = false）或無電器
- **THEN** 撥桿 MUST 顯示為半透明禁用狀態
- **AND** 游標 MUST 為 not-allowed（桌面版）

### Requirement: NFB lever interaction

玩家 MUST 能透過拖曳或點擊撥桿來控制送電與斷電。

#### Scenario: 拖曳送電

- **WHEN** 玩家在撥桿把手上 pointerdown 並向上拖曳超過閾值
- **THEN** 撥桿 MUST 移至 ON 位置
- **AND** MUST 觸發送電邏輯

#### Scenario: 拖曳斷電

- **WHEN** 撥桿在 ON 位置且玩家向下拖曳超過閾值
- **THEN** 撥桿 MUST 移至 OFF 位置
- **AND** MUST 觸發斷電邏輯

#### Scenario: 點擊切換

- **WHEN** 玩家在撥桿區域快速點擊（無明顯拖曳移動）
- **THEN** 撥桿 MUST 切換至相反狀態（ON↔OFF）
- **AND** MUST 觸發對應的送電/斷電邏輯

#### Scenario: 禁用時不可操作

- **WHEN** 撥桿處於禁用狀態
- **THEN** 拖曳與點擊操作 MUST 被忽略，不改變任何狀態

### Requirement: NFB lever animation

撥桿狀態切換時 MUST 有平滑的滑動動畫。

#### Scenario: 送電滑動動畫

- **WHEN** 撥桿從 OFF 切換至 ON
- **THEN** 把手 MUST 以平滑動畫滑至上方位置
- **AND** 動畫持續時間 MUST 約 200-300ms

#### Scenario: 斷電滑動動畫

- **WHEN** 撥桿從 ON 切換至 OFF（玩家主動斷電）
- **THEN** 把手 MUST 以平滑動畫滑至下方位置

#### Scenario: 跳脫彈回動畫

- **WHEN** 模擬狀態變為 tripped 或 burned
- **THEN** 撥桿 MUST 自動彈回 OFF 位置
- **AND** 彈回動畫 MUST 與既有的跳脫/燒毀音效同步
