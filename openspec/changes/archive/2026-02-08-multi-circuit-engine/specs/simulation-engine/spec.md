## MODIFIED Requirements

### Requirement: Simulation step function

系統 MUST 提供純函式 step，接收 Circuit、當前 CircuitState 和 dt，回傳新的 CircuitState。elapsed 不由 step 管理，由上層（stepMulti）負責。

#### Scenario: 純函式可重現

- **WHEN** 以相同的 Circuit、CircuitState 和 dt 呼叫 step
- **THEN** 回傳結果 MUST 完全相同

#### Scenario: step 接收 CircuitState 回傳 CircuitState

- **WHEN** 呼叫 step 函式
- **THEN** 輸入 MUST 為 CircuitState（不含 elapsed），回傳 MUST 為 CircuitState（不含 elapsed）

#### Scenario: 終態不可逆

- **WHEN** CircuitState status 為 tripped 或 burned
- **THEN** step MUST 回傳相同的 CircuitState 不做任何變更
