# multi-circuit-data-model Specification

## Purpose
多迴路資料模型型別定義，支援配電盤多迴路 / 多 NFB 場景。

## Requirements

### Requirement: CircuitId type definition

系統 MUST 定義 `CircuitId` 型別作為迴路的唯一識別符，為 `string` 型別。

#### Scenario: CircuitId 為 string 型別

- **WHEN** 定義一個 CircuitId 值
- **THEN** 該值 MUST 為 string 型別（如 `"c1"`, `"c2"`）

### Requirement: CircuitConfig type definition

系統 MUST 定義 `CircuitConfig` 型別，描述關卡中每個迴路的硬體配置。

#### Scenario: CircuitConfig 包含必要屬性

- **WHEN** 建立一個 CircuitConfig 物件
- **THEN** 該物件 MUST 包含：
  - `id`（CircuitId）— 迴路唯一識別符
  - `label`（string）— 迴路顯示名稱（如「廚房迴路」）
  - `breaker`（Breaker）— 該迴路的 NFB 配置
  - `availableAppliances`（readonly Appliance[]）— 可分配到此迴路的電器清單

#### Scenario: 所有屬性為 readonly

- **WHEN** 建立 CircuitConfig 後嘗試修改屬性
- **THEN** TypeScript MUST 在編譯時報錯

### Requirement: CircuitState type definition

系統 MUST 定義 `CircuitState` 型別，描述單一迴路的即時模擬狀態。

#### Scenario: CircuitState 包含必要屬性

- **WHEN** 建立一個 CircuitState 物件
- **THEN** 該物件 MUST 包含：
  - `status`（SimulationStatus）— 該迴路的狀態（normal / warning / tripped / burned）
  - `totalCurrent`（number）— 該迴路的當前總電流 (A)
  - `wireHeat`（number）— 該迴路的線材熱度 (0.0 ~ 1.0)
  - `breakerTripTimer`（number）— 該迴路的跳脫計時器 (秒)

#### Scenario: 初始 CircuitState 值

- **WHEN** 建立一個初始 CircuitState
- **THEN** status MUST 為 `'normal'`、totalCurrent MUST 為 0、wireHeat MUST 為 0、breakerTripTimer MUST 為 0

### Requirement: MultiCircuitState type definition

系統 MUST 定義 `MultiCircuitState` 型別，描述整體多迴路模擬狀態。

#### Scenario: MultiCircuitState 包含必要屬性

- **WHEN** 建立一個 MultiCircuitState 物件
- **THEN** 該物件 MUST 包含：
  - `circuitStates`（Record<CircuitId, CircuitState>）— 每個迴路的獨立狀態
  - `elapsed`（number）— 已通電時間 (秒)，所有迴路共用
  - `overallStatus`（SimulationStatus）— 整體狀態，由所有迴路最嚴重狀態決定

#### Scenario: overallStatus 取最嚴重狀態

- **WHEN** 迴路 c1 status 為 `'normal'`，迴路 c2 status 為 `'warning'`
- **THEN** overallStatus MUST 為 `'warning'`

#### Scenario: 任一迴路燒毀則整體為 burned

- **WHEN** 任一迴路的 status 為 `'burned'`
- **THEN** overallStatus MUST 為 `'burned'`

#### Scenario: 所有迴路正常則整體正常

- **WHEN** 所有迴路的 status 都為 `'normal'`
- **THEN** overallStatus MUST 為 `'normal'`

### Requirement: CircuitWiringState type definition

系統 MUST 定義 `CircuitWiringState` 型別，描述單一迴路的接線狀態。

#### Scenario: CircuitWiringState 包含必要屬性

- **WHEN** 建立一個 CircuitWiringState 物件
- **THEN** 該物件 MUST 包含：
  - `isWired`（boolean）— 該迴路是否已完成接線
  - `connectedWire`（Wire | null）— 已連接的線材

### Requirement: Overall status severity ordering

系統 MUST 定義狀態嚴重度排序：`burned` > `tripped` > `warning` > `normal`。

#### Scenario: burned 優先於 tripped

- **WHEN** 迴路 c1 status 為 `'tripped'`，迴路 c2 status 為 `'burned'`
- **THEN** overallStatus MUST 為 `'burned'`

#### Scenario: tripped 優先於 warning

- **WHEN** 迴路 c1 status 為 `'warning'`，迴路 c2 status 為 `'tripped'`
- **THEN** overallStatus MUST 為 `'tripped'`

### Requirement: Helper function for single-circuit level creation

系統 MUST 提供 `createSingleCircuitLevel` helper function，簡化單迴路關卡的建立。

#### Scenario: 單一迴路簡化建立

- **WHEN** 呼叫 `createSingleCircuitLevel` 並傳入名稱、描述、電器、預算、存活時間、NFB
- **THEN** MUST 回傳一個只有一個 CircuitConfig 的 Level 物件

#### Scenario: 預設使用 DEFAULT_BREAKER

- **WHEN** 呼叫 `createSingleCircuitLevel` 未指定 breaker
- **THEN** MUST 使用 DEFAULT_BREAKER 作為該迴路的 NFB

### Requirement: Legacy adapter functions

系統 MUST 提供轉接函式，讓現有程式碼在多迴路型別下暫時可編譯。

#### Scenario: toLegacyState 轉換

- **WHEN** 呼叫 `toLegacyState(multiState, circuitId)` 傳入 MultiCircuitState 和目標迴路 id
- **THEN** MUST 回傳該迴路對應的 SimulationState（舊格式，含 elapsed）

#### Scenario: toLegacyCircuit 轉換

- **WHEN** 呼叫 `toLegacyCircuit(circuitConfig, connectedWire, assignedAppliances)`
- **THEN** MUST 回傳舊格式 Circuit 物件（含 breaker / wire / appliances）
