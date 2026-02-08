## MODIFIED Requirements

### Requirement: ELCB availability per circuit

關卡 MUST 可透過 `CircuitConfig.elcbAvailable` 定義該迴路是否可安裝 ELCB。wetArea 迴路 MUST 將 `elcbAvailable` 設為 `true`。

#### Scenario: 迴路開放 ELCB 安裝

- **WHEN** CircuitConfig 的 `elcbAvailable` 為 `true`
- **THEN** 該迴路 MUST 顯示 ELCB 安裝開關供玩家選擇

#### Scenario: 迴路不提供 ELCB 選項

- **WHEN** CircuitConfig 的 `elcbAvailable` 為 `undefined` 或 `false`
- **THEN** 該迴路 MUST 不顯示 ELCB 安裝開關

#### Scenario: wetArea 迴路自動開放 ELCB

- **WHEN** CircuitConfig 的 `wetArea` 為 `true`
- **THEN** 該迴路 MUST 同時將 `elcbAvailable` 設為 `true`
- **AND** 該迴路的 ELCB 安裝開關 MUST 預設為已安裝（建議但非強制 UI 行為）
