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

系統 MUST 定義 `Level` 為 `FixedCircuitLevel | FreeCircuitLevel` union type，支援固定迴路和自由配迴路兩種關卡模式。

#### Scenario: Level 為 discriminated union

- **WHEN** 使用 Level 型別
- **THEN** Level MUST 為 `FixedCircuitLevel | FreeCircuitLevel` 聯合型別
- **AND** 可透過 `'rooms' in level` 判斷為 FreeCircuitLevel
- **AND** 可透過 `'circuitConfigs' in level` 判斷為 FixedCircuitLevel

#### Scenario: FixedCircuitLevel 保留原有 Level 所有欄位

- **WHEN** 建立一個 FixedCircuitLevel 物件
- **THEN** 該物件 MUST 包含 `name`、`description`、`requiredAppliances`、`budget`、`survivalTime`、`circuitConfigs` 屬性
- **AND** MUST 可包含 `phaseMode`、`leakageMode`、`leakageEvents`、`requiresCrimp`、`requiresRouting`、`initialLanes`、`bonusCondition`、`oldHouse` 可選欄位

#### Scenario: 既有關卡定義向後相容

- **WHEN** 既有關卡（L01-L23）使用 FixedCircuitLevel 型別
- **THEN** 所有關卡定義 MUST 保持相同結構，無需修改欄位值
- **AND** MUST 可通過 TypeScript 編譯

### Requirement: SimulationStatus includes main-tripped

SimulationStatus MUST 包含 `'main-tripped'` 值。

#### Scenario: SimulationStatus 包含所有狀態

- **WHEN** 使用 SimulationStatus 型別
- **THEN** 其值 MUST 可為 `'normal'`、`'warning'`、`'tripped'`、`'burned'`、`'neutral-burned'`、`'elcb-tripped'`、`'leakage'`、`'main-tripped'` 之一
