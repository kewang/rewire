## MODIFIED Requirements

### Requirement: Circuit type definition

系統 MUST 定義 Circuit 型別，描述一條完整迴路（NFB + 線材 + 插座上的電器），且包含迴路識別資訊。

#### Scenario: Circuit 型別包含識別欄位

- **WHEN** 建立一個 Circuit 物件
- **THEN** 該物件 MUST 包含 `id`（CircuitId）、`label`（string）、`breaker`（Breaker）、`wire`（Wire）、`appliances`（Appliance 陣列）屬性

#### Scenario: Circuit 型別向後相容

- **WHEN** 建立一個 Circuit 物件
- **THEN** 原有的 `breaker`、`wire`、`appliances` 欄位 MUST 保留且型別不變

### Requirement: Level type definition

系統 MUST 定義 Level 型別，描述關卡的目標電器、預算、過關條件，以及多迴路配置。

#### Scenario: Level 型別包含多迴路配置

- **WHEN** 建立一個 Level 物件
- **THEN** 該物件 MUST 包含 `name`（關卡名稱）、`description`（描述）、`requiredAppliances`（必要電器總清單）、`budget`（預算）、`survivalTime`（通電秒數目標）、`circuitConfigs`（CircuitConfig 陣列）屬性

#### Scenario: 單迴路關卡 circuitConfigs 只有一個元素

- **WHEN** 建立一個單迴路關卡（如 L01）
- **THEN** `circuitConfigs` MUST 為只含一個 CircuitConfig 的陣列

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
