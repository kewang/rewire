## MODIFIED Requirements

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
  - `floorPlan?: FloorPlan`

#### Scenario: FreeCircuitLevel 所有屬性為 readonly

- **WHEN** 建立 FreeCircuitLevel 後嘗試修改屬性
- **THEN** TypeScript MUST 在編譯時報錯

#### Scenario: FreeCircuitLevel 無 floorPlan 時 fallback

- **WHEN** FreeCircuitLevel 的 floorPlan 欄位為 undefined
- **THEN** 系統 MUST fallback 到舊 CircuitDiagram 視圖（向後相容）

## MODIFIED Requirements

### Requirement: FixedCircuitLevel floorPlan 擴充

系統 MUST 擴充 `FixedCircuitLevel` interface，新增可選 `floorPlan` 欄位。

#### Scenario: FixedCircuitLevel 支援 floorPlan

- **WHEN** 建立一個 FixedCircuitLevel 物件
- **THEN** MUST 可包含 `floorPlan?: FloorPlan` 可選欄位

#### Scenario: FixedCircuitLevel 無 floorPlan 時 fallback

- **WHEN** FixedCircuitLevel 的 floorPlan 欄位為 undefined
- **THEN** 系統 MUST fallback 到舊 CircuitDiagram 視圖（向後相容）
