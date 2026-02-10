## ADDED Requirements

### Requirement: Room type definition

系統 MUST 定義 `Room` interface，描述關卡中的房間及其所含電器。

#### Scenario: Room 包含必要屬性

- **WHEN** 建立一個 Room 物件
- **THEN** 該物件 MUST 包含：
  - `id`（string）— 房間唯一識別符（如 `"kitchen"`, `"bathroom"`）
  - `name`（string）— 房間顯示名稱（如 `"廚房"`, `"浴室"`）
  - `appliances`（readonly Appliance[]）— 此房間需要供電的電器清單

#### Scenario: Room 包含可選 wetArea 屬性

- **WHEN** 建立一個潮濕區域的 Room 物件
- **THEN** MUST 可包含 `wetArea?: boolean` 可選欄位
- **AND** 未指定時預設視為 false（乾燥區域）

#### Scenario: Room 所有屬性為 readonly

- **WHEN** 建立 Room 後嘗試修改屬性
- **THEN** TypeScript MUST 在編譯時報錯

### Requirement: PanelConfig type definition

系統 MUST 定義 `PanelConfig` interface，描述配電箱的硬體規格限制。

#### Scenario: PanelConfig 包含必要屬性

- **WHEN** 建立一個 PanelConfig 物件
- **THEN** 該物件 MUST 包含：
  - `maxSlots`（number）— 配電箱插槽上限（可建立迴路數量上限）
  - `mainBreakerRating`（number）— 主開關額定電流（A）

#### Scenario: PanelConfig 所有屬性為 readonly

- **WHEN** 建立 PanelConfig 後嘗試修改屬性
- **THEN** TypeScript MUST 在編譯時報錯

### Requirement: FreeCircuitLevel type definition

系統 MUST 定義 `FreeCircuitLevel` interface，描述自由配迴路關卡。

#### Scenario: FreeCircuitLevel 包含必要屬性

- **WHEN** 建立一個 FreeCircuitLevel 物件
- **THEN** 該物件 MUST 包含：
  - `name`（string）— 關卡名稱
  - `description`（string）— 關卡描述
  - `rooms`（readonly Room[]）— 房間列表（含電器）
  - `panel`（PanelConfig）— 配電箱規格
  - `budget`（number）— 預算
  - `survivalTime`（number）— 需通電維持的秒數

#### Scenario: FreeCircuitLevel 不含 circuitConfigs

- **WHEN** 建立一個 FreeCircuitLevel 物件
- **THEN** 該物件 MUST NOT 包含 `circuitConfigs` 欄位
- **AND** 該物件 MUST NOT 包含 `requiredAppliances` 欄位

#### Scenario: FreeCircuitLevel 支援可選機制欄位

- **WHEN** 建立一個 FreeCircuitLevel 物件
- **THEN** MUST 可包含以下可選欄位：
  - `phaseMode?: 'auto' | 'manual'`
  - `leakageMode?: 'scripted' | 'random'`
  - `leakageEvents?: readonly LeakageEvent[]`
  - `requiresCrimp?: boolean`
  - `requiresRouting?: boolean`
  - `bonusCondition?: BonusCondition`

#### Scenario: FreeCircuitLevel 所有屬性為 readonly

- **WHEN** 建立 FreeCircuitLevel 後嘗試修改屬性
- **THEN** TypeScript MUST 在編譯時報錯

### Requirement: isFreeCircuitLevel type guard

系統 MUST 提供 `isFreeCircuitLevel` 函式，用於 Level union 的 type narrowing。

#### Scenario: 判斷 FreeCircuitLevel

- **WHEN** 傳入一個包含 `rooms` 屬性的 Level 物件
- **THEN** `isFreeCircuitLevel` MUST 回傳 `true`
- **AND** TypeScript MUST 將型別 narrow 為 `FreeCircuitLevel`

#### Scenario: 判斷非 FreeCircuitLevel

- **WHEN** 傳入一個不包含 `rooms` 屬性的 Level 物件
- **THEN** `isFreeCircuitLevel` MUST 回傳 `false`

### Requirement: isFixedCircuitLevel type guard

系統 MUST 提供 `isFixedCircuitLevel` 函式，用於 Level union 的 type narrowing。

#### Scenario: 判斷 FixedCircuitLevel

- **WHEN** 傳入一個包含 `circuitConfigs` 屬性的 Level 物件
- **THEN** `isFixedCircuitLevel` MUST 回傳 `true`
- **AND** TypeScript MUST 將型別 narrow 為 `FixedCircuitLevel`

#### Scenario: 判斷非 FixedCircuitLevel

- **WHEN** 傳入一個不包含 `circuitConfigs` 屬性的 Level 物件
- **THEN** `isFixedCircuitLevel` MUST 回傳 `false`
