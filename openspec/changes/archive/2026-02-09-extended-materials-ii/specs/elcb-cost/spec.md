## ADDED Requirements

### Requirement: ELCB availability per circuit

關卡 MUST 可透過 `CircuitConfig.elcbAvailable` 定義該迴路是否可安裝 ELCB。

#### Scenario: 迴路開放 ELCB 安裝

- **WHEN** CircuitConfig 的 `elcbAvailable` 為 `true`
- **THEN** 該迴路 MUST 顯示 ELCB 安裝開關供玩家選擇

#### Scenario: 迴路不提供 ELCB 選項

- **WHEN** CircuitConfig 的 `elcbAvailable` 為 `undefined` 或 `false`
- **THEN** 該迴路 MUST 不顯示 ELCB 安裝開關

### Requirement: ELCB cost calculation

安裝 ELCB 的迴路 MUST 將 ELCB 成本（$35/迴路）計入總成本。

#### Scenario: 安裝 ELCB 增加成本

- **WHEN** 玩家在一個迴路選擇安裝 ELCB
- **THEN** 該迴路成本 MUST 增加 $35
- **AND** 總成本公式 MUST 為 `Σ(wire.costPerMeter × wireLength) + Σ(hasElcb ? 35 : 0)`

#### Scenario: 不安裝 ELCB 無額外成本

- **WHEN** 玩家未在迴路安裝 ELCB
- **THEN** 該迴路 MUST 不計入 ELCB 成本

#### Scenario: 多迴路 ELCB 成本獨立計算

- **WHEN** 關卡有 3 個迴路，其中 2 個安裝 ELCB
- **THEN** ELCB 總成本 MUST 為 $35 × 2 = $70

### Requirement: ELCB cost constant

系統 MUST 定義 ELCB 單價常數 `ELCB_COST = 35`。

#### Scenario: ELCB 常數值

- **WHEN** 讀取 ELCB 成本常數
- **THEN** 值 MUST 為 35
