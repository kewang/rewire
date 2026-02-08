## MODIFIED Requirements

### Requirement: Default game constants

系統 MUST 提供 PRD v0.4 數據表對應的預設常數，包含預設線材、電器和 NFB 資料。

#### Scenario: 預設線材資料符合 PRD v0.4

- **WHEN** 讀取預設線材常數
- **THEN** MUST 包含 6 種線材，按線徑由小到大排列：
  - 1.6mm²（15A, $3/米）
  - 2.0mm²（20A, $5/米）
  - 3.5mm²（25A, $8/米）
  - 5.5mm²（30A, $12/米）
  - 8mm²（45A, $18/米）
  - 14mm²（70A, $28/米）

#### Scenario: 預設電器資料符合 PRD v0.4

- **WHEN** 讀取預設電器常數
- **THEN** MUST 包含 10 種電器：
  - 吹風機（1200W/110V）
  - 快煮壺（1500W/110V）
  - 微波爐（1100W/110V）
  - 廚下加熱器（800W/110V）
  - 冰箱（200W/110V）
  - 烘衣機（2200W/220V）
  - 電熱水器（4400W/220V）
  - IH 爐（3000W/220V）
  - 冷氣（2800W/220V）
  - 浴室暖風機（1650W/220V）

#### Scenario: 預設 NFB 資料符合 PRD

- **WHEN** 讀取預設 NFB 常數
- **THEN** MUST 提供三種規格：
  - 15A 額定、1.5 秒跳脫延遲
  - 20A 額定、1.5 秒跳脫延遲（預設，向後相容）
  - 30A 額定、1.5 秒跳脫延遲

## ADDED Requirements

### Requirement: CircuitConfig ELCB availability field

CircuitConfig MUST 支援可選的 `elcbAvailable` 欄位，標示該迴路是否可安裝 ELCB。

#### Scenario: CircuitConfig 包含 elcbAvailable 可選欄位

- **WHEN** 定義 CircuitConfig
- **THEN** MUST 可包含 `elcbAvailable?: boolean` 可選欄位
- **AND** 未指定時預設視為 `false`

#### Scenario: 舊關卡不受影響

- **WHEN** 舊關卡（L01-L09）的 CircuitConfig 未指定 `elcbAvailable`
- **THEN** MUST 不顯示 ELCB 相關 UI
