## ADDED Requirements

### Requirement: GameBoard detects FreeCircuitLevel and enters planning phase

GameBoard MUST 偵測 FreeCircuitLevel 並進入規劃階段。

#### Scenario: 選擇自由配迴路關卡

- **WHEN** 玩家選擇一個 FreeCircuitLevel（level 有 rooms 屬性）
- **THEN** GameBoard MUST 設定 gamePhase = 'planning'
- **AND** MUST 渲染 CircuitPlanner 元件
- **AND** MUST 不渲染既有的 wiring/simulation UI

#### Scenario: 選擇固定迴路關卡（不受影響）

- **WHEN** 玩家選擇一個 FixedCircuitLevel
- **THEN** GameBoard MUST 走既有流程（無 planning phase）

### Requirement: Planning phase completion triggers transition

規劃完成後 MUST 轉換到接線/模擬階段。

#### Scenario: 規劃完成轉換

- **WHEN** 玩家在規劃階段點擊「確認配置」按鈕
- **AND** 所有送電前置條件已滿足（所有電器已指派 + 每迴路已選線 + 插槽未超限）
- **THEN** MUST 從 PlannerCircuit[] 生成 CircuitConfig[]
- **AND** MUST 設定 circuitWires / circuitAppliances / wiring state
- **AND** MUST 切換 gamePhase 到 'wiring'
- **AND** 後續流程（壓接/走線/模擬）MUST 沿用既有邏輯

#### Scenario: 轉換生成的 CircuitConfig 格式

- **WHEN** 從 PlannerCircuit 轉換為 CircuitConfig
- **THEN** CircuitConfig.id MUST 為 'c1', 'c2', ... 格式
- **AND** CircuitConfig.label MUST 為 '迴路 1', '迴路 2', ... 格式
- **AND** CircuitConfig.availableAppliances MUST 等於該迴路的 assignedAppliances
- **AND** CircuitConfig.voltage MUST 等於 PlannerCircuit.voltage
- **AND** CircuitConfig.breaker MUST 等於 PlannerCircuit.breaker

### Requirement: Planning phase pre-conditions validation

系統 MUST 驗證規劃完成的前置條件。

#### Scenario: 所有電器未指派時不可確認

- **WHEN** 有電器尚未指派到任何迴路
- **THEN** 「確認配置」按鈕 MUST 為 disabled

#### Scenario: 有迴路未選線時不可確認

- **WHEN** 有迴路尚未選擇線材
- **THEN** 「確認配置」按鈕 MUST 為 disabled

#### Scenario: 所有條件滿足時可確認

- **WHEN** 所有電器已指派且所有迴路已選線
- **THEN** 「確認配置」按鈕 MUST 為 enabled

### Requirement: Back to levels resets planning state

返回關卡選擇 MUST 清除規劃狀態。

#### Scenario: 返回關卡選擇

- **WHEN** 玩家在規劃階段點擊「← 返回」
- **THEN** MUST 清除所有規劃相關狀態
- **AND** MUST 回到關卡選擇畫面

### Requirement: Retry resets to planning phase for free circuit levels

重試 MUST 回到規劃階段。

#### Scenario: 自由配迴路關卡重試

- **WHEN** 玩家在自由配迴路關卡結果畫面點擊「重試」
- **THEN** MUST 回到規劃階段（gamePhase = 'planning'）
- **AND** MUST 清除所有迴路規劃（從頭開始）
