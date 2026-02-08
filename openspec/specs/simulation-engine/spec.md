# simulation-engine Specification

## Purpose
模擬引擎核心邏輯，包含電流計算、NFB 跳脫判定、線材熱度模型、狀態步進。

## Requirements

### Requirement: Total current calculation

系統 MUST 提供函式計算迴路的總電流，公式為 I_total = Σ(P / V)。

#### Scenario: 單一電器的電流計算

- **WHEN** 迴路上有一個 1200W / 110V 的電器
- **THEN** 總電流 MUST 為 1200 / 110 ≈ 10.91A

#### Scenario: 多個電器的電流加總

- **WHEN** 迴路上有 1200W/110V 和 1500W/110V 兩個電器
- **THEN** 總電流 MUST 為 (1200 + 1500) / 110 ≈ 24.55A

#### Scenario: 無電器時電流為零

- **WHEN** 迴路上沒有任何電器
- **THEN** 總電流 MUST 為 0

### Requirement: Breaker trip detection

系統 MUST 在總電流超過 NFB 額定電流的 1.25 倍時，經過跳脫延遲後觸發跳電。

#### Scenario: 電流超過 1.25 倍額定觸發跳電

- **WHEN** 總電流超過 NFB 額定電流的 1.25 倍（如 20A × 1.25 = 25A）
- **AND** 持續超過跳脫延遲時間（如 1.5 秒）
- **THEN** 狀態 MUST 變為 tripped

#### Scenario: 電流在額定與 1.25 倍之間不觸發

- **WHEN** 總電流超過 NFB 額定電流但未超過 1.25 倍
- **THEN** 跳脫計時器 MUST 不累計，狀態不變為 tripped

#### Scenario: 電流未超過額定不觸發

- **WHEN** 總電流未超過 NFB 額定電流
- **THEN** 跳脫計時器 MUST 不累計，狀態不變為 tripped

### Requirement: Wire heat model

系統 MUST 實作線材熱度模型：電流超過線材安全電流時熱度累積，低於時冷卻。

#### Scenario: 過載時熱度上升

- **WHEN** 總電流超過線材的 maxCurrent
- **THEN** wireHeat MUST 隨時間增加

#### Scenario: 正常負載時熱度下降

- **WHEN** 總電流未超過線材的 maxCurrent
- **AND** wireHeat 大於 0
- **THEN** wireHeat MUST 隨時間減少

#### Scenario: 熱度達到上限觸發燒毀

- **WHEN** wireHeat 達到 1.0
- **THEN** 狀態 MUST 變為 burned

### Requirement: Simulation status determination

系統 MUST 根據迴路狀態判定 SimulationStatus，涵蓋 normal、warning、tripped、burned 四種狀態。

#### Scenario: 正常運作

- **WHEN** 電流未超過 NFB 額定且 wireHeat 低
- **THEN** 狀態 MUST 為 normal

#### Scenario: 過載預警

- **WHEN** 電流超過線材 maxCurrent 但尚未燒毀或跳電
- **THEN** 狀態 MUST 為 warning

#### Scenario: 終態不可逆

- **WHEN** 狀態為 tripped 或 burned
- **THEN** 後續 step 呼叫 MUST 維持該狀態不變

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

### Requirement: Initial state creation

系統 MUST 提供建立初始狀態的函式，支援多迴路。

#### Scenario: 建立多迴路初始狀態

- **WHEN** 呼叫 `createInitialMultiState(circuitIds: CircuitId[])`
- **THEN** MUST 回傳 MultiCircuitState，其中每個 circuitId 對應一個初始 CircuitState（status: normal, totalCurrent: 0, wireHeat: 0, breakerTripTimer: 0），elapsed 為 0，overallStatus 為 normal

#### Scenario: 原有 createInitialState 保留

- **WHEN** 呼叫 `createInitialState()`
- **THEN** MUST 回傳與原有相同的單迴路 SimulationState（向後相容）
