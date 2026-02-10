## ADDED Requirements

### Requirement: SimulationStatus main-tripped value

SimulationStatus MUST 支援 `'main-tripped'` 值，表示主開關跳脫。

#### Scenario: SimulationStatus 包含 main-tripped

- **WHEN** 使用 SimulationStatus 型別
- **THEN** 其值 MUST 可為 `'main-tripped'`

#### Scenario: main-tripped 與 burned 同嚴重度

- **WHEN** 比較 `'main-tripped'` 的嚴重度
- **THEN** `'main-tripped'` MUST 為 severity=3（同 `'burned'`、`'neutral-burned'`、`'leakage'`）

### Requirement: worstStatus 支援 main-tripped

`worstStatus` helper 函式 MUST 能處理 `'main-tripped'` 狀態。

#### Scenario: main-tripped 在嚴重度比較中正確排序

- **WHEN** 呼叫 `worstStatus` 時輸入包含 `'main-tripped'` 的狀態
- **THEN** MUST 將 `'main-tripped'` 視為 severity=3
- **AND** 與 `'burned'` / `'neutral-burned'` / `'leakage'` 同級

## MODIFIED Requirements

### Requirement: MultiCircuitState type definition

系統 MUST 定義 `MultiCircuitState` 型別，描述整體多迴路模擬狀態。

#### Scenario: MultiCircuitState 包含必要屬性

- **WHEN** 建立一個 MultiCircuitState 物件
- **THEN** 該物件 MUST 包含：
  - `circuitStates`（Record<CircuitId, CircuitState>）— 每個迴路的獨立狀態
  - `elapsed`（number）— 已通電時間 (秒)，所有迴路共用
  - `overallStatus`（SimulationStatus）— 整體狀態，由所有迴路最嚴重狀態決定
  - `neutralCurrent`（number）— 中性線電流 (A)
  - `neutralHeat`（number）— 中性線熱度 (0.0 ~ 1.0)
  - `mainBreakerTripTimer`（number）— 主開關跳脫計時器 (秒)

#### Scenario: mainBreakerTripTimer 初始值

- **WHEN** 建立一個初始 MultiCircuitState
- **THEN** `mainBreakerTripTimer` MUST 為 0

#### Scenario: overallStatus 取最嚴重狀態

- **WHEN** 迴路 c1 status 為 `'normal'`，迴路 c2 status 為 `'warning'`
- **THEN** overallStatus MUST 為 `'warning'`

#### Scenario: 任一迴路燒毀則整體為 burned

- **WHEN** 任一迴路的 status 為 `'burned'`
- **THEN** overallStatus MUST 為 `'burned'`

#### Scenario: 中性線燒毀則整體為 neutral-burned

- **WHEN** neutralHeat 達到 1.0
- **THEN** overallStatus MUST 為 `'neutral-burned'`

#### Scenario: 所有迴路正常且中性線正常則整體正常

- **WHEN** 所有迴路的 status 都為 `'normal'` 且中性線未過載
- **THEN** overallStatus MUST 為 `'normal'`
