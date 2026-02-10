## MODIFIED Requirements

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
