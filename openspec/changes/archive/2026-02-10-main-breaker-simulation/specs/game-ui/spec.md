# game-ui Delta Spec

## MODIFIED Requirements

### Requirement: StatusDisplay main breaker load indicator

StatusDisplay MUST 在 mainBreakerRating 有值時顯示主開關負載指示器。

#### Scenario: 正常負載顯示

- **WHEN** mainBreakerRating = 50A，totalPanelCurrent = 33A
- **THEN** 顯示「主開關：33A / 50A」
- **AND** 使用預設顏色

#### Scenario: 負載 ≥80% 橘色警告

- **WHEN** mainBreakerRating = 50A，totalPanelCurrent = 42A（84%）
- **THEN** 顯示「主開關：42A / 50A」
- **AND** 數值文字 MUST 為橘色

#### Scenario: 負載 ≥100% 紅色危險

- **WHEN** mainBreakerRating = 50A，totalPanelCurrent = 55A（110%）
- **THEN** 顯示「主開關：55A / 50A」
- **AND** 數值文字 MUST 為紅色

#### Scenario: 無 mainBreakerRating 不顯示

- **WHEN** mainBreakerRating 為 undefined
- **THEN** 主開關負載指示器 MUST 不顯示

### Requirement: ResultPanel main-tripped display

ResultPanel MUST 支援 main-tripped 結果的顯示。

#### Scenario: main-tripped 失敗顯示

- **WHEN** 結果 overallStatus 為 `'main-tripped'`
- **THEN** ResultPanel MUST 顯示失敗狀態
- **AND** MUST 包含主開關跳脫相關的失敗文案

### Requirement: GameBoard mainBreakerRating passthrough

GameBoard MUST 從 FreeCircuitLevel 的 panel.mainBreakerRating 取值，在 rAF loop 中傳入 stepMulti。

#### Scenario: FreeCircuitLevel 傳遞 mainBreakerRating

- **WHEN** currentLevel 為 FreeCircuitLevel（有 panel 屬性）
- **THEN** GameBoard MUST 將 panel.mainBreakerRating 傳入 stepMulti

#### Scenario: FixedCircuitLevel 不傳遞

- **WHEN** currentLevel 為 FixedCircuitLevel（無 panel 屬性）
- **THEN** GameBoard MUST 不傳入 mainBreakerRating（或傳 undefined）
