## ADDED Requirements

### Requirement: Level requiresRouting Flag
Level 型別 SHALL 新增可選欄位 `requiresRouting?: boolean`。未設定或 false 時整線功能完全不啟用。

#### Scenario: L01-L20 unaffected
- **WHEN** 關卡未設定 requiresRouting
- **THEN** 不出現整線按鈕，送電不受整線條件限制

#### Scenario: Routing level enabled
- **WHEN** 關卡 requiresRouting = true
- **THEN** 接線完成後出現整線按鈕，送電前須完成整線

### Requirement: Routing Button Visibility
`requiresRouting` 關卡中，所有迴路接線完成（若 requiresCrimp 則壓接也完成）後 SHALL 顯示「整線」按鈕。

#### Scenario: Button appears after wiring complete
- **WHEN** requiresRouting 關卡中所有迴路已接線且壓接完成
- **THEN** 「整線」按鈕出現

#### Scenario: Button hidden before wiring
- **WHEN** 仍有迴路未接線
- **THEN** 「整線」按鈕不顯示

### Requirement: Routing Overlay Control
點擊「整線」按鈕 SHALL 開啟 PanelInteriorView overlay。overlay 中點擊「完成整線」SHALL 關閉 overlay 並標記 routingCompleted = true。

#### Scenario: Open routing overlay
- **WHEN** 玩家點擊「整線」按鈕
- **THEN** PanelInteriorView overlay 全幅顯示

#### Scenario: Complete routing
- **WHEN** 玩家在 overlay 中點擊「完成整線」
- **THEN** overlay 關閉，routingCompleted 設為 true

#### Scenario: Reopen routing overlay
- **WHEN** routingCompleted = true 時再次點擊「整線」按鈕
- **THEN** 可重新開啟 overlay 調整（分數會更新）

### Requirement: Power-on Prerequisite Updated
`canPowerOn` 條件 SHALL 新增：若 requiresRouting 則 routingCompleted 必須為 true。

#### Scenario: Cannot power on without routing
- **WHEN** requiresRouting = true 且 routingCompleted = false
- **THEN** 送電按鈕 disabled，tooltip 顯示「請先完成整線」

#### Scenario: Can power on after routing
- **WHEN** requiresRouting = true 且 routingCompleted = true
- **THEN** 送電按鈕啟用（其他條件也滿足時）

### Requirement: GameBoard Routing State Management
GameBoard SHALL 管理 routing phase 狀態：circuitLanes（車道排列）、cableTies（束帶 Set）、routingCompleted、showRoutingOverlay。handleSelectLevel 時初始化 circuitLanes = circuitConfigs.map(c => c.id)。

#### Scenario: Initialize lanes on level select
- **WHEN** 玩家選擇 requiresRouting 關卡
- **THEN** circuitLanes 初始化為迴路順序 [c1, c2, c3, ...]

#### Scenario: Lanes change callback
- **WHEN** PanelInteriorView 回調 onLanesChange
- **THEN** GameBoard 更新 circuitLanes 並清除 cableTies

### Requirement: ResultPanel Aesthetics Score Display
ResultPanel SHALL 新增可選 prop `aestheticsScore?: number`。過關時若有此值，顯示「整線分數：N / 100」。

#### Scenario: Show score on win
- **WHEN** result = 'won' 且 aestheticsScore = 90
- **THEN** ResultPanel 顯示「整線分數：90 / 100」

#### Scenario: Score color coding
- **WHEN** aestheticsScore ≥ 80
- **THEN** 分數文字為綠色
- **WHEN** aestheticsScore ≥ 50 且 < 80
- **THEN** 分數文字為黃色
- **WHEN** aestheticsScore < 50
- **THEN** 分數文字為紅色

#### Scenario: No score for non-routing levels
- **WHEN** aestheticsScore 未提供
- **THEN** ResultPanel 不顯示整線分數區塊

### Requirement: Aesthetics Score in PanelInteriorView
PanelInteriorView score bar SHALL 顯示即時整線分數。

#### Scenario: Real-time score display
- **WHEN** 玩家在 overlay 中拖曳車道或放置束帶
- **THEN** score bar 中的整線分數即時更新
