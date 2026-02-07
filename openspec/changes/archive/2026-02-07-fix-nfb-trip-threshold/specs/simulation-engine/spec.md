## MODIFIED Requirements

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
