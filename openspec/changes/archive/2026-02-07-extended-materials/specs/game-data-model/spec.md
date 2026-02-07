## MODIFIED Requirements

### Requirement: Default game constants

系統 MUST 提供 PRD v0.2 數據表對應的預設常數，包含預設線材、電器和 NFB 資料。

#### Scenario: 預設線材資料符合 PRD v0.2

- **WHEN** 讀取預設線材常數
- **THEN** MUST 包含 5 種線材，按線徑由小到大排列：
  - 1.6mm²（15A, $3/米）
  - 2.0mm²（20A, $5/米）
  - 3.5mm²（25A, $8/米）
  - 5.5mm²（30A, $12/米）
  - 8mm²（45A, $18/米）

#### Scenario: 預設電器資料符合 PRD v0.2

- **WHEN** 讀取預設電器常數
- **THEN** MUST 包含 5 種電器：
  - 吹風機（1200W/110V）
  - 快煮壺（1500W/110V）
  - 微波爐（1100W/110V）
  - 廚下加熱器（800W/110V）
  - 烘衣機（2200W/220V）

#### Scenario: 預設 NFB 資料符合 PRD

- **WHEN** 讀取預設 NFB 常數
- **THEN** MUST 為 20A 額定、1.5 秒跳脫延遲
