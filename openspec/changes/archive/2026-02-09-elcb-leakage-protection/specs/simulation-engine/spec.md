## MODIFIED Requirements

### Requirement: Simulation status determination

系統 MUST 根據迴路狀態判定 SimulationStatus，涵蓋 normal、warning、tripped、burned、neutral-burned、elcb-tripped、leakage 七種狀態。

#### Scenario: 正常運作

- **WHEN** 電流未超過 NFB 額定且 wireHeat 低
- **THEN** 狀態 MUST 為 normal

#### Scenario: 過載預警

- **WHEN** 電流超過線材 maxCurrent 但尚未燒毀或跳電
- **THEN** 狀態 MUST 為 warning

#### Scenario: 終態不可逆

- **WHEN** 狀態為 tripped、burned、neutral-burned、elcb-tripped 或 leakage
- **THEN** 後續 step 呼叫 MUST 維持該狀態不變

### Requirement: Simulation step function

系統 MUST 提供純函式 step，接收 Circuit、當前 CircuitState 和 dt，回傳新的 CircuitState。elapsed 不由 step 管理，由上層（stepMulti）負責。

#### Scenario: 純函式可重現

- **WHEN** 以相同的 Circuit、CircuitState 和 dt 呼叫 step
- **THEN** 回傳結果 MUST 完全相同

#### Scenario: step 接收 CircuitState 回傳 CircuitState

- **WHEN** 呼叫 step 函式
- **THEN** 輸入 MUST 為 CircuitState（不含 elapsed），回傳 MUST 為 CircuitState（不含 elapsed）

#### Scenario: 終態不可逆（含 elcb-tripped 和 leakage）

- **WHEN** CircuitState status 為 tripped、burned、elcb-tripped 或 leakage
- **THEN** step MUST 回傳相同的 CircuitState 不做任何變更

## ADDED Requirements

### Requirement: ELCB-tripped circuit step behavior

step 函式 MUST 在 elcb-tripped 狀態下停止所有計算。

#### Scenario: elcb-tripped 迴路不計算

- **WHEN** CircuitState.status 為 `'elcb-tripped'`
- **THEN** step MUST 立即回傳相同 CircuitState，不進行電流、熱度、NFB 計算
