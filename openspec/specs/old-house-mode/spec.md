## ADDED Requirements

### Requirement: Old house data model

系統 MUST 定義老屋模式的資料結構：

- `OldHouseProblemType = 'bare-wire' | 'wrong-wire-gauge' | 'oxidized-splice' | 'overrated-breaker' | 'missing-elcb'`
- `OldHouseProblem = { circuitId: CircuitId; type: OldHouseProblemType }`
- `PreWiredCircuit = { wire: Wire; crimpQuality: CrimpQuality; appliances: readonly Appliance[]; breaker?: Breaker }`
- `OldHouseConfig = { problems: readonly OldHouseProblem[]; preWiredCircuits: Record<CircuitId, PreWiredCircuit> }`
- `Level.oldHouse?: OldHouseConfig`

#### Scenario: 型別正確定義

- **WHEN** 在 game.ts 中定義老屋相關型別
- **THEN** OldHouseProblemType MUST 包含 5 種問題類型（含 overrated-breaker 和 missing-elcb）
- **AND** PreWiredCircuit MUST 有可選 breaker 欄位
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

#### Scenario: 預接 NFB 初始化

- **WHEN** 老屋關卡有 preWiredCircuit 指定 breaker
- **THEN** circuitBreakers[id] MUST 初始化為 preWiredCircuit.breaker
- **AND** 未指定 breaker 的迴路 MUST 使用 CircuitConfig.breaker

#### Scenario: missing-elcb 初始化

- **WHEN** 老屋關卡有 missing-elcb 問題迴路
- **THEN** circuitElcb[id] MUST 初始化為 false（ELCB 未安裝）
- **AND** 該迴路的 CircuitConfig MUST 有 elcbAvailable=true 和 wetArea=true

#### Scenario: 問題迴路標記

- **WHEN** 老屋關卡初始化完成
- **THEN** problems 中列出的迴路 MUST 標記為問題迴路
- **AND** 問題迴路 MUST 在 CircuitDiagram 上顯示對應問題類型的視覺標示

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

#### Scenario: 拆線型修復完成判定

- **WHEN** bare-wire/wrong-wire-gauge/oxidized-splice 問題迴路完成拆線 → 重新接線 → 壓接（若 requiresCrimp）
- **THEN** 該問題 MUST 標記為已修復
- **AND** 閃爍 + ⚠️ MUST 消失

#### Scenario: NFB 更換型修復完成判定

- **WHEN** overrated-breaker 問題迴路的 NFB 被更換為正確規格（ratedCurrent ≤ 線材 maxCurrent）
- **THEN** 該問題 MUST 標記為已修復
- **AND** NFB 紅色邊框 + ⚠️ MUST 消失

#### Scenario: ELCB 安裝型修復完成判定

- **WHEN** missing-elcb 問題迴路安裝 ELCB（circuitElcb[id] === true）
- **THEN** 該問題 MUST 標記為已修復
- **AND** 💧⚠️ MUST 消失

#### Scenario: 所有問題修復完成

- **WHEN** 所有問題都已修復
- **THEN** MUST 允許送電（若其他前置條件也滿足）

#### Scenario: 未全部修復不可送電

- **WHEN** 仍有問題未修復
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

## ADDED Requirements

### Requirement: Simulation uses circuitBreakers

模擬引擎 MUST 使用 GameBoard 的 circuitBreakers state（而非 CircuitConfig 的靜態 breaker）進行 NFB 跳脫判定。

#### Scenario: NFB 跳脫使用 circuitBreakers

- **WHEN** 模擬運行中判定 NFB 是否跳脫
- **THEN** MUST 使用 circuitBreakers[id] 的 ratedCurrent 計算跳脫閾值（ratedCurrent × 1.25）
- **AND** MUST NOT 使用 CircuitConfig.breaker

#### Scenario: circuitBreakers 未設定時 fallback

- **WHEN** circuitBreakers[id] 未定義
- **THEN** MUST fallback 使用 CircuitConfig.breaker

### Requirement: ResultPanel receives old house snapshot

ResultPanel MUST 接受可選的 oldHouseSnapshot prop，用於在老屋關卡通關時渲染 BeforeAfterView。

#### Scenario: 老屋關卡通關時傳入快照

- **WHEN** 老屋關卡結果為 won 或 over-budget
- **THEN** GameBoard MUST 將 OldHouseSnapshot 傳遞給 ResultPanel

#### Scenario: 非老屋關卡不傳入

- **WHEN** 非老屋關卡
- **THEN** oldHouseSnapshot prop MUST 為 undefined

### Requirement: ResultPanel receives current repair state

ResultPanel MUST 接受當前的修復狀態資訊，用於生成 After 面板的修復摘要。

#### Scenario: 傳入當前迴路狀態

- **WHEN** 老屋關卡通關時
- **THEN** GameBoard MUST 將 circuitConfigs、circuitWires、circuitBreakers、circuitElcb 傳遞給 ResultPanel
- **AND** ResultPanel MUST 將這些資訊傳遞給 BeforeAfterView

### Requirement: BeforeAfterView renders inside ResultPanel

BeforeAfterView MUST 在 ResultPanel 內部渲染，位於結果詳情和按鈕之間。

#### Scenario: 渲染位置

- **WHEN** BeforeAfterView 顯示
- **THEN** MUST 位於 ResultPanel 的 star-rating / result-details 區塊之後
- **AND** MUST 位於 result-actions 按鈕區塊之前

### Requirement: Old house routing integration

老屋模式 MUST 可與走線整理系統整合。

#### Scenario: routingReady 前置條件

- **WHEN** 老屋+走線整合關卡
- **THEN** routingReady MUST 需要 !problemsRemaining（所有問題修復 + 接線完成）
- **AND** 問題未全修復時走線按鈕 MUST 為 disabled

#### Scenario: 整合流程

- **WHEN** 玩家進入 oldHouse + routingMode 關卡
- **THEN** 遊戲流程 MUST 為：診斷問題 → 修復 → 整線 → 送電

### Requirement: L26-L28 level definitions

系統 MUST 定義 L26-L28 固定關卡。

#### Scenario: L26 五毒俱全

- **WHEN** 玩家選擇 L26
- **THEN** 關卡 MUST 有 4 迴路、全 5 種問題類型（c1 雙問題）
- **AND** 相位模式 MUST 為 manual、漏電模式 MUST 為 random

#### Scenario: L27 翻修+整線

- **WHEN** 玩家選擇 L27
- **THEN** 關卡 MUST 同時有 oldHouse 和 routingMode
- **AND** bonusCondition MUST 為 aesthetics-score

#### Scenario: L28 終極考驗

- **WHEN** 玩家選擇 L28
- **THEN** 關卡 MUST 有 5 迴路 + 4 問題 + 相位 + 漏電 + 走線
- **AND** bonusCondition MUST 為 under-budget-ratio
