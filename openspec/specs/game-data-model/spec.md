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

### Requirement: 電暖器電器定義

系統 MUST 在 DEFAULT_APPLIANCES 中包含電暖器。

#### Scenario: 電暖器規格

- **WHEN** 查詢電暖器的定義
- **THEN** name MUST 為 '電暖器'，power MUST 為 1800，voltage MUST 為 110
- **AND** 計算電流 MUST 為 1800 ÷ 110 ≈ 16.4A

### Requirement: 烤箱電器定義

系統 MUST 在 DEFAULT_APPLIANCES 中包含烤箱。

#### Scenario: 烤箱規格

- **WHEN** 查詢烤箱的定義
- **THEN** name MUST 為 '烤箱'，power MUST 為 1500，voltage MUST 為 110
- **AND** 計算電流 MUST 為 1500 ÷ 110 ≈ 13.6A

### Requirement: 除濕機電器定義

系統 MUST 在 DEFAULT_APPLIANCES 中包含除濕機。

#### Scenario: 除濕機規格

- **WHEN** 查詢除濕機的定義
- **THEN** name MUST 為 '除濕機'，power MUST 為 600，voltage MUST 為 110
- **AND** 計算電流 MUST 為 600 ÷ 110 ≈ 5.5A

### Requirement: DEFAULT_APPLIANCES 陣列順序

系統 MUST 將 3 種新電器附加到 DEFAULT_APPLIANCES 陣列末尾，既有電器 index 不變。

#### Scenario: 新電器在陣列末尾

- **WHEN** 查詢 DEFAULT_APPLIANCES 陣列
- **THEN** 陣列長度 MUST 為 13
- **AND** index 0–9 MUST 與既有 10 種電器一致
- **AND** index 10 MUST 為電暖器，index 11 MUST 為烤箱，index 12 MUST 為除濕機

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
