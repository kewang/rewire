## ADDED Requirements

### Requirement: Old house data model

系統 MUST 定義老屋模式的資料結構：

- `OldHouseProblemType = 'bare-wire' | 'wrong-wire-gauge' | 'oxidized-splice'`
- `OldHouseProblem = { circuitId: CircuitId; type: OldHouseProblemType }`
- `PreWiredCircuit = { wire: Wire; crimpQuality: CrimpQuality; appliances: readonly Appliance[] }`
- `OldHouseConfig = { problems: readonly OldHouseProblem[]; preWiredCircuits: Record<CircuitId, PreWiredCircuit> }`
- `Level.oldHouse?: OldHouseConfig`

#### Scenario: 型別正確定義

- **WHEN** 在 game.ts 中定義老屋相關型別
- **THEN** OldHouseProblemType MUST 包含 3 種問題類型
- **AND** OldHouseConfig MUST 包含 problems 陣列與 preWiredCircuits 記錄
- **AND** Level MUST 有可選 oldHouse 欄位

### Requirement: Oxidized contact resistance constant

系統 MUST 定義氧化接觸電阻常數 `OXIDIZED_CONTACT_RESISTANCE = 2.0`。

#### Scenario: 常數值

- **WHEN** 讀取 OXIDIZED_CONTACT_RESISTANCE
- **THEN** 值 MUST 為 2.0

### Requirement: Old house level initialization

老屋關卡選擇後，GameBoard MUST 初始化為預接線狀態。

#### Scenario: 預接線初始化

- **WHEN** 玩家選擇一個 oldHouse 關卡
- **THEN** 各迴路 MUST 依 preWiredCircuits 設定初始線材
- **AND** 各迴路 MUST 依 preWiredCircuits 設定初始壓接品質
- **AND** 各迴路 MUST 依 preWiredCircuits 設定初始電器
- **AND** 各迴路 MUST 標記為已接線（wiring.circuits[id].isWired = true）

#### Scenario: 問題迴路標記

- **WHEN** 老屋關卡初始化完成
- **THEN** problems 中列出的迴路 MUST 標記為問題迴路
- **AND** 問題迴路 MUST 在 CircuitDiagram 上顯示閃爍橘色邊框 + ⚠️ 圖示

### Requirement: Unwire operation

老屋模式中，玩家 MUST 能拆除已接線迴路的線材。

#### Scenario: 拆線按鈕顯示

- **WHEN** 老屋關卡中迴路已接線且未送電
- **THEN** CircuitDiagram 中該迴路 MUST 顯示「拆線」按鈕

#### Scenario: 拆線確認

- **WHEN** 玩家點擊「拆線」按鈕
- **THEN** MUST 彈出確認對話框
- **AND** 確認後該迴路 MUST 回到未接線狀態（circuitWires 清除、circuitCrimps 清除、wiring.circuits[id].isWired = false）

#### Scenario: 拆線不退費

- **WHEN** 拆線完成
- **THEN** 舊線材成本 MUST NOT 退回

#### Scenario: 送電中不可拆線

- **WHEN** 模擬運行中
- **THEN** 拆線按鈕 MUST 為 disabled 或隱藏

### Requirement: Problem circuit repair tracking

GameBoard MUST 追蹤問題迴路的修復狀態。

#### Scenario: 修復完成判定

- **WHEN** 問題迴路完成拆線 → 重新接線 → 壓接（若 requiresCrimp）
- **THEN** 該迴路 MUST 從問題清單中移除
- **AND** 閃爍 + ⚠️ MUST 消失

#### Scenario: 所有問題修復完成

- **WHEN** 所有問題迴路都已修復
- **THEN** MUST 允許送電（若其他前置條件也滿足）

#### Scenario: 未全部修復不可送電

- **WHEN** 仍有問題迴路未修復
- **THEN** NFB 開關 MUST 為 disabled
- **AND** MUST 顯示提示「請先修復所有問題迴路」

### Requirement: Old house cost rule

老屋模式的成本計算 MUST 僅計入替換的新線材，保留原線免費。

#### Scenario: 保留原線不計成本

- **WHEN** 老屋關卡中迴路保留預接線（未拆線）
- **THEN** 該迴路的線材 MUST NOT 計入 totalCost

#### Scenario: 替換線計成本

- **WHEN** 老屋關卡中迴路拆線後重新接線
- **THEN** 新線材 MUST 計入 totalCost

### Requirement: Problem circuit visual

問題迴路 MUST 有明確的視覺提示。

#### Scenario: 閃爍橘色邊框

- **WHEN** 迴路為問題迴路且未修復
- **THEN** 該迴路在 CircuitDiagram 中 MUST 顯示閃爍的橘色邊框

#### Scenario: ⚠️ 圖示

- **WHEN** 迴路為問題迴路且未修復
- **THEN** 該迴路 MUST 顯示 ⚠️ 警告圖示

#### Scenario: 氧化線材暗色

- **WHEN** 迴路問題為 oxidized-splice
- **THEN** 線材顏色 MUST 顯示為暗褐/暗綠色（vs 正常的鮮明顏色）

#### Scenario: 修復後恢復正常

- **WHEN** 問題迴路修復完成
- **THEN** 閃爍 + ⚠️ MUST 消失
- **AND** 線材顏色 MUST 恢復正常
