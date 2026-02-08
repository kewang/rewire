## MODIFIED Requirements

### Requirement: CircuitConfig type definition

系統 MUST 定義 `CircuitConfig` 型別，描述關卡中每個迴路的硬體配置。

#### Scenario: CircuitConfig 包含必要屬性

- **WHEN** 建立一個 CircuitConfig 物件
- **THEN** 該物件 MUST 包含：
  - `id`（CircuitId）— 迴路唯一識別符
  - `label`（string）— 迴路顯示名稱（如「廚房迴路」）
  - `breaker`（Breaker）— 該迴路的 NFB 配置
  - `availableAppliances`（readonly Appliance[]）— 可分配到此迴路的電器清單

#### Scenario: CircuitConfig 包含相位屬性

- **WHEN** 建立一個 110V 迴路的 CircuitConfig
- **THEN** 該物件 MUST 可包含 `phase?: 'R' | 'T'` 可選欄位
- **AND** 220V 迴路可省略 phase（跨相不適用）

#### Scenario: 所有屬性為 readonly

- **WHEN** 建立 CircuitConfig 後嘗試修改屬性
- **THEN** TypeScript MUST 在編譯時報錯

### Requirement: MultiCircuitState type definition

系統 MUST 定義 `MultiCircuitState` 型別，描述整體多迴路模擬狀態。

#### Scenario: MultiCircuitState 包含必要屬性

- **WHEN** 建立一個 MultiCircuitState 物件
- **THEN** 該物件 MUST 包含：
  - `circuitStates`（Record<CircuitId, CircuitState>）— 每個迴路的獨立狀態
  - `elapsed`（number）— 已通電時間 (秒)，所有迴路共用
  - `overallStatus`（SimulationStatus）— 整體狀態，由所有迴路最嚴重狀態決定
  - `neutralCurrent`（number）— 中性線電流 (A)
  - `neutralHeat`（number）— 中性線熱度 (0.0 ~ 1.0)

#### Scenario: overallStatus 取最嚴重狀態

- **WHEN** 迴路 c1 status 為 `'normal'`，迴路 c2 status 為 `'warning'`
- **THEN** overallStatus MUST 為 `'warning'`

#### Scenario: 任一迴路燒毀則整體為 burned

- **WHEN** 任一迴路的 status 為 `'burned'`
- **THEN** overallStatus MUST 為 `'burned'`

#### Scenario: 中性線燒毀則整體為 neutral-burned

- **WHEN** neutralHeat 達到 1.0
- **THEN** overallStatus MUST 為 `'neutral-burned'`

#### Scenario: 所有迴路正常且中性線正常則整體正常

- **WHEN** 所有迴路的 status 都為 `'normal'` 且中性線未過載
- **THEN** overallStatus MUST 為 `'normal'`

## ADDED Requirements

### Requirement: Level phaseMode field

Level 型別 MUST 支援可選的 `phaseMode` 欄位。

#### Scenario: Level 包含 phaseMode 可選欄位

- **WHEN** 定義 Level
- **THEN** MUST 可包含 `phaseMode?: 'auto' | 'manual'` 可選欄位
- **AND** 未指定時視為無相位機制（不啟用相位平衡）

### Requirement: SimulationStatus neutral-burned extension

SimulationStatus MUST 支援 `'neutral-burned'` 值。

#### Scenario: SimulationStatus 包含 neutral-burned

- **WHEN** 使用 SimulationStatus 型別
- **THEN** 其值 MUST 可為 `'normal'`、`'warning'`、`'tripped'`、`'burned'`、`'neutral-burned'` 之一

#### Scenario: neutral-burned 與 burned 同權重

- **WHEN** 比較嚴重度
- **THEN** `'neutral-burned'` MUST 與 `'burned'` 同級
