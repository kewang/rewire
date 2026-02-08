# game-data-model Specification

## Purpose
遊戲核心資料模型型別定義，包含線材、電器、NFB、迴路、關卡等。

## Requirements

### Requirement: Wire type definition

系統 MUST 定義 Wire 型別，包含線徑（mm²）、最大安全電流（A）、每米成本等屬性。

#### Scenario: Wire 型別包含必要屬性

- **WHEN** 建立一個 Wire 物件
- **THEN** 該物件 MUST 包含 `crossSection`（線徑 mm²）、`maxCurrent`（安全電流上限 A）、`costPerMeter`（每米成本）屬性

### Requirement: Appliance type definition

系統 MUST 定義 Appliance 型別，包含名稱、功率（W）、電壓（V）等屬性。

#### Scenario: Appliance 型別包含必要屬性

- **WHEN** 建立一個 Appliance 物件
- **THEN** 該物件 MUST 包含 `name`（名稱）、`power`（功率 W）、`voltage`（電壓 V）屬性

#### Scenario: 電流可由功率和電壓推算

- **WHEN** 已知 Appliance 的 power 和 voltage
- **THEN** 電流 MUST 可透過 `power / voltage` 計算得出

### Requirement: Breaker type definition

系統 MUST 定義 Breaker（NFB）型別，包含額定電流和跳脫延遲。

#### Scenario: Breaker 型別包含必要屬性

- **WHEN** 建立一個 Breaker 物件
- **THEN** 該物件 MUST 包含 `ratedCurrent`（額定電流 A）、`tripDelay`（跳脫延遲秒數）屬性

### Requirement: Circuit type definition

系統 MUST 定義 Circuit 型別，描述一條完整迴路（NFB + 線材 + 插座上的電器），且包含迴路識別資訊。

#### Scenario: Circuit 型別包含識別欄位

- **WHEN** 建立一個 Circuit 物件
- **THEN** 該物件 MUST 包含 `id`（CircuitId）、`label`（string）、`breaker`（Breaker）、`wire`（Wire）、`appliances`（Appliance 陣列）屬性

#### Scenario: Circuit 型別向後相容

- **WHEN** 建立一個 Circuit 物件
- **THEN** 原有的 `breaker`、`wire`、`appliances` 欄位 MUST 保留且型別不變

### Requirement: Simulation status type

系統 MUST 定義 SimulationStatus 型別，涵蓋四種狀態：normal、warning、tripped、burned。

#### Scenario: 狀態為字串字面量聯合型別

- **WHEN** 使用 SimulationStatus 型別
- **THEN** 其值 MUST 為 `'normal'`、`'warning'`、`'tripped'`、`'burned'` 之一

### Requirement: Level type definition

系統 MUST 定義 Level 型別，描述關卡的目標電器、預算、過關條件，以及多迴路配置。

#### Scenario: Level 型別包含多迴路配置

- **WHEN** 建立一個 Level 物件
- **THEN** 該物件 MUST 包含 `name`（關卡名稱）、`description`（描述）、`requiredAppliances`（必要電器總清單）、`budget`（預算）、`survivalTime`（通電秒數目標）、`circuitConfigs`（CircuitConfig 陣列）屬性

#### Scenario: 單迴路關卡 circuitConfigs 只有一個元素

- **WHEN** 建立一個單迴路關卡（如 L01）
- **THEN** `circuitConfigs` MUST 為只含一個 CircuitConfig 的陣列

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

### Requirement: CircuitConfig ELCB availability field

CircuitConfig MUST 支援可選的 `elcbAvailable` 欄位，標示該迴路是否可安裝 ELCB。

#### Scenario: CircuitConfig 包含 elcbAvailable 可選欄位

- **WHEN** 定義 CircuitConfig
- **THEN** MUST 可包含 `elcbAvailable?: boolean` 可選欄位
- **AND** 未指定時預設視為 `false`

#### Scenario: 舊關卡不受影響

- **WHEN** 舊關卡（L01-L09）的 CircuitConfig 未指定 `elcbAvailable`
- **THEN** MUST 不顯示 ELCB 相關 UI
