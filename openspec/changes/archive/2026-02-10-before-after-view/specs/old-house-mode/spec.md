## ADDED Requirements

### Requirement: ResultPanel receives old house snapshot

ResultPanel MUST 接受可選的 oldHouseSnapshot prop，用於在老屋關卡通關時渲染 BeforeAfterView。

#### Scenario: 老屋關卡通關時傳入快照

- **WHEN** 老屋關卡結果為 won 或 over-budget
- **THEN** GameBoard MUST 將 OldHouseSnapshot 傳遞給 ResultPanel

#### Scenario: 非老屋關卡不傳入

- **WHEN** 非老屋關卡
- **THEN** oldHouseSnapshot prop MUST 為 undefined

### Requirement: ResultPanel receives current repair state

ResultPanel MUST 接受當前的修復狀態資訊，用於生成 After 面板的修復摘要。

#### Scenario: 傳入當前迴路狀態

- **WHEN** 老屋關卡通關時
- **THEN** GameBoard MUST 將 circuitConfigs、circuitWires、circuitBreakers、circuitElcb 傳遞給 ResultPanel
- **AND** ResultPanel MUST 將這些資訊傳遞給 BeforeAfterView

### Requirement: BeforeAfterView renders inside ResultPanel

BeforeAfterView MUST 在 ResultPanel 內部渲染，位於結果詳情和按鈕之間。

#### Scenario: 渲染位置

- **WHEN** BeforeAfterView 顯示
- **THEN** MUST 位於 ResultPanel 的 star-rating / result-details 區塊之後
- **AND** MUST 位於 result-actions 按鈕區塊之前
