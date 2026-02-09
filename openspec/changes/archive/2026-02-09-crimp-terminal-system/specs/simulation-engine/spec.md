## MODIFIED Requirements

### Requirement: Wire heat model

系統 MUST 實作線材熱度模型：使用 effectiveCurrent（考慮接觸電阻）判定是否過載。effectiveCurrent = totalCurrent × √(contactResistance)。

#### Scenario: 過載時熱度上升（含接觸電阻）

- **WHEN** effectiveCurrent 超過線材的 maxCurrent
- **THEN** wireHeat MUST 隨時間增加
- **AND** overloadRatio MUST 以 effectiveCurrent 計算

#### Scenario: 正常負載時熱度下降

- **WHEN** effectiveCurrent 未超過線材的 maxCurrent
- **AND** wireHeat 大於 0
- **THEN** wireHeat MUST 隨時間減少

#### Scenario: 熱度達到上限觸發燒毀

- **WHEN** wireHeat 達到 1.0
- **THEN** 狀態 MUST 變為 burned

#### Scenario: contactResistance 預設為 1.0

- **WHEN** Circuit 未指定 contactResistance
- **THEN** effectiveCurrent MUST 等於 totalCurrent（即 contactResistance = 1.0）

### Requirement: Simulation status determination

系統 MUST 根據迴路狀態判定 SimulationStatus。warning 狀態 MUST 以 effectiveCurrent 判定。

#### Scenario: 正常運作

- **WHEN** effectiveCurrent 未超過線材 maxCurrent 且 wireHeat 低
- **THEN** 狀態 MUST 為 normal

#### Scenario: 過載預警

- **WHEN** effectiveCurrent 超過線材 maxCurrent 但尚未燒毀或跳電
- **THEN** 狀態 MUST 為 warning

#### Scenario: 終態不可逆

- **WHEN** 狀態為 tripped、burned、neutral-burned、elcb-tripped 或 leakage
- **THEN** 後續 step 呼叫 MUST 維持該狀態不變

### Requirement: Breaker trip detection

系統 MUST 在總電流超過 NFB 額定電流的 1.25 倍時，經過跳脫延遲後觸發跳電。NFB 跳脫 MUST 看實際 totalCurrent，不看 effectiveCurrent。

#### Scenario: NFB 跳脫不受接觸電阻影響

- **WHEN** totalCurrent 未超過 NFB 額定電流的 1.25 倍
- **AND** effectiveCurrent 超過線材 maxCurrent（因接觸電阻）
- **THEN** NFB MUST 不跳脫
- **AND** wireHeat MUST 累積（可能燒線）

#### Scenario: 電流超過 1.25 倍額定觸發跳電

- **WHEN** totalCurrent 超過 NFB 額定電流的 1.25 倍（如 20A × 1.25 = 25A）
- **AND** 持續超過跳脫延遲時間（如 1.5 秒）
- **THEN** 狀態 MUST 變為 tripped
