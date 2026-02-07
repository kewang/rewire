## ADDED Requirements

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

系統 MUST 定義 Circuit 型別，描述一條完整迴路（NFB + 線材 + 插座上的電器）。

#### Scenario: Circuit 型別組合所有元件

- **WHEN** 建立一個 Circuit 物件
- **THEN** 該物件 MUST 包含 `breaker`（Breaker）、`wire`（Wire）、`appliances`（Appliance 陣列）屬性

### Requirement: Simulation status type

系統 MUST 定義 SimulationStatus 型別，涵蓋四種狀態：normal、warning、tripped、burned。

#### Scenario: 狀態為字串字面量聯合型別

- **WHEN** 使用 SimulationStatus 型別
- **THEN** 其值 MUST 為 `'normal'`、`'warning'`、`'tripped'`、`'burned'` 之一

### Requirement: Level type definition

系統 MUST 定義 Level 型別，描述關卡的目標電器、預算和過關條件。

#### Scenario: Level 型別包含必要屬性

- **WHEN** 建立一個 Level 物件
- **THEN** 該物件 MUST 包含 `name`（關卡名稱）、`requiredAppliances`（必要電器）、`budget`（預算）、`survivalTime`（通電秒數目標）屬性

### Requirement: Default game constants

系統 MUST 提供 PRD 數據表對應的預設常數，包含預設線材、電器和 NFB 資料。

#### Scenario: 預設線材資料符合 PRD

- **WHEN** 讀取預設線材常數
- **THEN** MUST 包含 1.6mm²（15A, 3/米）、2.0mm²（20A, 5/米）、5.5mm²（30A, 12/米）三種線材

#### Scenario: 預設電器資料符合 PRD

- **WHEN** 讀取預設電器常數
- **THEN** MUST 包含吹風機（1200W/110V）、快煮壺（1500W/110V）、微波爐（1100W/110V）

#### Scenario: 預設 NFB 資料符合 PRD

- **WHEN** 讀取預設 NFB 常數
- **THEN** MUST 為 20A 額定、1.5 秒跳脫延遲
