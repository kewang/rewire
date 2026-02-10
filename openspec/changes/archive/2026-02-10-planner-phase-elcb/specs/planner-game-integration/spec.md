## MODIFIED Requirements

### Requirement: Planning phase completion triggers transition

規劃完成後 MUST 轉換到接線/模擬階段。

#### Scenario: 規劃完成轉換

- **WHEN** 玩家在規劃階段點擊「確認配置」按鈕
- **AND** 所有送電前置條件已滿足（所有電器已指派 + 每迴路已選線 + 插槽未超限 + wetArea 迴路已啟用 ELCB）
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
- **AND** CircuitConfig.phase MUST 等於 PlannerCircuit.phase（110V 迴路）
- **AND** CircuitConfig.wetArea MUST 為 true 若迴路含 wetArea 電器
- **AND** CircuitConfig.elcbAvailable MUST 等於 PlannerCircuit.elcbEnabled

#### Scenario: 轉換時設定 circuitPhases

- **WHEN** 規劃完成轉換
- **AND** PlannerCircuit 有 phase 值
- **THEN** circuitPhases state MUST 包含對應的 circuitId → phase 映射

#### Scenario: 轉換時設定 circuitElcb

- **WHEN** 規劃完成轉換
- **AND** PlannerCircuit 有 elcbEnabled 為 true
- **THEN** circuitElcb state MUST 包含對應的 circuitId → true 映射

### Requirement: Planning phase pre-conditions validation

系統 MUST 驗證規劃完成的前置條件。

#### Scenario: 所有電器未指派時不可確認

- **WHEN** 有電器尚未指派到任何迴路
- **THEN** 「確認配置」按鈕 MUST 為 disabled

#### Scenario: 有迴路未選線時不可確認

- **WHEN** 有迴路尚未選擇線材
- **THEN** 「確認配置」按鈕 MUST 為 disabled

#### Scenario: wetArea 迴路未啟用 ELCB 時不可確認

- **WHEN** 存在包含 wetArea 電器的迴路且 elcbEnabled 為 false
- **THEN** 「確認配置」按鈕 MUST 為 disabled
- **AND** confirmTooltip MUST 包含「潮濕區域迴路需安裝 ELCB」

#### Scenario: 所有條件滿足時可確認

- **WHEN** 所有電器已指派、所有迴路已選線、wetArea 迴路已啟用 ELCB
- **THEN** 「確認配置」按鈕 MUST 為 enabled

## ADDED Requirements

### Requirement: Scripted leakageEvent circuitId dynamic resolution

自由配迴路關卡的 scripted leakageEvent MUST 在規劃完成時動態解析 circuitId。

#### Scenario: 解析 wetArea 迴路的 leakageEvent

- **WHEN** 規劃完成且關卡有 leakageMode 為 'scripted'
- **AND** leakageEvents 中的 circuitId 需要動態映射
- **THEN** 系統 MUST 找到包含 wetArea 電器的已建迴路
- **AND** 將 leakageEvent 的 circuitId 替換為該迴路的實際 ID

#### Scenario: 多個 wetArea 迴路的映射

- **WHEN** 有多個包含 wetArea 電器的迴路
- **THEN** 系統 MUST 按迴路順序映射 leakageEvent

#### Scenario: 無 leakageEvents 時跳過映射

- **WHEN** 關卡未定義 leakageEvents
- **THEN** 系統 MUST 不執行映射邏輯

### Requirement: Planning phase handles onChangePhase callback

GameBoard MUST 支援 onChangePhase 回調以更新 PlannerCircuit 的 phase。

#### Scenario: 更新 PlannerCircuit phase

- **WHEN** CircuitCard 觸發 onChangePhase(id, 'T')
- **THEN** GameBoard MUST 更新對應 PlannerCircuit 的 phase 為 'T'

### Requirement: Planning phase handles onChangeElcb callback

GameBoard MUST 支援 onChangeElcb 回調以更新 PlannerCircuit 的 elcbEnabled。

#### Scenario: 更新 PlannerCircuit elcbEnabled

- **WHEN** CircuitCard 觸發 onChangeElcb(id, true)
- **THEN** GameBoard MUST 更新對應 PlannerCircuit 的 elcbEnabled 為 true

### Requirement: ELCB cost included in planner total cost

GameBoard 的自由配迴路總成本計算 MUST 包含 ELCB 費用。

#### Scenario: 含 ELCB 的總成本

- **WHEN** 一條迴路 elcbEnabled 為 true，wire cost = $30，NFB cost = $15
- **THEN** 該迴路成本 MUST = $30 + $15 + $35 = $80
- **AND** 總成本 MUST 包含此 $80
