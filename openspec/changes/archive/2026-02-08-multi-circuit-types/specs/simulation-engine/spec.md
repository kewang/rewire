## MODIFIED Requirements

### Requirement: Simulation step function

系統 MUST 提供純函式 step，接收 Circuit、當前 CircuitState 和 dt，回傳新的 CircuitState。整體多迴路步進由上層迭代各迴路呼叫 step 完成。

#### Scenario: 純函式可重現

- **WHEN** 以相同的 Circuit、CircuitState 和 dt 呼叫 step
- **THEN** 回傳結果 MUST 完全相同

#### Scenario: step 回傳 CircuitState

- **WHEN** 呼叫 step 函式
- **THEN** 回傳型別 MUST 為 CircuitState（不含 elapsed，elapsed 由上層管理）

### Requirement: Initial state creation

系統 MUST 提供建立初始狀態的函式，支援多迴路。

#### Scenario: 建立多迴路初始狀態

- **WHEN** 呼叫 `createInitialMultiState(circuitIds: CircuitId[])`
- **THEN** MUST 回傳 MultiCircuitState，其中每個 circuitId 對應一個初始 CircuitState（status: normal, totalCurrent: 0, wireHeat: 0, breakerTripTimer: 0），elapsed 為 0，overallStatus 為 normal

#### Scenario: 原有 createInitialState 保留

- **WHEN** 呼叫 `createInitialState()`
- **THEN** MUST 回傳與原有相同的單迴路 SimulationState（向後相容）
