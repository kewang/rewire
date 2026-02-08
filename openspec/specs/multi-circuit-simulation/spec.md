# multi-circuit-simulation Specification

## Purpose
多迴路步進函式，迭代各迴路獨立運算並匯總 overallStatus。

## Requirements

### Requirement: Multi-circuit step function

系統 MUST 提供 `stepMulti` 函式，接收多個 Circuit、當前 MultiCircuitState 和 dt，迭代各迴路呼叫 step() 並回傳新的 MultiCircuitState。

#### Scenario: 單迴路 stepMulti 與舊 step 行為一致

- **WHEN** 以單一迴路（circuits 長度為 1）呼叫 stepMulti
- **THEN** 回傳的 MultiCircuitState 中該迴路的 CircuitState MUST 與直接呼叫 step() 的結果一致

#### Scenario: 多迴路各自獨立計算

- **WHEN** 有兩個迴路 c1（過載）和 c2（正常）
- **AND** 呼叫 stepMulti
- **THEN** c1 的 wireHeat MUST 上升，c2 的 wireHeat MUST 不變或下降
- **AND** 兩個迴路的計算 MUST 互不影響

#### Scenario: elapsed 統一遞增

- **WHEN** 呼叫 stepMulti 傳入 dt = 0.016
- **THEN** 新 MultiCircuitState 的 elapsed MUST 為 state.elapsed + 0.016

#### Scenario: overallStatus 取最嚴重

- **WHEN** stepMulti 結果中 c1 status 為 warning，c2 status 為 normal
- **THEN** overallStatus MUST 為 warning

#### Scenario: 任一迴路 burned 則整體 burned

- **WHEN** stepMulti 結果中任一迴路 status 為 burned
- **THEN** overallStatus MUST 為 burned

### Requirement: stepMulti is a pure function

stepMulti MUST 為純函式，不產生副作用。

#### Scenario: 純函式可重現

- **WHEN** 以相同的 circuits、MultiCircuitState 和 dt 呼叫 stepMulti
- **THEN** 回傳結果 MUST 完全相同
