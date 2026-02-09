## ADDED Requirements

### Requirement: CrimpQuality type definition

系統 MUST 定義 CrimpQuality 字串字面量聯合型別。

#### Scenario: CrimpQuality 包含四種品質等級

- **WHEN** 使用 CrimpQuality 型別
- **THEN** 其值 MUST 為 `'excellent'`、`'good'`、`'poor'`、`'none'` 之一

### Requirement: CrimpTerminalType type definition

系統 MUST 定義 CrimpTerminalType 字串字面量聯合型別。

#### Scenario: CrimpTerminalType 包含兩種端子類型

- **WHEN** 使用 CrimpTerminalType 型別
- **THEN** 其值 MUST 為 `'o-ring'`、`'y-fork'` 之一

### Requirement: CrimpResult type definition

系統 MUST 定義 CrimpResult 介面，描述壓接結果。

#### Scenario: CrimpResult 包含必要屬性

- **WHEN** 建立 CrimpResult 物件
- **THEN** MUST 包含 `terminalType`（CrimpTerminalType）、`quality`（CrimpQuality）、`contactResistance`（number）屬性

## MODIFIED Requirements

### Requirement: Circuit type definition

系統 MUST 定義 Circuit 型別，描述一條完整迴路（NFB + 線材 + 插座上的電器），且包含迴路識別資訊與可選的接觸電阻。

#### Scenario: Circuit 型別包含識別欄位

- **WHEN** 建立一個 Circuit 物件
- **THEN** 該物件 MUST 包含 `id`（CircuitId）、`label`（string）、`breaker`（Breaker）、`wire`（Wire）、`appliances`（Appliance 陣列）屬性

#### Scenario: Circuit 型別包含可選 contactResistance

- **WHEN** 建立一個 Circuit 物件
- **THEN** MUST 可包含 `contactResistance?: number` 可選欄位
- **AND** 未指定時預設視為 1.0

#### Scenario: Circuit 型別向後相容

- **WHEN** 建立一個 Circuit 物件
- **THEN** 原有的 `breaker`、`wire`、`appliances` 欄位 MUST 保留且型別不變

### Requirement: Level type definition

系統 MUST 定義 Level 型別，描述關卡的目標電器、預算、過關條件，以及多迴路配置與壓接需求。

#### Scenario: Level 型別包含多迴路配置

- **WHEN** 建立一個 Level 物件
- **THEN** 該物件 MUST 包含 `name`（關卡名稱）、`description`（描述）、`requiredAppliances`（必要電器總清單）、`budget`（預算）、`survivalTime`（通電秒數目標）、`circuitConfigs`（CircuitConfig 陣列）屬性

#### Scenario: Level 型別包含可選 requiresCrimp

- **WHEN** 建立一個 Level 物件
- **THEN** MUST 可包含 `requiresCrimp?: boolean` 可選欄位
- **AND** 未指定時預設視為 false

#### Scenario: 單迴路關卡 circuitConfigs 只有一個元素

- **WHEN** 建立一個單迴路關卡（如 L01）
- **THEN** `circuitConfigs` MUST 為只含一個 CircuitConfig 的陣列
