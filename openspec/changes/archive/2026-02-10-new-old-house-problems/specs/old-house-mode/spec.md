## MODIFIED Requirements

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
